import { supabase } from './supabase';

import i18n from '../i18n'; // Import i18n instance

export interface AIInsight {
    mood_level: number;
    journal_content: string;
    analysis: string; // Changed from insight to analysis to match usage
    affirmation: string;
    actionable_steps: string[];
    isMock?: boolean; // Added isMock
}

export const generateInsight = async (moodLevel: number, journalContent: string): Promise<AIInsight | null> => {
    console.log(`[AI] Generating insight for Mood Level ${moodLevel}. Content length: ${journalContent?.length || 0}`);
    try {
        const currentLang = i18n.language || 'id'; // Default to Indonesian if undefined
        const { data, error } = await supabase.functions.invoke('generate-insight', {
            body: { mood_level: moodLevel, journal_content: journalContent, language: currentLang },
        });

        if (error) {
            console.error('[AI] Error invoking function:', error);
            throw error;
        }

        console.log('[AI] Insight generated successfully:', data);

        // Map server response (insight) to client interface (analysis)
        return {
            ...data,
            analysis: data.insight || data.analysis, // Handle both cases
        } as AIInsight;
    } catch (error) {
        console.error('[AI] Unexpected error:', error);
        // Mock Fallback
        console.log('[AI] Using Mock Data due to error.');
        return {
            mood_level: moodLevel,
            journal_content: journalContent,
            analysis: "Ini adalah insight simulasi karena layanan AI sedang tidak tersedia. Tetap semangat dan jangan menyerah!",
            affirmation: "Saya kuat dan mampu menghadapi tantangan hari ini.",
            actionable_steps: ["Tarik napas dalam-dalam", "Minum air putih", "Istirahat sejenak"],
            isMock: true
        };
    }
};
