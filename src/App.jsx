// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <-- IMPORTAÇÕES
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import JobDetails from './pages/JobDetails.jsx'; // <-- IMPORTAÇÃO
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

function App() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    // Se não houver usuário logado, mostre sempre a página de login
    if (!currentUser) {
        return <LoginPage />;
    }

    // Se o usuário ESTIVER logado, mostre as rotas protegidas
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vaga/:jobId" element={<JobDetails />} />
            {/* Outras rotas protegidas podem ser adicionadas aqui */}
        </Routes>
    );
}

export default App;