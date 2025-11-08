import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardEditor from './components/DashboardEditor/DashboardEditor'
import TaskManager from './components/TaskManager/TaskManager'
import KlivDashboard from './components/KlivDashboard/KlivDashboard'
import { useTheme } from './contexts/ThemeContext'
import './App.css'

function App() {
    const { theme } = useTheme()

    return (
        <div className={`app ${theme}`}>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<KlivDashboard />} />
                <Route path="/dashboard-editor" element={<DashboardEditor />} />
                <Route path="/task-manager" element={<TaskManager />} />
                <Route path="/projects" element={<div className="page-container">Proyectos - En construcción</div>} />
                <Route path="/gallery" element={<div className="page-container">Galería - En construcción</div>} />
                <Route path="/settings" element={<div className="page-container">Configuración - En construcción</div>} />
                <Route path="*" element={<div className="page-container">Página no encontrada</div>} />
            </Routes>
        </div>
    )
}

export default App