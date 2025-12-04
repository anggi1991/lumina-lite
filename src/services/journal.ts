import { supabase } from './supabase';

export interface Journal {
    id?: string;
    user_id?: string;
    content: string;
    mood_tags?: string[];
    created_at?: string;
}

export const saveJournalEntry = async (userId: string, content: string, moodId?: string, tags: string[] = []) => {
    console.log(`[Journal] Saving entry for user ${userId}: "${content.substring(0, 20)}..." (MoodID: ${moodId || 'None'}, Tags: ${tags.join(', ')})`);

    // Combine moodId (if present) with tags, or just use tags. 
    // Ideally mood_tags column stores the tags. mood_id might be separate or we just mix them.
    // Based on previous code: mood_tags: moodId ? [moodId] : []
    // Let's append tags to this.
    const finalTags = [...(moodId ? [moodId] : []), ...tags];

    const { data, error } = await supabase
        .from('journals')
        .insert([{ user_id: userId, content: content, mood_tags: finalTags }])
        .select();

    if (error) {
        console.error('[Journal] Error saving entry:', error.message);
        throw error;
    }
    console.log('[Journal] Entry saved successfully:', data);
    return data;
};

export const getJournalEntries = async (userId: string) => {
    console.log(`[Journal] Fetching entries for user ${userId}...`);
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Journal] Error fetching entries:', error.message);
        throw error;
    }
    return data;
};

export const updateJournalEntry = async (id: string, content: string, tags?: string[]) => {
    console.log(`[Journal] Updating entry ${id}: "${content.substring(0, 20)}..."`);

    const updateData: any = { content: content, updated_at: new Date().toISOString() };
    if (tags) {
        updateData.mood_tags = tags;
    }

    const { data, error } = await supabase
        .from('journals')
        .update(updateData)
        .eq('id', id)
        .select();

    if (error) {
        console.error('[Journal] Error updating entry:', error.message);
        throw error;
    }
    console.log('[Journal] Entry updated successfully:', data);
    return data;
};

export const deleteJournalEntry = async (id: string) => {
    console.log(`[Journal] Deleting entry ${id}`);
    const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[Journal] Error deleting entry:', error.message);
        throw error;
    }
    console.log('[Journal] Entry deleted successfully');
};
