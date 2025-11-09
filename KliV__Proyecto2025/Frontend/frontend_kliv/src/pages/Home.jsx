// src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '@styles/Home.css'

function Home() {
    // Estado para el tema
    const [darkMode, setDarkMode] = useState(false)
    // Estado para el nombre del usuario
    const [username, setUsername] = useState('')

    // Al montar el componente, leemos el tema y el usuario guardados
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        const savedUser = localStorage.getItem('usuario')

        if (savedTheme === 'dark') {
            setDarkMode(true)
            document.body.classList.add('dark')
        }

        if (savedUser) setUsername(savedUser)
    }, [])

    // Alternar tema y guardar en localStorage
    const toggleTheme = () => {
        const newTheme = darkMode ? 'light' : 'dark'
        setDarkMode(!darkMode)
        localStorage.setItem('theme', newTheme)
        document.body.classList.toggle('dark')
    }

    return (
        <section className={`home-container ${darkMode ? 'dark' : ''}`}>
            <h1>Bienvenido {username ? username : 'a Task Manager Pro'}</h1>

            <p>
                Organiza tus proyectos, gestiona tus tareas y mejora tu productividad.
            </p>

            <div className="home-actions">
                {!username && (
                    <Link to="/login" className="btn">
                        Iniciar sesión
                    </Link>
                )}
                {username && (
                    <Link to="/dashboard" className="btn btn-alt">
                        Ir al panel
                    </Link>
                )}
            </div>

            <button onClick={toggleTheme} className="theme-toggle">
                Cambiar a {darkMode ? 'modo claro ☀️' : 'modo oscuro 🌙'}
            </button>
        </section>
    )
}

export default Home
