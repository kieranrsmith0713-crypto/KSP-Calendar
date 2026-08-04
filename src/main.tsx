import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@kieranrsmith0713-crypto/hub-foundations/css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
