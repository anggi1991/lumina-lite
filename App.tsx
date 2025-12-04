import './src/i18n';
import React from 'react';
import { View, ActivityIndicator, AppState, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Session } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mobileAds from 'react-native-google-mobile-ads';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Purchases from 'react-native-purchases';

import OnboardingScreen from './src/screens/OnboardingScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AuthScreen from './src/screens/AuthScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import JournalEntryScreen from './src/screens/JournalEntryScreen';
import InsightScreen from './src/screens/InsightScreen';
import JournalDetailScreen from './src/screens/JournalDetailScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import TermsScreen from './src/screens/TermsScreen';
import ChatScreen from './src/screens/ChatScreen';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { PremiumProvider, usePremium } from './src/context/PremiumContext';
import { supabase } from './src/services/supabase';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from './src/services/notifications';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isDarkTheme, theme } = useAppTheme();
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const { isLockEnabled } = usePremium();
  const appState = React.useRef(AppState.currentState);
  const [isLocked, setIsLocked] = React.useState(false);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        if (isLockEnabled) {
          setIsLocked(true);
          authenticate();
        }
      }
      appState.current = nextAppState;
    });

    // Initial check
    if (isLockEnabled) {
      setIsLocked(true);
      authenticate();
    }

    return () => {
      subscription.remove();
    };
  }, [isLockEnabled]);

  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setIsLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Lumina',
      fallbackLabel: 'Enter PIN',
    });

    if (result.success) {
      setIsLocked(false);
    } else {
      // Retry or stay locked?
      // For now, stay locked. User can tap a button to retry.
    }
  };

  // ... existing auth check ...
  React.useEffect(() => {
    // Auth Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Notifications Setup
    registerForPushNotificationsAsync().then(() => {
      scheduleDailyReminder();
    });

    // Initialize AdMob
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob Initialized', adapterStatuses);
      });

    // Initialize Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    // Initialize RevenueCat
    const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    if (revenueCatApiKey) {
      Purchases.configure({ apiKey: revenueCatApiKey });
      console.log('RevenueCat Initialized');
    } else {
      console.warn('RevenueCat API Key not found in environment variables');
    }


    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      {isLocked ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <MaterialCommunityIcons name="lock" size={80} color={theme.colors.primary} style={{ marginBottom: 24 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16 }}>Lumina Locked</Text>
          <Button mode="contained" onPress={authenticate} style={{ borderRadius: 20 }}>
            Unlock
          </Button>
        </View>
      ) : (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={session ? "Main" : "Onboarding"}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
            <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
            <Stack.Screen name="Insight" component={InsightScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ presentation: 'modal' }} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>

  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6A5AE0" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <PremiumProvider>
        <AppContent />
      </PremiumProvider>
    </ThemeProvider>
  );
}
