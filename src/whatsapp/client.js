import { Client } from 'whatsapp-web.js'
import { whatsappConfig } from '../config/whatsapp.js'
import { registerEvents } from './events.js'
import { logger } from '../utils/logger.js'

let client

export const initWhatsApp = () => {
    if (client) return client

    logger.info('🚀 Initializing WhatsApp client...')

    client = new Client(whatsappConfig)

    registerEvents(client)

    client.initialize()

    return client
}

export const getWhatsAppClient = () => {
    if (!client) {
        throw new Error('WhatsApp client not initialized')
    }
    return client
}