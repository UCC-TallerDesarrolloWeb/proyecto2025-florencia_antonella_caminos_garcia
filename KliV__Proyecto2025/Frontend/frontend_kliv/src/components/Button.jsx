import React from "react"
import PropTypes from "prop-types"

/**
 * Componente Button reutilizable.
 *
 * @param {string} label - Texto visible en el botón.
 * @param {function} onClick - Función que se ejecuta al hacer clic.
 * @param {string} type - Tipo de botón (submit, button, reset).
 * @param {boolean} disabled - Indica si el botón está deshabilitado.
 * @param {string} variant - Estilo visual del botón: 'primary', 'secondary', 'danger', etc.
 * @param {string} className - Clases adicionales para personalización.
 */
export default function Button({
                                   label,
                                   onClick,
                                   type = "button",
                                   disabled = false,
                                   variant = "primary",
                                   className = "",
                               }) {
    // Definir estilos según el tipo de variante
    const baseStyle = `
    w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `

    const variantStyles = {
        primary: `
      bg-purple-600 text-white hover:bg-purple-700
      focus:ring-purple-500
      disabled:bg-purple-300
    `,
        secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300
      focus:ring-gray-400
      disabled:bg-gray-100
    `,
        danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500
      disabled:bg-red-300
    `,
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variantStyles[variant]} ${className}`}
        >
            {label}
        </button>
    )
}

// Validación de props
Button.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
    className: PropTypes.string,
}
