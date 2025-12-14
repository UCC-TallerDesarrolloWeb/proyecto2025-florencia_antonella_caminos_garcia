import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Hook para proteger rutas - redirige al login si no está autenticado
 * @param {string} redirectTo - Ruta de redirección (default: "/login")
 * @param {boolean} requireAdmin - Si requiere rol de administrador
 */
export const useRequireAuth = (redirectTo = "/login", requireAdmin = false) => {
    const { user, isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (loading) return // Esperar a que cargue la autenticación

        if (!isAuthenticated) {
            // Guardar la ubicación actual para redirigir después del login
            const from = location.pathname + location.search
            navigate(`${redirectTo}?redirect=${encodeURIComponent(from)}`, { 
                replace: true 
            })
            return
        }

        if (requireAdmin && user?.role !== "admin") {
            navigate("/unauthorized", { replace: true })
        }
    }, [isAuthenticated, loading, user, requireAdmin, navigate, location, redirectTo])

    return { user, isAuthenticated, loading }
}