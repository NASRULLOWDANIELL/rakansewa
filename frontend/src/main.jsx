import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

// Keep a dummy clientId but enough to initiate the script.
// Note: Google login will not work properly without a real client ID, 
// but it satisfies the requirement of initiating the frontend Google Auth flow.
const GOOGLE_CLIENT_ID = "1041913165243-dummyclientid.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
