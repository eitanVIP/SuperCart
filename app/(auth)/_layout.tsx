import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from "react-native";
import {Slot} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {useTheme} from "@/theme/ThemeContext";

export default function AuthLayout() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.root}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                // "padding" works best for iOS, "height" or undefined works best for Android
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.root}
            >
                <View style={staticStyles.hero}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <Text style={styles.title}>SuperCart</Text>
                    <Text style={styles.subtitle}>Shopping, made simple for your family.</Text>
                </View>

                <ScrollView style={styles.card}>
                    <Slot />
                    <View style={{height: 48}} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const staticStyles = StyleSheet.create({
    hero: { alignItems: "center", paddingTop: 68, flex: 0.3 },
});

const createStyles = (colors) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        logo: {
            height: 58,
            width: 58,
            borderRadius: 19,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        logoText: { fontSize: 30, fontWeight: "900", color: colors.onPrimary },
        title: { fontSize: 29, fontWeight: "800", color: colors.text, marginTop: 13 },
        subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 6 },
        card: {
            flex: 0.7,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 31,
            borderTopRightRadius: 31,
            padding: 24,
        },
    });