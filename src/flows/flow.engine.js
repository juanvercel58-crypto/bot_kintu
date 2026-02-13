import { getWhatsAppClient } from '../whatsapp/client.js'
import { logger } from '../utils/logger.js'
import { STEPS } from '../constants/steps.js'
import { MESSAGES } from '../constants/messages.js'
import { resolveNextStep } from './flow.router.js'
import { getUser, createUser, updateUserStep } from '../services/user.service.js'
import { stepHandlers } from '../handlers/step.handler.js'
import { isGreetingIntent } from './flow.intent.js'
import { notifyAdvisorbyClient } from '../services/notifications.service.js'
import { isHumanEntryMessage, isHumanExitMessage } from './flow.handoff.detector.js'

const normalizeText = (text = '') => text.toLowerCase().trim()

// 💡 Control de concurrencia por chat
const activeFlows = new Map() // phone => true/false
// 🛑 Chats que ya están en HANDOFF
const handoffChats = new Set()

export const handleIncomingMessage = async ({ phone, text, name }) => {
    const client = getWhatsAppClient()
    const normalizedText = normalizeText(text)

    if (isHumanEntryMessage(text)) {
        handoffChats.add(phone)
        logger.info(`🛑 Human advisor detected. Bot stopped for ${phone}`);
        return
    }

    if (isHumanExitMessage(text)) {
        if (handoffChats.has(phone)) {
            handoffChats.delete(phone)
            logger.info(`♻️ Human exit detected. Bot reactivated for ${phone}`)
        }
        return
    }

    // ❌ Si el chat ya está en HANDOFF, no procesar
    if (handoffChats.has(phone)) {
        logger.info(`🤖 Bot stopped for ${phone} (HANDOFF active)`)
        return
    }

    // ❌ Evitar doble procesamiento
    if (activeFlows.get(phone)) return;
    activeFlows.set(phone, true)

    try {
        let user = await getUser(phone)
        let response = null
        let nextStep = null

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
                text: normalizedText,
                client
            })

            response = result?.response || null
            nextStep = result?.forcedStep || nextStep
        }

        // 🛠️ Si entramos a HANDOFF, detener el bot en este chat
        if (nextStep === STEPS.HANDOFF) {
            handoffChats.add(phone)
            logger.info(`🛑 Chat ${phone} moved to HANDOFF, bot will stop here.`)
            await notifyAdvisorbyClient(user, client)
        }

        // 🔄 Persistir estado
        if (nextStep && nextStep !== user?.step) {
            await updateUserStep(phone, nextStep)
        }

        // 📤 Envío de mensaje único
        if (response) {
            await client.sendMessage(phone, response)
        }

        logger.info(`FLOW ${user?.step || 'NEW'} → ${nextStep} | "${normalizedText}"`)

    } catch (error) {
        logger.error(`❌ Flow engine error: ${error.message}`)
    } finally {
        activeFlows.delete(phone)
    }
}

/**
 * 💡 Función auxiliar para reiniciar el bot si se termina la conversación con el asesor
 */
export const resetBotForChat = (phone) => {
    if (handoffChats.has(phone)) {
        handoffChats.delete(phone)
        logger.info(`♻️ Chat ${phone} reactivated for bot.`)
    }
}