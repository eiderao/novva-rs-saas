// src/pages/ApplicationDetails.jsx (VERSÃO DE DEPURAÇÃO FINAL)
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { format, parseISO } from 'date-fns';
import { 
    Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress, 
    Alert, Paper, Grid, Link, Divider, List, ListItem, ListItemText,
    FormControl, InputLabel, Select, MenuItem, TextField, Snackbar
} from '@mui/material';

const EvaluationSection = ({ title, criteria = [], notes = [], evaluationData = {}, onEvaluationChange, onNotesChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {criteria.map((criterion, index) => (
        <Box key={index} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{criterion.name} (Peso: {criterion.weight}%)</InputLabel>
            <Select
              value={evaluationData[criterion.name] ?? ''}
              label={`${criterion.name} (Peso: ${criterion.weight}%)`}
              onChange={(e) => {
                console.group(`[SENSOR #1] Ação no Componente Select (${title})`);
                console.log(`Critério: ${criterion.name}`);
                console.log(`Valor bruto do evento (e.target.value):`, e.target.value);
                console.log(`Tipo do valor bruto:`, typeof e.target.value);
                console.groupEnd();
                onEvaluationChange(title.toLowerCase(), criterion.name, e.target.value);
              }}
              variant="standard"
            >
              {notes.map((note, noteIndex) => (
                <MenuItem key={noteIndex} value={note.valor}>{note.nome} ({note.valor})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}
      <TextField
        label="Anotações"
        multiline
        rows={3}
        fullWidth
        variant="standard"
        sx={{ mt: 2 }}
        value={evaluationData.anotacoes || ''}
        onChange={(e) => onNotesChange(title.toLowerCase(), e.target.value)}
      />
    </Paper>
  );
};

const ApplicationDetails = () => {
  const { jobId, applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [evaluation, setEvaluation] = useState({ triagem: {anotacoes: ''}, cultura: {anotacoes: ''}, tecnico: {anotacoes: ''} });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!applicationId) { setError("ID da candidatura não encontrado."); setLoading(false); return; }
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão não encontrada.");
        const appResponse = await fetch(`/api/getApplicationDetails?applicationId=${applicationId}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (!appResponse.ok) { const errorData = await appResponse.json(); throw new Error(errorData.error || "Não foi possível buscar os detalhes."); }
        const appData = await appResponse.json();

        if (appData.application) {
          setApplication(appData.application);
          if (appData.application.evaluation) {
            setEvaluation(prev => ({
                triagem: { ...prev.triagem, ...appData.application.evaluation.triagem },
                cultura: { ...prev.cultura, ...appData.application.evaluation.cultura },
                tecnico: { ...prev.tecnico, ...appData.application.evaluation.tecnico },
            }));
          }

          const filePath = appData.application.resumeUrl;
          if (filePath) {
            const urlResponse = await fetch(`/api/getResumeSignedUrl?filePath=${filePath}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
            if (!urlResponse.ok) { throw new Error("Não foi possível gerar o link do currículo."); }
            const urlData = await urlResponse.json();
            setResumeUrl(urlData.signedUrl);
          }
        } else { throw new Error("Dados da candidatura recebidos são inválidos."); }
      } catch (err) { console.error("Erro ao carregar detalhes:", err); setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [applicationId]);

  const handleEvaluationChange = (section, criterionName, value) => {
    console.group('[SENSOR #2] handleEvaluationChange chamado');
    console.log(`Recebido: seção=${section}, critério=${criterionName}, valor=${value}`);
    console.log(`Tipo do valor recebido:`, typeof value);
    const numericValue = Number(value);
    console.log(`Valor convertido para número:`, numericValue);
    console.log(`Tipo do valor convertido:`, typeof numericValue);
    console.groupEnd();

    setEvaluation(prevEval => {
      const newState = { ...prevEval, [section]: { ...prevEval[section], [criterionName]: numericValue } };
      console.group('[SENSOR #3] Novo estado que será salvo');
      console.log(newState);
      console.groupEnd();
      return newState;
    });
  };

  const handleNotesChange = (section, text) => { setEvaluation(prevEval => ({ ...prevEval, [section]: { ...prevEval[section], anotacoes: text } })); };
  const handleCloseFeedback = () => { setFeedback({ open: false, message: '' }); };
  const handleSaveEvaluation = async () => { /* ... */ };
  const formatUrl = (url) => { /* ... */ };

  const renderContent = () => {
    if (loading) { return <CircularProgress />; }
    if (error) { return <Alert severity="error">{error}</Alert>; }
    if (application) {
      const { candidate, job, formData } = application;
      return (
        <Grid container spacing={3}>
          {/* ... Colunas de Info e Respostas ... */}
           <Grid item xs={12}>
             <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h5" gutterBottom>Avaliação</Typography>
                <EvaluationSection title="Triagem" criteria={job.parameters.triagem} notes={job.parameters.notas} evaluationData={evaluation.triagem} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <EvaluationSection title="Cultura" criteria={job.parameters.cultura} notes={job.parameters.notas} evaluationData={evaluation.cultura} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <EvaluationSection title="Técnico" criteria={job.parameters.tecnico} notes={job.parameters.notas} evaluationData={evaluation.tecnico} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large" onClick={handleSaveEvaluation} disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} color="inherit"/> : 'Salvar Avaliação'}
                  </Button>
                </Box>
              </Paper>
           </Grid>
        </Grid>
      );
    }
    return null;
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{application ? `Candidato: ${application.candidate.name}` : 'Carregando Candidatura...'}</Typography>
          <Button color="inherit" component={RouterLink} to={`/vaga/${jobId}`}> Voltar para a Vaga </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>{renderContent()}</Container>
      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={handleCloseFeedback}>
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicationDetails;