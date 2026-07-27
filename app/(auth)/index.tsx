import React, { useState } from "react";
import {Alert, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Field, PrimaryButton } from "../components/ui";
import {useAuth} from "../../context/AuthContext";
import {router} from "expo-router";
import * as Auth from '../nonui/auth';
import {useSnackbar} from "../../context/SnackbarContext";

export default function AuthScreen() {
    const [mode, setMode] = useState("login");
    const signup = mode === "signup";

    const { showSnackbar } = useSnackbar();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    function signIn(email: string, password: string) {
        if (!email || email === "" || !password || password === "") {
            Alert.alert(
                'Invalid input',
                'All inputs are required',
                [{ text: 'OK', onPress: () => {} }]
            );
            return;
        }

        Auth.signIn(email, password).then(userCred => {
            router.push("/(auth)/family-gate");
        }).catch(err => {
            console.log("Failed to sign in", err);
            showSnackbar("Failed to sign in: " + err)
        });
    }

    function signUp(email: string, password: string, name: string) {
        if (!email || email === "" || !password || password === "" || !name || name === "") {
            Alert.alert(
                'Invalid input',
                'All inputs are required',
                [{ text: 'OK', onPress: () => {} }]
            );
            return;
        }

        Auth.signUp(email, password).then(userCred => {
            Auth.updateProfile(name).then(() => {
                router.push("/(auth)/family-gate");
            }).catch(err => {
                console.log("Failed to sign up", err);
                showSnackbar("Failed to sign up: " + err)
            });
        }).catch(err => {
            console.log("Failed to sign up", err);
            showSnackbar("Failed to sign up: " + err)
        });
    }

    return (
        <>
            <View style={styles.switcher}>
                <TouchableOpacity
                    style={[styles.tab, !signup && styles.activeTab]}
                    onPress={() => setMode("login")}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, !signup && styles.activeText]}>
                        Log in
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, signup && styles.activeTab]}
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
                label={signup ? "Create account" : "Log in"}
                onPress={() => {
                    if (signup)
                        signUp(email, password, name);
                    else
                        signIn(email, password);
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    switcher: {
        height: 48,
        backgroundColor: "#EAF1ED",
        borderRadius: 13,
        flexDirection: "row",
        alignItems: "center",
        padding: 4, // Gives a nice inner margin around the active tab
    },
    tab: {
        flex: 1, // Forces each tab to take up exactly 50% of the container width
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: "#FFF",
    },
    tabText: {
        color: "#6C7B72",
        fontWeight: "800",
    },
    activeText: {
        color: "#177A50",
    },
});
