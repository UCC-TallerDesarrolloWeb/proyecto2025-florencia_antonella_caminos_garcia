import { useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

/**
 * Hook para acciones de autenticación con manejo de errores y feedback
 */
export const useAuthActions = () => {
    const { login, logout, agregarUsuario } = useAuth()
    const navigate = useNavigate()

    const handleLogin = useCallback(async (credentials, onSuccess, onError) => {
        try {
            const result = await login(credentials)
            if (result?.success) {
                onSuccess?.()
                navigate("/dashboard")
            } else {
                onError?.(result?.message || "Error en login")
            }
        } catch (error) {
            onError?.(error.message || "Error de conexión")
        }
    }, [login, navigate])

    const handleRegister = useCallback(async (userData, onSuccess, onError) => {
        try {
            const result = await agregarUsuario(userData)
            if (result?.success) {
                onSuccess?.(result.message)
                setTimeout(() => navigate("/login"), 1500)
            } else {
                onError?.(result?.message || "Error en registro")
            }
        } catch (error) {
            onError?.(error.message || "Error de conexión")
        }
    }, [agregarUsuario, navigate])

    const handleLogout = useCallback(async (onSuccess) => {
        await logout()
        onSuccess?.()
        navigate("/login")
    }, [logout, navigate])

    return {
        handleLogin,
        handleRegister,
        handleLogout
    }
}