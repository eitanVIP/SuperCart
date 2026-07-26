import {StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform} from "react-native";
import { Slot } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {height} from "@expo/ui/jetpack-compose/modifiers";

export default function AuthLayout() {
    return (
        <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.root}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                // "padding" works best for iOS, "height" or undefined works best for Android
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.root}
            >
                <View style={styles.hero}>
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

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#EAF5EF" },
    hero: { alignItems: "center", paddingTop: 68, flex: 0.3 },
    logo: {
        height: 58,
        width: 58,
        borderRadius: 19,
        backgroundColor: "#177A50",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: { fontSize: 30, fontWeight: "900", color: "#FFF" },
    title: { fontSize: 29, fontWeight: "800", color: "#173426", marginTop: 13 },
    subtitle: { fontSize: 15, color: "#537061", marginTop: 6 },
    card: {
        flex: 0.7,
        backgroundColor: "#F8FCF9",
        borderTopLeftRadius: 31,
        borderTopRightRadius: 31,
        padding: 24,
    },
});