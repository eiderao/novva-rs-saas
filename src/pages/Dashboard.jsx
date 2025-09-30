// src/pages/Dashboard.jsx (Versão Final e Corrigida)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import CreateJobModal from '../components/jobs/CreateJobModal';
import { 
    Box, Button, Typography, Container, AppBar, Toolbar, CircularProgress, 
    Table, TableBody, TableCell, TableHead, TableRow, Paper 
} from '@mui/material';

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreateModal, setOpenCreateModal] = useState(false);

    // 1. A função fetchJobs é declarada fora do useEffect, no escopo do componente
    const fetchJobs = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        
        // Note que não precisamos de setLoading(true) aqui, pois o useEffect já cuida disso
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão do usuário não encontrada.");
            
            const response = await fetch('/api/getJobs', { headers: { 'Authorization': `Bearer ${session.access_token}` } });
            
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
    }, [currentUser]); // A função depende apenas do currentUser

    // 2. O useEffect é usado para chamar a função na primeira renderização
    useEffect(() => {
        setLoading(true); // Controlamos o loading inicial aqui
        fetchJobs();
    }, [fetchJobs]); // E ele depende da função fetchJobs

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleRowClick = (jobId) => {
      navigate(`/vaga/${jobId}`);
    };

    return (
        <>
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
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large"
                            onClick={() => setOpenCreateModal(true)}
                        >
                            Criar Nova Vaga
                        </Button>
                    </Box>

                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
                    {error && <Typography color="error" align="center">Erro: {error}</Typography>}
                    
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
                                        <TableRow 
                                            hover 
                                            key={job.id} 
                                            onClick={() => handleRowClick(job.id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
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
            {/* 3. Agora o onJobCreated consegue encontrar e chamar a função fetchJobs */}
            <CreateJobModal 
                open={openCreateModal}
                handleClose={() => setOpenCreateModal(false)}
                onJobCreated={fetchJobs}
            />
        </>
    );
};

export default Dashboard;