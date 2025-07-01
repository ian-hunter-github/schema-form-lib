import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import { ThemeDemo } from './demo/ThemeDemo'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
