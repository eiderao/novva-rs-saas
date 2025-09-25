// src/firebase/config.js (Versão Final e Completa)
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ▼▼▼ COLE AQUI O OBJETO 'firebaseConfig' QUE VOCÊ COPIOU DO SEU PROJETO ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyA1S2Xancc20OHgsGR78CIjksx1cCxhzJg",
  authDomain: "novva-rs.firebaseapp.com",
  projectId: "novva-rs",
  storageBucket: "novva-rs.firebasestorage.app",
  messagingSenderId: "225806473141",
  appId: "1:225806473141:web:cce7c9d8b5f9d056feabfc",
  measurementId: "G-XY47Z0ZWRL"
};
// ▲▲▲ COLE AQUI O OBJETO 'firebaseConfig' QUE VOCÊ COPIOU DO SEU PROJETO ▲▲▲


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'southamerica-east1'); // É uma boa prática definir a região
const storage = getStorage(app);

// Conecta aos emuladores SE estivermos no ambiente de desenvolvimento local (ex: rodando `npm run dev`)
if (window.location.hostname === "localhost") {
  console.log("Ambiente local detectado. Conectando aos emuladores do Firebase...");
  
  // Porta padrão do emulador de Autenticação
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  
  // Porta que NÓS definimos para o emulador do Firestore no arquivo firebase.json
  connectFirestoreEmulator(db, "127.0.0.1", 8081);
  
  // Porta padrão do emulador de Funções
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// Exporta os serviços para uso no restante da aplicação
export { auth, db, storage, functions };
export default app;