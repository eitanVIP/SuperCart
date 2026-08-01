import {StyleSheet} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Slot} from "expo-router";
import {SnackbarProvider} from '../context/SnackbarContext';
import {ThemeProvider} from "@/theme/ThemeContext";

export default function RootLayout() {
    return (
        <ThemeProvider>
            <SafeAreaProvider style={styles.container}>
                <SnackbarProvider>
                    <Slot />
                </SnackbarProvider>
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6FAF7",
    },
});