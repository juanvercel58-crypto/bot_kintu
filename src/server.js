import app from './app.js'
import { ENV } from './config/env.js'
import { initWhatsApp } from './whatsapp/client.js'
import { logger } from './utils/logger.js'

// Inicializar WhatsApp
initWhatsApp()

// Levantar servidor
app.listen(ENV.PORT, () => {
    logger.info(`🚀 Server running on port ${ENV.PORT}`)
})