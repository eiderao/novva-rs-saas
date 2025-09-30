// src/pages/JobDetails.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, AppBar, Toolbar, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Para criar links de navegação

const JobDetails = () => {
  // O hook useParams() pega os parâmetros da URL, como o :jobId
  const { jobId } = useParams();

  return (
    <Box>
      <AppBar position="static">
          <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Detalhes da Vaga
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">
                Voltar para o Painel
              </Button>
          </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Detalhes da Vaga ID: {jobId}</Typography>
        <Typography sx={{ mt: 2 }}>
          Aqui ficarão as abas de Parâmetros, Ficha do Candidato, etc.
        </Typography>
      </Container>
    </Box>
  );
};

export default JobDetails;