import { setSessionStatus } from './session.js'
import { saveQr } from './qr.js'
import { logger } from '../utils/logger.js'
import { handleIncomingMessage } from '../flows/flow.engine.js'

let eventsRegistered = false

// 🧵 Cola por usuario
const messageQueue = new Map()

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
        if (message.fromMe || !message.body) return

        const phone = message.from
        const text = message.body
        const name = message._data?.notifyName || null

        enqueueMessage(phone, async () => {
            logger.info(`📩 ${phone}: "${text}"`)
            await handleIncomingMessage({ phone, text, name })
        })
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