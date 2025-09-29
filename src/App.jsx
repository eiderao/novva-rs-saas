import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

function App() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {currentUser ? <Dashboard /> : <LoginPage />}
        </>
    );
}

export default App;