import React, {createContext, ReactNode, useContext, useState} from 'react';
import {PaperProvider, Snackbar} from 'react-native-paper';
import {useTheme} from "@/theme/ThemeContext";

interface SnackbarContextType {
    showSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState('');

    const showSnackbar = (message: string) => {
        setText(message);
        setVisible(true);
    };

    const onDismiss = () => setVisible(false);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            <PaperProvider>
                {children}
                <Snackbar
                    style={{ margin: 30, backgroundColor: colors.surfaceAlt }}
                    theme={{ colors: { onSurface: colors.text, inverseOnSurface: colors.text } }}
                    visible={visible}
                    onDismiss={onDismiss}
                    duration={3000}
                >
                    {text}
                </Snackbar>
            </PaperProvider>
        </SnackbarContext.Provider>
    );
};

// Custom Hook for easy usage inside any screen
export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};