import { db } from '../config/supabase.js'

export const getPublishedExperiences = async () => {
    const { data, error } = await db
        .from('experiences')
        .select(`
            id,
            code,
            experience_name,
            tour_name,
            duration,
            difficulty_level,
            availability,
            price_min,
            price_max,
            currency
        `)
        .eq('published', true)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}
