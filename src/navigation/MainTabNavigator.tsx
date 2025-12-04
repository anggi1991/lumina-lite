import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import JournalListScreen from '../screens/JournalListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MoodTrackerIcon } from '../components/icons/MoodTrackerIcon';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { JournalIcon } from '../components/icons/JournalIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 0,
                    elevation: 5,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarIcon: ({ color, size, focused }) => {
                    const iconProps = {
                        theme: theme.dark ? 'dark' as const : 'light' as const,
                        size: 28,
                        color: color, // Use the navigation color (active/inactive) for the main stroke
                    };

                    if (route.name === 'Home') {
                        return <MoodTrackerIcon {...iconProps} />;
                    } else if (route.name === 'Analytics') {
                        return <DashboardIcon {...iconProps} />;
                    } else if (route.name === 'JournalList') {
                        return <JournalIcon {...iconProps} />;
                    } else if (route.name === 'History') {
                        return <CalendarIcon {...iconProps} />;
                    } else if (route.name === 'Profile') {
                        return <SettingsIcon {...iconProps} />;
                    }
                    
                    return null;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: t('tabs.insight') }} />
            <Tab.Screen name="JournalList" component={JournalListScreen} options={{ tabBarLabel: t('tabs.journal') }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t('tabs.history') }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
        </Tab.Navigator>
    );
}
