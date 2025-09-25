// src/pages/Dashboard.jsx
import React from 'react';
import { supabase } from '../supabase/client'; // Importa nosso novo cliente Supabase
import { useAuth } from '../context/AuthContext';
import { Box, Button, Typography, Container, AppBar, Toolbar } from '@mui/material';

const Dashboard = () => {
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        // A nova função de logout do Supabase
        await supabase.auth.signOut();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Novva R&S Dashboard</Typography>
                    <Button color="inherit" onClick={handleLogout}>Sair</Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4">Bem-vindo(a)!</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Login realizado com sucesso como: {currentUser?.email}
                </Typography>
            </Container>
        </Box>
    );
};

export default Dashboard;