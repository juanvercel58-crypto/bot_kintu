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
    'información'
]

export const isGreetingIntent = (text = '') => {
    const normalized = text.toLowerCase().trim()
    return GREETINGS.some(word => normalized.includes(word))
}