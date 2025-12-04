import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { deleteJournalEntry } from '../services/journal';
import { useTranslation } from 'react-i18next';

export default function JournalDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { entry } = route.params || {};

    if (!entry) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.onSurface }}>Entry not found.</Text>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            t('common.delete'),
            t('journal.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteJournalEntry(entry.id);
                            navigation.goBack();
                        } catch {
                            Alert.alert(t('common.error'), t('common.error'));
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor={theme.colors.onSurface} />
                <View style={styles.actions}>
                    <IconButton icon="pencil" onPress={() => navigation.navigate('JournalEntry', { entry })} iconColor={theme.colors.onSurface} />
                    <IconButton icon="delete" iconColor={theme.colors.error} onPress={handleDelete} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineSmall" style={[styles.date, { color: theme.colors.primary }]}>
                    {new Date(entry.created_at).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text variant="labelMedium" style={[styles.time, { color: theme.colors.secondary }]}>
                    {new Date(entry.created_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <Surface style={styles.paper} elevation={0}>
                    <Text variant="bodyLarge" style={[styles.text, { color: theme.colors.onSurface }]}>
                        {entry.content}
                    </Text>
                </Surface>
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
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    actions: {
        flexDirection: 'row',
    },
    content: {
        padding: 24,
    },
    date: {
        fontFamily: 'Poppins-Bold',
        marginBottom: 4,
    },
    time: {
        marginBottom: 24,
    },
    paper: {
        backgroundColor: 'transparent',
    },
    text: {
        fontFamily: 'Inter-Regular',
        lineHeight: 28,
        fontSize: 18,
    },
});
