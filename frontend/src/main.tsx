import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

// Image-protection deterrents: block context menu / drag on media. (Cannot stop screenshots - see README.)
document.addEventListener('contextmenu', (e) => { if ((e.target as HTMLElement).closest('.protected')) e.preventDefault() })
document.addEventListener('dragstart', (e) => { if ((e.target as HTMLElement).closest('.protected')) e.preventDefault() })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>,
)