import React, { createContext, useContext, useState, useEffect } from 'react';
import { Portal, Dialog, Text, Button, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

interface PremiumContextType {
    isPremium: boolean;
    isLoading: boolean;
    offerings: PurchasesOfferings | null;
    purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
    restorePurchases: () => Promise<void>;
    isLockEnabled: boolean;
    toggleAppLock: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType>({
    isPremium: false,
    isLoading: true,
    offerings: null,
    purchasePackage: async () => { },
    restorePurchases: async () => { },
    isLockEnabled: false,
    toggleAppLock: () => { },
});

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [isLockEnabled, setIsLockEnabled] = useState(false);
    const [visible, setVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const showCustomAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setVisible(true);
    };

    const hideAlert = () => setVisible(false);

    useEffect(() => {
        loadLockStatus();
        checkPremiumStatus();
        loadOfferings();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            setIsLoading(true);
            const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
            
            // Check if user has active premium entitlement
            const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
            setIsPremium(hasPremium);
            
            console.log('Premium Status:', hasPremium);
        } catch (error) {
            console.error('Failed to check premium status', error);
            setIsPremium(false);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            setOfferings(offerings);
            console.log('Loaded offerings:', offerings.current?.availablePackages.length);
        } catch (error) {
            console.error('Failed to load offerings', error);
        }
    };

    const purchasePackage = async (pkg: PurchasesPackage) => {
        try {
            setIsLoading(true);
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            
            // Check if purchase was successful
            const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
            setIsPremium(hasPremium);
            
            if (hasPremium) {
                showCustomAlert('Purchase Successful', 'You now have access to all premium features!');
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('Purchase failed', error);
                showCustomAlert('Purchase Failed', error.message || 'An error occurred during purchase. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const restorePurchases = async () => {
        try {
            setIsLoading(true);
            const customerInfo = await Purchases.restorePurchases();
            
            const hasPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
            setIsPremium(hasPremium);
            
            if (hasPremium) {
                showCustomAlert('Restore Successful', 'Your premium access has been restored!');
            } else {
                showCustomAlert('No Purchases Found', 'We could not find any previous purchases to restore.');
            }
        } catch (error: any) {
            console.error('Restore failed', error);
            showCustomAlert('Restore Failed', error.message || 'An error occurred while restoring purchases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadLockStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('isLockEnabled');
            setIsLockEnabled(status === 'true');
        } catch (error) {
            console.error('Failed to load lock status', error);
        }
    };

    const toggleAppLock = async (value: boolean) => {
        if (value && !isPremium) {
            showCustomAlert('Premium Feature', 'App Lock is a premium feature. Please upgrade to enable.');
            return;
        }
        setIsLockEnabled(value);
        await AsyncStorage.setItem('isLockEnabled', value.toString());
    };

    return (
        <PremiumContext.Provider value={{
            isPremium,
            isLoading,
            offerings,
            purchasePackage,
            restorePurchases,
            isLockEnabled,
            toggleAppLock,
        }}>
            {children}
            <Portal>
                <Dialog visible={visible} onDismiss={hideAlert} style={{ borderRadius: 20, backgroundColor: theme.colors.surface }}>
                    <Dialog.Title style={{ textAlign: 'center', color: theme.colors.primary, fontFamily: 'Poppins-Bold' }}>{alertTitle}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', fontFamily: 'Inter-Regular' }}>{alertMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center' }}>
                        <Button onPress={hideAlert} labelStyle={{ fontFamily: 'Inter-SemiBold' }}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </PremiumContext.Provider>
    );
};

