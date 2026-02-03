import { getLastSessionStatus, setSessionStatus } from './session.js'
import { saveQr } from './qr.js'
import { logger } from '../utils/logger.js'
import { handleIncomingMessage } from '../flows/flow.engine.js'
import { forceLogout } from './logout.js'

let eventsRegistered = false

export const registerEvents = (client) => {

    console.log(client);

    if (eventsRegistered) {
        logger.warn('⚠️ WhatsApp events already registered, skipping...')
        return
    }

    eventsRegistered = true
    logger.info('📡 Registering WhatsApp events...')

    // 📲 QR generado
    client.on('qr', async (qr) => {
        logger.info('📲 QR received')
        const last = getLastSessionStatus()
        if (last === 'READY') {
            logger.error('❌ Session closed from phone (detected via QR)')
            await forceLogout();
        }
        saveQr(qr)
        setSessionStatus('QR')
    })

    // 🔐 Autenticado
    client.on('authenticated', () => {
        logger.info('🔐 WhatsApp authenticated')
        setSessionStatus('AUTHENTICATED')
    })

    // ✅ Cliente listo
    client.on('ready', () => {
        logger.info('✅ WhatsApp connected and ready')
        setSessionStatus('READY')
    })

    client.on('change_state', (state) => {
        logger.warn(`🔄 WhatsApp state changed: ${state}`)

        if (state === 'UNPAIRED' || state === 'UNPAIRED_IDLE') {
            logger.error('❌ WhatsApp session unpaired (logout detected)')
            setSessionStatus('AUTH_FAILURE')

            forceLogout(client)
        }
    })

    // ❌ Sesión inválida / cerrada desde el celular
    client.on('auth_failure', (msg) => {
        logger.error(`❌ Auth failure: ${msg}`)
        setSessionStatus('AUTH_FAILURE')
        try {
            client.destroy()
            logger.warn('🧹 Client destroyed after auth failure')
        } catch (e) {
            logger.error('Error destroying client after auth failure', e)
        }
    })

    // ⚠️ Desconectado
    client.on('disconnected', (reason) => {
        logger.warn(`⚠️ WhatsApp disconnected: ${reason}`)
        setSessionStatus('DISCONNECTED')
        client.destroy()
    })

    // 📩 Mensajes entrantes
    client.on('message', async (message) => {
        if (message.fromMe) return
        if (!message.body) return

        try {
            logger.info(`📩 ${message.from}: "${message.body}"`)

            const contact = await message.getContact()

            await handleIncomingMessage({
                phone: message.from,
                text: message.body,
                name: contact.pushname || contact.name || null
            })

        } catch (err) {
            logger.error('❌ Error handling incoming message')
            logger.error(err)
        }
    })
}