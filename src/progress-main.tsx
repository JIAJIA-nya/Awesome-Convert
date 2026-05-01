import React from 'react'
import ReactDOM from 'react-dom/client'
import ProgressApp from './ProgressApp'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProgressApp />
    </ThemeProvider>
  </React.StrictMode>,
)
