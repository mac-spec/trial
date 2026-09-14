import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuditCopilot } from './components/AuditCopilot';
import './index.css';

document.documentElement.classList.add('light');

document.documentElement.style.fontSize = '16px';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <AuditCopilot />
  </StrictMode>
);
