import { STEPS } from '../constants/steps.js'

export function resolveNextStep(currentStep, message) {
    const text = message.trim().toLowerCase()

    switch (currentStep) {
        case STEPS.WELCOME:
            return STEPS.MENU

        case STEPS.MENU:
            if (text === '1') return STEPS.EXPERIENCES_LIST
            if (text === '2') return STEPS.BOOKING_START
            if (text === '3') return STEPS.HANDOFF
            return STEPS.MENU

        case STEPS.EXPERIENCES_LIST:
            if (/^\d+$/.test(text)) return STEPS.EXPERIENCE_DETAIL
            return STEPS.EXPERIENCES_LIST

        case STEPS.EXPERIENCE_DETAIL:
            if (text === '1') return STEPS.BOOKING_START
            if (text === '2') return STEPS.EXPERIENCES_LIST
            if (text === '3') return STEPS.HANDOFF
            return STEPS.EXPERIENCE_DETAIL

        case STEPS.BOOKING_START:
            return STEPS.BOOKING_DATE

        case STEPS.BOOKING_DATE:
            return STEPS.BOOKING_PEOPLE

        case STEPS.BOOKING_PEOPLE:
            return STEPS.END

        case STEPS.HANDOFF:
            return STEPS.HANDOFF

        default:
            return STEPS.MENU
    }
}