import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';
import { Provider as PaperProvider } from 'react-native-paper';

type ThemeContextType = {
    isDarkTheme: boolean;
    toggleTheme: () => void;
    theme: typeof lightTheme;
};

const ThemeContext = createContext<ThemeContextType>({
    isDarkTheme: false,
    toggleTheme: () => { },
    theme: lightTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [isDarkTheme, setIsDarkTheme] = useState(systemScheme === 'dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('theme');
                if (storedTheme) {
                    setIsDarkTheme(storedTheme === 'dark');
                } else {
                    setIsDarkTheme(systemScheme === 'dark');
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadThemePreference();
    }, [systemScheme]);

    const toggleTheme = async () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const theme = isDarkTheme ? darkTheme : lightTheme;

    if (isLoading) {
        return null; // Or a splash screen/loader if needed
    }

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, theme }}>
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
