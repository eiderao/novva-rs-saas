// src/App.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import JobDetails from './pages/JobDetails.jsx';
import ApplyPage from './pages/ApplyPage.jsx'; // <-- IMPORTAÇÃO DA NOVA PÁGINA
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

// Um componente para agrupar nossas rotas protegidas
const ProtectedRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/vaga/:jobId" element={<JobDetails />} />
    {/* Futuras rotas protegidas virão aqui */}
  </Routes>
);

function App() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            {/* ROTA PÚBLICA: Qualquer um pode acessar */}
            <Route path="/vaga/:jobId/apply" element={<ApplyPage />} />

            {/* ROTAS PRIVADAS: Redireciona para Login ou para as rotas protegidas */}
            <Route path="/*" element={currentUser ? <ProtectedRoutes /> : <LoginPage />} />
        </Routes>
    );
}

export default App;