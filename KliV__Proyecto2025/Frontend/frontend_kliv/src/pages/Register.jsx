import React, { useContext, useReducer, useState, useEffect, useMemo, useCallback, useRef } from React;
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useFormValidation } from "../hooks/useFormValidation.js";
import { useAuthRedirect } from "../hooks/useAuthRedirect.js";
import "../styles/Register.css";

const Register = () => {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);
    const { agregarUsuario, loading: authLoading, error: authError, setError } = useAuth();

    useAuthRedirect();

    const nombreRef = useRef(null);

    const [mensaje, setMensaje] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validationRules = useCallback((values) => {
        const errors = {};

        if (!values.nombre?.trim()) {
            errors.nombre = "El nombre es obligatorio";
        } else if (values.nombre.length < 2) {
            errors.nombre = "El nombre debe tener al menos 2 caracteres";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!values.email) {
            errors.email = "Email requerido";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "Email inválido";
        }

        if (!values.password) {
            errors.password = "Contraseña requerida";
        } else if (values.password.length < 6) {
            errors.password = "Mínimo 6 caracteres";
        }

        if (!values.confirmPassword) {
            errors.confirmPassword = "Confirma tu contraseña";
        } else if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Las contraseñas no coinciden";
        }

        return errors;
    }, []);

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        resetForm,
        validateForm,
        setFieldValue,
        isValid
    } = useFormValidation({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: ""
    }, validationRules);

    const isFormComplete = useMemo(() => {
        return values.nombre.trim() &&
            values.email.trim() &&
            values.password &&
            values.confirmPassword;
    }, [values]);

    const isLoading = authLoading || isSubmitting;

    // Enfocar input al cargar
    useEffect(() => {
        if (nombreRef.current) {
            nombreRef.current.focus();
        }
    }, []);

    // Limpiar mensajes automáticamente
    useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => setMensaje(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // Mostrar errores del contexto de autenticación
    useEffect(() => {
        if (authError) {
            setMensaje(authError);
        }
    }, [authError]);

    const handleRegister = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setMensaje("");
        setError(null);

        // Validar formulario con feedback visual
        const isFormValid = validateForm();
        if (!isFormValid) {
            // Encontrar el primer campo con error para dar foco
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

        // Preparar datos para envío
        const userData = {
            name: values.nombre.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
            registeredAt: new Date().toISOString(),
            role: "user"
        };

        setIsSubmitting(true);

        try {
            setError(null);

            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            const resultado = await agregarUsuario(userData);

            if (resultado?.success) {
                setMensaje("🎉 ¡Registro exitoso! Redirigiendo al login...");
                resetForm();

                // Feedback visual de éxito
                const formElement = e.target;
                formElement.classList.add('success-submit');

                setTimeout(() => {
                    formElement.classList.remove('success-submit');
                    window.location.href = "/login";
                }, 2000);

            } else {
                const errorMessage = resultado?.message || "❌ Error en el registro";

                // Clasificar errores para mejor UX
                if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("correo")) {
                    // Enfocar campo de email si hay error relacionado
                    const emailInput = document.getElementById('email');
                    if (emailInput) {
                        emailInput.focus();
                        setFieldValue('email', '');
                    }
                }

                setMensaje(errorMessage);

                // Scroll al mensaje de error
                setTimeout(() => {
                    const messageElement = document.querySelector('.global-message');
                    if (messageElement) {
                        messageElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 100);
            }

        } catch (error) {
            console.error("Error en registro:", error);
            setMensaje("😞 Ocurrió un error inesperado. Por favor, intenta nuevamente.");

        } finally {
            setIsSubmitting(false);
        }
    };

    const SubmitButton = () => {
        const buttonText = isLoading ? (
            <span className="button-content">
                <span className="spinner"></span>
                <span>Procesando...</span>
            </span>
        ) : !isValid ? (
            <span className="button-content">
                <span className="icon">⚠️</span>
                <span>Completa el formulario</span>
            </span>
        ) : (
            <span className="button-content">
                <span className="icon">🚀</span>
                <span>Crear cuenta</span>
            </span>
        );

        return (
            <motion.button
                type="submit"
                className={`submit-button ${!isValid ? 'button-disabled' : ''} ${isLoading ? 'button-loading' : ''}`}
                disabled={isLoading || !isValid || !isFormComplete}
                whileHover={(!isLoading && isValid && isFormComplete) ? {
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(66, 153, 225, 0.3)"
                } : {}}
                whileTap={(!isLoading && isValid && isFormComplete) ? {
                    scale: 0.98
                } : {}}
                initial={{ opacity: 0.8 }}
                animate={{
                    opacity: (isLoading || !isValid || !isFormComplete) ? 0.7 : 1,
                    backgroundColor: !isValid ? "#a0aec0" : "#4299e1"
                }}
            >
                {buttonText}
            </motion.button>
        );
    };

    const StatusMessage = () => {
        if (!mensaje) return null;

        const isSuccess = mensaje.includes("🎉") ||
            mensaje.includes("éxito") ||
            mensaje.includes("✅");

        const isError = mensaje.includes("❌") ||
            mensaje.includes("Error") ||
            mensaje.includes("error") ||
            mensaje.includes("😞");

        const isWarning = mensaje.includes("⚠️");

        const getMessageIcon = () => {
            if (isSuccess) return "✅";
            if (isError) return "❌";
            if (isWarning) return "⚠️";
            return "ℹ️";
        };

        const getMessageType = () => {
            if (isSuccess) return "success";
            if (isError) return "error";
            if (isWarning) return "warning";
            return "info";
        };

        return (
            <motion.div
                className={`global-message ${getMessageType()}`}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                role="alert"
                aria-live="polite"
            >
                <div className="message-content">
                    <span className="message-icon">{getMessageIcon()}</span>
                    <span className="message-text">
                        {mensaje.replace(/[🎉✅❌⚠️😞]/g, '').trim()}
                    </span>
                </div>

                {/* Botón para cerrar mensaje (opcional) */}
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

    const FormProgress = () => {
        const fields = ['nombre', 'email', 'password', 'confirmPassword'];
        const completedFields = fields.filter(field =>
            values[field] && values[field].trim().length > 0
        ).length;

        const progressPercentage = (completedFields / fields.length) * 100;

        return (
            <div className="form-progress" aria-label="Progreso del formulario">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="progress-text">
                    {completedFields} de {fields.length} campos completados
                </div>
            </div>
        );
    };

    const PasswordStrength = () => {
        if (!values.password || values.password.length === 0) return null;

        const getStrength = () => {
            const length = values.password.length;
            const hasUpper = /[A-Z]/.test(values.password);
            const hasLower = /[a-z]/.test(values.password);
            const hasNumber = /[0-9]/.test(values.password);
            const hasSpecial = /[^A-Za-z0-9]/.test(values.password);

            let score = 0;
            if (length >= 6) score++;
            if (length >= 8) score++;
            if (hasUpper && hasLower) score++;
            if (hasNumber) score++;
            if (hasSpecial) score++;

            return {
                score,
                level: score < 2 ? "Débil" : score < 4 ? "Moderada" : "Fuerte",
                color: score < 2 ? "#e53e3e" : score < 4 ? "#d69e2e" : "#38a169"
            };
        };

        const strength = getStrength();

        return (
            <div className="password-strength">
                <div className="strength-header">
                    <span>Seguridad de la contraseña:</span>
                    <span style={{ color: strength.color, fontWeight: 600 }}>
                        {strength.level}
                    </span>
                </div>
                <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <div
                            key={index}
                            className={`strength-bar ${index <= strength.score ? 'active' : ''}`}
                            style={{
                                backgroundColor: index <= strength.score ? strength.color : '#e2e8f0'
                            }}
                        />
                    ))}
                </div>
                <div className="strength-tips">
                    {strength.score < 3 && (
                        <small>💡 Sugerencia: Agrega mayúsculas, números o símbolos</small>
                    )}
                </div>
            </div>
        );
    };

    return (
        <motion.section
            className={`register-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                className="register-card"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="register-header">
                    <motion.h1
                        className="register-title"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Crear Cuenta
                    </motion.h1>
                    <motion.p
                        className="register-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Únete a <strong>Task Manager Pro</strong>
                    </motion.p>
                </div>

                <FormProgress />

                <form
                    className="register-form"
                    onSubmit={handleRegister}
                    noValidate
                    aria-label="Formulario de registro"
                >
                    {}
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre completo *</label>
                        <input
                            ref={nombreRef}
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={values.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Juan Pérez"
                            className={`form-input ${touched.nombre && errors.nombre ? 'input-error' : ''}`}
                            disabled={isLoading}
                            autoComplete="name"
                        />
                        {touched.nombre && errors.nombre && (
                            <span className="error-text">{errors.nombre}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="ejemplo@email.com"
                            className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
                            disabled={isLoading}
                            autoComplete="email"
                        />
                        {touched.email && errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Mínimo 6 caracteres"
                            className={`form-input ${touched.password && errors.password ? 'input-error' : ''}`}
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {touched.password && errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Repite tu contraseña"
                            className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <span className="error-text">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <PasswordStrength />

                    <StatusMessage />

                    <SubmitButton />

                    <div className="terms-notice">
                        <input
                            type="checkbox"
                            id="terms"
                            className="terms-checkbox"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="terms" className="terms-label">
                            Acepto los{' '}
                            <Link to="/terms" className="terms-link">
                                Términos de servicio
                            </Link>{' '}
                            y{' '}
                            <Link to="/privacy" className="terms-link">
                                Política de privacidad
                            </Link>
                        </label>
                    </div>
                </form>

                <div className="register-footer">
                    <div className="login-redirect">
                        <span>¿Ya tienes cuenta?</span>
                        <Link
                            to="/login"
                            className="login-link"
                            onClick={(e) => {
                                if (isLoading) e.preventDefault();
                            }}
                        >
                            Inicia sesión
                        </Link>
                    </div>
                    <Link
                        to="/"
                        className="back-home"
                        onClick={(e) => {
                            if (isLoading) e.preventDefault();
                        }}
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </motion.div>
        </motion.section>
    );

}

export default Register;
