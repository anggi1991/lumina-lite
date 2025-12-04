import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { getWeeklyMoods } from '../services/mood';
import Svg, { Circle, Line, Text as SvgText, Polyline } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HappyIcon } from '../components/icons/HappyIcon';
import { SadIcon } from '../components/icons/SadIcon';
import { NeutralIcon } from '../components/icons/NeutralIcon';
import { StressedIcon } from '../components/icons/StressedIcon';
import { ExcitedIcon } from '../components/icons/ExcitedIcon';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [moodCounts, setMoodCounts] = useState<any>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const moodData = await getWeeklyMoods(user.id);

            // Fetch journals for tags analysis
            const { data: journalData } = await supabase
                .from('journals')
                .select('mood_tags')
                .eq('user_id', user.id);

            processData(moodData, journalData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const processData = (moodData: any[], journalData: any[]) => {
        // 1. Process Weekly Trend (Last 7 Days)
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        // Map data to days, taking the average mood if multiple exist per day, or null if none
        const trend = last7Days.map(date => {
            const dayMoods = moodData.filter((m: any) => m.created_at.startsWith(date));
            if (dayMoods.length === 0) return { date, value: 0 }; // 0 means no data
            const sum = dayMoods.reduce((acc: number, curr: any) => acc + curr.mood_level, 0);
            return { date, value: sum / dayMoods.length };
        });
        setWeeklyData(trend);

        // 2. Process Distribution
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        moodData.forEach((m: any) => {
            const level = Math.round(m.mood_level); // Round in case of decimals
            if (counts[level as keyof typeof counts] !== undefined) {
                counts[level as keyof typeof counts]++;
            }
        });
        setMoodCounts(counts);

        // 3. Process Top Tags
        const tagCounts: { [key: string]: number } = {};
        journalData.forEach((j: any) => {
            if (j.mood_tags && Array.isArray(j.mood_tags)) {
                j.mood_tags.forEach((tag: string) => {
                    // Filter out mood IDs (which might be numbers or UUIDs, but our tags are words)
                    // Simple heuristic: Tags are usually capitalized words.
                    if (tag && tag.length > 2 && isNaN(Number(tag))) {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    }
                });
            }
        });

        // Sort by count
        const sortedTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5

        setTopTags(sortedTags);
    };

    const renderWeeklyChart = () => {
        const height = 200;
        const width = screenWidth - 48; // Padding
        const padding = 20;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // X Axis: 7 points
        const xStep = chartWidth / 6;
        // Y Axis: 1 to 5
        const yScale = chartHeight / 5;

        const points = weeklyData.map((d, i) => {
            if (d.value === 0) return null; // Skip empty days for line
            const x = padding + i * xStep;
            const y = height - padding - (d.value * yScale); // Invert Y
            return `${x},${y}`;
        }).filter(p => p !== null).join(' ');

        return (
            <Svg height={height} width={width}>
                {/* Grid Lines */}
                {[1, 2, 3, 4, 5].map(level => (
                    <Line
                        key={level}
                        x1={padding}
                        y1={height - padding - (level * yScale)}
                        x2={width - padding}
                        y2={height - padding - (level * yScale)}
                        stroke={theme.colors.surfaceVariant}
                        strokeWidth="1"
                    />
                ))}

                {/* Line Path */}
                {points && (
                    <React.Fragment>
                        <Polyline points={points} fill="none" stroke={theme.colors.primary} strokeWidth="3" />
                        {/* Dots */}
                        {weeklyData.map((d, i) => {
                            if (d.value === 0) return null;
                            const x = padding + i * xStep;
                            const y = height - padding - (d.value * yScale);
                            return (
                                <Circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={theme.colors.primary}
                                />
                            );
                        })}
                    </React.Fragment>
                )}

                {/* X Axis Labels (Day Names) */}
                {weeklyData.map((d, i) => {
                    const date = new Date(d.date);
                    const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' });
                    const x = padding + i * xStep;
                    return (
                        <SvgText
                            key={i}
                            x={x}
                            y={height - 5}
                            fontSize="10"
                            fill={theme.colors.secondary}
                            textAnchor="middle"
                        >
                            {dayName}
                        </SvgText>
                    );
                })}
            </Svg>
        );
    };

    const renderDistributionChart = () => {
        const total = Object.values(moodCounts).reduce((a: any, b: any) => a + b, 0);
        if (total === 0) return <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>{t('analytics.noData')}</Text>;

        const maxCount = Math.max(...Object.values(moodCounts) as number[]);
        // const height = 150;

        // const barWidth = (width - 40) / 5;

        const moodIcons = [SadIcon, StressedIcon, NeutralIcon, HappyIcon, ExcitedIcon];

        return (
            <View style={styles.distContainer}>
                {[1, 2, 3, 4, 5].map((level, index) => {
                    const count = moodCounts[level as keyof typeof moodCounts];
                    const percentage = maxCount > 0 ? count / maxCount : 0;
                    const barHeight = percentage * 100; // Max 100px height
                    const IconComponent = moodIcons[index];

                    return (
                        <View key={level} style={styles.distItem}>
                            <View style={[styles.bar, { height: Math.max(barHeight, 4), backgroundColor: getMoodColor(level) }]} />
                            <View style={{ marginBottom: 4 }}>
                                <IconComponent size={36} theme={theme.dark ? 'dark' : 'light'} />
                            </View>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>{count}x</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const [topTags, setTopTags] = useState<any[]>([]);

    const getMoodColor = (level: number) => {
        if (level >= 4) return '#4CAF50';
        if (level === 3) return '#FFC107';
        return '#F44336';
    };

    const renderTopTags = () => {
        if (topTags.length === 0) return <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>{t('analytics.noData')}</Text>;

        return (
            <View style={styles.tagsContainer}>
                {topTags.map(([tag, count], index) => (
                    <View key={index} style={styles.tagItem}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{tag}</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>{count}x</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>{t('analytics.title')}</Text>

                {loading ? (
                    <ActivityIndicator animating={true} color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : weeklyData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>{t('analytics.noData')}</Text>
                    </View>
                ) : (
                    <>
                        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('analytics.weeklyTrend')}</Text>
                            {renderWeeklyChart()}
                        </Surface>

                        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('analytics.distribution')}</Text>
                            {renderDistributionChart()}
                        </Surface>

                        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('analytics.topTags')}</Text>
                            {renderTopTags()}
                        </Surface>
                    </>
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
        padding: 20,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        marginBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    chartCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    cardTitle: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 16,
        width: '100%',
    },
    emptyText: {
        fontStyle: 'italic',
    },
    distContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: 150,
        alignItems: 'flex-end',
    },
    distItem: {
        alignItems: 'center',
        width: 40,
    },
    bar: {
        width: 12,
        borderRadius: 6,
        marginBottom: 8,
    },

    tagsContainer: {
        width: '100%',
    },
    tagItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
