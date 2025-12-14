import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import "@/styles/Login.scss";

const Login = () => {
    const { darkMode } = useContext(ThemeContext);
    const { login, loading: authLoading, error: authError, setError } = useAuth();

    // Redirige si ya está autenticado
    useAuthRedirect();

    // Estado local
    const [localLoading, setLocalLoading] = React.useState(false);
    const [mensaje, setMensaje] = React.useState("");

    // Validaciones
    const validationRules = React.useCallback((values) => {
        const errors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!values.email) {
            errors.email = "Email requerido";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "Email inválido";
        }

        if (!values.password) {
            errors.password = "Contraseña requerida";
        } else if (values.password.length < 1) {
            errors.password = "La contraseña es obligatoria";
        }

        return errors;
    }, []);

    // Hook de formulario
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateForm,
        isValid
    } = useFormValidation({
        email: "",
        password: ""
    }, validationRules);

    // Limpiar mensajes automáticamente
    React.useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => setMensaje(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // Sincronizar errores del contexto
    React.useEffect(() => {
        if (authError) {
            setMensaje(authError);
        }
    }, [authError]);

    // Manejo de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setMensaje("");
        setError(null);

        // Validar formulario
        const isFormValid = validateForm();
        if (!isFormValid) {
            const firstErrorField = Object.keys(errors).find(key => errors[key]);
            if (firstErrorField) {
                const errorElement = document.getElementById(firstErrorField);
                if (errorElement) {
                    errorElement.focus();
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            setMensaje("⚠️ Por favor, corrige los errores en el formulario");
            return;
        }

        setLocalLoading(true);

        try {
            const resultado = await login({
                email: values.email.trim().toLowerCase(),
                password: values.password
            });

            if (resultado?.success) {
                setMensaje("✅ ¡Inicio de sesión exitoso!");
                // La redirección se maneja automáticamente con useAuthRedirect
            } else {
                setMensaje(resultado?.message || "❌ Credenciales inválidas");

                // Limpiar campo de contraseña en caso de error
                handleChange({ target: { name: 'password', value: '' } });

                // Enfocar campo de email si hay error
                const emailInput = document.getElementById('email');
                if (emailInput) {
                    emailInput.focus();
                }
            }
        } catch (error) {
            console.error("Error en login:", error);
            setMensaje("😞 Error inesperado. Por favor, intenta nuevamente.");
        } finally {
            setLocalLoading(false);
        }
    };

    const isLoading = authLoading || localLoading;
    const isFormComplete = useMemo(() => {
        return values.email.trim() && values.password;
    }, [values.email, values.password]);

    // Componente de botón
    const SubmitButton = () => {
        const buttonText = isLoading ? (
            <span className="button-content">
                <span className="spinner"></span>
                <span>Iniciando sesión...</span>
            </span>
        ) : !isValid ? (
            <span className="button-content">
                <span className="icon">⚠️</span>
                <span>Completa el formulario</span>
            </span>
        ) : (
            <span className="button-content">
                <span className="icon">🔐</span>
                <span>Ingresar</span>
            </span>
        );

        return (
            <motion.button
                type="submit"
                className={`submit-button ${!isValid ? 'button-disabled' : ''} ${isLoading ? 'button-loading' : ''}`}
                disabled={isLoading || !isValid || !isFormComplete}
                whileHover={(!isLoading && isValid && isFormComplete) ? {
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)"
                } : {}}
                whileTap={(!isLoading && isValid && isFormComplete) ? {
                    scale: 0.98
                } : {}}
                initial={{ opacity: 0.8 }}
                animate={{
                    opacity: (isLoading || !isValid || !isFormComplete) ? 0.7 : 1,
                    backgroundColor: !isValid ? "#9ca3af" : "#3b82f6"
                }}
            >
                {buttonText}
            </motion.button>
        );
    };

    // Componente de mensaje
    const StatusMessage = () => {
        if (!mensaje) return null;

        const isSuccess = mensaje.includes("✅") || mensaje.includes("éxito");
        const isError = mensaje.includes("❌") || mensaje.includes("Error") || mensaje.includes("😞");
        const isWarning = mensaje.includes("⚠️");

        const getMessageType = () => {
            if (isSuccess) return "success";
            if (isError) return "error";
            if (isWarning) return "warning";
            return "info";
        };

        return (
            <motion.div
                className={`global-message ${getMessageType()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                aria-live="polite"
            >
                <div className="message-content">
                    <span className="message-text">
                        {mensaje.replace(/[✅❌⚠️😞]/g, '').trim()}
                    </span>
                </div>
                {!isLoading && (
                    <button
                        className="close-message"
                        onClick={() => setMensaje("")}
                        aria-label="Cerrar mensaje"
                    >
                        ×
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <motion.section
            className={`login-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="login-card"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="login-header">
                    <h1 className="login-title">Iniciar Sesión</h1>
                    <p className="login-subtitle">
                        Bienvenido a <strong>Task Manager Pro</strong>
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {/* Campo Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Correo electrónico *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="ejemplo@correo.com"
                            className={`form-input ${touched.email && errors.email ? "input-error" : ""}`}
                            disabled={isLoading}
                            autoComplete="username"
                            autoFocus
                        />
                        {touched.email && errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ingresa tu contraseña"
                            className={`form-input ${touched.password && errors.password ? "input-error" : ""}`}
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        {touched.password && errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    {/* Enlace para recuperar contraseña (opcional) */}
                    <div className="forgot-password">
                        <Link to="/forgot-password" className="forgot-link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Mensaje de estado */}
                    <StatusMessage />

                    {/* Botón de submit */}
                    <SubmitButton />

                    {/* Datos de prueba */}
                    <div className="test-credentials">
                        <details className="test-details">
                            <summary className="test-summary">Datos de prueba</summary>
                            <div className="test-content">
                                <div className="test-account">
                                    <strong>Admin:</strong>
                                    <div>Email: admin@kliv.com</div>
                                    <div>Contraseña: 1234</div>
                                </div>
                                <div className="test-account">
                                    <strong>Usuario:</strong>
                                    <div>Email: user@kliv.com</div>
                                    <div>Contraseña: abcd</div>
                                </div>
                            </div>
                        </details>
                    </div>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <div className="register-redirect">
                        <span>¿No tienes cuenta?</span>
                        <Link to="/register" className="register-link">
                            Crear cuenta
                        </Link>
                    </div>
                    <Link to="/" className="back-home">
                        ← Volver al inicio
                    </Link>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Login;