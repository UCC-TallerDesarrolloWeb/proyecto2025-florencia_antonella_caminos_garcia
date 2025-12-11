// noinspection ExceptionCaughtLocallyJS

import { useContext, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext.jsx"

/**
 * Hook personalizado que retorna las funciones y estados de autenticación.
 *
 * @returns {{
 *  user: object|null,
 *  login: (credentials: object) => Promise<void>,
 *  logout: () => Promise<void>,
 *  isAuthenticated: boolean,
 *  requireAuth: (redirectTo?: string) => void
 * }}
 */
export default function useAuth() {
    const { user, login, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const isAuthenticated = Boolean(user)

    /**
     * Redirige al login si el usuario no está autenticado.
     * Puede usarse en rutas protegidas o componentes sensibles.
     *
     * @param {string} redirectTo - Ruta personalizada de redirección (por defecto: "/login")
     */
    const requireAuth = useCallback(
        async (redirectTo = "/login") => {
            if (!isAuthenticated) {
                console.warn("[useAuth] Usuario no autenticado. Redirigiendo a:", redirectTo)
                await new Promise((resolve) => setTimeout(resolve, 200)) // delay suave para UX
                navigate(redirectTo, { replace: true })
            }
        },
        [isAuthenticated, navigate]
    )

    /**
     * Inicia sesión de forma asíncrona con control de errores.
     *
     * @param {object} credentials - { email, password }
     */
    const handleLogin = useCallback(
        async (credentials) => {
            try {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Las credenciales no son válidas.")
                }

                await login(credentials) // Espera al contexto Auth para procesar
                console.info("[useAuth] Login exitoso:", credentials.email)
            } catch (err) {
                console.error("[useAuth] Error en login:", err.message)
                throw err
            }
        },
        [login]
    )

    /**
     * Cierra sesión limpiamente.
     * Incluye pequeña pausa para UX visual (animaciones o loaders).
     */
    const handleLogout = useCallback(async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 250))
            await logout()
            console.info("[useAuth] Sesión cerrada correctamente.")
        } catch (err) {
            console.error("[useAuth] Error durante logout:", err.message)
        }
    }, [logout])

    /**
     * Mantiene sincronizado el usuario con localStorage.
     */
    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem("user", JSON.stringify(user))
            } else {
                localStorage.removeItem("user")
            }
        } catch (error) {
            console.warn("[useAuth] No se pudo sincronizar el usuario:", error)
        }
    }, [user])

    return {
        user,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated,
        requireAuth
    }
}
