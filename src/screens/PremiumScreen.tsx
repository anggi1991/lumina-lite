import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';

import { usePremium } from '../context/PremiumContext';

export default function PremiumScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const theme = useTheme();
    const { isPremium, isLoading, offerings, purchasePackage, restorePurchases } = usePremium();
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

    const benefits = [
        { icon: 'brain', title: t('premium.benefits.ai'), desc: t('premium.benefits.aiDesc') },
        { icon: 'robot', title: t('premium.benefits.assistant'), desc: t('premium.benefits.assistantDesc') },
        { icon: 'chart-timeline-variant', title: t('premium.benefits.analysis'), desc: t('premium.benefits.analysisDesc') },
        { icon: 'chart-bar', title: t('premium.benefits.stats'), desc: t('premium.benefits.statsDesc') },
        { icon: 'block-helper', title: t('premium.benefits.ads'), desc: t('premium.benefits.adsDesc') },
        { icon: 'lock', title: t('premium.benefits.lock'), desc: t('premium.benefits.lockDesc') },
        { icon: 'file-pdf-box', title: t('premium.benefits.export'), desc: t('premium.benefits.exportDesc') },
        { icon: 'notebook-multiple', title: t('premium.benefits.unlimitedJournals'), desc: t('premium.benefits.unlimitedJournalsDesc') },
    ];

    const handleRestore = async () => {
        await restorePurchases();
    };

    const handleSubscribe = async () => {
        if (selectedPackage) {
            await purchasePackage(selectedPackage);
        } else if (offerings?.current?.availablePackages[0]) {
            // Default to first package if none selected
            await purchasePackage(offerings.current.availablePackages[0]);
        }
    };

    const handleTerms = () => {
        (navigation as any).navigate('Terms');
    };

    const formatPrice = (pkg: PurchasesPackage) => {
        return pkg.product.priceString;
    };

    const getPackageTitle = (pkg: PurchasesPackage) => {
        const identifier = pkg.identifier.toLowerCase();
        if (identifier.includes('annual') || identifier.includes('yearly')) {
            return t('premium.yearly');
        } else if (identifier.includes('monthly')) {
            return t('premium.monthly');
        } else if (identifier.includes('lifetime')) {
            return t('premium.lifetime');
        }
        return pkg.product.title;
    };

    // Auto-select first package
    React.useEffect(() => {
        if (offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0 && !selectedPackage) {
            setSelectedPackage(offerings.current.availablePackages[0]);
        }
    }, [offerings, selectedPackage]);

    if (isPremium) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.content}>
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <View style={[styles.hero, { marginTop: 100 }]}>
                        <MaterialCommunityIcons name="crown" size={80} color="#FFD700" />
                        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                            {t('premium.alreadyPremium')}
                        </Text>
                        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.secondary, marginTop: 16 }]}>
                            {t('premium.enjoyFeatures')}
                        </Text>
                        <Button
                            mode="contained"
                            style={[styles.subscribeButton, { marginTop: 32 }]}
                            onPress={() => navigation.goBack()}
                        >
                            {t('common.back')}
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={() => navigation.goBack()}
                    />
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <MaterialCommunityIcons name="crown" size={80} color="#FFD700" />
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                        {t('premium.title')}
                    </Text>
                    <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.secondary }]}>
                        {t('premium.subtitle')}
                    </Text>
                </View>

                {/* Benefits List */}
                <View style={styles.benefitsContainer}>
                    {benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                                <MaterialCommunityIcons name={benefit.icon as any} size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.benefitText}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{benefit.title}</Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>{benefit.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pricing Cards */}
                {isLoading ? (
                    <View style={{ alignItems: 'center', padding: 32 }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 16, color: theme.colors.secondary }}>
                            {t('premium.loadingOfferings')}
                        </Text>
                    </View>
                ) : offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0 ? (
                    <View style={styles.pricingContainer}>
                        {offerings.current.availablePackages.map((pkg, index) => {
                            const isYearly = pkg.identifier.toLowerCase().includes('annual') || pkg.identifier.toLowerCase().includes('yearly');
                            const isSelected = selectedPackage?.identifier === pkg.identifier;
                            
                            return (
                                <TouchableOpacity
                                    key={pkg.identifier}
                                    onPress={() => setSelectedPackage(pkg)}
                                >
                                    <Surface 
                                        style={[
                                            styles.priceCard, 
                                            isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
                                            index > 0 && { marginTop: 12 }
                                        ]} 
                                        elevation={isSelected ? 2 : 1}
                                    >
                                        {isYearly && (
                                            <View style={styles.bestValueTag}>
                                                <Text style={styles.bestValueText}>{t('premium.bestValue')}</Text>
                                            </View>
                                        )}
                                        <Text variant="titleMedium">{getPackageTitle(pkg)}</Text>
                                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginVertical: 8 }}>
                                            {formatPrice(pkg)}
                                        </Text>
                                        {pkg.product.subscriptionPeriod && (
                                            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                                                {pkg.product.subscriptionPeriod}
                                            </Text>
                                        )}
                                    </Surface>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={{ alignItems: 'center', padding: 32 }}>
                        <Text style={{ color: theme.colors.error }}>
                            {t('premium.noOfferings')}
                        </Text>
                    </View>
                )}

                {/* CTA Button */}
                <Button
                    mode="contained"
                    style={styles.subscribeButton}
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                    onPress={handleSubscribe}
                    disabled={isLoading || !selectedPackage}
                    loading={isLoading}
                >
                    {t('premium.subscribe')}
                </Button>

                <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 16, color: theme.colors.secondary }}>
                    {t('premium.autoRenew')}
                </Text>

                {/* Footer Links */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>{t('premium.restore')}</Text>
                    </TouchableOpacity>
                    <Text variant="bodySmall" style={{ marginHorizontal: 8 }}>•</Text>
                    <TouchableOpacity onPress={handleTerms}>
                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>{t('premium.terms')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 0,
    },
    header: {
        alignItems: 'flex-end',
    },
    hero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        marginTop: 16,
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 8,
    },
    benefitsContainer: {
        marginBottom: 32,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    benefitText: {
        flex: 1,
    },
    pricingContainer: {
        marginBottom: 24,
    },
    priceCard: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        position: 'relative',
    },
    bestValueTag: {
        position: 'absolute',
        top: -12,
        backgroundColor: '#FFD700',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bestValueText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    subscribeButton: {
        borderRadius: 28,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 24,
    },
});
