// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase/client'; // Importa nosso novo cliente Supabase

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            // Pega a sessão do usuário (se ele já estiver logado)
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Ouve por mudanças no estado de autenticação (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        // Limpa o "ouvinte" quando o componente é desmontado
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};