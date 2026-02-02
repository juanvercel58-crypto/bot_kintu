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
    try {
        const client = getWhatsAppClient()
        const normalizedText = normalizeText(text)

        let user = await getUser(phone)

        // 🆕 Usuario nuevo
        if (!user) {
            user = await createUser({ phone, step: STEPS.MENU, name })
            await client.sendMessage(phone, MESSAGES.WELCOME(name))
            await client.sendMessage(phone, MESSAGES.MENU)
            return
        }

        // 👋 Saludo global (no rompe flujos)
        if (isGreetingIntent(normalizedText)) {
            await updateUserStep(phone, STEPS.MENU)
            await client.sendMessage(phone, MESSAGES.WELCOME(user.name))
            await client.sendMessage(phone, MESSAGES.MENU)
            return
        }

        // 🔁 Resolver handler a ejecutar
        const nextStep = resolveNextStep(user.step, normalizedText)
        const handler = stepHandlers[nextStep] || stepHandlers.DEFAULT

        const { response, forcedStep } = await handler({
            user,
            phone,
            text: normalizedText,
            client
        })

        const finalStep = forcedStep || nextStep

        if (finalStep !== user.step) {
            await updateUserStep(phone, finalStep)
        }

        if (response) {
            await client.sendMessage(phone, response)
        }

        logger.info(`FLOW ${user.step} → ${finalStep} | "${normalizedText}"`)
    } catch (error) {
        logger.error(`❌ Flow engine error: ${error.message}`)
    }
}