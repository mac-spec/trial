import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuditCopilot } from './components/AuditCopilot';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <AuditCopilot />
  </StrictMode>
);
