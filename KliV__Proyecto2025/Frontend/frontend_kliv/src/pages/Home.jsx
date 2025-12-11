// noinspection JSXUnresolvedComponent

import React, { useEffect, useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ThemeContext } from "@contexts/ThemeContext"
import useAuth from "@hooks/useAuth"
import { fetchAllUsers } from "@api/users"
import "@styles/Home.css"

export default function Home() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    // Sincroniza clase del body con el tema actual
    useEffect(() => {
        document.body.className = darkMode ? "dark" : "light"
    }, [darkMode])

    // Alterna entre modo oscuro y claro
    const toggleTheme = () => setDarkMode((prev) => !prev)

    // Maneja redirección a Dashboard si ya está logueado
    useEffect(() => {
        if (isAuthenticated) {
            const timer = setTimeout(() => {
                navigate("/dashboard")
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isAuthenticated, navigate])

    // Llamada a API mock para obtener usuarios
    useEffect(() => {
        fetchAllUsers()
            .then((data) => setUsers(data))
            .finally(() => setLoading(false))
    }, [])

    return (
        <motion.section
            className={`home-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div
                className="home-content"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="home-title">
                    Bienvenido{" "}
                    {isAuthenticated && user
                        ? `${user.name} 👋`
                        : "a Task Manager Pro"}
                </h1>

                <p className="home-subtitle">
                    Organiza tus proyectos, gestiona tus tareas y mejora tu
                    productividad con estilo y simplicidad.
                </p>

                {/* Lista de usuarios mock */}
                {loading ? (
                    <p>Cargando usuarios...</p>
                ) : (
                    <ul>
                        {users.map((u) => (
                            <li key={u.id}>
                                {u.name} - {u.email}
                            </li>
                        ))}
                    </ul>
                )}

                <motion.div
                    className="home-actions"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                >
                    {!isAuthenticated ? (
                        <Link to="/login" className="btn btn-primary">
                            Iniciar sesión
                        </Link>
                    ) : (
                        <>
                            <Link to="/dashboard" className="btn btn-alt">
                                Ir al panel
                            </Link>
                            <button onClick={logout} className="btn btn-danger">
                                Cerrar sesión
                            </button>
                        </>
                    )}
                </motion.div>

                <motion.button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Cambiar a {darkMode ? "modo claro ☀️" : "modo oscuro 🌙"}
                </motion.button>
            </motion.div>
        </motion.section>
    )
}
