import React, { useState } from 'react'
import { useTheme } from '@context/ThemeContext.jsx'

const TaskManager = () => {
    const [view, setView] = useState('kanban')
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="theme-task-manager" style={{
            minHeight: '100vh',
            background: '#f0fdf4',
            display: 'grid',
            gridTemplateColumns: '280px 1fr'
        }}>
            {/* Sidebar */}
            <aside style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '24px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Productividad</h2>

                <div style={{ marginBottom: '24px' }}>
                    <button style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)'
                    }}>
                        ➕ Nueva Tarea
                    </button>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Estadísticas</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <span>Total: 0</span>
                        <div style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px', marginTop: '4px' }}>
                            <div style={{ background: 'white', height: '100%', width: '50%', borderRadius: '3px' }}></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                <header style={{
                    background: 'white',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ color: '#15803d', margin: 0 }}>Task Manager Pro</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            Tarea Rápida
                        </button>
                        <button onClick={toggleTheme} style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </header>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        <button
                            onClick={() => setView('kanban')}
                            style={{
                                background: view === 'kanban' ? '#22c55e' : 'white',
                                color: view === 'kanban' ? 'white' : '#22c55e',
                                border: '1px solid #22c55e',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            📋 Vista Kanban
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            style={{
                                background: view === 'calendar' ? '#22c55e' : 'white',
                                color: view === 'calendar' ? 'white' : '#22c55e',
                                border: '1px solid #22c55e',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            📅 Vista Calendario
                        </button>
                    </div>

                    {view === 'kanban' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '24px'
                        }}>
                            {['To Do', 'In Progress', 'Done'].map((columna) => (
                                <div key={columna} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        color: 'white',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {columna} <span style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px'
                                        }}>0</span>
                                        </h3>
                                        <button style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            border: 'none',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            cursor: 'pointer'
                                        }}>
                                            +
                                        </button>
                                    </div>
                                    <div style={{ padding: '16px', minHeight: '400px', background: '#f8fafc' }}>
                                        <p style={{ textAlign: 'center', color: '#64748b' }}>No hay tareas</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default TaskManager