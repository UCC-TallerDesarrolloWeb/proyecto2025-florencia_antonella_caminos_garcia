import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext.jsx'

const initialTasks = [
    { id: 1, title: 'Diseñar mockups', status: 'To Do' },
    { id: 2, title: 'Configurar entorno Vite', status: 'In Progress' },
    { id: 3, title: 'Revisar AuthContext', status: 'Done' }
]

const TaskManager = () => {
    const { theme, toggleTheme } = useTheme()
    const [tasks, setTasks] = useState(initialTasks)
    const [view, setView] = useState('kanban')
    const [newTask, setNewTask] = useState('')

    const addTask = () => {
        if (!newTask.trim()) return
        setTasks([...tasks, { id: Date.now(), title: newTask, status: 'To Do' }])
        setNewTask('')
    }

    const changeStatus = (id, newStatus) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task))
    }

    const deleteTask = id => {
        setTasks(tasks.filter(task => task.id !== id))
    }

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'To Do').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        done: tasks.filter(t => t.status === 'Done').length
    }

    useEffect(() => {
        document.title = `Tareas (${stats.total})`
    }, [stats.total])

    return (
        <div className={`task-manager ${theme}`}>
            <aside className="sidebar">
                <h2>Productividad</h2>
                <div className="new-task">
                    <input
                        type="text"
                        placeholder="Nueva tarea..."
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                    />
                    <button onClick={addTask}>Agregar</button>
                </div>
                <div className="stats">
                    <h3>Estadísticas</h3>
                    <p>Total: {stats.total}</p>
                    <p>To Do: {stats.todo}</p>
                    <p>En Progreso: {stats.inProgress}</p>
                    <p>Hechas: {stats.done}</p>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <h1>Task Manager Pro</h1>
                    <div className="actions">
                        <button onClick={() => setView('kanban')}>📋 Kanban</button>
                        <button onClick={() => setView('calendar')}>📅 Calendario</button>
                        <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
                    </div>
                </header>

                {view === 'kanban' ? (
                    <section className="kanban-view">
                        {['To Do', 'In Progress', 'Done'].map(col => (
                            <div key={col} className="kanban-column">
                                <div className="column-header">
                                    <h3>{col}</h3>
                                    <span>{tasks.filter(t => t.status === col).length}</span>
                                </div>
                                <div className="task-list">
                                    {tasks.filter(t => t.status === col).length === 0 ? (
                                        <p>No hay tareas</p>
                                    ) : (
                                        tasks
                                            .filter(t => t.status === col)
                                            .map(task => (
                                                <div key={task.id} className="task-card">
                                                    <span>{task.title}</span>
                                                    <div className="task-controls">
                                                        {col !== 'To Do' && (
                                                            <button onClick={() => changeStatus(task.id, 'To Do')}>↩</button>
                                                        )}
                                                        {col === 'To Do' && (
                                                            <button onClick={() => changeStatus(task.id, 'In Progress')}>➡</button>
                                                        )}
                                                        {col === 'In Progress' && (
                                                            <button onClick={() => changeStatus(task.id, 'Done')}>✅</button>
                                                        )}
                                                        <button onClick={() => deleteTask(task.id)}>🗑</button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>
                ) : (
                    <section className="calendar-view">
                        <h2>Vista Calendario</h2>
                        <p>Funcionalidad de calendario próximamente...</p>
                    </section>
                )}
            </main>
        </div>
    )
}

export default TaskManager
