import { setSessionStatus } from './session.js'
import { saveQr } from './qr.js'
import { logger } from '../utils/logger.js'
import { handleIncomingMessage } from '../flows/flow.engine.js'

export const registerEvents = (client) => {
    client.on('qr', (qr) => {
        logger.info('📲 QR received')
        saveQr(qr)
        setSessionStatus('QR')
    })

    client.on('ready', () => {
        logger.info('✅ WhatsApp connected')
        setSessionStatus('READY')
    })

    client.on('authenticated', () => {
        logger.info('🔐 WhatsApp authenticated')
        setSessionStatus('AUTHENTICATED')
    })

    client.on('disconnected', (reason) => {
        logger.warn(`⚠️ WhatsApp disconnected: ${reason}`)
        setSessionStatus('DISCONNECTED')
    })

    client.on('message', async (message) => {
        try {
            logger.info(`=======================================`)
            logger.info(`📩 MESSAGE EVENT FIRED`)
            logger.info(`${message.from}: ${message.body}`)

            if (message.fromMe) return
            if (!message.body) return

            const contact = await message.getContact()

            await handleIncomingMessage({
                phone: message.from,
                text: message.body,
                message,
                name: contact.pushname || contact.name || null
            })
        } catch (err) {
            logger.error('❌ Error handling incoming message')
            logger.error(err)
        }
    })

}