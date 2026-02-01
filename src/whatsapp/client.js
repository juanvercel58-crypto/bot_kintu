import { Client } from 'whatsapp-web.js'
import { whatsappConfig } from '../config/whatsapp.js'
import { registerEvents } from './events.js'
import { logger } from '../utils/logger.js'

let client

export const initWhatsApp = () => {
    if (client) return client

    logger.info('🚀 Initializing WhatsApp client...')

    const config = {
        ...whatsappConfig,
        puppeteer: {
            headless: true, // headless obligatorio
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    };

    client = new Client(config)

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