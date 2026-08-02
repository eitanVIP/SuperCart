import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {Slot} from "expo-router";
import {SnackbarProvider} from '../context/SnackbarContext';
import {ThemeProvider, useTheme} from "@/theme/ThemeContext";
import {StatusBar} from "expo-status-bar";
import {KeyboardAvoidingView, Platform} from "react-native";
import {KeyboardProvider} from "react-native-keyboard-controller";

function ThemedStatusBar() {
    const { resolvedTheme } = useTheme();
    return <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />;
}

function ThemedSafeAreaProvider({children}) {
    const { colors } = useTheme();
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: colors.background}}>
            {children}
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <KeyboardProvider>
                <ThemedStatusBar />
                <ThemedSafeAreaProvider>
                    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            // "padding" works best for iOS, "height" or undefined works best for Android
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{flex: 1}}
                        >
                            <SnackbarProvider>
                                <Slot />
                            </SnackbarProvider>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                </ThemedSafeAreaProvider>
            </KeyboardProvider>
        </ThemeProvider>
    );
}