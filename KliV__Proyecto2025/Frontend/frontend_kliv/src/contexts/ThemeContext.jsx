import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const getInitialTheme = useCallback(() => {
        const storedTheme = localStorage.getItem("theme")
        if (storedTheme === "dark" || storedTheme === "light") return storedTheme === "dark"

        if (window.matchMedia("(prefers-color-scheme: dark)").matches) return true

        return false
    }, [])

    const [darkMode, setDarkMode] = useState(getInitialTheme)

    useEffect(() => {
        const themeClass = darkMode ? "dark" : "light"
        document.documentElement.setAttribute("data-theme", themeClass)
        document.body.className = themeClass
        localStorage.setItem("theme", themeClass)
    }, [darkMode])

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (event) => setDarkMode(event.matches)
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])

    const toggleTheme = useCallback(() => {
        setDarkMode((prev) => !prev)
    }, [])

    const value = useMemo(
        () => ({
            darkMode,
            toggleTheme,
            setDarkMode,
            themeName: darkMode ? "dark" : "light"
        }),
        [darkMode, toggleTheme]
    )

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
    return context
}
