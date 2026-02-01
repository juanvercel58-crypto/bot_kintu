import pkg from 'whatsapp-web.js'
import { ENV } from './env.js'

const { LocalAuth } = pkg;

export const whatsappConfig = {
    authStrategy: new LocalAuth({
        clientId: ENV.WHATSAPP.CLIENT_ID,
        dataPath: ENV.WHATSAPP.AUTH_PATH
    }),
    puppeteer: {
        headless: true,
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
}