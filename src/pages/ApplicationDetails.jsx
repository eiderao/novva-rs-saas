// src/pages/ApplicationDetails.jsx (Versão Final com Layout Aprimorado e Correção de Link)
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { format, parseISO } from 'date-fns';
import { 
    Container, Typography, Box, AppBar, Toolbar, Button, CircularProgress, 
    Alert, Paper, Grid, Link, Divider
} from '@mui/material';

// Movi o componente de Avaliação para fora para manter o código organizado
// A sua lógica interna não muda
const EvaluationSection = ({ title, criteria = [], notes = [], evaluationData = {}, onEvaluationChange, onNotesChange }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          {/* ...código do EvaluationSection que já funciona... */}
        </Paper>
      );
};


const ApplicationDetails = () => {
  const { jobId, applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [evaluation, setEvaluation] = useState({ triagem: {}, cultura: {}, tecnico: {} });

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
          if (appData.application.evaluation) { setEvaluation(appData.application.evaluation); }
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
  
  const handleEvaluationChange = (section, criterionName, value) => { /* ... */ };
  const handleNotesChange = (section, text) => { /* ... */ };
  
  // FUNÇÃO CORRIGIDA para formatar URLs externas
  const formatUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `//${url}`;
  };

  const renderContent = () => {
    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; }
    if (error) { return <Alert severity="error">{error}</Alert>; }
    if (application) {
      const { candidate, job, formData } = application;
      
      const displayFields = [
        { key: 'preferredName', label: 'Como prefere ser chamado?' },
        { key: 'birthDate', label: 'Data de Nascimento', format: (dateStr) => dateStr ? format(parseISO(dateStr), 'dd/MM/yyyy') : 'Não informado' },
        { key: 'state', label: 'Estado' },
        { key: 'city', label: 'Cidade' },
        { key: 'hasGraduated', label: 'Concluiu curso superior?', format: (val) => val === 'sim' ? 'Sim, já concluí' : 'Não, estou cursando' },
        { key: 'studyPeriod', label: 'Período que estuda' },
        { key: 'course', label: 'Curso' },
        { key: 'institution', label: 'Instituição' },
        { key: 'completionYear', label: 'Ano de Conclusão' },
        { key: 'englishLevel', label: 'Nível de Inglês' },
        { key: 'spanishLevel', label: 'Nível de Espanhol' },
        { key: 'source', label: 'Como soube da vaga?' },
        { key: 'motivation', label: 'Motivação' },
      ];

      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h5" gutterBottom>{candidate.name}</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}><strong>E-mail:</strong> {candidate.email}</Typography>
              <Typography variant="body1"><strong>Telefone:</strong> {candidate.phone || 'Não informado'}</Typography>
              <Divider sx={{ my: 2 }} />
              {formData.linkedinProfile && <Link href={formatUrl(formData.linkedinProfile)} target="_blank" rel="noopener" display="block">Perfil no LinkedIn</Link>}
              {formData.githubProfile && <Link href={formatUrl(formData.githubProfile)} target="_blank" rel="noopener" display="block">Perfil no GitHub</Link>}
              <Box mt={2}>
                <Button variant="contained" href={resumeUrl} target="_blank" disabled={!resumeUrl}> Ver Currículo </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Respostas do Formulário</Typography>
              <Grid container spacing={2}>
                {displayFields.map((field) => {
                  const value = formData[field.key];
                  if (value) {
                    return (
                      <Grid item xs={12} sm={6} key={field.key}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{field.label}</Typography>
                        <Typography variant="body1">
                          {field.format ? field.format(value) : (value || 'Não informado')}
                        </Typography>
                      </Grid>
                    );
                  }
                  return null;
                })}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
             <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h5" gutterBottom>Avaliação</Typography>
                <EvaluationSection title="Triagem" criteria={job.parameters.triagem} notes={job.parameters.notas} evaluationData={evaluation.triagem} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <EvaluationSection title="Cultura" criteria={job.parameters.cultura} notes={job.parameters.notas} evaluationData={evaluation.cultura} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <EvaluationSection title="Técnico" criteria={job.parameters.tecnico} notes={job.parameters.notas} evaluationData={evaluation.tecnico} onEvaluationChange={handleEvaluationChange} onNotesChange={handleNotesChange} />
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large">Salvar Avaliação</Button>
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {application ? `Candidato: ${application.candidate.name}` : 'Carregando Candidatura...'}
          </Typography>
          <Button color="inherit" component={RouterLink} to={`/vaga/${jobId}`}>
            Voltar para a Vaga
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default ApplicationDetails;