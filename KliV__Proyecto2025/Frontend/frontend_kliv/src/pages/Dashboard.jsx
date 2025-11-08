// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import '@styles/Dashboard.css'

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [fecha, setFecha] = useState(new Date())

    // Efecto para obtener datos del usuario y actualizar la hora
    useEffect(() => {
        const storedUser = localStorage.getItem('usuario')
        if (storedUser) setUser(storedUser)

        const interval = setInterval(() => setFecha(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    // Si no hay usuario, redirigir al login
    if (!localStorage.getItem('usuario')) {
        return <Navigate to="/login" replace />
    }

    const handleLogout = () => {
        localStorage.removeItem('usuario')
        navigate('/login')
    }

    return (
        <section className="dashboard-container">
            <div className="dashboard-card">
                <h1>Bienvenido, {user} 👋</h1>
                <p>
                    Hoy es{' '}
                    <span className="fecha">
            {fecha.toLocaleDateString()} - {fecha.toLocaleTimeString()}
          </span>
                </p>

                <p className="texto">
                    Desde aquí podés administrar tus tareas, proyectos y preferencias del
                    sistema.
                </p>

                <div className="dashboard-actions">
                    <button onClick={() => navigate('/home')} className="btn btn-alt">
                        Volver al inicio
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </section>
    )
}
