export const MESSAGES = {
  WELCOME: (name = '') => 
`👋 Hola${name ? ` ${name}` : ''}, soy *Kintu*, el asistente de Kintu Travel Expeditions.
Viajar con nosotros es reconectar contigo mismo 🌿`,

  MENU: `¿Cómo te gustaría continuar?

1️⃣ Ver experiencias  
2️⃣ Cotizar o reservar  
3️⃣ Hablar con una persona`,

  INVALID_OPTION: `No entendí tu mensaje 😅  
Por favor responde con una de las opciones del menú.`,

  HANDOFF: `Perfecto 🙌  
Un asesor humano continuará contigo en breve.`,

  // =========================
  // 📌 RESERVAS / BOOKING
  // =========================

  BOOKING_START: `📝 Excelente decisión ✨  
Para ayudarte con tu reserva, necesito algunos datos.`,

  ASK_BOOKING_DATE: `📅 ¿Para qué fecha te gustaría viajar?  
Escríbela en el formato *YYYY-MM-DD*`,

  INVALID_BOOKING_DATE: `❌ La fecha no tiene el formato correcto.  
Por favor usa *YYYY-MM-DD* (ejemplo: 2026-05-18)`,

  ASK_BOOKING_PEOPLE: `👥 ¿Cuántas personas viajarán?`,

  INVALID_BOOKING_PEOPLE: `❌ Por favor indica un número válido de personas.`,

  BOOKING_SUMMARY: ({ name, experience, date, people, total, currency }) =>
`📋 *Resumen de tu reserva*${name ? `, ${name}` : ''}

🌄 *Experiencia:* ${experience.experience_name}
🗺️ *Tour:* ${experience.tour_name}
📅 *Fecha de viaje:* ${date}
👥 *Personas:* ${people}
💰 *Total estimado:* ${total} ${currency}

Un asesor te contactará en breve para confirmar disponibilidad 🙌`,
  BOOKING_CONFIRMATION: (name, total, currency = 'PEN') =>
`✅ ¡Perfecto${name ? `, ${name}` : ''}!  

Hemos registrado tu solicitud de reserva.
💰 *Total estimado:* ${total} ${currency}

Un asesor te confirmará disponibilidad y el siguiente paso 💬`
}