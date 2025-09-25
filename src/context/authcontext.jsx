import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Cria o Contexto
const AuthContext = createContext();

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

// Componente Provedor
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esta função do Firebase é um "ouvinte". Ela dispara sempre que
        // o estado de login/logout muda (inclusive no carregamento inicial).
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Retorna a função de limpeza para remover o "ouvinte" quando o componente desmontar
        return unsubscribe;
    }, []);

    const value = {
        currentUser
    };

    // Enquanto o Firebase verifica a autenticação, mostramos um spinner.
    // Isso evita um "piscar" da tela de login antes de redirecionar para o dashboard.
    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingSpinner /> : children}
        </AuthContext.Provider>
    );
};