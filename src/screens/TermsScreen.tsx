import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
    const navigation = useNavigation();
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="close" onPress={() => navigation.goBack()} />
                <Text variant="titleLarge" style={styles.title}>Terms & Privacy</Text>
                <View style={{ width: 48 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="titleMedium" style={styles.heading}>Terms of Service</Text>
                <Text variant="bodyMedium" style={styles.text}>
                    Welcome to Lumina. By using our app, you agree to these terms.
                    {"\n\n"}
                    1. Usage: You agree to use the app for personal, non-commercial purposes.
                    {"\n"}
                    2. Content: You retain ownership of your journal entries.
                    {"\n"}
                    3. AI: Our AI insights are generated for informational purposes only and do not constitute professional medical advice.
                </Text>

                <Text variant="titleMedium" style={styles.heading}>Privacy Policy</Text>
                <Text variant="bodyMedium" style={styles.text}>
                    Your privacy is important to us.
                    {"\n\n"}
                    1. Data Collection: We collect your email and journal entries to provide the service.
                    {"\n"}
                    2. Data Security: Your data is stored securely on Supabase.
                    {"\n"}
                    3. AI Processing: Your journal entries are processed by Azure OpenAI to generate insights but are not used to train the models.
                </Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    title: {
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    heading: {
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    text: {
        marginBottom: 16,
        lineHeight: 24,
    },
});
