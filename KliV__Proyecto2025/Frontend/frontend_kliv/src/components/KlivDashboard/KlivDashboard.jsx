// src/components/KlivDashboard/KlivDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '@styles/KlivDashboard.css'

/**
 * KlivDashboard - Panel principal del usuario
 * Permite navegar entre secciones, visualizar contenido dinámico y cerrar sesión.
 */
const KlivDashboard = () => {
    const navigate = useNavigate()
    const { user, logout, isAuthenticated } = useAuth()
    const [activeSection, setActiveSection] = useState('Dashboard')
    const [searchQuery, setSearchQuery] = useState('')
    const [pins, setPins] = useState([])

    // Cargar pines dinámicos (simula fetch desde JSON local)
    useEffect(() => {
        const storedPins = [
            { id: 1, image: 'https://picsum.photos/200/300', likes: 120, comments: 45 },
            { id: 2, image: 'https://picsum.photos/200/180', likes: 89, comments: 12 },
            { id: 3, image: 'https://picsum.photos/200/250', likes: 90, comments: 78 }
        ]
        setPins(storedPins)
    }, [])

    // Si el usuario no está autenticado, redirige al login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const filteredPins = pins.filter(pin =>
        pin.id.toString().includes(searchQuery.trim()) // simple ejemplo de búsqueda
    )

    return (
        <div className="kliv-dashboard">
            {/* Header */}
            <header className="kliv-header">
                <div>
                    <h1 className="kliv-title">KliV</h1>
                    <p className="kliv-subtitle">Dashboard Principal</p>
                </div>

                <div className="kliv-header-actions">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="kliv-search"
                    />
                    <div className="kliv-user-info">
                        <span className="kliv-username">{user?.name}</span>
                        <button onClick={handleLogout} className="kliv-logout">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="kliv-sidebar">
                <h2>Inicio</h2>
                <nav>
                    <ul>
                        {['Dashboard', 'Projects', 'Gallery', 'Tasks', 'Settings', 'Help'].map(section => (
                            <li key={section}>
                                <button
                                    onClick={() => setActiveSection(section)}
                                    className={`kliv-sidebar-btn ${activeSection === section ? 'active' : ''}`}
                                >
                                    {section}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="kliv-main">
                <div className="kliv-toolbar">
                    <button className="kliv-nav-btn">← Anterior</button>
                    <span className="kliv-breadcrumb">Inicio / {activeSection}</span>
                    <button className="kliv-nav-btn">Siguiente →</button>
                </div>

                <section className="kliv-content">
                    <h2>{activeSection}</h2>

                    {activeSection === 'Dashboard' && (
                        <div className="kliv-pins-grid">
                            {filteredPins.map(pin => (
                                <div key={pin.id} className="kliv-pin-card">
                                    <img src={pin.image} alt={`Pin ${pin.id}`} />
                                    <div className="kliv-pin-info">
                                        <button className="kliv-icon-btn">🤍</button>
                                        <span>{pin.likes}</span>
                                        <button className="kliv-icon-btn">💬</button>
                                        <span>{pin.comments}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection !== 'Dashboard' && (
                        <p className="kliv-placeholder">
                            Contenido de {activeSection} — En desarrollo 🚧
                        </p>
                    )}
                </section>
            </main>
        </div>
    )
}

export default KlivDashboard
