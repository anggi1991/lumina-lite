import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Text, IconButton, Surface, useTheme, ActivityIndicator, Button, Menu, Divider, Portal, Dialog } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../context/PremiumContext';
import { ChatMessage, checkChatQuota, incrementChatQuota, sendChatMessage } from '../services/chat';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function ChatScreen() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const { isPremium } = usePremium();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [quota, setQuota] = useState({ allowed: true, remaining: 0 });
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '', actions: [] as any[] });

    const showDialog = (title: string, message: string, actions: any[] = []) => {
        setDialogContent({ title, message, actions });
        setDialogVisible(true);
    };

    const hideDialog = () => setDialogVisible(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const loadQuota = useCallback(async () => {
        const status = await checkChatQuota(isPremium);
        setQuota(status);
    }, [isPremium]);

    useEffect(() => {
        loadQuota();
        setMessages(prev => {
            if (prev.length > 0) {
                return prev;
            }

            return [
                {
                    id: 'init',
                    text: t('chat.greeting'),
                    isUser: false,
                    timestamp: Date.now(),
                },
            ];
        });
    }, [loadQuota, t]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        if (!quota.allowed) {
            showDialog(
                t('chat.limitTitle'),
                isPremium ? t('chat.limitPremium') : t('chat.limitFree'),
                [
                    { text: t('common.ok'), onPress: hideDialog },
                    !isPremium ? { text: t('premium.title'), onPress: () => { hideDialog(); navigation.navigate('Premium'); } } : null
                ].filter(Boolean)
            );
            return;
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // Increment quota immediately
            await incrementChatQuota();
            loadQuota();

            const replyText = await sendChatMessage(userMsg.text, messages);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: replyText,
                isUser: false,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            showDialog(t('common.error'), t('chat.error'), [{ text: t('common.ok'), onPress: hideDialog }]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isUser = item.isUser;
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble,
                { backgroundColor: isUser ? theme.colors.primary : theme.colors.surfaceVariant }
            ]}>
                <Text style={{ color: isUser ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}>
                    {item.text}
                </Text>
            </View>
        );
    };

    const handleClearChat = () => {
        closeMenu();
        showDialog(
            t('chat.clearHistory'),
            t('chat.confirmClear'),
            [
                { text: t('common.cancel'), onPress: hideDialog },
                {
                    text: t('common.yes'),
                    onPress: () => {
                        setMessages([
                            {
                                id: 'init',
                                text: t('chat.greeting'),
                                isUser: false,
                                timestamp: Date.now()
                            }
                        ]);
                        hideDialog();
                    }
                }
            ]
        );
    };

    const handleAbout = () => {
        closeMenu();
        showDialog(t('chat.aboutLumi'), t('chat.aboutDesc'), [{ text: t('common.ok'), onPress: hideDialog }]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant || theme.colors.outline }]}>
                <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor={theme.colors.onSurface} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontFamily: 'Poppins-Bold', color: theme.colors.onSurface }}>Lumi AI</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                        {isPremium ? 'Premium' : `${quota.remaining} ${t('chat.remaining')}`}
                    </Text>
                </View>
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={<IconButton icon="dots-vertical" onPress={openMenu} iconColor={theme.colors.onSurface} />}
                    contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
                >
                    <Menu.Item onPress={handleClearChat} title={t('chat.clearHistory')} leadingIcon="delete" titleStyle={{ color: theme.colors.error }} />
                    <Divider />
                    <Menu.Item onPress={handleAbout} title={t('chat.aboutLumi')} leadingIcon="information" titleStyle={{ color: theme.colors.onSurface }} />
                </Menu>
            </View>

            {/* Chat Content */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    style={{ flex: 1 }}
                />

                {/* Loading Indicator */}
                {loading && (
                    <View style={{ padding: 10, alignItems: 'flex-start', marginLeft: 20 }}>
                        <Surface style={[styles.botBubble, { backgroundColor: theme.colors.surfaceVariant, padding: 10 }]} elevation={0}>
                            <ActivityIndicator size={16} color={theme.colors.primary} />
                        </Surface>
                    </View>
                )}

                {/* Ad Banner for Free Users */}
                {!isPremium && (
                    <View style={{ alignItems: 'center' }}>
                        <BannerAd
                            unitId={process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER}
                            size={BannerAdSize.BANNER}
                            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                        />
                    </View>
                )}

                {/* Input Area */}
                <Surface style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant || theme.colors.outline }]} elevation={4}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.onSurface }]}
                        placeholder={t('chat.placeholder')}
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <IconButton
                        icon="send"
                        mode="contained"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                        size={24}
                        onPress={handleSend}
                        disabled={loading || !inputText.trim()}
                    />
                </Surface>
            </KeyboardAvoidingView>

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 20, backgroundColor: theme.colors.surface }}>
                    <Dialog.Title style={{ textAlign: 'center', color: theme.colors.primary, fontFamily: 'Poppins-Bold' }}>{dialogContent.title}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', fontFamily: 'Inter-Regular' }}>{dialogContent.message}</Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                        {dialogContent.actions.map((action, index) => (
                            <Button key={index} onPress={action.onPress} labelStyle={{ fontFamily: 'Inter-SemiBold' }}>{action.text}</Button>
                        ))}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
        paddingHorizontal: 12,
    },
});
