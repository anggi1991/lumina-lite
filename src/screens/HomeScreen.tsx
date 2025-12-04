import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { saveMood, getWeeklyMoods } from '../services/mood';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { usePremium } from '../context/PremiumContext';
import { AddEntryIcon } from '../components/icons/AddEntryIcon';
import { AIInsightIcon } from '../components/icons/AIInsightIcon';
import { HappyIcon } from '../components/icons/HappyIcon';
import { SadIcon } from '../components/icons/SadIcon';
import { NeutralIcon } from '../components/icons/NeutralIcon';
import { StressedIcon } from '../components/icons/StressedIcon';
import { ExcitedIcon } from '../components/icons/ExcitedIcon';
import { JournalIcon } from '../components/icons/JournalIcon';
import { LuminaLogo } from '../components/icons/LuminaLogo';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { isPremium } = usePremium();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [todayEntries, setTodayEntries] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    const moods = [
        { level: 1, value: 1, Icon: SadIcon },
        { level: 2, value: 2, Icon: StressedIcon },
        { level: 3, value: 3, Icon: NeutralIcon },
        { level: 4, value: 4, Icon: HappyIcon },
        { level: 5, value: 5, Icon: ExcitedIcon },
    ];

    useEffect(() => {
        console.log('[Screen] HomeScreen mounted.');
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTodayData();
        }, [fetchTodayData])
    );

    const processWeeklyData = useCallback((data: any[]) => {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const trend = last7Days.map(date => {
            const dayMoods = data.filter((m: any) => m.created_at.startsWith(date));
            if (dayMoods.length === 0) return { date, value: 0 };
            const sum = dayMoods.reduce((acc: number, curr: any) => acc + curr.mood_level, 0);
            return { date, value: sum / dayMoods.length };
        });
        setWeeklyData(trend);
    }, []);

    const fetchTodayData = useCallback(async () => {
        try {
            const { data: { user: fetchedUser } } = await supabase.auth.getUser();
            if (!fetchedUser) return;
            setUser(fetchedUser);

            const today = new Date().toISOString().split('T')[0];
            const startOfDay = today + 'T00:00:00';
            const endOfDay = today + 'T23:59:59';

            // Fetch latest mood
            const { data: moods } = await supabase
                .from('moods')
                .select('*')
                .eq('user_id', fetchedUser.id)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false })
                .limit(1);

            if (moods && moods.length > 0) {
                setSelectedMood(moods[0].mood_level);
            } else {
                setSelectedMood(null);
            }

            // Fetch ALL journals for today
            const { data: journals } = await supabase
                .from('journals')
                .select('*')
                .eq('user_id', fetchedUser.id)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false });

            if (journals) {
                setTodayEntries(journals);
            } else {
                setTodayEntries([]);
            }

            // Fetch weekly moods
            const weeklyMoods = await getWeeklyMoods(fetchedUser.id);
            processWeeklyData(weeklyMoods);

        } catch (error) {
            console.error('Error fetching today data:', error);
        }
    }, [processWeeklyData]);

    const handleMoodSelectAndNavigate = async (level: number) => {
        setSelectedMood(level);
        console.log(`[HomeScreen] Mood selected: ${level} `);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                await saveMood(currentUser.id, level);
                // Refresh data to update chart immediately
                fetchTodayData();
            }
            navigation.navigate('Insight', { moodLevel: level });
        } catch (error) {
            console.error(error);
        }
    };

    const renderWeeklySummary = () => {
        if (weeklyData.every(d => d.value === 0)) {
            return (
                <View style={styles.statsContent}>
                    <Text style={{ color: theme.colors.secondary }}>{t('analytics.noData')}</Text>
                </View>
            );
        }

        // Calculate average mood
        const validDays = weeklyData.filter(d => d.value > 0);
        const sum = validDays.reduce((acc, curr) => acc + curr.value, 0);
        const average = validDays.length > 0 ? Math.round(sum / validDays.length) : 0;

        const MoodIconComponent = moods.find(m => m.value === average)?.Icon || NeutralIcon;

        return (
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                <View style={styles.summaryContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginRight: 8 }}>
                            {t('home.averageMood')}: <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{t(`moods.${average}`)}</Text>
                        </Text>
                        <MoodIconComponent theme={theme.dark ? 'dark' : 'light'} size={24} />
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 4 }}>
                        {t('home.viewDetails')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const handleJournalPress = () => {
        if (isPremium) {
            // Premium: Always create new
            navigation.navigate('JournalEntry', { entry: null });
        } else {
            // Free: Edit if exists, else create
            if (todayEntries.length > 0) {
                navigation.navigate('JournalEntry', { entry: todayEntries[0] });
            } else {
                navigation.navigate('JournalEntry', { entry: null });
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text variant="titleMedium" style={styles.greeting}>{t('home.greeting')},</Text>
                        <Text variant="headlineMedium" style={styles.username}>
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
                        </Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>{t('home.moodPrompt')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <LuminaLogo size={48} transparent theme={theme.dark ? 'dark' : 'light'} />
                    </TouchableOpacity>
                </View>

                {/* Mood Picker Section */}
                <Surface style={styles.moodCard} elevation={1}>
                    <View style={styles.moodContainer}>
                        {moods.map((m) => (
                            <TouchableOpacity
                                key={m.value}
                                onPress={() => handleMoodSelectAndNavigate(m.value)}
                                style={[
                                    styles.moodButton,
                                    selectedMood === m.value && styles.moodButtonSelected
                                ]}
                            >
                                <m.Icon theme={theme.dark ? 'dark' : 'light'} size={32} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Surface>

                {/* CTA / Journal Card */}
                <Surface style={styles.journalCard} elevation={2}>
                    <View style={styles.journalHeader}>
                        <Text variant="titleLarge" style={styles.cardTitle}>
                            {/* Title logic */}
                            {isPremium 
                                ? t('home.writeJournal') 
                                : (todayEntries.length > 0 ? t('home.editJournal') : t('home.writeJournal'))
                            }
                        </Text>
                        <IconButton
                            icon={({ size, color }) => 
                                (!isPremium && todayEntries.length > 0) ? 
                                <JournalIcon size={size} color={color} theme={theme.dark ? 'dark' : 'light'} /> : 
                                <AddEntryIcon size={size} color={color} theme={theme.dark ? 'dark' : 'light'} />
                            }
                            mode="contained"
                            containerColor={theme.colors.primaryContainer}
                            iconColor={theme.colors.primary}
                            size={20}
                            onPress={handleJournalPress}
                        />
                    </View>

                    {/* Content Preview Logic */}
                    {!isPremium && todayEntries.length > 0 ? (
                        <Text variant="bodyMedium" numberOfLines={3} style={styles.summaryText}>
                            &quot;{todayEntries[0].content}&quot;
                        </Text>
                    ) : (
                        <Text variant="bodyMedium" style={styles.placeholderText}>
                            {isPremium ? t('home.noEntry') : (todayEntries.length > 0 ? '' : t('home.noEntry'))}
                            {/* For Premium, we might want a different placeholder or just generic "Write something..." */}
                            {/* Actually, if Premium, we always show "Write Journal" so placeholder is fine */}
                        </Text>
                    )}

                    <Button
                        mode="contained"
                        style={styles.journalButton}
                        onPress={handleJournalPress}
                    >
                        {isPremium 
                            ? t('common.start') 
                            : (todayEntries.length > 0 ? t('common.edit') : t('common.start'))
                        }
                    </Button>
                </Surface>

                {/* Premium: Today's Entries List */}
                {isPremium && todayEntries.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text variant="titleMedium" style={{ fontFamily: 'Inter-SemiBold', marginBottom: 12, color: theme.colors.onSurface }}>
                            {t('home.todaysEntries')}
                        </Text>
                        {todayEntries.map((entry, index) => (
                            <TouchableOpacity 
                                key={entry.id} 
                                onPress={() => navigation.navigate('JournalEntry', { entry: entry })}
                                style={{ marginBottom: 8 }}
                            >
                                <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface }} elevation={1}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1, fontFamily: 'Inter-Regular', color: theme.colors.onSurface }}>
                                            {entry.content}
                                        </Text>
                                        <JournalIcon size={16} theme={theme.dark ? 'dark' : 'light'} />
                                    </View>
                                </Surface>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Weekly Summary Card */}
                <Surface style={styles.statsCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.statsTitle}>{t('home.dailySummary')}</Text>
                    {renderWeeklySummary()}
                </Surface>

                {/* AdMob Banner */}
                {!isPremium && (
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <BannerAd
                            unitId={process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER}
                            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                            requestOptions={{
                                requestNonPersonalizedAdsOnly: true,
                            }}
                        />
                    </View>
                )}

            </ScrollView>
            <FAB
                icon={({ size, color }) => <AIInsightIcon size={size} color={color} theme={theme.dark ? 'dark' : 'light'} />}
                label={t('home.chatAssistant')}
                style={styles.fab}
                onPress={() => navigation.navigate('Chat')}
                color={theme.colors.onPrimaryContainer}
            />
        </SafeAreaView >
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontFamily: 'Inter-Regular',
        color: theme.colors.secondary,
        fontSize: 16,
    },
    username: {
        fontFamily: 'Poppins-Bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Inter-Medium',
        color: theme.colors.onSurface,
        opacity: 0.7,
    },
    moodCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        marginBottom: 24,
    },
    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    moodButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceVariant,
    },
    moodButtonSelected: {
        backgroundColor: theme.colors.primaryContainer,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    moodEmoji: {
        fontSize: 28,
    },
    journalCard: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: theme.colors.primary, // Using primary color for the main CTA card
        marginBottom: 24,
    },
    journalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: 'Poppins-Bold',
        color: theme.colors.onPrimary,
    },
    summaryText: {
        color: theme.colors.onPrimary,
        fontStyle: 'italic',
        marginBottom: 20,
        opacity: 0.9,
    },
    placeholderText: {
        color: theme.colors.onPrimary,
        marginBottom: 20,
        opacity: 0.8,
    },
    journalButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    statsCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        marginBottom: 24,
    },
    statsTitle: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 16,
    },
    statsContent: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 16,
    },
    summaryContainer: {
        padding: 16,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 16,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primaryContainer,
    },
});
