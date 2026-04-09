import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/authcontext.jsx'
import { TaskProvider } from './context/taskcontext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <TaskProvider>
                    <App />
                </TaskProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
