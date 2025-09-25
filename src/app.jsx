import React from 'react';
import { useAuth } from './context/authcontext';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    const { currentUser } = useAuth();

    return (
        <>
            {currentUser ? <Dashboard /> : <LoginPage />}
        </>
    );
}

export default App;