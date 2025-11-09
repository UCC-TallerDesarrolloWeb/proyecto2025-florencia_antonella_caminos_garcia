import { createContext, useState, useEffect, useContext } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [token, setToken] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
        }
        setLoading(false)
    }, [])

    const login = async (credentials) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fakeAuthRequest(credentials)
            if (response.success) {
                setUser(response.user)
                setToken(response.token)
                localStorage.setItem("user", JSON.stringify(response.user))
                localStorage.setItem("token", response.token)
            } else {
                setError("Credenciales inválidas")
            }
        } catch {
            setError("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }

    const isAuthenticated = !!user && !!token

    const value = {
        user,
        token,
        error,
        loading,
        login,
        logout,
        isAuthenticated,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

const fakeAuthRequest = (credentials) =>
    new Promise((resolve) => {
        setTimeout(() => {
            if (credentials.email === "admin@kliv.com" && credentials.password === "1234") {
                resolve({
                    success: true,
                    user: { name: "Administrador", email: credentials.email, role: "admin" },
                    token: "fake-jwt-token-123",
                })
            } else {
                resolve({ success: false })
            }
        }, 800)
    })

export const useAuth = () => useContext(AuthContext)
