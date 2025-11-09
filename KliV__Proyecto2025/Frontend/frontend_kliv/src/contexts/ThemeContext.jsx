import { createContext, useState, useEffect } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark")

    useEffect(() => {
        document.body.className = darkMode ? "dark" : "light"
        localStorage.setItem("theme", darkMode ? "dark" : "light")
    }, [darkMode])

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}
