/**
 * main.jsx
 * ============================================================
 * Punto de entrada principal de la aplicación Task Manager Pro.
 * Configura los contextos globales (Tema y Autenticación),
 * enrutamiento con React Router y modo estricto de React.
 *
 * @version 2.0
 * @author
 * Florencia Antonella Caminos García
 */

import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

// Contextos globales
import { ThemeProvider } from "@contexts/ThemeContext"
import { AuthProvider } from "@contexts/AuthContext"

// Componente raíz
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
