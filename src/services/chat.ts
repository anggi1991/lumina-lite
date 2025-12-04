import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: number;
}

export const checkChatQuota = async (isPremium: boolean): Promise<{ allowed: boolean; remaining: number }> => {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `chat_usage_${today}`;
    const usageStr = await AsyncStorage.getItem(usageKey);
    const usage = usageStr ? parseInt(usageStr) : 0;

    const limit = isPremium ? 50 : 3;
    const remaining = Math.max(0, limit - usage);

    return {
        allowed: usage < limit,
        remaining
    };
};

export const incrementChatQuota = async () => {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `chat_usage_${today}`;
    const usageStr = await AsyncStorage.getItem(usageKey);
    const usage = usageStr ? parseInt(usageStr) : 0;
    await AsyncStorage.setItem(usageKey, (usage + 1).toString());
};

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('chat-assistant', {
            body: {
                message,
                history: history.map(h => ({ role: h.isUser ? 'user' : 'assistant', content: h.text })),
                language: i18n.language || 'id'
            },
        });

        if (error) throw error;
        return data.reply;
    } catch (error) {
        console.error('[Chat] Error:', error);
        // Fallback Mock Response
        return "Maaf, Lumi sedang mengalami gangguan koneksi. Tapi aku di sini mendengarkanmu. Ceritakan lebih lanjut?";
    }
};
