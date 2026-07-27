import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, PaperProvider } from 'react-native-paper';

interface SnackbarContextType {
    showSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
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
                    visible={visible}
                    onDismiss={onDismiss}
                    duration={2000}
                    action={{
                        label: 'OK',
                        onPress: onDismiss,
                    }}
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