import { MESSAGES } from "../constants/messages.js"
import { STEPS } from "../constants/steps.js"
import { isValidDate, isValidIndex, isValidPeopleNumber } from "../flows/flow.validators.js"
import { updateBookingStatus } from "../repositories/booking.repo.js"
import { updateUserMetadata } from "../repositories/user.repo.js"
import { createBooking } from "../services/booking.service.js"
import { getExperienceDetailForWhatsapp, listExperiencesForWhatsapp } from "../services/experience.service.js"
import { notifyAdvisorNewBooking } from "../services/notifications.service.js"
import { updateUserStep } from "../services/user.service.js"

export const stepHandlers = {

    [STEPS.MENU]: async () => ({
        response: MESSAGES.MENU
    }),

    [STEPS.EXPERIENCES_LIST]: async ({ phone }) => {
        const { message, experiences } = await listExperiencesForWhatsapp()

        await updateUserMetadata(phone, { experiences })

        return { response: message }
    },

    [STEPS.EXPERIENCE_DETAIL]: async ({ user, phone, text }) => {
        const index = parseInt(text, 10) - 1
        const experiences = user.metadata?.experiences || []

        if (!isValidIndex(text, experiences.length)) {
            return { response: MESSAGES.INVALID_OPTION }
        }

        const experience = experiences[index]

        await updateUserMetadata(phone, {
            ...user.metadata,
            selected_experience: experience
        })

        return {
            response: getExperienceDetailForWhatsapp(experience)
        }
    },

    [STEPS.BOOKING_START]: async ({ user, phone }) => {
        const experience = user.metadata?.selected_experience

        if (!experience) {
            return {
                response: MESSAGES.INVALID_OPTION,
                forcedStep: STEPS.MENU
            }
        }

        await updateUserMetadata(phone, {
            ...user.metadata,
            booking: { experience_id: experience.id }
        })

        return {
            response: MESSAGES.ASK_BOOKING_DATE,
            forcedStep: STEPS.BOOKING_DATE
        }
    },

    [STEPS.BOOKING_DATE]: async ({ user, phone, text }) => {
        if (!isValidDate(text)) {
            return {
                response: MESSAGES.INVALID_BOOKING_DATE,
                forcedStep: STEPS.BOOKING_DATE
            }
        }

        await updateUserMetadata(phone, {
            ...user.metadata,
            booking: {
                ...user.metadata.booking,
                travel_date: text
            }
        })

        return {
            response: MESSAGES.ASK_BOOKING_PEOPLE,
            forcedStep: STEPS.BOOKING_PEOPLE
        }
    },

    [STEPS.BOOKING_PEOPLE]: async ({ user, phone, text, client }) => {

        if (!isValidPeopleNumber(text)) {
            return {
                response: MESSAGES.INVALID_BOOKING_PEOPLE,
                forcedStep: STEPS.BOOKING_PEOPLE
            }
        }

        const people = parseInt(text, 10)
        const experience = user.metadata.selected_experience
        const bookingDraft = user.metadata.booking

        const total = Number(experience.price_min) * people

        const booking = await createBooking({
            experience_id: bookingDraft.experience_id,
            travel_date: bookingDraft.travel_date,
            number_of_people: people,
            total_price: total,
            currency: experience.currency,
            source: 'whatsapp',
            whatsapp_user_id: user.id
        })

        await updateUserMetadata(phone, { booking: null })
        await updateUserStep(phone, STEPS.END)

        await client.sendMessage(
            phone,
            MESSAGES.BOOKING_SUMMARY({
                name: user.name,
                experience,
                date: bookingDraft.travel_date,
                people,
                total,
                currency: experience.currency
            })
        )

        await notifyAdvisorNewBooking(booking, user, experience)
        await updateBookingStatus(booking.id, 'advisor_notified')

        return { response: null }
    },

    [STEPS.HANDOFF]: async () => ({
        response: MESSAGES.HANDOFF
    }),

    DEFAULT: async () => ({
        response: MESSAGES.INVALID_OPTION
    })
}