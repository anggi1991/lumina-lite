import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Text, Surface, Button, List, Avatar, Switch, useTheme, Portal, Dialog } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { signOut } from '../services/auth';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

import { usePremium } from '../context/PremiumContext';


const adUnitId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TestIds.REWARDED;

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

// ...

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { isDarkTheme, toggleTheme } = useAppTheme();
    const { isPremium, lockPremium, isLockEnabled, toggleAppLock } = usePremium();
    const [user, setUser] = useState<any>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [stats, setStats] = useState({ journalCount: 0, streak: 0 });
    const [rewardedLoaded, setRewardedLoaded] = useState(false);
    const [languageDialogVisible, setLanguageDialogVisible] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'ar', name: 'العربية' },
        { code: 'pt', name: 'Português' },
        { code: 'ru', name: 'Русский' },
    ];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setLanguageDialogVisible(false);
    };

    const getLanguageName = (code: string) => {
        const lang = languages.find(l => l.code === code);
        return lang ? lang.name : 'English';
    };

    useEffect(() => {
        fetchUser();
        fetchStats();

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setRewardedLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
            console.log('User earned reward of ', reward);
            Alert.alert('Reward Earned!', 'You have unlocked a free AI Insight!');
        });

        rewarded.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, []);

    const showRewardedAd = () => {
        if (rewardedLoaded) {
            rewarded.show();
            setRewardedLoaded(false); // Reset load state
            rewarded.load(); // Load next ad
        } else {
            Alert.alert('Ad not ready', 'Please try again later.');
            rewarded.load();
        }
    };

    const fetchUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Journal Count
            const { count, error: countError } = await supabase
                .from('journals')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) console.error('Error fetching count:', countError);

            // Calculate Streak (Simplified: Consecutive days with any activity)
            // For MVP, we'll just count total days with activity as a proxy or implement real streak later.
            // Let's try a real streak calculation based on moods and journals.
            const { data: moods } = await supabase
                .from('moods')
                .select('created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const { data: journals } = await supabase
                .from('journals')
                .select('created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const dates = new Set<string>();
            moods?.forEach(m => dates.add(m.created_at.split('T')[0]));
            journals?.forEach(j => dates.add(j.created_at.split('T')[0]));

            const sortedDates = Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

            let currentStreak = 0;
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Check if streak is active (activity today or yesterday)
            if (sortedDates.length > 0) {
                if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                    currentStreak = 1;
                    for (let i = 0; i < sortedDates.length - 1; i++) {
                        const curr = new Date(sortedDates[i]);
                        const next = new Date(sortedDates[i + 1]);
                        const diffTime = Math.abs(curr.getTime() - next.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                }
            }

            setStats({ journalCount: count || 0, streak: currentStreak });

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            t('auth.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            navigation.replace('Auth');
                        } catch (error) {
                            console.error(error);
                            Alert.alert(t('common.error'), t('auth.logoutError'));
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>{t('profile.title')}</Text>
                </View>

                <View style={styles.profileHeader}>
                    {user?.user_metadata?.avatar_url ? (
                        <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
                    ) : (
                        <Avatar.Text size={80} label={user?.email?.substring(0, 2).toUpperCase() || 'US'} style={{ backgroundColor: theme.colors.primary }} />
                    )}
                    <Text variant="titleLarge" style={[styles.name, { color: theme.colors.onBackground }]}>
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.secondary }]}>{user?.email}</Text>
                </View>

                <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <View style={styles.statItem}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.primary }]}>{stats.journalCount}</Text>
                        <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.secondary }]}>{t('profile.journalCount')}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
                    <View style={styles.statItem}>
                        <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.primary }]}>{stats.streak}</Text>
                        <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.secondary }]}>{t('profile.streak')}</Text>
                    </View>
                </Surface>

                {/* Premium Banner or Status */}
                {isPremium ? (
                    <Surface style={[styles.premiumCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>Premium Active 👑</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>You have access to all features.</Text>
                        </View>
                        {/* Debug Button to Lock */}
                        <Button mode="text" onPress={lockPremium} textColor={theme.colors.error}>
                            Lock
                        </Button>
                    </Surface>
                ) : (
                    <Surface style={[styles.premiumCard, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={2}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ color: theme.colors.onTertiaryContainer, fontWeight: 'bold' }}>Lumina Premium</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>Unlock unlimited AI insights & more.</Text>
                        </View>
                        <Button mode="contained" onPress={() => navigation.navigate('Premium')} buttonColor={theme.colors.tertiary} textColor={theme.colors.onTertiary}>
                            Upgrade
                        </Button>
                    </Surface>
                )}

                {/* Rewarded Ad Button (Only for Free Users) */}
                {!isPremium && (
                    <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
                        <Button
                            mode="outlined"
                            icon="play-circle"
                            onPress={showRewardedAd}
                            disabled={!rewardedLoaded}
                            style={{ borderColor: theme.colors.primary }}
                            textColor={theme.colors.primary}
                        >
                            Watch Ad for Free Insight
                        </Button>
                    </View>
                )}

                <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.secondary }]}>{t('profile.settings')}</Text>
                    <List.Section>
                        <List.Item
                            title={t('profile.language')}
                            description={getLanguageName(i18n.language)}
                            titleStyle={{ color: theme.colors.onSurface }}
                            descriptionStyle={{ color: theme.colors.secondary }}
                            left={() => <List.Icon icon="translate" color={theme.colors.onSurface} />}
                            onPress={() => setLanguageDialogVisible(true)}
                        />
                        <List.Item
                            title={t('profile.theme')}
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => <List.Icon icon="theme-light-dark" color={theme.colors.onSurface} />}
                            right={() => <Switch value={isDarkTheme} onValueChange={toggleTheme} color={theme.colors.primary} />}
                        />


                        <List.Item
                            title={t('profile.notifications')}
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => <List.Icon icon="bell-outline" color={theme.colors.onSurface} />}
                            right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} color={theme.colors.primary} />}
                        />
                        <List.Item
                            title={t('premium.benefits.lock')}
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => <List.Icon icon="lock-outline" color={theme.colors.onSurface} />}
                            right={() => <Switch value={isLockEnabled} onValueChange={toggleAppLock} color={theme.colors.primary} />}
                        />
                        <List.Item
                            title={t('profile.help')}
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={() => <List.Icon icon="help-circle-outline" color={theme.colors.onSurface} />}
                            onPress={() => Alert.alert(t('common.info'), t('profile.contactSupport'))}
                        />
                    </List.Section>
                </View>

                <Portal>
                    <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 16 }}>
                        <Dialog.Title style={{ color: theme.colors.onSurface, textAlign: 'center' }}>{t('profile.selectLanguage')}</Dialog.Title>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                                {languages.map((lang) => (
                                    <List.Item
                                        key={lang.code}
                                        title={lang.name}
                                        titleStyle={{ color: theme.colors.onSurface }}
                                        onPress={() => changeLanguage(lang.code)}
                                        right={props => i18n.language === lang.code ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button onPress={() => setLanguageDialogVisible(false)} textColor={theme.colors.primary}>{t('common.cancel')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <View style={styles.footer}>
                    <Button mode="outlined" textColor={theme.colors.error} style={[styles.logoutButton, { borderColor: theme.colors.error }]} onPress={handleLogout}>
                        {t('auth.logout')}
                    </Button>
                    <Text variant="labelSmall" style={[styles.version, { color: theme.colors.secondary }]}>{t('profile.version')} 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
    },
    title: {
        fontFamily: 'Poppins-Bold',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    name: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 4,
    },
    email: {
    },
    statsCard: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    premiumCard: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Poppins-Bold',
    },
    statLabel: {
    },
    divider: {
        width: 1,
        height: '80%',
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 16,
    },
    footer: {
        padding: 24,
        marginTop: 'auto',
        alignItems: 'center',
    },
    logoutButton: {
        width: '100%',
        marginBottom: 12,
        borderRadius: 12,
    },
    version: {
    },
});
