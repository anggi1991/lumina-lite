import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, ActivityIndicator, useTheme } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen() {
    const { t } = useTranslation();
    const theme = useTheme();

    useEffect(() => {
        console.log('[Screen] HistoryScreen mounted.');
    }, []);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMonthData = useCallback(async () => {
        const dateString = selectedDate;
        // Fetch moods for the whole month to mark the calendar
        // This is a simplified version, ideally we fetch range
        const startOfMonth = dateString.substring(0, 7) + '-01';
        const [year, month] = dateString.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        try {
            const { data, error } = await supabase
                .from('moods')
                .select('created_at, mood_level')
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth);

            if (error) throw error;

            const marks: any = {};
            data?.forEach((item: any) => {
                const date = item.created_at.split('T')[0];
                let color = theme.colors.surfaceVariant;
                if (item.mood_level >= 4) color = '#4CAF50'; // Good
                else if (item.mood_level === 3) color = '#FFC107'; // Neutral
                else color = '#F44336'; // Bad

                marks[date] = { marked: true, dotColor: color };
            });

            // Mark selected date
            marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: theme.colors.primary };

            setMarkedDates(marks);
        } catch (error) {
            console.error('Error fetching month data:', error);
        }
    }, [selectedDate, theme.colors.primary, theme.colors.surfaceVariant]);

    const fetchEntriesForDate = useCallback(async () => {
        const dateString = selectedDate;
        setLoading(true);
        const startOfDay = dateString + 'T00:00:00';
        const endOfDay = dateString + 'T23:59:59';

        try {
            // Fetch Moods
            const { data: moods } = await supabase
                .from('moods')
                .select('*')
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            // Fetch Journals
            const { data: journals } = await supabase
                .from('journals')
                .select('*')
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            // Combine and sort
            const combined = [
                ...(moods?.map(m => ({ ...m, type: 'mood' })) || []),
                ...(journals?.map(j => ({ ...j, type: 'journal' })) || [])
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setEntries(combined);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchMonthData();
    }, [fetchMonthData]);

    useEffect(() => {
        fetchEntriesForDate();
    }, [fetchEntriesForDate]);

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        const newMarks = { ...markedDates };
        // Reset previous selected
        Object.keys(newMarks).forEach(key => {
            if (newMarks[key].selected) {
                newMarks[key] = { ...newMarks[key], selected: false, selectedColor: undefined };
            }
        });
        // Set new selected
        newMarks[day.dateString] = { ...newMarks[day.dateString], selected: true, selectedColor: theme.colors.primary };
        setMarkedDates(newMarks);

    };

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Text variant="labelSmall" style={[styles.time, { color: theme.colors.secondary }]}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {item.type === 'mood' ? (
                <View style={styles.row}>
                    <Text style={{ fontSize: 24 }}>
                        {item.mood_level === 1 ? '😭' : item.mood_level === 2 ? '😢' : item.mood_level === 3 ? '😐' : item.mood_level === 4 ? '🙂' : '😄'}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginLeft: 12, color: theme.colors.onSurface }}>{t('history.moodCheckin')}</Text>
                </View>
            ) : (
                <View>
                    <Text variant="titleSmall" style={{ color: theme.colors.secondary }}>{t('history.journalEntry')}</Text>
                    <Text variant="bodyMedium" numberOfLines={3} style={{ color: theme.colors.onSurface }}>{item.content}</Text>
                </View>
            )}
        </Surface>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>{t('history.title')}</Text>
            </View>
            <Calendar
                onDayPress={onDayPress}
                markedDates={markedDates}
                theme={{
                    calendarBackground: theme.colors.background,
                    textSectionTitleColor: theme.colors.secondary,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: theme.colors.onPrimary,
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.onSurface,
                    textDisabledColor: theme.colors.surfaceVariant,
                    dotColor: theme.colors.primary,
                    selectedDotColor: theme.colors.onPrimary,
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.primary,
                    indicatorColor: theme.colors.primary,
                }}
            />

            <View style={styles.listContainer}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    {t('history.entryOn')} {selectedDate}
                </Text>

                {loading ? (
                    <ActivityIndicator animating={true} color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : entries.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>{t('history.noDataDate')}</Text>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {entries.map((item: any) => (
                            <React.Fragment key={item.id || item.created_at}>
                                {renderItem({ item })}
                            </React.Fragment>
                        ))}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    title: {
        fontFamily: 'Poppins-Bold',
    },
    listContainer: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 16,
    },
    card: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 24,
    },
    time: {
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 24,
        fontStyle: 'italic',
    },
});
