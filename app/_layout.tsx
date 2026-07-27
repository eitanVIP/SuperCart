import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SnackbarProvider } from '../context/SnackbarContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider style={styles.container}>
            <AuthProvider>
                <SnackbarProvider>
                    <Slot />
                </SnackbarProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6FAF7",
    },
});