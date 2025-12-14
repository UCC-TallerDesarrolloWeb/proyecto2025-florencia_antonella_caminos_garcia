import React, {useContext, useReducer, useState, useEffect, useMemo, useCallback, useRef} from React;
import { useNavigate, Link } from "react-router-dom";
import {motion} from "framer-motion";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/Register.css";

// Reducer para manejar el formulario
const formReducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value };
        case "RESET":
            return { nombre: "", email: "", password: "", confirmPassword: "" };
        default:
            return state;
    }
};

const Register = () => {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);
    const { agregarUsuario, loading: authLoading, error: authError } = useAuth();

    const [formState, dispatch] = useReducer(formReducer, {
        nombre: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [mensaje, setMensaje] = useState("");
    const [localLoading, setLocalLoading] = useState(false);

    const nombreRef = useRef(null);

    // Enfocar input al cargar
    useEffect(() => {
        if(nombreRef.current)
        {
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

    // Validaciones memoizadas
    const validaciones = useMemo(() => {
        const validarEmail = (email) =>
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        const validarPassword = (password) => password.length >= 6;
        const passwordsCoinciden =
            formState.password === formState.confirmPassword;

        return {
            emailValido: validarEmail(formState.email),
            passwordValido: validarPassword(formState.password),
            passwordsCoinciden,
            formularioValido: formState.nombre.trim() && 
                            validarEmail(formState.email) && 
                            validarPassword(formState.password) && 
                            passwordsCoinciden
        };
    }, [formState]);

    // Manejo del registro
    const handleRegister = useCallback(
        async (e) => {
            e.preventDefault();
            setMensaje("");

            if (!formState.nombre.trim()) {
                setMensaje("El nombre es obligatorio.");
                return;
            }

            if (!validaciones.emailValido) {
                setMensaje("Email inválido.");
                return;
            }

            if (!validaciones.passwordValido) {
                setMensaje("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            if (!validaciones.passwordsCoinciden) {
                setMensaje("Las contraseñas no coinciden.");
                return;
            }

            setLocalLoading(true);
            
            try {
                const resultado = await agregarUsuario({ 
                name: formState.nombre,
                email: formState.email,
                password: formState.password
            });

            if (resultado?.success) {
                setMensaje("¡Usuario registrado correctamente!");
                dispatch({ type: "RESET" });
                
                // Redirigir automáticamente al login después de un breve delay
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                setMensaje(resultado?.message || "Error al registrar usuario");
            }
        } catch (error) {
            setMensaje("Error inesperado al registrar usuario");
            console.error("Error en registro:", error);
        } finally {
            setLocalLoading(false);
        }
    }, [formState, validaciones, agregarUsuario, navigate]);

    const isLoading = authLoading || localLoading;
    // noinspection JSXUnresolvedComponent
    return (
        <motion.section
            className={`register-container ${darkMode ? "dark" : "light"}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
        >
            <motion.div
                className="register-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="register-title">Crear Cuenta</h1>
                <p className="register-subtitle">
                    Completa tus datos para registrarte en <strong>Task Manager Pro</strong>
                </p>

                <form className="register-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            type="text"
                            id="nombre"
                            ref={nombreRef}
                            value={formState.nombre}
                            onChange={(e) =>
                                dispatch({ type: "SET_FIELD", field: "nombre", value: e.target.value })
                            }
                            placeholder="Juan Pérez"
                            autoComplete="name"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={formState.email}
                            onChange={(e) =>
                                dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })
                            }
                            placeholder="usuario@ejemplo.com"
                            autoComplete="username"
                            required
                            disabled = {isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={formState.password}
                            onChange={(e) =>
                                dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })
                            }
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            disabled = {isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formState.confirmPassword}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD",
                                    field: "confirmPassword",
                                    value: e.target.value
                                })
                            }
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            disabled = {isLoading}
                        />
                    </div>

                    {mensaje && (
                        <motion.p
                            className={`error-message ${mensaje.includes("correctamente") ? "success" : "error"
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {mensaje}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading || !validaciones.formularioValido}
                        whileHover={{scale: validaciones.formularioValido && !isLoading ? 1.05 : 1 }}
                        whileTap={{ scale: validaciones.formularioValido && !isLoading ? 0.95 : 1 }}
                    >
                        {loading ? "Registrando..." : "Crear cuenta"}
                    </motion.button>
                </form>

                <div className="register-footer">
                    <p>
                        ¿Ya tenes cuenta?{" "}
                        <Link to="/login" className="login-link">
                            Iniciar sesión
                        </Link>
                    </p>
                    <Link to="/home" className="back-home">
                        ← Volver al inicio
                    </Link>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Register;
