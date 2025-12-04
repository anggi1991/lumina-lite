import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const slides = [
        {
            id: '1',
            title: t('onboarding.slides.1.title'),
            description: t('onboarding.slides.1.description'),
            icon: '🧘‍♀️',
        },
        {
            id: '2',
            title: t('onboarding.slides.2.title'),
            description: t('onboarding.slides.2.description'),
            icon: '📝',
        },
        {
            id: '3',
            title: t('onboarding.slides.3.title'),
            description: t('onboarding.slides.3.description'),
            icon: '📊',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    useEffect(() => {
        console.log('[Screen] OnboardingScreen mounted.');
    }, []);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace('Auth');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => (
                        <View style={styles.slide}>
                            <Text style={styles.icon}>{item.icon}</Text>
                            <Text variant="headlineLarge" style={styles.title}>{item.title}</Text>
                            <Text variant="bodyLarge" style={styles.description}>{item.description}</Text>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />

                <View style={styles.paginator}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                    </Button>
                    {currentIndex < slides.length - 1 && (
                        <Button
                            mode="text"
                            onPress={() => navigation.replace('Auth')}
                            textColor={theme.colors.primary}
                        >
                            {t('onboarding.skip')}
                        </Button>
                    )}
                </View>
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
        alignItems: 'center',
    },
    slide: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    icon: {
        fontSize: 100,
        marginBottom: 40,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        color: theme.colors.onSurface,
        paddingHorizontal: 32,
    },
    paginator: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginHorizontal: 8,
    },
    footer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 10,
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        paddingVertical: 8,
        elevation: 2,
    },
    buttonLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: theme.colors.onPrimary,
    },
});
