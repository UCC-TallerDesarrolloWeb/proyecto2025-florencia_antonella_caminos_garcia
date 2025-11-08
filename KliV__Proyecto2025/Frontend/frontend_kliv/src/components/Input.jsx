/**
 * Input.jsx
 * ============================================================
 * Componente reutilizable para formularios en Task Manager Pro.
 *
 * Incluye:
 * - Etiqueta accesible (label)
 * - Validación visual (error)
 * - Soporte para distintos tipos de input (texto, email, password, fecha, etc.)
 * - Integración con TailwindCSS
 *
 * @example
 * <Input
 *   label="Correo electrónico"
 *   type="email"
 *   name="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="ejemplo@correo.com"
 *   required
 * />
 */

import React from "react"
import PropTypes from "prop-types"

export default function Input({
                                  label,
                                  name,
                                  type = "text",
                                  value,
                                  onChange,
                                  placeholder = "",
                                  error = "",
                                  required = false,
                                  disabled = false,
                                  className = ""
                              }) {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {/* Etiqueta superior */}
            {label && (
                <label
                    htmlFor={name}
                    className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Campo de entrada */}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg 
          bg-white dark:bg-gray-800 
          border-gray-300 dark:border-gray-700
          text-gray-800 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500
          transition-all duration-150
          ${error ? "border-red-500 ring-red-400" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
            />

            {/* Mensaje de error */}
            {error && (
                <span className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </span>
            )}
        </div>
    )
}

/* ========================
   Validación de PropTypes
   ======================== */
Input.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string
}
