import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchAllUsers } from "../api/users";
import "../styles/Home.css";

const Home = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    
    useRequireAuth("/dashboard", false);
    
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showUsers, setShowUsers] = React.useState(false);
    
    const [homeSettings, setHomeSettings] = useLocalStorage("home_settings", {
        showFeatures: true,
        lastVisit: new Date().toISOString()
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAllUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        document.body.className = darkMode ? "dark" : "light";
        return () => {
            document.body.className = "";
        };
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "¡Buenos días!";
        if (hour < 19) return "¡Buenas tardes!";
        return "¡Buenas noches!";
    };

    const formatLastVisit = () => {
        if (!homeSettings.lastVisit) return "Primera vez";
        const lastVisit = new Date(homeSettings.lastVisit);
        return lastVisit.toLocaleDateString();
    };

    const handleToggleFeature = () => {
        setHomeSettings(prev => ({
            ...prev,
            showFeatures: !prev.showFeatures
        }));
    };

    return (
        <motion.section
            className={`home-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="home-content"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="home-header">
                    <h1 className="home-title">
                        {getGreeting()}
                        {isAuthenticated && user ? `, ${user.name}` : ""} 👋
                    </h1>
                    <p className="home-subtitle">
                        Bienvenido a Task Manager Pro
                    </p>
                </div>

                {isAuthenticated && user && (
                    <div className="user-info">
                        <div className="info-card">
                            <div className="info-icon">👤</div>
                            <div className="info-content">
                                <h3>Tu cuenta</h3>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Rol:</strong> {user.role}</p>
                                <p><strong>Última visita:</strong> {formatLastVisit()}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="users-section">
                    <div className="section-header">
                        <h2>Usuarios del sistema ({users.length})</h2>
                        <button
                            className="toggle-btn"
                            onClick={() => setShowUsers(!showUsers)}
                            disabled={loading}
                        >
                            {showUsers ? "Ocultar usuarios" : "Mostrar usuarios"}
                        </button>
                    </div>
                    
                    {showUsers && (
                        <div className="users-list">
                            {loading ? (
                                <div className="loading">
                                    <div className="spinner"></div>
                                    <p>Cargando usuarios...</p>
                                </div>
                            ) : (
                                <div className="users-grid">
                                    {users.map((u) => (
                                        <div key={u.id} className="user-card">
                                            <div className="user-avatar">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="user-details">
                                                <h4>{u.name}</h4>
                                                <p>{u.email}</p>
                                                <span className={`user-role ${u.role}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {homeSettings.showFeatures && (
                    <div className="features-section">
                        <div className="section-header">
                            <h2>Características principales</h2>
                            <button
                                className="toggle-btn"
                                onClick={handleToggleFeature}
                            >
                                Ocultar
                            </button>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">✅</div>
                                <h4>Gestión de tareas</h4>
                                <p>Organiza y prioriza tus actividades</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">👥</div>
                                <h4>Colaboración</h4>
                                <p>Trabaja en equipo eficientemente</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h4>Reportes</h4>
                                <p>Visualiza tu progreso</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="home-actions">
                    {!isAuthenticated ? (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-primary">
                                Iniciar sesión
                            </Link>
                            <Link to="/register" className="btn btn-secondary">
                                Crear cuenta
                            </Link>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/dashboard" className="btn btn-primary">
                                Ir al dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-danger">
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>

                <div className="theme-section">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                    >
                        {darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro"}
                    </button>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Home;