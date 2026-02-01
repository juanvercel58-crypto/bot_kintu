import { getWhatsAppClient } from '../whatsapp/client.js' 
import { logger } from '../utils/logger.js' 
import { STEPS } from '../constants/steps.js' 
import { MESSAGES } from '../constants/messages.js' 
import { resolveNextStep } from './flow.router.js' 
import { getUser, createUser, updateUserStep } from '../services/user.service.js'
import { getExperienceDetailForWhatsapp, listExperiencesForWhatsapp } from '../services/experience.service.js'
import { updateUserMetadata } from '../repositories/user.repo.js'
import { isValidDate, isValidIndex, isValidPeopleNumber } from './flow.validators.js'
import { createBooking } from '../services/booking.service.js'
import { notifyAdvisorNewBooking } from '../services/notifications.service.js'
import { updateBookingStatus } from '../repositories/booking.repo.js'

const normalizeText = (text = '') => text.toLowerCase().trim()

export const handleIncomingMessage = async ({ phone, text, name }) => {
    try {
        
        logger.info(`📩 Message from ${phone}: ${text}`)

        const client = getWhatsAppClient()
        const normalizedText = normalizeText(text)

        let user = await getUser(phone)

        // 🆕 Usuario nuevo
        if (!user) {
            user = await createUser({
                phone,
                step: STEPS.WELCOME,
                name
            })

            await client.sendMessage(phone, MESSAGES.WELCOME(user.name))
            await client.sendMessage(phone, MESSAGES.MENU)
            return
        }

        // 🔁 Resolver siguiente paso
        const nextStep = resolveNextStep(user.step, normalizedText)

        let response = null

        switch (nextStep) {

            case STEPS.MENU:
                response = MESSAGES.MENU
                break

            case STEPS.EXPERIENCES_LIST: {
                const { message, experiences } = await listExperiencesForWhatsapp()
                response = message
                await updateUserMetadata(phone, {
                    ...user.metadata,
                    experiences
                })
                break
            }

            case STEPS.EXPERIENCE_DETAIL: {
                const index = parseInt(normalizedText, 10) - 1
                const experiences = user.metadata?.experiences || []

                if (!isValidIndex(normalizedText, experiences.length)) {
                    response = MESSAGES.INVALID_OPTION
                    break
                }

                const experience = experiences[index]

                response = getExperienceDetailForWhatsapp(experience)

                await updateUserMetadata(phone, {
                    ...user.metadata,
                    selected_experience: experience
                })
                break
            }

            case STEPS.BOOKING_START: {

                const selectedExperience = user.metadata?.selected_experience
                
                if (!selectedExperience) {
                    response = MESSAGES.INVALID_OPTION
                    await updateUserStep(phone, STEPS.MENU)
                    break
                }

                await updateUserMetadata(phone, {
                    ...user.metadata,
                    booking: {
                        experience_id: selectedExperience.id
                    }
                })

                response = MESSAGES.ASK_BOOKING_DATE
                await updateUserStep(phone, STEPS.BOOKING_DATE)
                break
            }

            case STEPS.BOOKING_DATE: {
                if (!isValidDate(normalizedText)) {
                    response = MESSAGES.INVALID_BOOKING_DATE
                    break
                }

                await updateUserMetadata(phone, {
                    ...user.metadata,
                    booking: {
                        ...user.metadata.booking,
                        travel_date: normalizedText
                    }
                })

                response = MESSAGES.ASK_BOOKING_PEOPLE
                await updateUserStep(phone, STEPS.BOOKING_PEOPLE)
                break
            }

            case STEPS.BOOKING_PEOPLE: {
                if (!isValidPeopleNumber(normalizedText)) {
                    response = MESSAGES.INVALID_BOOKING_PEOPLE
                    break
                }

                const bookingDraft = user.metadata.booking
                const numberOfPeople = parseInt(normalizedText, 10)
                const selectedExperience = user.metadata.selected_experience

                if (!bookingDraft || !selectedExperience) {
                    response = MESSAGES.INVALID_OPTION
                    await updateUserStep(phone, STEPS.MENU)
                    break
                }

                const pricePerPerson = Number(selectedExperience.price_min)
                const totalPrice = pricePerPerson * numberOfPeople

                const booking = await createBooking({
                    experience_id: bookingDraft.experience_id,
                    travel_date: bookingDraft.travel_date,
                    number_of_people: numberOfPeople,
                    total_price: totalPrice,
                    currency: selectedExperience.currency,
                    source: 'whatsapp',
                    whatsapp_user_id: user.id
                })

                logger.info(`✅ Booking creado: ${booking.id}`)

                await updateUserMetadata(phone, {
                    ...user.metadata,
                    booking: null
                })

                // 🔚 Finalizar flujo
                await updateUserStep(phone, STEPS.END)

                await client.sendMessage(
                    phone,
                    MESSAGES.BOOKING_SUMMARY({
                        name: user.name,
                        experience: selectedExperience,
                        date: bookingDraft.travel_date,
                        people: numberOfPeople,
                        total: totalPrice,
                        currency: selectedExperience.currency
                    })
                )

                try {
                    await notifyAdvisorNewBooking(booking, user, selectedExperience)
                } catch (error) {
                    logger.warn('⚠️ No se pudo notificar al asesor', error.message)
                }
                
                await updateBookingStatus(booking.id, 'advisor_notified')

                break
            }

            case STEPS.HANDOFF:
                response = MESSAGES.HANDOFF
                break

            default:
                response = MESSAGES.INVALID_OPTION
        }

        await updateUserStep(phone, nextStep)
        await client.sendMessage(phone, response)
    } catch (error) {
        console.error(error);
        logger.error(`❌ Flow engine error: ${error.message}`)
    }
}