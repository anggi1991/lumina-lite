import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const theme = useTheme();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert(t('common.error'), t('auth.enterEmail'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'luminaapp://reset-password', // Ensure deep link is configured if needed, or just rely on email link
            });

            if (error) throw error;

            Alert.alert(t('common.success'), t('auth.resetEmailSent'));
            navigation.goBack();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>{t('auth.resetPassword')}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>{t('auth.resetPasswordSubtitle')}</Text>

                <TextInput
                    label={t('auth.emailLabel')}
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={theme.colors.surfaceVariant}
                    activeOutlineColor={theme.colors.primary}
                    autoCapitalize="none"
                />

                <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                >
                    {t('auth.sendResetLink')}
                </Button>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{t('auth.backToLogin')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
        fontFamily: 'Inter-Regular',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        borderRadius: 12,
        paddingVertical: 6,
    },
    buttonLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
    linkContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
});
