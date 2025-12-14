import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/contexts/ThemeContext.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx"
import App from "@/App.jsx"
//import "index.css"

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('No se encontró el elemento raíz (#root). Verifica tu index.html.')
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter basename="/">
            <ThemeProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
)
