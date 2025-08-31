import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './authContext.jsx'
import ProjectRoutes from './Routes.jsx';
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ProjectRoutes />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
