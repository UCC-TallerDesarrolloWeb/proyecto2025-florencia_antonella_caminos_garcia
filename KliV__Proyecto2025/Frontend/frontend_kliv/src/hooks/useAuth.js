/**
 * useAuth.js
 * ============================================================
 * Hook personalizado para acceder fácilmente al contexto de autenticación.
 * Centraliza el acceso a los métodos `login`, `logout` y al usuario actual.
 *
 * @version 2.0
 * @author
 * Florencia Antonella Caminos García
 */

import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "@contexts/AuthContext"

/**
 * Hook personalizado que retorna las funciones y estados de autenticación.
 *
 * @returns {{
 *  user: object|null,
 *  login: (userData: object) => void,
 *  logout: () => void,
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
    const requireAuth = (redirectTo = "/login") => {
        if (!isAuthenticated) {
            navigate(redirectTo)
        }
    }

    // Sincroniza autenticación con localStorage (opcional)
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user))
        } else {
            localStorage.removeItem("user")
        }
    }, [user])

    return { user, login, logout, isAuthenticated, requireAuth }
}
