import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@contexts/AuthContext"
import { Sun, Moon, LogOut, Menu, X } from "lucide-react"

export default function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navLinks = [
        { path: "/", label: "Inicio" },
        { path: "/activities", label: "Actividades" },
        { path: "/dashboard", label: "Dashboard" },
        { path: "/about", label: "Acerca de" },
    ]

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"))
    const toggleMenu = () => setIsMenuOpen(prev => !prev)

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img
                        src="./public/logo.png"
                        alt="KliV Logo"
                        className="w-9 h-9 rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 tracking-tight">
                        KliV
                    </span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-8">
                    {navLinks.map(({ path, label }) => (
                        <li key={path}>
                            <Link
                                to={path}
                                className={`relative text-sm font-medium tracking-wide pb-1
                transition-colors duration-200
                ${location.pathname === path
                                        ? "text-purple-600 dark:text-purple-300 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-purple-500"
                                        : "text-gray-700 dark:text-gray-300 hover:text-purple-500"
                                    }`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        title="Cambiar tema"
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        {theme === "light" ? (
                            <Moon size={18} className="text-gray-800" />
                        ) : (
                            <Sun size={18} className="text-yellow-400" />
                        )}
                    </button>

                    {/* Auth User Section */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                {user.name}
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-md text-sm shadow-sm transition-all duration-300"
                            >
                                <LogOut size={16} />
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-md text-sm shadow-sm"
                        >
                            Iniciar sesión
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden flex flex-col items-center gap-4 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 animate-fadeIn">
                    {navLinks.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-base font-medium transition-all duration-150 ${location.pathname === path
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

