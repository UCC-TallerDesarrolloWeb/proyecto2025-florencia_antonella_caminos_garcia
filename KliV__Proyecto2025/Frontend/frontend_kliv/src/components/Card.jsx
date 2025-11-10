import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useTheme } from '@context/ThemeContext'
import { Heart, Clock } from 'lucide-react'

export default function Card({
    nombre,
    descripcion = 'Sin descripción disponible.',
    horarios = [],
    imagen = null,
    interactiva = true
}) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const handleClick = () => {
        if (!interactiva) return
        if (!user) navigate('/login')
        else navigate(`/dashboard?actividad=${encodeURIComponent(nombre)}`)
    }

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    return (
        <motion.article
            onClick={handleClick}
            whileHover={interactiva ? { y: -4, scale: 1.02 } : {}}
            whileTap={interactiva ? { scale: 0.98 } : {}}
            className={`group relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300
        ${isDark
                    ? 'bg-gray-800 border-gray-700 hover:border-purple-400'
                    : 'bg-white border-gray-200 hover:border-purple-500'
                }
        ${interactiva ? 'cursor-pointer' : 'cursor-default'}
      `}
        >
            {/* Imagen superior con overlay */}
            {imagen && (
                <div className="relative w-full h-48 overflow-hidden">
                    <img
                        src={imagen}
                        alt={`Imagen de ${nombre}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div
                        className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/40 to-transparent' : 'from-black/25 to-transparent'
                            }`}
                    />
                    {/* Ícono favorito */}
                    {interactiva && (
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-3 right-3 rounded-full bg-black/30 backdrop-blur-sm p-2 text-white hover:bg-black/50"
                        >
                            <Heart size={18} />
                        </motion.button>
                    )}
                </div>
            )}

            {/* Contenido principal */}
            <div className="p-5 flex flex-col justify-between min-h-[230px]">
                <div>
                    <h3
                        className={`text-xl font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'
                            }`}
                    >
                        {nombre}
                    </h3>
                    <p
                        className={`text-sm leading-snug mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                    >
                        {descripcion}
                    </p>

                    {/* Horarios */}
                    {horarios.length > 0 && (
                        <div
                            className={`rounded-lg p-3 text-sm ${isDark
                                    ? 'bg-gray-700 text-gray-200 divide-gray-600'
                                    : 'bg-gray-100 text-gray-800 divide-gray-300'
                                } divide-y`}
                        >
                            {horarios.map((h, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="opacity-70" />
                                        <span className="font-medium">
                                            {diasSemana[h.dia]}
                                        </span>
                                    </div>
                                    <span>{h.horaInicio} – {h.horaFin}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón inferior */}
                {interactiva && (
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClick()
                        }}
                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors duration-300
            ${isDark
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                            }`}
                    >
                        Ver detalles
                    </motion.button>
                )}
            </div>
        </motion.article>
    )
}

Card.propTypes = {
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    horarios: PropTypes.arrayOf(
        PropTypes.shape({
            dia: PropTypes.number.isRequired,
            horaInicio: PropTypes.string.isRequired,
            horaFin: PropTypes.string.isRequired
        })
    ),
    imagen: PropTypes.string,
    interactiva: PropTypes.bool
}
