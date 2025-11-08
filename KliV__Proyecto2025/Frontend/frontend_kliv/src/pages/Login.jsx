import React from 'react'
import Input from "@components/Input"
import '@styles/Login.css'

export default function Login() {
    /**
     * Login.jsx
     * ============================================================
     * Página de inicio de sesión para Task Manager Pro.
     * Integra el AuthContext, validación de campos,
     * manejo de estado visual (loading, error, éxito)
     * y navegación posterior al login.
     *
     * @version 2.1
     * @author
     * Florencia Antonella Caminos García
     */

    import React, { useContext, useState } from "react"
    import { useNavigate } from "react-router-dom"
    import { AuthContext } from "@contexts/AuthContext"
    import Input from "@components/Input"
    import Button from "@components/Button"
    import "@styles/Login.css"

    export default function Login() {
        const navigate = useNavigate()
        const { login } = useContext(AuthContext)

        const [email, setEmail] = useState("")
        const [password, setPassword] = useState("")
        const [message, setMessage] = useState("")
        const [loading, setLoading] = useState(false)

        /**
         * Maneja el envío del formulario.
         * Simula una llamada de autenticación, guarda usuario
         * en el contexto y redirige al dashboard.
         */
        const handleSubmit = async (e) => {
            e.preventDefault()

            // Validación de campos vacíos
            if (!email || !password) {
                setMessage("⚠️ Por favor completa todos los campos.")
                return
            }

            setLoading(true)
            setMessage("")

            // Simulación de autenticación (simulando backend)
            setTimeout(() => {
                const userData = { name: "Flor", email }
                const success = login(userData)

                setLoading(false)

                if (success || email === "flor@kliv.com") {
                    setMessage("✅ ¡Inicio de sesión exitoso!")
                    navigate("/dashboard")
                } else {
                    setMessage("❌ Credenciales incorrectas.")
                }
            }, 1000)
        }

        return (
            <div className="login-container min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-sm text-gray-800 dark:text-gray-100 transition-transform hover:scale-[1.01] duration-300">
                    {/* Título */}
                    <h1 className="text-3xl font-bold text-center mb-6 text-purple-700 dark:text-purple-400">
                        Iniciar sesión
                    </h1>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Correo electrónico"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />

                        <Input
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />

                        {/* Botones con componente Button */}
                        <div className="flex flex-col gap-3">
                            <Button
                                label={loading ? "Ingresando..." : "Entrar"}
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            />
                            <Button
                                label="Cancelar"
                                onClick={() => navigate("/")}
                                variant="secondary"
                            />
                        </div>
                    </form>

                    {/* Mensaje de estado */}
                    {message && (
                        <p
                            className={`text-center mt-5 text-sm font-medium ${
                                message.includes("exitoso")
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            {message}
                        </p>
                    )}

                    {/* Enlace al registro */}
                    <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                        ¿No tenés cuenta?{" "}
                        <a
                            href="#"
                            className="text-purple-600 hover:underline dark:text-purple-400"
                        >
                            Registrate
                        </a>
                    </p>
                </div>
            </div>
        )
    }
}
