// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { 
    Box, Button, Typography, Container, AppBar, Toolbar, CircularProgress, 
    Table, TableBody, TableCell, TableHead, TableRow, Paper 
} from '@mui/material';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Esta função será executada assim que o componente for montado
        const fetchJobs = async () => {
            if (!currentUser) return; // Garante que temos um usuário logado

            try {
                // Pega a sessão do usuário para obter o token de acesso (prova de identidade)
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    throw new Error("Sessão do usuário não encontrada.");
                }

                // Faz a chamada para a nossa API de backend, passando o token para autorização
                const response = await fetch('/api/getJobs', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });

                // Se a resposta do servidor não for bem-sucedida, trate como um erro
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao buscar vagas do servidor.');
                }
                
                const data = await response.json();
                setJobs(data.jobs);

            } catch (err) {
                console.error("Erro ao buscar vagas:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [currentUser]); // O `useEffect` roda novamente se `currentUser` mudar

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Novva R&S Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Sair</Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Painel de Vagas
                    </Typography>
                    <Button variant="contained" color="primary" size="large">
                        Criar Nova Vaga
                    </Button>
                </Box>

                {/* Seção de Carregamento e Erro */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
                {error && <Typography color="error" align="center">Erro: {error}</Typography>}
                
                {/* Tabela de Vagas */}
                {!loading && !error && (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome da Vaga</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Candidatos</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <TableRow hover key={job.id}>
                                        <TableCell>{job.title}</TableCell>
                                        <TableCell>{job.status}</TableCell>
                                        <TableCell align="center">{job.candidateCount || 0}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Nenhuma vaga criada ainda.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default Dashboard;