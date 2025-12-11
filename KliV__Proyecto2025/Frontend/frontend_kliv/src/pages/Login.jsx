import React, { useState, useContext, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ThemeContext } from "../contexts/ThemeContext.jsx"
import useAuth from "../hooks/useAuth.js"
import "../styles/Login.css"

export default function Login() {
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)
    const { login, isAuthenticated, error } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState("")

    // Si el usuario ya está autenticado, redirigir automáticamente
    useEffect(() => {
        if (isAuthenticated) navigate("/dashboard")
    }, [isAuthenticated, navigate])

    // Validar campos vacíos antes de intentar loguear
    const validateForm = () => {
        if (!email.trim() || !password.trim()) {
            setFormError("Por favor completa todos los campos.")
            return false
        }
        return true
    }

    // Maneja el inicio de sesión
    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError("")
        if (!validateForm()) return

        setLoading(true)
        try {
            await login({ email, password })
        } catch (err) {
            setFormError("Error al iniciar sesión. Intenta nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    // noinspection JSXUnresolvedComponent
    return (
        <motion.section
            className={`login-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
        >
            <motion.div
                className="login-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="login-title">Iniciar Sesión</h1>
                <p className="login-subtitle">
                    Bienvenido a <strong>Task Manager Pro</strong>
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@kliv.com"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {(formError || error) && (
                        <motion.p
                            className="error-message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {formError || error}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Iniciando sesión..." : "Ingresar"}
                    </motion.button>
                </form>

                <div className="login-footer">
                    <p>
                        ¿No tenés cuenta?{" "}
                        <Link to="/register" className="register-link">
                            Crear cuenta
                        </Link>
                    </p>
                    <Link to="/home" className="back-home">
                        ← Volver al inicio
                    </Link>
                </div>
            </motion.div>
        </motion.section>
    )
}
