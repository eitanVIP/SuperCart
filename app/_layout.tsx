import {StyleSheet} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Slot} from "expo-router";
import {SnackbarProvider} from '../context/SnackbarContext';
import {ThemeProvider, useTheme} from "@/theme/ThemeContext";

function MainLayout() {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaProvider style={styles.container}>
            <SnackbarProvider>
                <Slot />
            </SnackbarProvider>
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <MainLayout />
        </ThemeProvider>
    );
}

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
    });