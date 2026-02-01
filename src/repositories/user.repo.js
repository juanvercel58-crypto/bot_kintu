import { db } from '../config/supabase.js'

/**
 * Buscar usuario por teléfono
 */
export const findUserByPhone = async (phone) => {
    const { data, error } = await db
        .from('whatsapp_users')
        .select('*')
        .eq('phone', phone)
        .single()

    if (error && error.code !== 'PGRST116') {
        throw error
    }

    return data
}

/**
 * Insertar nuevo usuario
 */
export const insertUser = async (user) => {
    const { data, error } = await db
        .from('whatsapp_users')
        .insert(user)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Actualizar step del usuario
 */
export const updateUserStepByPhone = async (phone, step) => {
    const { data, error } = await db
        .from('whatsapp_users')
        .update({ step })
        .eq('phone', phone)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Actualizar metadata del usuario
 */
export const updateUserMetadata = async (phone, metadata) => {
    const { data, error } = await db
        .from('whatsapp_users')
        .update({ metadata })
        .eq('phone', phone)
        .select()
        .single()

    if (error) throw error
    return data
}