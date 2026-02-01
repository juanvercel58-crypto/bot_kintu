import { findUserByPhone, insertUser, updateUserStepByPhone } from '../repositories/user.repo.js'

/**
 * Obtener usuario por teléfono
 */
export const getUser = async (phone) => {
    return await findUserByPhone(phone)
}

/**
 * Crear nuevo usuario
 */
export const createUser = async ({ phone, step, name }) => {
    return await insertUser({
        phone,
        step,
        is_handoff: false,
        metadata: {},
        name,
    })
}

/**
 * Actualizar paso del flujo
 */
export const updateUserStep = async (phone, step) => {
    return await updateUserStepByPhone(phone, step)
}


/**
 * Actualizar reservas del usuario
 */
export const saveBookingDraft = async (phone, data) => {
    return await updateUserMetadata(phone, data)
}