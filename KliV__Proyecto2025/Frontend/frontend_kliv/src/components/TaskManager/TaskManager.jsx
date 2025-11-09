import React, { useState } from 'react'
import { useTheme } from '@context/ThemeContext.jsx'

const TaskManager = () => {
    const [view, setView] = useState('kanban')
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="theme-task-manager">
            {/* Sidebar */}
            <aside>
                <h2>Productividad</h2>

                <div>
                    <button>
                        ➕ Nueva Tarea
                    </button>
                </div>

                <div>
                    <h3>Estadísticas</h3>
                    <div>
                        <span>Total: 0</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                <header>
                    <h1>Task Manager Pro</h1>
                    <div>
                        <button>
                            Tarea Rápida
                        </button>
                        <button onClick={toggleTheme}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </header>

                <div>
                    <div>
                        <button onClick={() => setView('kanban')}>
                            📋 Vista Kanban
                        </button>
                        <button onClick={() => setView('calendar')}>
                            📅 Vista Calendario
                        </button>
                    </div>

                    {view === 'kanban' && (
                        <div>
                            {['To Do', 'In Progress', 'Done'].map((columna) => (
                                <div key={columna}>
                                    <div>
                                        <h3>
                                            {columna} <span>0</span>
                                        </h3>
                                        <button>
                                            +
                                        </button>
                                    </div>
                                    <div>
                                        <p>No hay tareas</p>
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