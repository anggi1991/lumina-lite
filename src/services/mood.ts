import { supabase } from './supabase';

export interface Mood {
    id?: string;
    user_id?: string;
    mood_level: number; // 1-5 or 1-7
    note?: string;
    created_at?: string;
}

// Define MoodEntry type for the return value of saveMood
export type MoodEntry = Mood;

export const saveMood = async (userId: string, moodLevel: number, note?: string): Promise<{ data: MoodEntry | null; error: any }> => {
    console.log(`[Mood] Saving mood for user ${userId}: Level ${moodLevel}, Note: ${note || 'None'}`);
    const { data, error } = await supabase
        .from('moods')
        .insert([{ user_id: userId, mood_level: moodLevel, note: note }])
        .select();

    if (error) {
        console.error("[Mood] Error saving mood:", error);
        throw error;
    }
    console.log("[Mood] Mood saved successfully:", data);
    return { data: data ? data[0] : null, error };
};

export const getMoods = async () => {
    const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getWeeklyMoods = async (userId: string) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

    const startDate = sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00';
    const endDate = today.toISOString().split('T')[0] + 'T23:59:59';

    console.log(`[Mood] Fetching weekly moods from ${startDate} to ${endDate}`);

    const { data, error } = await supabase
        .from('moods')
        .select('created_at, mood_level')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[Mood] Error fetching weekly moods:', error.message);
        throw error;
    }
    return data;
};
