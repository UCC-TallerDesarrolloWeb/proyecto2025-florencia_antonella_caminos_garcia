import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useTheme } from '@context/ThemeContext'

export default function Button({
  label,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = ''
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const base = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: isDark
      ? `
        bg-purple-500 text-white hover:bg-purple-400
        focus:ring-purple-300 active:scale-[0.98]
      `
      : `
        bg-purple-600 text-white hover:bg-purple-700
        focus:ring-purple-500 active:scale-[0.98]
      `,

    secondary: isDark
      ? `
        bg-gray-800 text-gray-100 hover:bg-gray-700
        focus:ring-gray-600 active:scale-[0.98]
      `
      : `
        bg-gray-100 text-gray-800 hover:bg-gray-200
        focus:ring-gray-400 active:scale-[0.98]
      `,

    danger: isDark
      ? `
        bg-red-700 text-white hover:bg-red-600
        focus:ring-red-500 active:scale-[0.98]
      `
      : `
        bg-red-600 text-white hover:bg-red-700
        focus:ring-red-500 active:scale-[0.98]
      `,

    ghost: isDark
      ? `
        bg-transparent text-purple-300 hover:bg-gray-800
        focus:ring-purple-400 active:scale-[0.98]
      `
      : `
        bg-transparent text-purple-700 hover:bg-purple-50
        focus:ring-purple-500 active:scale-[0.98]
      `
  }

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-3'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </motion.button>
  )
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  className: PropTypes.string
}
