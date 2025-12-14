import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

/**
 * Hook para redirigir automáticamente según estado de autenticación
 * Ej: Si está autenticado, redirigir al dashboard desde login
 */
export const useAuthRedirect = () => {
    const { isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get("redirect")

    useEffect(() => {
        if (loading) return

        if (isAuthenticated) {
            // Si viene de un redirect, ir allí; sino al dashboard
            const target = redirect || "/dashboard"
            navigate(target, { replace: true })
        }
    }, [isAuthenticated, loading, navigate, redirect])

    return { isAuthenticated, loading }
}