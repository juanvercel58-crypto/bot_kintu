export const isValidIndex = (text, max) => {
    const index = parseInt(text, 10)
    return !isNaN(index) && index > 0 && index <= max
}

export const isValidDate = (text) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(text)
}

export const isValidPeopleNumber = (text) => {
    const n = parseInt(text, 10)
    return !isNaN(n) && n > 0 && n <= 20
}