import { setSessionStatus } from './session.js'
import { saveQr } from './qr.js'
import { logger } from '../utils/logger.js'
import { handleIncomingMessage } from '../flows/flow.engine.js'

let eventsRegistered = false

export const registerEvents = (client) => {
    
    if (eventsRegistered) {
        logger.warn('⚠️ WhatsApp events already registered, skipping...')
        return
    }

    eventsRegistered = true
    logger.info('📡 Registering WhatsApp events...')

    // 📲 QR generado
    client.on('qr', (qr) => {
        logger.info('📲 QR received')
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

    // ❌ Sesión inválida / cerrada desde el celular
    client.on('auth_failure', (msg) => {
        logger.error(`❌ Auth failure: ${msg}`)
        setSessionStatus('AUTH_FAILURE')
    })

    // ⚠️ Desconectado
    client.on('disconnected', (reason) => {
        logger.warn(`⚠️ WhatsApp disconnected: ${reason}`)
        setSessionStatus('DISCONNECTED')
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