import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Cria um tema básico do Material-UI para um visual agradável
const theme = createTheme();

// Pega o elemento 'root' do index.html e renderiza nosso app dentro dele
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);