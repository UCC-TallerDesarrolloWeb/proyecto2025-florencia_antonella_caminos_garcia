// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from '@pages/Home';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Navbar from '@components/Navbar';
import useAuth from '@hooks/useAuth';

// Layout que renderiza Navbar + contenido dinámico
function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}

// Ruta privada: solo accesible si está autenticado
function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Ruta pública: solo accesible si NO está autenticado
function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// Componente principal de la aplicación
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Layout general con Navbar */}
                <Route path="/" element={<Layout />}>
                    {/* Página raíz redirige a Home */}
                    <Route index element={<Navigate to="/home" replace />} />

                    {/* Rutas públicas */}
                    <Route
                        path="home"
                        element={
                            <PublicRoute>
                                <Home />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />

                    {/* Rutas privadas */}
                    <Route
                        path="dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Ruta 404: cualquier ruta no definida */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
