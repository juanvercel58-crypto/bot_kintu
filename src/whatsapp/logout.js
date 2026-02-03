import { getWhatsAppClient } from './client.js'
import { logger } from '../utils/logger.js'
import fs from 'fs'
import path from 'path'

const safeDestroy = async (client) => {
    try {
        logger.warn('🧨 Destroying WhatsApp client safely...')
        setTimeout(async () => {
            await client.destroy()
            logger.warn('🧹 Client destroyed safely')
        }, 500) // medio segundo de margen
    } catch (e) {
        logger.error('Error destroying client', e)
    }
}

export const forceLogout = async () => {
    try {
        const client = getWhatsAppClient()
        logger.warn('🧨 Forcing WhatsApp logout...')

        // borrar LocalAuth
        const authPath = path.resolve('./.wwebjs_auth')
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true })
            logger.warn('🧹 LocalAuth deleted')
        }

        await safeDestroy(client)
    } catch (err) {
        logger.error('Error forcing logout', err)
    }
}