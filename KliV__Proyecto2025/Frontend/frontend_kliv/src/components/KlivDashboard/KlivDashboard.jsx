import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@context/AuthContext"
import { useNavigate } from "react-router-dom"
import { LogOut, Search, Heart, MessageSquare, Settings, HelpCircle, LayoutDashboard, FolderKanban, Image as ImageIcon, ListTodo } from "lucide-react"
import "@styles/KlivDashboard.css"

const KlivDashboard = () => {
    const navigate = useNavigate()
    const { user, logout, isAuthenticated } = useAuth()

    const [activeSection, setActiveSection] = useState("Dashboard")
    const [searchQuery, setSearchQuery] = useState("")
    const [pins, setPins] = useState([])
    const [isSidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) navigate("/login", { replace: true })
    }, [isAuthenticated, navigate])

    useEffect(() => {
        setPins([
            { id: 1, image: "https://picsum.photos/400/250", likes: 124, comments: 34, category: "Design" },
            { id: 2, image: "https://picsum.photos/400/280", likes: 87, comments: 18, category: "UI" },
            { id: 3, image: "https://picsum.photos/400/300", likes: 154, comments: 54, category: "Research" },
            { id: 4, image: "https://picsum.photos/400/260", likes: 45, comments: 9, category: "Ideas" }
        ])
    }, [])

    const filteredPins = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return pins.filter(pin =>
            pin.category.toLowerCase().includes(query) ||
            pin.id.toString().includes(query)
        )
    }, [pins, searchQuery])

    const handleLogout = useCallback(() => {
        logout()
        navigate("/login")
    }, [logout, navigate])

    const sections = useMemo(() => ([
        { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Projects", icon: <FolderKanban size={18} /> },
        { name: "Gallery", icon: <ImageIcon size={18} /> },
        { name: "Tasks", icon: <ListTodo size={18} /> },
        { name: "Settings", icon: <Settings size={18} /> },
        { name: "Help", icon: <HelpCircle size={18} /> }
    ]), [])

    return (
        <div className={`kliv-dashboard ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
            {/* HEADER */}
            <header className="kliv-header">
                <div className="kliv-header-left">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        title="Mostrar/Ocultar menú"
                    >
                        ☰
                    </button>
                    <h1 className="kliv-title">KliV</h1>
                    <span className="kliv-subtitle">Panel Principal</span>
                </div>

                <div className="kliv-header-right">
                    <div className="kliv-search-container">
                        <Search className="icon" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar proyectos, categorías..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="kliv-search-input"
                        />
                    </div>
                    <div className="kliv-user-controls">
                        <span className="kliv-username">{user?.name || "Usuario"}</span>
                        <button className="kliv-logout" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* SIDEBAR */}
            <aside className="kliv-sidebar">
                <nav className="kliv-nav">
                    <ul>
                        {sections.map(({ name, icon }) => (
                            <li key={name}>
                                <button
                                    className={`kliv-sidebar-btn ${activeSection === name ? "active" : ""}`}
                                    onClick={() => setActiveSection(name)}
                                >
                                    {icon}
                                    <span>{name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* MAIN */}
            <main className="kliv-main">
                <div className="kliv-toolbar">
                    <button className="kliv-nav-btn">←</button>
                    <span className="kliv-breadcrumb">Inicio / {activeSection}</span>
                    <button className="kliv-nav-btn">→</button>
                </div>

                <section className="kliv-content">
                    {activeSection === "Dashboard" ? (
                        <div className="kliv-pins-grid">
                            {filteredPins.length > 0 ? (
                                filteredPins.map(pin => (
                                    <article key={pin.id} className="kliv-pin-card">
                                        <img src={pin.image} alt={`Pin ${pin.id}`} className="kliv-pin-img" />
                                        <div className="kliv-pin-footer">
                                            <div className="pin-meta">
                                                <span className="pin-category">{pin.category}</span>
                                            </div>
                                            <div className="pin-actions">
                                                <button className="kliv-icon-btn"><Heart size={16} /></button>
                                                <span>{pin.likes}</span>
                                                <button className="kliv-icon-btn"><MessageSquare size={16} /></button>
                                                <span>{pin.comments}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <p className="empty-msg">No se encontraron resultados para "{searchQuery}"</p>
                            )}
                        </div>
                    ) : (
                        <div className="kliv-placeholder">
                            <h2>{activeSection}</h2>
                            <p>Contenido de esta sección — Próximamente 🚧</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default KlivDashboard
