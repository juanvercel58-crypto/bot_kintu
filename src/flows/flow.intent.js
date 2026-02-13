const GREETINGS = [
    'hola',
    'buenas',
    'buenos dias',
    'buenas tardes',
    'buenas noches',
    'hello',
    'hi',
    'consulta',
    'info',
    'informacion',
    'información',
    'Deseo más información',
    'Quiero hacer una reserva',
    'reservar',
    'tours',
    'Quiero vivir la experiencia'
]

export const isGreetingIntent = (text = '') => {
    const normalized = text.toLowerCase().trim()
    return GREETINGS.some(word => normalized.includes(word))
}