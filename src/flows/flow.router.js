import { STEPS } from '../constants/steps.js'

export const resolveNextStep = (currentStep, text) => {

    // 📌 MENÚ PRINCIPAL
    if (currentStep === STEPS.MENU) {
        if (text === '1') return STEPS.EXPERIENCES_LIST
        if (text === '2') return STEPS.BOOKING_START
        if (text === '3') return STEPS.HANDOFF
        return STEPS.MENU
    }

    // 📌 LISTA → DETALLE (solo si es número)
    if (currentStep === STEPS.EXPERIENCES_LIST) {
        if (/^\d+$/.test(text)) {
            return STEPS.EXPERIENCE_DETAIL
        }
        return STEPS.EXPERIENCES_LIST
    }

    // 📌 DETALLE → INICIAR RESERVA
    if (currentStep === STEPS.EXPERIENCE_DETAIL) {
        if (text === '1') return STEPS.BOOKING_START
        return STEPS.EXPERIENCE_DETAIL
    }

    // Flujos guiados NO se resuelven aquí
    return currentStep
}