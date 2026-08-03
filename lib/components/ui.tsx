import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    type TextInputProps,
    useWindowDimensions,
    View
} from "react-native";
import {useTheme} from "@/theme/ThemeContext";
import {BottomSheet as ExpoBottomSheet, RNHostView} from '@expo/ui';

export function PrimaryButton({
                                  label,
                                  onPress,
                                  disabled = false,
                              }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.primary, disabled && staticStyles.disabled]}
        >
            <Text style={styles.primaryText}>{label}</Text>
        </Pressable>
    );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={styles.input} placeholderTextColor={colors.placeholder} {...props} />
        </View>
    );
}

export function TopBar({
                           title,
                           action,
                           onAction,
                       }: {
    title: string;
    action?: string | null;
    onAction?: () => void;
}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.topBar}>
            <View style={staticStyles.brand}>
                <Image source={require('@/assets/icon.png')} style={{height: 40, width: 40}} />
                <Text style={styles.brandText}>{title}</Text>
            </View>
            {action && (
                <Pressable onPress={onAction} hitSlop={10}>
                    <Text style={styles.topAction}>{action}</Text>
                </Pressable>
            )}
        </View>
    );
}

export function LoadingIndicator() {
    const { colors } = useTheme();

    return (
        <View style={staticStyles.loadingContainer}>
            <ActivityIndicator size={50} color={colors.primary} />
        </View>
    );
}

export function BottomSheet({ children, visible, onClose }) {
    const { width } = useWindowDimensions();

    return (
        <ExpoBottomSheet isPresented={visible} onDismiss={onClose} snapPoints={["0%"]}>
            <RNHostView matchContents>
                <View style={[staticStyles.sheet, {width}]}>
                    {children}
                </View>
            </RNHostView>
        </ExpoBottomSheet>
    );
}

export function PromptModal({
                                visible,
                                title,
                                placeholder = "",
                                initialValue = "",
                                confirmLabel = "Confirm",
                                cancelLabel = "Cancel",
                                secureTextEntry = false,
                                validate,
                                onCancel,
                                onConfirm,
                            }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [text, setText] = useState(initialValue);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible) {
            setText(initialValue);
            setError(null);
        }
    }, [visible]);

    function handleConfirm() {
        const trimmed = text.trim();
        if (validate) {
            const validationError = validate(trimmed);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        onConfirm(trimmed);
    }

    function handleCancel() {
        setError(null);
        onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Pressable style={staticStyles.backdrop} onPress={handleCancel}>
                    <Pressable style={styles.card} onPress={() => {}}>
                        <Text style={styles.title}>{title}</Text>
                        <TextInput
                            value={text}
                            onChangeText={(value) => {
                                setText(value);
                                if (error) setError(null);
                            }}
                            placeholder={placeholder}
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={secureTextEntry}
                            autoFocus
                            style={styles.promptInput}
                            onSubmitEditing={handleConfirm}
                        />
                        {error && <Text style={styles.error}>{error}</Text>}
                        <View style={staticStyles.buttonRow}>
                            <Pressable onPress={handleCancel} style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
                            </Pressable>
                            <Pressable onPress={handleConfirm} style={styles.primaryButton}>
                                <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const staticStyles = StyleSheet.create({
    sheet: {
        backgroundColor: "transparent",
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 34,
        gap: 8
    },
    disabled: { opacity: 0.45 },
    brand: { flexDirection: "row", alignItems: "center", gap: 9 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
});

const createStyles = (colors) =>
    StyleSheet.create({
        primary: {
            height: 52,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            marginTop: 20,
        },
        primaryText: { color: colors.text, fontSize: 16, fontWeight: "800" },
        inputLabel: {
            fontSize: 10,
            color: colors.textMuted,
            fontWeight: "800",
            letterSpacing: 1,
            marginTop: 15,
            marginBottom: 7,
        },
        input: {
            height: 52,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderLight,
            borderRadius: 13,
            paddingHorizontal: 14,
            fontSize: 15,
            color: colors.text,
        },
        topBar: {
            height: 62,
            paddingHorizontal: 20,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        brandMark: {
            height: 32,
            width: 32,
            borderRadius: 10,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
        },
        brandLetter: { color: colors.onPrimary, fontWeight: "900", fontSize: 17 },
        brandText: { color: colors.text, fontWeight: "800", fontSize: 17 },
        topAction: { color: colors.primary, fontWeight: "800", fontSize: 14 },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 20,
            width: "100%",
            maxWidth: 340,
        },
        title: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 14 },
        promptInput: {
            height: 46,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderLight,
            paddingHorizontal: 12,
            color: colors.text,
            fontSize: 14,
        },
        error: { color: colors.danger, fontSize: 12, marginTop: 8 },
        secondaryButton: {
            flex: 1,
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderLight,
            alignItems: "center",
            justifyContent: "center",
        },
        secondaryButtonText: { color: colors.textSecondary, fontWeight: "700" },
        primaryButton: {
            flex: 1,
            height: 44,
            borderRadius: 10,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        primaryButtonText: { color: colors.onPrimary, fontWeight: "800" },
    });