import { Client } from 'whatsapp-web.js';
import { whatsappConfig } from '../config/whatsapp.js';
import { registerEvents } from './events.js';
import { logger } from '../utils/logger.js';
//import puppeteer from 'puppeteer-core';

let client;

export const initWhatsApp = () => {
    if (client) return client;

    logger.info('🚀 Initializing WhatsApp client...');

    client = new Client({
        ...whatsappConfig,
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/chromium-browser', // 👈 path en Railway
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
    });

    registerEvents(client);
    client.initialize();
    return client;
};

export const getWhatsAppClient = () => {
    if (!client) throw new Error('WhatsApp client not initialized');
    return client;
};