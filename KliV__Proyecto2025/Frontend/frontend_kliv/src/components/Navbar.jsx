import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Sun, Moon, LogOut } from "lucide-react"

const Navbar = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout } = useAuth()
    const location = useLocation()

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
    }

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const navLinks = [
        { path: "/", label: "Inicio" },
        { path: "/activities", label: "Actividades" },
        { path: "/dashboard", label: "Dashboard" },
        { path: "/about", label: "Acerca de" }
    ]

    return (
        <nav className="w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="../assets/logo.png"
                        alt="Logo"
                        className="w-8 h-8 rounded-lg"
                    />
                    <span className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
            KliV
          </span>
                </Link>

                {/* MENÚ PRINCIPAL */}
                <div className="hidden md:flex gap-6">
                    {navLinks.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`text-sm font-medium transition-colors duration-200 ${
                                location.pathname === path
                                    ? "text-purple-600 dark:text-purple-300 border-b-2 border-purple-400"
                                    : "text-gray-700 dark:text-gray-300 hover:text-purple-500"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* ACCIONES (tema + usuario) */}
                <div className="flex items-center gap-4">
                    {/* Cambiar tema */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Cambiar tema"
                    >
                        {theme === "light" ? (
                            <Moon size={18} className="text-gray-800" />
                        ) : (
                            <Sun size={18} className="text-yellow-400" />
                        )}
                    </button>

                    {/* Usuario */}
                    {user ? (
                        <div className="flex items-center gap-3">
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {user.name}
              </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm transition"
                            >
                                <LogOut size={16} />
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm"
                        >
                            Iniciar sesión
                        </Link>
                    )}

                    {/* Menú móvil */}
                    <button
                        className="md:hidden flex flex-col gap-1.5"
                        onClick={toggleMenu}
                    >
                        <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200"></span>
                        <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200"></span>
                        <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200"></span>
                    </button>
                </div>
            </div>

            {/* MENÚ MÓVIL */}
            {isMenuOpen && (
                <div className="md:hidden flex flex-col items-center gap-4 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
                    {navLinks.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-base font-medium ${
                                location.pathname === path
                                    ? "text-purple-600 dark:text-purple-300"
                                    : "text-gray-700 dark:text-gray-300 hover:text-purple-500"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}

export default Navbar
