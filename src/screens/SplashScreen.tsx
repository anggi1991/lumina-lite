import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LuminaOrbIcon } from '../components/icons/LuminaOrbIcon';

export default function SplashScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        console.log('[Screen] SplashScreen mounted. Checking session...');
        let timer: NodeJS.Timeout; // Declare timer outside to be accessible by cleanup
        const checkSession = async () => {
            // Simulate session check result
            const session = false; // For now, simulate no session to match original navigation to Onboarding

            timer = setTimeout(() => {
                if (session) {
                    console.log('[Screen] Session found, navigating to MainTabs.');
                    navigation.replace('Main');
                } else {
                    console.log('[Screen] No session, navigating to Onboarding.');
                    navigation.replace('Onboarding');
                }
            }, 2000);
        };

        checkSession(); // Call the async function

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <Surface style={styles.container}>
            <View style={styles.content}>
                {/* Lumina Orb Icon */}
                <View style={styles.logoContainer}>
                    <LuminaOrbIcon size={160} variant={theme.dark ? 'dark' : 'light'} />
                </View>
                <Text variant="headlineMedium" style={styles.title}>Lumina</Text>
                <Text variant="bodyLarge" style={styles.tagline}>Terangi Hari, Tenangkan Pikiran</Text>
            </View>
            <ActivityIndicator animating={true} color={theme.colors.primary} style={styles.loader} />
        </Surface>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logoContainer: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    tagline: {
        fontFamily: 'Inter-Regular',
        color: theme.colors.secondary,
    },
    loader: {
        marginBottom: 50,
    },
});
