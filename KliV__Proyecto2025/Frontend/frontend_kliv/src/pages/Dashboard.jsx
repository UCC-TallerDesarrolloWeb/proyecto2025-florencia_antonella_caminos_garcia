import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ThemeContext } from "../contexts/ThemeContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    
    const { loading: authLoading } = useRequireAuth();
    
    const [stats, setStats] = useLocalStorage("dashboard_stats", {
        visits: 0,
        lastVisit: null,
        tasksCreated: 0
    });
    
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [greeting, setGreeting] = React.useState("");

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("¡Buenos días!");
            else if (hour < 19) setGreeting("¡Buenas tardes!");
            else setGreeting("¡Buenas noches!");
        };

        updateGreeting();
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            updateGreeting();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updatedStats = {
            ...stats,
            visits: stats.visits + 1,
            lastVisit: new Date().toISOString()
        };
        setStats(updatedStats);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    if (authLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <motion.section
            className={`dashboard-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="dashboard-card"
                initial={{ y: 20, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        {greeting}{" "}
                        <span className="user-name">
                            {user?.name || "Usuario"}
                        </span>
                        <span className="welcome-emoji"> 👋</span>
                    </h1>
                    
                    <div className="dashboard-time">
                        <div className="current-date">{formatDate(currentTime)}</div>
                        <div className="current-time">{formatTime(currentTime)}</div>
                    </div>
                </div>

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.visits}</div>
                            <div className="stat-label">Visitas al dashboard</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.tasksCreated}</div>
                            <div className="stat-label">Tareas creadas</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">👤</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {user?.role === "admin" ? "Administrador" : "Usuario"}
                            </div>
                            <div className="stat-label">Tu rol</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-actions">
                    <button
                        onClick={() => navigate("/home")}
                        className="action-btn primary"
                    >
                        <span className="btn-icon">🏠</span>
                        <span className="btn-text">Ir al inicio</span>
                    </button>
                    
                    <button
                        onClick={() => navigate("/tasks")}
                        className="action-btn secondary"
                    >
                        <span className="btn-icon">📋</span>
                        <span className="btn-text">Gestionar tareas</span>
                    </button>
                    
                    <button
                        onClick={() => navigate("/profile")}
                        className="action-btn secondary"
                    >
                        <span className="btn-icon">⚙️</span>
                        <span className="btn-text">Configuración</span>
                    </button>
                </div>

                <div className="theme-section">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                    >
                        <span className="theme-icon">
                            {darkMode ? "☀️" : "🌙"}
                        </span>
                        <span className="theme-text">
                            {darkMode ? "Modo claro" : "Modo oscuro"}
                        </span>
                    </button>
                </div>

                <div className="logout-section">
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        <span className="logout-icon">🚪</span>
                        <span className="logout-text">Cerrar sesión</span>
                    </button>
                </div>
            </motion.div>

            <div className="dashboard-footer">
                <p>
                    © {new Date().getFullYear()} Task Manager Pro — Panel de usuario
                </p>
            </div>
        </motion.section>
    );
};

export default Dashboard;