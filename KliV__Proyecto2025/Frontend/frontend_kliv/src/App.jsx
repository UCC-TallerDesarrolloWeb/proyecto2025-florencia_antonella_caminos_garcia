// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Home from '@pages/Home'
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import Navbar from '@components/Navbar'

// Componente principal de la aplicación
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Página principal redirige al login */}
                    <Route index element={<Navigate to="/login" />} />
                    {/* Rutas de la aplicación */}
                    <Route path="home" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

// Layout que renderiza Navbar + contenido dinámico
function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}
