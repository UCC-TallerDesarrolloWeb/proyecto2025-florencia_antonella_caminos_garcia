// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Contexto de autenticación global para la aplicación.
 * Permite gestionar el estado del usuario (login, logout)
 * y persistirlo en localStorage.
 */
const AuthContext = createContext(null)

/**
 * Hook personalizado que facilita el acceso al contexto de autenticación.
 * Ejemplo: const {user, login, logout, isAuthenticated} = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
    }
    return context
}

/**
 * Proveedor de autenticación global.
 * Envuelve la aplicación para compartir el estado del usuario.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Carga el usuario guardado al iniciar la app
    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    /**
     * Inicia sesión si las credenciales son válidas
     * @param {string} email
     * @param {string} password
     * @returns {boolean} éxito o error
     */
    const login = (email, password) => {
        // ⚠️ Ejemplo simple de validación (puedes reemplazarlo con backend o JSON)
        if (email === 'flor@kliv.com' && password === '12345') {
            const userData = {
                id: 1,
                name: 'Flor',
                email,
                avatar: '/imagenes/avatar.jpg'
            }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return true
        }
        return false
    }

    /**
     * Cierra la sesión y limpia el almacenamiento
     */
    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
