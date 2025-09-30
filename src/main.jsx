// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- IMPORTAÇÃO
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter> {/* <-- ADICIONADO */}
          <App />
        </BrowserRouter> {/* <-- ADICIONADO */}
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);