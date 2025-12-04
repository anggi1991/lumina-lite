
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { generateInsight } from '../services/ai';
import { useTranslation } from 'react-i18next';
import { colors } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

export default function InsightScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { moodLevel, journalContent } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState<any>(null);
    const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        console.log(`[Screen] InsightScreen mounted.Mood: ${moodLevel}, Content Length: ${journalContent?.length || 0} `);
        
        // Load Rewarded Ad
        const ad = RewardedAd.createForAdRequest(TestIds.REWARDED, {
            requestNonPersonalizedAdsOnly: true,
        });

        const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        const unsubscribeEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
            console.log('User earned reward of ', reward);
            setLoading(true);
            // Bypass limit and generate insight
            generateInsight(moodLevel, journalContent).then(data => {
                setInsight(data);
                setLoading(false);
            });
        });

        ad.load();
        setRewardedAd(ad);

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, [moodLevel, journalContent]);

    const { isPremium } = usePremium();

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                // Check Daily Limit for Free Users
                if (!isPremium) {
                    const today = new Date().toISOString().split('T')[0];
                    const usageKey = `ai_usage_${today}`;
                    const usage = await AsyncStorage.getItem(usageKey);
                    const count = usage ? parseInt(usage) : 0;

                    if (count >= 1) {
                        setLoading(false);
                        // Show Limit Reached UI
                        setInsight({ isLimitReached: true });
                        return;
                    }

                    // Increment Usage
                    await AsyncStorage.setItem(usageKey, (count + 1).toString());
                }

                const data = await generateInsight(moodLevel, journalContent);
                setInsight(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsight();
    }, [moodLevel, journalContent, isPremium]);

    const showRewardedAd = () => {
        if (rewardedAd && adLoaded) {
            rewardedAd.show();
        } else {
            console.log('Ad not loaded yet');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>{t('insight.title')}</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>{t('insight.loading')}</Text>
                    </View>
                ) : insight?.isLimitReached ? (
                    <View style={styles.card}>
                        <MaterialCommunityIcons name="lock" size={60} color={theme.colors.primary} style={{ marginBottom: 16 }} />
                        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>{t('insight.limitReachedTitle')}</Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24, color: theme.colors.secondary }}>
                            {t('insight.limitReachedDesc')}
                        </Text>
                        <Button mode="contained" onPress={() => navigation.navigate('Premium')} style={styles.button}>
                            {t('insight.upgradeNow')}
                        </Button>
                        
                        <Button 
                            mode="outlined" 
                            onPress={showRewardedAd} 
                            disabled={!adLoaded}
                            style={{ marginTop: 12, width: '100%', borderRadius: 12, borderColor: theme.colors.primary }}
                            textColor={theme.colors.primary}
                        >
                            {adLoaded ? "Watch Ad for Free Insight" : "Loading Ad..."}
                        </Button>

                        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                            {t('common.back')}
                        </Button>
                    </View>
                ) : insight ? (
                    <>
                        {insight.isMock && (
                            <Text style={{ color: colors.warning, textAlign: 'center', marginBottom: 10 }}>
                                {t('insight.mockWarning')}
                            </Text>
                        )}
                        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                            <Text variant="bodyLarge" style={[styles.insightText, { color: theme.colors.onSurface }]}>{insight.analysis}</Text>
                        </Surface>

                        <Surface style={[styles.card, { backgroundColor: theme.colors.secondaryContainer, marginTop: 20 }]} elevation={1}>
                            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSecondaryContainer }]}>{t('insight.affirmation')}</Text>
                            <Text variant="bodyMedium" style={[styles.affirmationText, { color: theme.colors.onSecondaryContainer }]}>&quot;{insight.affirmation}&quot;</Text>
                        </Surface>

                        <Button mode="contained" onPress={() => navigation.navigate('Main')} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
                            {t('insight.backHome')}
                        </Button>
                    </>
                ) : (
                    <Text style={{ color: theme.colors.error }}>{t('common.error')}</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    insightText: {
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 18,
        lineHeight: 28,
    },
    cardTitle: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 8,
    },
    affirmationText: {
        fontFamily: 'Inter-Regular',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 8,
    },
    button: {
        width: '100%',
        marginTop: 32,
        borderRadius: 12,
    },
});
