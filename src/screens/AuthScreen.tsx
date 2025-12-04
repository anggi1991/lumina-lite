import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithGoogle, signInWithEmail } from '../services/auth';
import { useTranslation } from 'react-i18next';
import { LuminaLogo } from '../components/icons/LuminaLogo';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';

export default function AuthScreen({ navigation }: any) {
    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        console.log('[Screen] AuthScreen mounted.');
    }, []);

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        console.log('[AuthScreen] Google Sign-In button clicked.');
        try {
            const { error, session } = await signInWithGoogle();

            if (error) {
                console.error('[AuthScreen] Sign-In failed:', error.message);
                Alert.alert('Login Failed', error.message);
            } else if (session) {
                console.log('[AuthScreen] Sign-In successful, navigating to MainTabs.');
                navigation.replace('Main');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            Alert.alert(t('common.error'), t('auth.fillAllFields'));
            return;
        }

        setLoading(true);
        console.log('[AuthScreen] Email Sign-In button clicked.');

        try {
            const { error, session } = await signInWithEmail(trimmedEmail, password);

            if (error) {
                console.error('[AuthScreen] Email Sign-In failed:', error.message);
                Alert.alert('Login Failed', error.message);
            } else if (session) {
                console.log('[AuthScreen] Email Sign-In successful, navigating to MainTabs.');
                navigation.replace('Main');
            } else {
                Alert.alert('Login Failed', 'Unable to sign in. Please try again.');
            }
        } catch (error: any) {
            console.error('[AuthScreen] Unexpected email sign-in error:', error?.message || error);
            Alert.alert('Login Failed', error?.message || 'Unable to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 0 }}>
                    <LuminaLogo size={120} transparent />
                </View>
                <Text variant="headlineMedium" style={styles.title}>{t('auth.loginTitle')}</Text>

                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <LoadingIndicator size={50} color={theme.colors.primary} />
                    </View>
                ) : (
                    <>
                        <Button
                            mode="outlined"
                            onPress={handleGoogleLogin}
                            style={styles.googleButton}
                            icon="google"
                            textColor={theme.colors.onSurface}
                        >
                            {t('auth.signInGoogle')}
                        </Button>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{t('auth.or')}</Text>
                            <View style={styles.divider} />
                        </View>

                        <TextInput
                            label={t('auth.emailLabel')}
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={theme.colors.surfaceVariant}
                            activeOutlineColor={theme.colors.primary}
                            autoCapitalize="none"
                            keyboardType="email-address"
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

                        <Button
                            mode="contained"
                            onPress={handleEmailLogin}
                            style={styles.loginButton}
                            labelStyle={styles.loginButtonLabel}
                            loading={loading}
                            disabled={loading}
                        >
                            {t('auth.loginButton')}
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={() => navigation.navigate('Register')}
                            style={[styles.createAccountButton, { borderColor: theme.colors.secondary }]}
                            labelStyle={[styles.createAccountLabel, { color: theme.colors.secondary }]}
                        >
                            {t('auth.createAccount')}
                        </Button>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotPassword}>{t('auth.forgotPassword')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.primary,
    },
    googleButton: {
        borderColor: theme.colors.surfaceVariant,
        borderRadius: 12,
        paddingVertical: 6,
        marginBottom: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.surfaceVariant,
    },
    dividerText: {
        marginHorizontal: 16,
        color: theme.colors.onSurfaceVariant,
        fontFamily: 'Inter-Regular',
    },
    input: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 8,
        marginTop: 8,
        elevation: 2,
    },
    loginButtonLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: theme.colors.onPrimary,
    },
    createAccountButton: {
        borderRadius: 12,
        paddingVertical: 8,
        marginTop: 12,
    },
    createAccountLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
    forgotPassword: {
        textAlign: 'center',
        marginTop: 16,
        color: theme.colors.primary,
        fontFamily: 'Inter-Medium',
    },
});
