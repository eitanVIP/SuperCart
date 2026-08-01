import React, {createContext, useContext, useEffect, useState} from "react";
import {Appearance, useColorScheme} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {darkColors, lightColors, ThemeColors} from "./colors";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
    mode: ThemeMode;              // what the user picked
    resolvedTheme: ResolvedTheme; // what's actually applied
    colors: ThemeColors;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme(); // "light" | "dark" | null
    const [mode, setModeState] = useState<ThemeMode>("system");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (saved === "light" || saved === "dark" || saved === "system") {
                setModeState(saved);
            }
            setLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (mode === "system") {
            Appearance.setColorScheme('unspecified'); // follow OS
        } else {
            Appearance.setColorScheme(mode); // force light/dark
        }
    }, [mode]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        AsyncStorage.setItem(STORAGE_KEY, newMode);
    };

    const resolvedTheme: ResolvedTheme =
        mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

    const colors = resolvedTheme === "dark" ? darkColors : lightColors;

    if (!loaded) return null; // or a splash/loading view

    return (
        <ThemeContext.Provider value={{ mode, resolvedTheme, colors, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}