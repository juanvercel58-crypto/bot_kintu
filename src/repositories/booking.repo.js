import { db } from '../config/supabase.js'

export const insertBooking = async (book) => {
    const { data, error } = await db
        .from('bookings')
        .insert(book)
        .select()
        .single()

    if (error) throw error
    return data
}

const ALLOWED_STATUS = [
    'pending',
    'advisor_notified',
    'contacted',
    'confirmed',
    'payment_pending',
    'paid',
    'completed',
    'cancelled'
]

export const updateBookingStatus = async (id, status) => {
    if (!ALLOWED_STATUS.includes(status)) {
        throw new Error(`Invalid booking status: ${status}`)
    }

    const { data, error } = await db
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}
