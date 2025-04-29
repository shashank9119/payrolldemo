import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Get the root element
const rootElement = document.getElementById('root');

// Update the document title
document.title = 'PayrollPro - Payroll Management System';

// Create the root and render the app
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}