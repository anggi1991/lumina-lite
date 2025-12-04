import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Surface, ActivityIndicator, IconButton, useTheme, Portal, Dialog, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { getJournalEntries } from '../services/journal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { usePremium } from '../context/PremiumContext';
import { AddEntryIcon } from '../components/icons/AddEntryIcon';
import { PdfIcon } from '../components/icons/PdfIcon';

export default function JournalListScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] as any[] });

    const showDialog = (title: string, message: string, actions: any[] = []) => {
        setDialogContent({ title, message, actions });
        setDialogVisible(true);
    };

    const hideDialog = () => setDialogVisible(false);

    useFocusEffect(
        useCallback(() => {
            fetchJournals();
        }, [])
    );

    const { isPremium } = usePremium();

    const handleExportPDF = async () => {
        if (!isPremium) {
            showDialog('Premium Feature', 'Export PDF is a premium feature. Please upgrade to enable.', [
                { text: 'Cancel', onPress: hideDialog },
                { text: 'Upgrade', onPress: () => { hideDialog(); navigation.navigate('Premium'); } }
            ]);
            return;
        }

        if (entries.length === 0) {
            showDialog('No Data', 'No journal entries to export.', [{ text: 'OK', onPress: hideDialog }]);
            return;
        }

        setLoading(true);
        try {
            let htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
                        h1 { color: #6A5AE0; text-align: center; }
                        .entry { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 10px; }
                        .date { color: #666; font-size: 12px; margin-bottom: 5px; }
                        .content { font-size: 14px; line-height: 1.5; }
                    </style>
                </head>
                <body>
                    <h1>Lumina Journal Export</h1>
            `;

            entries.forEach(entry => {
                const date = new Date(entry.created_at).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                htmlContent += `
                    <div class="entry">
                        <div class="date">${date}</div>
                        <div class="content">${entry.content}</div>
                    </div>
                `;
            });

            htmlContent += `</body></html>`;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

        } catch (error) {
            console.error(error);
            showDialog('Error', 'Failed to export PDF.', [{ text: 'OK', onPress: hideDialog }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const data = await getJournalEntries(user.id);
            setEntries(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('JournalDetail', { entry: item })}>
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={styles.cardHeader}>
                    <Text variant="labelMedium" style={[styles.date, { color: theme.colors.secondary }]}>
                        {new Date(item.created_at).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                    {item.mood_tags && item.mood_tags.length > 0 && (
                        <Text style={styles.moodIcon}>
                            {/* Assuming mood_tags stores mood level for now, or we map it */}
                            {/* For simplicity, just showing a generic icon if tag exists */}
                            📝
                        </Text>
                    )}
                </View>
                <Text variant="bodyMedium" numberOfLines={2} style={[styles.content, { color: theme.colors.onSurface }]}>
                    {item.content}
                </Text>
            </Surface>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>{t('journal.myJournal')}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <IconButton
                        icon={({ size, color }) => <PdfIcon size={size} color={color} theme={theme.dark ? 'dark' : 'light'} />}
                        mode="contained"
                        containerColor={theme.colors.secondaryContainer}
                        iconColor={theme.colors.onSecondaryContainer}
                        size={24}
                        onPress={handleExportPDF}
                    />


                    <IconButton
                        icon={({ size, color }) => <AddEntryIcon size={size} color={color} theme={theme.dark ? 'dark' : 'light'} />}
                        mode="contained"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        size={24}
                        onPress={() => navigation.navigate('JournalEntry')}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator animating={true} color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>{t('journal.emptyList')}</Text>
                    <Text style={[styles.emptySubText, { color: theme.colors.onSurfaceVariant }]}>{t('journal.emptySub')}</Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 20, backgroundColor: theme.colors.surface }}>
                    <Dialog.Title style={{ textAlign: 'center', color: theme.colors.primary, fontFamily: 'Poppins-Bold' }}>{dialogContent.title}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', fontFamily: 'Inter-Regular' }}>{dialogContent.message}</Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                        {dialogContent.actions.map((action, index) => (
                            <Button key={index} onPress={action.onPress} labelStyle={{ fontFamily: 'Inter-SemiBold' }}>{action.text}</Button>
                        ))}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    title: {
        fontFamily: 'Poppins-Bold',
    },
    listContent: {
        padding: 24,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    date: {
        fontFamily: 'Inter-SemiBold',
    },
    moodIcon: {
        fontSize: 16,
    },
    content: {
        fontFamily: 'Inter-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
    },
    emptySubText: {
        marginTop: 8,
    },
});
