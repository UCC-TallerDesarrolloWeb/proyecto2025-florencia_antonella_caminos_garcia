import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser)
                if (parsedUser && typeof parsedUser === "object" && storedToken.length > 10) {
                    setUser(parsedUser)
                    setToken(storedToken)
                } else {
                    localStorage.clear()
                }
            } catch {
                localStorage.clear()
            }
        }

        setLoading(false)
    }, [])

    const persistAuth = useCallback((userData, tokenValue) => {
        setUser(userData)
        setToken(tokenValue)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", tokenValue)
    }, [])

    const login = useCallback(async (credentials) => {
        setLoading(true)
        setError(null)

        if (!credentials?.email || !credentials?.password) {
            setError("Debe ingresar un email y contraseña válidos.")
            setLoading(false)
            return
        }

        try {
            const response = await fakeAuthRequest(credentials)
            if (response.success) {
                persistAuth(response.user, response.token)
            } else {
                setError("Credenciales inválidas. Inténtelo nuevamente.")
            }
        } catch {
            setError("No se pudo conectar con el servidor de autenticación.")
        } finally {
            setLoading(false)
        }
    }, [persistAuth])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }, [])

    const isAuthenticated = useMemo(() => Boolean(user && token), [user, token])

    const value = useMemo(() => ({
        user,
        token,
        error,
        loading,
        login,
        logout,
        isAuthenticated
    }), [user, token, error, loading, login, logout, isAuthenticated])

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

const fakeAuthRequest = (credentials) =>
    new Promise((resolve) => {
        const { email, password } = credentials
        setTimeout(() => {
            if (email === "admin@kliv.com" && password === "1234") {
                resolve({
                    success: true,
                    user: { name: "Administrador", email, role: "admin" },
                    token: crypto.randomUUID()
                })
            } else if (email === "user@kliv.com" && password === "abcd") {
                resolve({
                    success: true,
                    user: { name: "Usuario", email, role: "user" },
                    token: crypto.randomUUID()
                })
            } else {
                resolve({ success: false })
            }
        }, 700)
    })

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider")
    return context
}
