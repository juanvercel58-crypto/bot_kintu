import { setSessionStatus } from './session.js'
import { saveQr } from './qr.js'
import { logger } from '../utils/logger.js'
import { handleIncomingMessage } from '../flows/flow.engine.js'
import { isHumanEntryMessage, isHumanExitMessage } from '../flows/flow.handoff.detector.js'

let eventsRegistered = false

// 🧵 Cola por usuario
const messageQueue = new Map()
const handoffChats = new Set()

export const registerEvents = (client) => {

    if (eventsRegistered) {
        logger.warn('⚠️ WhatsApp events already registered, skipping...')
        return
    }

    eventsRegistered = true
    logger.info('📡 Registering WhatsApp events...')

    // 📲 QR
    client.on('qr', (qr) => {
        logger.info('📲 QR received')
        saveQr(qr)
        setSessionStatus('QR')
    })

    // 🔐 Auth
    client.on('authenticated', () => {
        logger.info('🔐 WhatsApp authenticated')
        setSessionStatus('AUTHENTICATED')
    })

    // ✅ Ready
    client.on('ready', () => {
        logger.info('✅ WhatsApp connected and ready')
        setSessionStatus('READY')
    })

    // ❌ Sesión inválida (ÚNICO lugar para destruir)
    client.on('auth_failure', async (msg) => {
        logger.error(`❌ Auth failure: ${msg}`)
        setSessionStatus('AUTH_FAILURE')
        await safeDestroy(client)
    })

    // ⚠️ Desconectado real
    client.on('disconnected', async (reason) => {
        logger.warn(`⚠️ WhatsApp disconnected: ${reason}`)
        setSessionStatus('DISCONNECTED')
        await safeDestroy(client)
    })

    // 📩 Mensajes entrantes (SERIALIZADOS)
    client.on('message', async (message) => {

        // ❌ ignorar mensajes sin texto || grupos || estados
        if (!message.body) return
        if (message.from === 'status@broadcast') return
        if (message.from.endsWith('@g.us')) return


        try {

            //const phone = message.from
            const phone = message.fromMe ? message.to : message.from
            const text = message.body
            const name = message._data?.notifyName || null

            logger.info(`📩 ${phone} (${message.fromMe ? 'HUMAN' : 'CLIENT'}): "${text}"`)

            // 🛑 Si el humano está atendiendo → el bot NO responde
            if (handoffChats.has(phone)) {
                logger.info(`🤖 Bot paused for ${phone}`)
                return
            }

            enqueueMessage(phone, async () => {
                logger.info(`📩 ${phone}: "${text}"`)
                await handleIncomingMessage({ phone, text, name })
            })

        } catch (error) {
            logger.error('❌ Error handling incoming message')
            logger.error(error)
        }
        
    })

    client.on('message_create', (message) => {

        if (!message.fromMe) return
        if (!message.body) return

        const phone = message.to
        const text = message.body

        logger.info(`🧑‍💼 HUMAN ${phone}: "${text}"`)

        // 👋 ENTRADA HUMANA
        if (isHumanEntryMessage(text)) {
            handoffChats.add(phone)
            logger.info(`🛑 HANDOFF ACTIVATED for ${phone}`)
            return
        }

        // 👋 SALIDA HUMANA
        if (isHumanExitMessage(text)) {
            handoffChats.delete(phone)
            logger.info(`♻️ HANDOFF ENDED for ${phone}`)
            return
        }
    })
}

/* ===========================
   UTILIDADES
=========================== */

const enqueueMessage = (phone, task) => {
    const prev = messageQueue.get(phone) || Promise.resolve()

    const next = prev
        .then(task)
        .catch(err => logger.error('❌ Queue error', err))

    messageQueue.set(phone, next)
}

const safeDestroy = async (client) => {
    try {
        logger.warn('🧨 Destroying WhatsApp client safely...')
        await client.destroy()
        logger.warn('🧹 Client destroyed safely')
    } catch (e) {
        logger.error('❌ Error destroying client', e)
    }
}