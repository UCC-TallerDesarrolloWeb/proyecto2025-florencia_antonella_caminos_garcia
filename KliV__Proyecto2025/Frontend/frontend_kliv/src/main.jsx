import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@contexts/ThemeContext"
import { AuthProvider } from "@contexts/AuthContext"
import App from "./App.jsx"

// Contenedor raíz seguro
const rootElement = document.getElementById("root")

if (!rootElement) {
    throw new Error("No se encontró el elemento raíz (#root). Verifica tu index.html.")
}

const root = createRoot(rootElement)

/**
 * Renderiza la aplicación con todos los proveedores de contexto
 * y configuración necesaria para Task Manager Pro.
 */
root.render(
    <StrictMode>
        <BrowserRouter basename="/">
            <ThemeProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
)
