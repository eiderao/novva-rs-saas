import React from 'react';
import { useAuth } from './context/authcontext';
import LoginPage from './pages/login';
import Dashboard from './pages/dashboard';

function App() {
    const { currentUser } = useAuth();

    return (
        <>
            {currentUser ? <Dashboard /> : <LoginPage />}
        </>
    );
}

export default App;