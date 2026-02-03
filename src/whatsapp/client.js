import pkg from 'whatsapp-web.js';
import { whatsappConfig } from '../config/whatsapp.js';
import { registerEvents } from './events.js';
import { logger } from '../utils/logger.js';

let client;

export const initWhatsApp = () => {

    const { Client, LocalAuth } = pkg;

    if (client) return client;

    logger.info('🚀 Initializing WhatsApp client...');

    client = new Client({
        ...whatsappConfig,
        authStrategy: new LocalAuth({
            dataPath: '/app/.wwebjs_auth'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote'
            ]  
        },
        restartOnAuthFail: false
    });

    registerEvents(client);
    client.initialize();
    return client;
};

export const getWhatsAppClient = () => {
    if (!client) throw new Error('WhatsApp client not initialized');
    return client;
};