import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "sonner";
import './style.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      richColors
      duration={4000}
    />
    <App />
  </StrictMode>,
)
