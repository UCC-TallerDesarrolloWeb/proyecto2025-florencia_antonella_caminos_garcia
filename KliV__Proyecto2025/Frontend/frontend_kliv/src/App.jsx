// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import { useTheme } from './contexts/ThemeContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import './App.css'

// Componentes que SÍ existen (basado en los archivos que compartiste)
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TaskManager = lazy(() => import('./components/TaskManager'))

// Componentes que NO existen aún - COMENTADOS temporalmente
// const KlivDashboard = lazy(() => import('./pages/KlivDashboard'))
// const Activities = lazy(() => import('./pages/Activities'))

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()

    return isAuthenticated ? children : <Navigate to="/login" />
}

// Layout principal con Navbar y Footer
const MainLayout = ({ children }) => {
    const { themeName } = useTheme()

    return (
        <div className={`app-container theme-${themeName}`}>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <Footer
                brand="KliV Manager"
                links={[
                    { label: "Inicio", to: "/" },
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Tareas", to: "/tasks" },
                    { label: "Login", to: "/login" },
                    { label: "Registro", to: "/register" }
                ]}
            />
        </div>
    )
}

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={
                    <MainLayout>
                        <Home />
                    </MainLayout>
                } />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas protegidas */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/tasks" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <TaskManager />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/*
        Rutas comentadas porque los archivos no existen aún:

        <Route path="/kliv-dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <KlivDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/activities" element={
          <MainLayout>
            <Activities />
          </MainLayout>
        } />
        */}

                {/* Ruta 404 */}
                <Route path="*" element={
                    <MainLayout>
                        <div className="not-found auth-container flex flex-col items-center justify-center">
                            <div className="auth-card">
                                <h1 className="auth-card-title text-danger">404 - Página no encontrada</h1>
                                <p className="text-center my-4">La página que buscas no existe.</p>
                                <a href="/" className="btn btn-primary btn-full">
                                    Volver al inicio
                                </a>
                            </div>
                        </div>
                    </MainLayout>
                } />
            </Routes>
        </Suspense>
    )
}

export default App