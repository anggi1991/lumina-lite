import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Text, Button, IconButton, useTheme, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveJournalEntry, updateJournalEntry } from '../services/journal';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../context/PremiumContext';

import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TestIds.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

// ...

export default function JournalEntryScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useTranslation();
    const theme = useTheme();
    const { isPremium } = usePremium();
    const { entry } = route.params || {};
    const [content, setContent] = useState(entry ? entry.content : '');
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setLoaded(true);
        });

        // Start loading the interstitial straight away
        interstitial.load();

        // Unsubscribe from events on unmount
        return unsubscribe;
    }, []);

    const availableTags = ['Work', 'Family', 'Health', 'Relationship', 'Hobbies', 'Sleep', 'Food', 'Travel'];
    const [selectedTags, setSelectedTags] = useState<string[]>(entry?.mood_tags || []);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Journal content cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            const moodId = entry?.mood_id || null;

            if (entry) {
                await updateJournalEntry(entry.id, content, selectedTags);
            } else {
                await saveJournalEntry(user.id, content, moodId, selectedTags);
            }

            // Show Ad if loaded and NOT premium, then navigate back
            if (loaded && !isPremium) {
                interstitial.show();
            }

            Alert.alert(t('common.success'), entry ? t('journal.updateSuccess') : t('journal.saveSuccess'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            console.error(error);
            Alert.alert(t('common.error'), 'Gagal menyimpan jurnal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.surfaceVariant }]}>
                <IconButton icon="close" onPress={() => navigation.goBack()} iconColor={theme.colors.onSurface} />
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                    {entry ? t('journal.editEntry') : t('journal.newEntry')}
                </Text>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={{ backgroundColor: theme.colors.primary }}
                >
                    {t('common.save')}
                </Button>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.tagsContainer}>
                    <Text variant="labelLarge" style={{ marginBottom: 8, color: theme.colors.secondary }}>{t('journal.tag')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                        {availableTags.map(tag => (
                            <Chip
                                key={tag}
                                selected={selectedTags.includes(tag)}
                                onPress={() => toggleTag(tag)}
                                style={[styles.tag, selectedTags.includes(tag) && { backgroundColor: theme.colors.primaryContainer }]}
                                showSelectedOverlay
                            >
                                {tag}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    placeholder={t('journal.placeholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    autoFocus
                />
            </ScrollView>
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
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontFamily: 'Inter-SemiBold',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 24,
        flex: 1,
    },
    tagsContainer: {
        marginBottom: 20,
    },
    tagsScroll: {
        gap: 8,
        paddingRight: 24,
    },
    tag: {
        marginRight: 8,
    },
    input: {
        fontFamily: 'Inter-Regular',
        fontSize: 18,
        minHeight: 300,
        textAlignVertical: 'top',
        lineHeight: 28,
    },
});
