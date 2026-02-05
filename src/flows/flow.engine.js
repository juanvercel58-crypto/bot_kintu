import { getWhatsAppClient } from '../whatsapp/client.js'
import { logger } from '../utils/logger.js'
import { STEPS } from '../constants/steps.js'
import { MESSAGES } from '../constants/messages.js'
import { resolveNextStep } from './flow.router.js'
import { getUser, createUser, updateUserStep } from '../services/user.service.js'
import { stepHandlers } from '../handlers/step.handler.js'
import { isGreetingIntent } from './flow.intent.js'

const normalizeText = (text = '') => text.toLowerCase().trim()

export const handleIncomingMessage = async ({ phone, text, name }) => {
    const client = getWhatsAppClient()
    const normalizedText = normalizeText(text)

    let response = null
    let nextStep = null

    try {
        let user = await getUser(phone)

        // 🆕 Usuario nuevo
        if (!user) {
            user = await createUser({ phone, step: STEPS.MENU, name })

            response = `${MESSAGES.WELCOME(name)}\n\n${MESSAGES.MENU}`
            nextStep = STEPS.MENU
        }

        // 👋 Saludo global
        else if (isGreetingIntent(normalizedText)) {
            response = `${MESSAGES.WELCOME(user.name)}\n\n${MESSAGES.MENU}`
            nextStep = STEPS.MENU
        }

        // 🔁 Flujo normal
        else {
            nextStep = resolveNextStep(user.step, normalizedText)
            const handler = stepHandlers[nextStep] || stepHandlers.DEFAULT

            const result = await handler({
                user,
                phone,
                text: normalizedText
            })

            response = result?.response || null
            nextStep = result?.forcedStep || nextStep
        }

        // 🔄 Persistir estado
        if (nextStep && nextStep !== user?.step) {
            await updateUserStep(phone, nextStep)
        }

        // 📤 Envío ÚNICO
        if (response) {
            await client.sendMessage(phone, response)
        }

        logger.info(`FLOW ${user?.step || 'NEW'} → ${nextStep} | "${normalizedText}"`)

    } catch (error) {
        logger.error(`❌ Flow engine error: ${error.message}`)
    }
}