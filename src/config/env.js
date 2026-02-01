import dotenv from 'dotenv'

dotenv.config()

const required = [
    'PORT',
    'WHATSAPP_CLIENT_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
]

required.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`❌ Missing environment variable: ${key}`)
    }
})

export const ENV = {
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV || 'production',
    WHATSAPP: {
        CLIENT_ID: process.env.WHATSAPP_CLIENT_ID,
        AUTH_PATH: process.env.WHATSAPP_AUTH_PATH || '.wwebjs_auth',
        ADVISOR: process.env.WHATSAPP_ADVISOR || '51993507707'
    },
    SUPABASE: {
        URL: process.env.SUPABASE_URL,
        SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
    },
    BOT: {
        NAME: process.env.BOT_NAME || 'Kintu Bot',
        LANGUAGE: process.env.BOT_LANGUAGE || 'es',
        TIMEZONE: process.env.BOT_TIMEZONE || 'America/Lima'
    }
}