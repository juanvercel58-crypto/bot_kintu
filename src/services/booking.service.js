import { insertBooking } from "../repositories/booking.repo.js"

export const createBooking = async (booking) => {
    return await insertBooking({
        ...booking,
        status: 'pending'
    })
}