import React, {useEffect, useState} from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Field, PrimaryButton} from "@/lib/components/ui";
import {router} from "expo-router";
import * as Auth from '@/lib/auth';
import {useSnackbar} from "../../context/SnackbarContext";
import {log} from "@/lib/util";
import {useTheme} from "@/theme/ThemeContext";

export default function AuthPage() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("login");
    const signup = mode === "signup";

    const { showSnackbar } = useSnackbar();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        const unsubscribe = Auth.onAuthStateChanged((user) => {
            if (user) {
                router.replace('/(app)');
            }
        });
        return unsubscribe;
    }, []);

    function getAuthErrorMessage(err: any): string {
        switch (err.code) {
            // Sign-in
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Try again later.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';

            // Sign-up
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'That email address looks invalid.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is currently disabled.';

            // Update profile / re-authentication
            case 'auth/requires-recent-login':
                return 'Please sign in again to complete this action.';
            case 'auth/credential-already-in-use':
                return 'This credential is already linked to another account.';

            // Network / general
            case 'auth/network-request-failed':
                return 'Network error. Check your connection and try again.';

            default:
                return 'Something went wrong. Please try again.';
        }
    }

    function signIn(email: string, password: string) {
        if (!email || email === "" || !password || password === "") {
            log("Sign In", "All inputs are required", showSnackbar);
            return;
        }

        setLoading(true);

        Auth.signIn(email, password).then(userCred => {
            router.replace("/(auth)/family-gate-page");
        }).catch(err => {
            log("Sign In", getAuthErrorMessage(err), showSnackbar);
        }).finally(() => {
            setLoading(false);
        });
    }

    function signUp(email: string, password: string, name: string) {
        if (!email || email === "" || !password || password === "" || !name || name === "") {
            log("Sign Up", "All inputs are required", showSnackbar);
            return;
        }

        setLoading(true);

        Auth.signUp(email, password).then(userCred => {
            Auth.updateProfile(name, null).then(() => {
                router.replace("/(auth)/family-gate-page");
            }).catch(err => {
                log("Sign Up", getAuthErrorMessage(err), showSnackbar);
            });
        }).catch(err => {
            log("Sign Up", getAuthErrorMessage(err), showSnackbar);
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <>
            <View style={staticStyles.hero}>
                <Image source={require('@/assets/icon.png')} style={{height: 72, aspectRatio: 1}} />
                <Text style={styles.title}>SuperCart</Text>
                <Text style={styles.subtitle}>Shopping, made simple for your family.</Text>
            </View>

            <ScrollView style={styles.card}>
                <View style={styles.switcher}>
                    <TouchableOpacity
                        style={[staticStyles.tab, !signup && styles.activeTab]}
                        onPress={() => setMode("login")}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, !signup && styles.activeText]}>
                            Log in
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[staticStyles.tab, signup && styles.activeTab]}
                        onPress={() => setMode("signup")}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, signup && styles.activeText]}>
                            Sign up
                        </Text>
                    </TouchableOpacity>
                </View>
                {signup && <Field
                    label="YOUR NAME"
                    placeholder="Your name"
                    value={name}
                    onChangeText={setName}
                />}
                <Field
                    label="EMAIL ADDRESS"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <Field
                    label="PASSWORD"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <PrimaryButton
                    disabled={loading}
                    label={signup ? "Create account" : "Log in"}
                    onPress={() => {
                        if (signup)
                            signUp(email, password, name);
                        else
                            signIn(email, password);
                    }}
                />
                <View style={{height: 48}} />
            </ScrollView>
        </>
    );
}

const staticStyles = StyleSheet.create({
    tab: {
        flex: 1, // Forces each tab to take up exactly 50% of the container width
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    hero: { alignItems: "center", paddingTop: 68, flex: 0.3 },
});

const createStyles = (colors) =>
    StyleSheet.create({
        switcher: {
            height: 48,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 13,
            flexDirection: "row",
            alignItems: "center",
            padding: 4, // Gives a nice inner margin around the active tab
        },
        activeTab: {
            backgroundColor: colors.card,
        },
        tabText: {
            color: colors.textMuted,
            fontWeight: "800",
        },
        activeText: {
            color: colors.primary,
        },
        root: { flex: 1, backgroundColor: colors.background },
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