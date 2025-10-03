// src/pages/JobDetails.jsx (Versão Final com Nota "N/A" Fixa)
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { 
    Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress, 
    Alert, Paper, Tabs, Tab, TextField, IconButton, Snackbar, InputAdornment,
    List, ListItem, ListItemText, Divider, Grid
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ParametersSection = ({ criteria = [], onCriteriaChange }) => {
  const handleItemChange = (index, field, value) => { const newCriteria = [...criteria]; const numericValue = field === 'weight' ? Number(value) || 0 : value; newCriteria[index] = { ...newCriteria[index], [field]: numericValue }; onCriteriaChange(newCriteria); };
  const addCriterion = () => { if (criteria.length < 10) { onCriteriaChange([...criteria, { name: '', weight: 0 }]); } };
  const removeCriterion = (index) => { const newCriteria = criteria.filter((_, i) => i !== index); onCriteriaChange(newCriteria); };
  const totalWeight = criteria.reduce((sum, item) => sum + (item.weight || 0), 0);
  return (
    <Box sx={{ mt: 2 }}>
      {criteria.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField label={`Critério ${index + 1}`} value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} fullWidth variant="standard" />
          <TextField label="Peso (%)" type="number" value={item.weight} onChange={(e) => handleItemChange(index, 'weight', e.target.value)} sx={{ width: '120px' }} variant="standard" />
          <IconButton onClick={() => removeCriterion(index)} color="error"><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Button startIcon={<AddCircleOutlineIcon />} onClick={addCriterion} disabled={criteria.length >= 10} sx={{ mt: 2 }}>Adicionar Critério</Button>
      <Typography variant="h6" sx={{ mt: 3, p: 1, borderRadius: 1, bgcolor: totalWeight === 100 ? '#e8f5e9' : '#ffebee', color: totalWeight === 100 ? 'green' : 'red' }}> Soma dos Pesos: {totalWeight}% </Typography>
    </Box>
  );
};

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [parameters, setParameters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) { setLoading(false); setError("ID da vaga não encontrado."); return; }
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão não encontrada.");
        const response = await fetch(`/api/getJobById?id=${jobId}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Não foi possível buscar os detalhes da vaga."); }
        const data = await response.json();
        if (data.job && data.job.parameters) { setJob(data.job); setParameters(data.job.parameters); } 
        else { throw new Error("Os dados da vaga recebidos são inválidos."); }
      } catch (err) { console.error("Erro ao buscar detalhes da vaga:", err); setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId) return;
      setLoadingApplicants(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão não encontrada.");
        const response = await fetch(`/api/getApplicantsForJob?jobId=${jobId}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Não foi possível buscar os candidatos."); }
        const data = await response.json();
        setApplicants(data.applications);
      } catch (err) { console.error("Erro ao buscar candidatos:", err); } 
      finally { setLoadingApplicants(false); }
    };
    if (tabValue === 0) { fetchApplicants(); }
  }, [jobId, tabValue]);

  const handleTabChange = (event, newValue) => { setTabValue(newValue); };
  const handleParametersChange = (section, newCriteria) => { setParameters(prevParams => ({ ...prevParams, [section]: newCriteria })); };
  
  const handleNoteChange = (index, field, value) => {
    const newNotes = [...parameters.notas];
    const numericValue = field === 'valor' ? Number(value) || 0 : value;
    newNotes[index] = { ...newNotes[index], [field]: numericValue };
    setParameters(prevParams => ({ ...prevParams, notas: newNotes }));
  };

  const handleSaveParameters = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Você não está autenticado.");
      const response = await fetch('/api/updateJobParameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ jobId: jobId, parameters: parameters }),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Não foi possível salvar os parâmetros."); }
      setFeedback({ open: true, message: 'Parâmetros salvos com sucesso!', severity: 'success' });
    } catch (err) {
      setFeedback({ open: true, message: err.message, severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCloseFeedback = () => { setFeedback({ open: false, message: '' }); };
  const applicationUrl = `${window.location.origin}/vaga/${jobId}/apply`;
  const handleCopyLink = () => { navigator.clipboard.writeText(applicationUrl); setFeedback({ open: true, message: 'Link copiado!', severity: 'info' }); };
  
  const renderContent = () => {
    if (loading) { return <CircularProgress />; }
    if (error) { return <Alert severity="error">{error}</Alert>; }
    if (job && parameters) {
      return (
        <>
          <Typography variant="h4">{job.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>Status: {job.status}</Typography>
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Link Público de Candidatura</Typography>
            <TextField fullWidth variant="outlined" value={applicationUrl} InputProps={{ readOnly: true, endAdornment: ( <InputAdornment position="end"><IconButton onClick={handleCopyLink}><ContentCopyIcon /></IconButton></InputAdornment> )}}/>
          </Box>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Candidatos" />
                <Tab label="Parâmetros" />
              </Tabs>
            </Box>
            <Box p={3} hidden={tabValue !== 0}>
              <Typography variant="h5" gutterBottom>Candidatos Inscritos</Typography>
              {loadingApplicants ? <CircularProgress /> : (
                <List>
                  {applicants.length > 0 ? applicants.map((app, index) => (
                    <React.Fragment key={app.id}>
                      <ListItem button component={RouterLink} to={`/vaga/${jobId}/candidato/${app.id}`}>
                        <ListItemText primary={app.candidates.name} secondary={app.candidates.email} />
                      </ListItem>
                      {index < applicants.length - 1 && <Divider />}
                    </React.Fragment>
                  )) : ( <Typography>Nenhum candidato inscrito para esta vaga ainda.</Typography> )}
                </List>
              )}
            </Box>
            <Box p={3} hidden={tabValue !== 1}>
               <Typography variant="h5" gutterBottom>Parâmetros de Avaliação</Typography>
               <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography>Critérios de Triagem</Typography>
                  <ParametersSection criteria={parameters.triagem} onCriteriaChange={(newCriteria) => handleParametersChange('triagem', newCriteria)} />
               </Paper>
               <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography>Cultura</Typography>
                  <ParametersSection criteria={parameters.cultura} onCriteriaChange={(newCriteria) => handleParametersChange('cultura', newCriteria)} />
               </Paper>
               <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography>Técnico</Typography>
                  <ParametersSection criteria={parameters.tecnico} onCriteriaChange={(newCriteria) => handleParametersChange('tecnico', newCriteria)} />
               </Paper>
               <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{p: 1}}>Definição de Notas</Typography>
                  <Grid container spacing={2} sx={{p: 2}}>
                    {parameters.notas && parameters.notas.map((nota, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={6}>
                          <TextField label={`Nome da Nota ${index + 1}`} value={nota.nome} onChange={(e) => handleNoteChange(index, 'nome', e.target.value)} fullWidth variant="standard" disabled={nota.nome === 'N/A'} />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label={`Valor da Nota ${index + 1}`} type="number" value={nota.valor} onChange={(e) => handleNoteChange(index, 'valor', e.target.value)} fullWidth variant="standard" disabled={nota.nome === 'N/A'} />
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
               </Paper>
               <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large" onClick={handleSaveParameters} disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : 'Salvar Parâmetros'}
                  </Button>
               </Box>
            </Box>
          </Paper>
        </>
      );
    }
    return null;
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{job ? `Vaga: ${job.title}` : 'Carregando Vaga...'}</Typography>
          <Button color="inherit" component={RouterLink} to="/">Voltar para o Painel</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {renderContent()}
      </Container>
      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default JobDetails;