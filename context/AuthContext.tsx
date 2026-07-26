import React, { createContext, useContext, useState } from 'react';
import {Family, User} from "../app/data/types";

interface AuthContextType {
    session: User | null;
    setSession: (session: User| null) => void;
    family: Family | null;
    setFamily: (family: Family | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

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