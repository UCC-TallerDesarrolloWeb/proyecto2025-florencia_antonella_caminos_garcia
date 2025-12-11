import React, { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Home, Sun, Moon } from "lucide-react"
import useAuth from "@hooks/useAuth"
import { ThemeContext } from "@contexts/ThemeContext"
import "@styles/Dashboard.css"

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, logout, isAuthenticated } = useAuth()
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    const [fecha, setFecha] = useState(new Date())
    const [saludo, setSaludo] = useState("")

    // Si no está autenticado, redirige al login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate])

    // Saludo dinámico + hora en tiempo real
    useEffect(() => {
        const definirSaludo = () => {
            const hora = new Date().getHours()
            if (hora < 12) return "¡Buenos días!"
            if (hora < 19) return "¡Buenas tardes!"
            return "¡Buenas noches!"
        }
        setSaludo(definirSaludo())
        const interval = setInterval(() => setFecha(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    const toggleTheme = () => setDarkMode((prev) => !prev)

    // noinspection JSXUnresolvedComponent
    return (
        <motion.section
            className={`dashboard-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <motion.div
                className="dashboard-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 120 }}
            >
                <header className="dashboard-header">
                    <h1 className="titulo">
                        {saludo}{" "}
                        <motion.span
                            className="user"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {user?.name || "Usuario"}
                        </motion.span>{" "}
                        👋
                    </h1>

                    <motion.p
                        className="fecha"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {fecha.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                        , {fecha.toLocaleTimeString("es-ES")}
                    </motion.p>
                </header>

                <motion.p
                    className="texto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    Desde este panel podés administrar tus{" "}
                    <strong>tareas</strong>, proyectos y ajustar tus{" "}
                    <strong>preferencias del sistema</strong>. Todo está
                    sincronizado con tu sesión.
                </motion.p>

                <motion.div
                    className="dashboard-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <button
                        onClick={() => navigate("/home")}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Home size={18} />
                        Ir al inicio
                    </button>

                    <button
                        onClick={logout}
                        className="btn btn-danger flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>

                    <button
                        onClick={toggleTheme}
                        className={`btn btn-theme flex items-center gap-2 ${
                            darkMode ? "btn-light" : "btn-dark"
                        }`}
                    >
                        {darkMode ? (
                            <>
                                <Sun size={18} /> Modo Claro
                            </>
                        ) : (
                            <>
                                <Moon size={18} /> Modo Oscuro
                            </>
                        )}
                    </button>
                </motion.div>
            </motion.div>

            <motion.footer
                className="dashboard-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
            >
                <small>
                    © {new Date().getFullYear()} Kliv Manager — Panel del usuario
                </small>
            </motion.footer>
        </motion.section>
    )
}
