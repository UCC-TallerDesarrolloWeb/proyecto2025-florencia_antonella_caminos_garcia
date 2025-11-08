import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const KlivDashboard = () => {
    const [activeSection, setActiveSection] = useState('Dashboard')
    const [searchQuery, setSearchQuery] = useState('')
    const { user, logout } = useAuth()

    const pins = [
        { id: 1, image: 'https://picsum.photos/200/300', likes: 120, comments: 45 },
        { id: 2, image: 'https://picsum.photos/200/180', likes: 89, comments: 12 },
        { id: 3, image: 'https://picsum.photos/200/250', likes: 90, comments: 78 }
    ]

    return (
        <div className="theme-kliv" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gridTemplateRows: '80px 1fr auto'
        }}>
            {/* Header */}
            <header style={{
                gridColumn: '1 / -1',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff, #e9d5ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '28px',
                        fontWeight: '800'
                    }}>
                        KliV
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                        Dashboard Principal
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'white' }}>{user?.name}</span>
                        <button onClick={logout} style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.2)',
                padding: '24px 0'
            }}>
                <h2 style={{
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '24px',
                    padding: '0 16px'
                }}>
                    Inicio
                </h2>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Dashboard', 'Projects', 'Gallery', 'Tasks', 'Settings', 'Help'].map(section => (
                            <li key={section} style={{ margin: '0 16px 8px 16px' }}>
                                <button
                                    onClick={() => setActiveSection(section)}
                                    style={{
                                        width: '100%',
                                        background: activeSection === section ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderLeft: activeSection === section ? '4px solid #a855f7' : 'none'
                                    }}
                                >
                                    {section}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ padding: '24px' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                        ← Anterior
                    </button>
                    <nav>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>
              Inicio / {activeSection}
            </span>
                    </nav>
                    <button style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                        Siguiente →
                    </button>
                </div>

                <section style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '24px',
                    minHeight: '500px'
                }}>
                    <h2 style={{ color: '#7c3aed', marginBottom: '24px' }}>{activeSection}</h2>

                    {activeSection === 'Dashboard' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '24px'
                        }}>
                            {pins.map(pin => (
                                <div key={pin.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    <img
                                        src={pin.image}
                                        alt={`Pin ${pin.id}`}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <button style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '18px',
                                                cursor: 'pointer'
                                            }}>
                                                🤍
                                            </button>
                                            <span style={{ color: '#64748b', fontSize: '14px' }}>{pin.likes}</span>
                                            <button style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '18px',
                                                cursor: 'pointer'
                                            }}>
                                                💬
                                            </button>
                                            <span style={{ color: '#64748b', fontSize: '14px' }}>{pin.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection !== 'Dashboard' && (
                        <p>Contenido de {activeSection} - En desarrollo</p>
                    )}
                </section>
            </main>
        </div>
    )
}

export default KlivDashboard