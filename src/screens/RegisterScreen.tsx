import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';
import { LuminaLogo } from '../components/icons/LuminaLogo';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const theme = useTheme();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !name) {
            Alert.alert(t('common.error'), t('auth.fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                // Auto login if session exists
                navigation.replace('Main');
            } else {
                Alert.alert(t('common.success'), t('auth.registrationSuccess'));
                navigation.goBack();
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 0 }}>
                    <LuminaLogo size={120} transparent />
                </View>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>{t('auth.createAccount')}</Text>

                <TextInput
                    label={t('auth.fullName')}
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={theme.colors.surfaceVariant}
                    activeOutlineColor={theme.colors.primary}
                />

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

                <TextInput
                    label={t('auth.passwordLabel')}
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor={theme.colors.surfaceVariant}
                    activeOutlineColor={theme.colors.primary}
                />

                {loading ? (
                    <View style={{ alignItems: 'center', padding: 10 }}>
                        <LoadingIndicator size={40} color={theme.colors.primary} />
                    </View>
                ) : (
                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        {t('auth.register')}
                    </Button>
                )}

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
                    <Text style={{ color: theme.colors.secondary }}>{t('auth.alreadyHaveAccount')} <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{t('auth.login')}</Text></Text>
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
        marginBottom: 32,
        textAlign: 'center',
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
