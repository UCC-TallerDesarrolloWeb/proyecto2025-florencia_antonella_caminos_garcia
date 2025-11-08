import React, { createContext, useContext, useState, useEffect } from 'react'

// 1️⃣ Crear el contexto
export const ThemeContext = createContext()

// 2️⃣ Proveedor del tema
export const ThemeProvider = ({ children }) => {
    // Estado inicial basado en el localStorage (por defecto: 'light')
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light'
    })

    // 3️⃣ Efecto: aplica el tema al documento y lo guarda en localStorage
    useEffect(() => {
        localStorage.setItem('theme', theme)
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    // 4️⃣ Función para alternar el tema
    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    // 5️⃣ Proveer el contexto
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// 6️⃣ Hook personalizado para usar el contexto
export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
