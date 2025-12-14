import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
//import '@/src/App.css'

// Componentes lazy
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Layout principal
const MainLayout = ({ children }) => {
    const { themeName } = useTheme()

    return (
        <div className={`app-container theme-${themeName}`}>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <Footer
                brand="Task Manager Pro"
                links={[
                    { label: "Inicio", to: "/" },
                    { label: "Dashboard", to: "/dashboard" },
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
                {/* Rutas públicas con layout */}
                <Route path="/" element={
                    <MainLayout>
                        <Home />
                    </MainLayout>
                } />

                {/* Rutas de auth SIN layout (para formularios limpios) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas protegidas CON layout */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                {/* Ruta 404 */}
                <Route path="*" element={
                    <MainLayout>
                        <div className="not-found auth-container">
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