const normalize = (text = '') =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

// 🧠 Frases típicas de ENTRADA de asesor (5+ variaciones)
const HUMAN_ENTRY_PATTERNS = [
    /hola.*te saluda/,
    /hola.*mi nombre es/,
    /gracias por escribirnos/,
    /sera un gusto poder ayudarte/,
    /bienvenido.*kintu/
]

// 🧠 Frases típicas de SALIDA de asesor (5+ variaciones)
const HUMAN_EXIT_PATTERNS = [
    /gracias por tu preferencia/,
    /ha sido un gusto ayudarte/,
    /que tengas un excelente dia/,
    /estamos para ayudarte/,
    /hasta una proxima oportunidad/,
    /conversación finalizada/,
    /finalizado/
]

export const isHumanEntryMessage = (text) => {
    const normalized = normalize(text)
    return HUMAN_ENTRY_PATTERNS.some(pattern => pattern.test(normalized))
}

export const isHumanExitMessage = (text) => {
    const normalized = normalize(text)
    return HUMAN_EXIT_PATTERNS.some(pattern => pattern.test(normalized))
}