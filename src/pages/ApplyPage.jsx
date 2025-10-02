// src/pages/ApplyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

const ApplyPage = () => {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Busca o título da vaga ao carregar a página
  useEffect(() => {
    const fetchJobTitle = async () => {
      try {
        const response = await fetch(`/api/getPublicJobData?id=${jobId}`);
        if (!response.ok) throw new Error('Vaga não encontrada.');
        const data = await response.json();
        setJobTitle(data.job.title);
      } catch (error) {
        setFeedback({ type: 'error', message: 'Erro ao carregar dados da vaga.' });
      }
    };
    fetchJobTitle();
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    if (!resumeFile) {
      setFeedback({ type: 'error', message: 'Por favor, anexe seu currículo.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('name', formState.name);
    formData.append('email', formState.email);
    formData.append('phone', formState.phone);
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formData, // FormData define o header 'multipart/form-data' automaticamente
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocorreu um erro ao enviar sua candidatura.');
      }

      setFeedback({ type: 'success', message: 'Candidatura enviada com sucesso! Entraremos em contato em breve.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (feedback.type === 'success') {
    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" gutterBottom>Obrigado!</Typography>
            <Alert severity="success">{feedback.message}</Alert>
        </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Candidatura à Vaga
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {jobTitle || 'Carregando vaga...'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField name="name" label="Nome Completo" required fullWidth margin="normal" onChange={handleInputChange} />
          <TextField name="email" label="E-mail" type="email" required fullWidth margin="normal" onChange={handleInputChange} />
          <TextField name="phone" label="Telefone" required fullWidth margin="normal" onChange={handleInputChange} />
          <Button variant="contained" component="label" sx={{ mt: 2, mb: 1 }}>
            Anexar Currículo (PDF, DOCX)
            <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </Button>
          {resumeFile && <Typography variant="body2">{resumeFile.name}</Typography>}

          {feedback.type === 'error' && <Alert severity="error" sx={{ mt: 2 }}>{feedback.message}</Alert>}

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Enviar Candidatura'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ApplyPage;