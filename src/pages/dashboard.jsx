import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Typography, Container, AppBar, Toolbar } from '@mui/material';

const Dashboard = () => {
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // O AuthContext cuidará do redirecionamento
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Nowa R&S Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4">
                    Bem-vindo(a)!
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Logado como: {currentUser?.email}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Este é o seu painel. Em breve, aqui você verá a lista de vagas.
                </Typography>
            </Container>
        </Box>
    );
};

export default Dashboard;