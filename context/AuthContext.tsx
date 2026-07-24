import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<any>(null);
    const [family, setFamily] = useState<any>(null);

    return (
        <AuthContext.Provider value={{ session, setSession, family, setFamily }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);