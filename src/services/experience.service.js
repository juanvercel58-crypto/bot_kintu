import { getPublishedExperiences } from '../repositories/experience.repo.js'

export const listExperiencesForWhatsapp = async () => {
    
    const experiences = await getPublishedExperiences()

    if (!experiences || experiences.length === 0) {
        return {
            message: '🌿 En este momento no tenemos experiencias disponibles.',
            experiences: []
        }
    }

    let message = `🌿 *Experiencias disponibles*\n\n`

    experiences.forEach((exp, index) => {
        message += `${index + 1}️⃣ *${exp.experience_name}*\n`
    })

    message += `\nResponde con el número para ver más detalles.`

    return {
        message,
        experiences
    }
}

export const getExperienceDetailForWhatsapp = (experience) => {
    return (
        `🌿 *${experience.experience_name}*\n\n` +
        `🕒 Duración: ${experience.duration || 'Por confirmar'}\n` +
        `💪 Dificultad: ${experience.difficulty_level || 'Todos los niveles'}\n` +
        `💰 Precio: ${experience.price_min || 'Consultar'} ${experience.currency || ''}\n\n` +
        `¿Qué te gustaría hacer?\n\n` +
        `1️⃣ Reservar esta experiencia\n` +
        `2️⃣ Ver otras experiencias\n` +
        `3️⃣ Hablar con una persona`
    )
}