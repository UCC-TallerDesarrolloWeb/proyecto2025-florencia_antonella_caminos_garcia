import React from "react"
import PropTypes from "prop-types"
import { motion } from "framer-motion"
import { FiAlertCircle } from "react-icons/fi"

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
    icon: Icon = null,
    className = "",
}) {
    const baseStyle = `
    w-full px-4 py-2 rounded-xl border 
    bg-white dark:bg-gray-900
    text-gray-800 dark:text-gray-100
    border-gray-300 dark:border-gray-700
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-purple-500
    transition-all duration-200 ease-in-out
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${error ? "border-red-500 ring-red-400" : ""}
`

    // noinspection JSXUnresolvedComponent
    return (
        <div className={`flex flex-col space-y-1 mb-5 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <Icon className="absolute left-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                )}

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`${baseStyle} ${Icon ? "pl-10" : ""}`}
                />

                {error && (
                    <FiAlertCircle className="absolute right-3 text-red-500 w-5 h-5 animate-pulse" />
                )}
            </div>

            {error && (
                <!--suppress JSXUnresolvedComponent -->
                <motion.span
                    className="text-xs text-red-500 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.span>
            )}
        </div>
    )
}

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
    icon: PropTypes.elementType,
    className: PropTypes.string,
}
