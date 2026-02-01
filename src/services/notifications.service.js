import { ENV } from '../config/env.js'
import { getWhatsAppClient } from '../whatsapp/client.js'

export const notifyAdvisorNewBooking = async (booking, user, experience) => {
    const client = getWhatsAppClient()
    const advisorPhone = ENV.WHATSAPP.ADVISOR;

    if (!advisorPhone) {
        console.warn('⚠️ ADVISOR_WHATSAPP no definido')
        return;
    }

    const isRegistered = await client.isRegisteredUser(advisorPhone)

    if (!isRegistered) {
        console.warn(`⚠️ Asesor no registrado en WhatsApp: ${advisorPhone}`)
        return
    }

    const message = `
📢 *Nueva reserva desde WhatsApp*

👤 Cliente: ${user.name || 'Sin nombre'}
📞 Teléfono: ${user.phone}

🌄 Experiencia: ${experience.experience_name}
🗺️ Tour: ${experience.tour_name}

📅 Fecha: ${booking.travel_date}
👥 Personas: ${booking.number_of_people}
💰 Total: ${booking.total_price} ${booking.currency}

🆔 Booking ID: ${booking.id}
    `.trim()

    await client.sendMessage(advisorPhone, message)
}