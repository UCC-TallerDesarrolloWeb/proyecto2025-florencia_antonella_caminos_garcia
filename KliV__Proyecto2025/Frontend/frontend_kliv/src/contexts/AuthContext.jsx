import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"
import {useNavigate} from "react-router-dom"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
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
                return {success: true}
            } else {
                setError("Credenciales inválidas. Intentelo nuevamente.")
                return {success: false, message: "Credenciales Invalidas"}
            }
        } catch {

            setError("No se pudo conectar con el servidor de autenticacion.")
            return {success: false, message: "Error de conexion"}

        } finally {
            setLoading(false)
        }
    }, [persistAuth])

    const agregarUsuario = useCallback(async (userData) =>
    {
        setLoading(true)
        setError(null)

        if(!userData?.email || !userData?.password || !userData?.name)
        {
            setError("Debe completar todos los campos obligatorios.")
            setLoading(false)
            return {success: false, message: "Campos Incompletos"}
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(userData.email)) {
            setError("Por favor, ingrese un email válido.")
            setLoading(false)
            return { success: false, message: "Email invalido" }
        }

        if (userData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.")
                setLoading(false)
                return { success: false, message: "Contraseña muy corta" }
        }

        try {
            const response = await fakeRegisterRequest(userData)
            
            if (response.success) {
                setError(null)
                return { success: true, message: "Usuario registrado exitosamente" }
            } else {
                setError(response.message || "No se pudo registrar el usuario.")
                return { success: false, message: response.message }
            }
        } catch (error) {
            setError("Error de conexión al registrar usuario.")
            return { success: false, message: "Error de conexión" }
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }, [])

    const isAuthenticated = useMemo(() => Boolean(user && token), [user, token])

    const requireAuth = useCallback(async (redirectTo = "/login") => {
        if (!isAuthenticated) {
            console.warn("[useAuth] Usuario no autenticado. Redirigiendo a:", redirectTo)
            await new Promise((resolve) => setTimeout(resolve, 200))
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, navigate])

    const value = useMemo(() => ({
        user,
        token,
        error,
        loading,
        login,
        logout,
        agregarUsuario,
        isAuthenticated,
        requireAuth,
        setError
    }), [user, token, error, loading, login, logout, isAuthenticated, requireAuth])

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

const fakeRegisterRequest = (userData) =>
    new Promise((resolve) => {
        const { email, name, password, role = "user" } = userData
        
        setTimeout(() => {
            const existingEmails = ["admin@kliv.com", "user@kliv.com"]
            
            if (existingEmails.includes(email)) {
                resolve({
                    success: false,
                    message: "El email ya está registrado"
                })
                return
            }
            
            resolve({
                success: true,
                user: { 
                    name, 
                    email, 
                    role,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString()
                },
                token: crypto.randomUUID(),
                message: "Usuario registrado exitosamente"
            })
        }, 1000)
    })

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider")
    
    const { user, login, logout, ...rest } = context
    
    const handleLogin = useCallback(async (credentials) => {
        try {
            if (!credentials?.email || !credentials?.password) {
                throw new Error("Las credenciales no son válidas.")
            }
            const result = await login(credentials)
            if (result?.success) {
                console.info("[useAuth] Login exitoso:", credentials.email)
                return result
            } else {
                throw new Error(result?.message || "Error en login")
            }
        } catch (err) {
            console.error("[useAuth] Error en login:", err.message)
            throw err
        }
    }, [login])

    const handleLogout = useCallback(async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 250))
            logout()
            console.info("[useAuth] Sesión cerrada correctamente.")
        } catch (err) {
            console.error("[useAuth] Error durante logout:", err.message)
        }
    }, [logout])

    return {
        ...rest,
        user,
        login: handleLogin, 
        logout: handleLogout, 
        isAuthenticated: rest.isAuthenticated
    }
}
