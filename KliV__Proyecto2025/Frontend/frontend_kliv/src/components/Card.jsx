/**
 * Card.jsx
 * ============================================================
 * Componente visual reutilizable para mostrar una actividad o
 * proyecto dentro del sistema Task Manager Pro.
 *
 * - Muestra nombre, descripción, horarios y una imagen opcional.
 * - Redirige al dashboard o login según el estado del usuario.
 * - Totalmente compatible con TailwindCSS y React Router.
 *
 * @author
 * Florencia Antonella Caminos García
 * @version 3.0.0
 */

import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@contexts/AuthContext" // Ruta alias definida en vite.config.js

/**
 * @component Card
 * @param {string} nombre - Título o nombre principal de la actividad/proyecto.
 * @param {string} descripcion - Descripción breve o informativa.
 * @param {Array<Object>} horarios - Lista de horarios ({día, horaInicio, horaFin}).
 * @param {string} imagen - Ruta o URL de la imagen asociada.
 * @param {boolean} interactiva - Si es true, permite clic y navegación.
 */
export default function Card({
                                 nombre,
                                 descripcion = "Sin descripción disponible.",
                                 horarios = [],
                                 imagen = null,
                                 interactiva = true
                             }) {
    const navigate = useNavigate()
    const { user } = useAuth()

    /**
     * Controlador del clic en la tarjeta.
     * Redirige al dashboard o login dependiendo del usuario.
     */
    const handleClick = () => {
        if (!interactiva) return
        if (!user) {
            navigate("/login")
        } else {
            navigate(`/dashboard?actividad=${encodeURIComponent(nombre)}`)
        }
    }

    /**
     * Días abreviados para visualización
     */
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    return (
        <article
            onClick={handleClick}
            className={`group relative rounded-2xl overflow-hidden shadow-md border border-gray-200 
      dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300
      ${interactiva ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : "cursor-default"}`}
        >
            {/* Imagen superior */}
            {imagen && (
                <div className="relative w-full h-44 overflow-hidden">
                    <img
                        src={imagen}
                        alt={`Imagen de ${nombre}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
            )}

            {/* Contenido principal */}
            <div className="p-5 flex flex-col justify-between h-full">
                {/* Título y descripción */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {nombre}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug mb-3">
                        {descripcion}
                    </p>

                    {/* Bloque de horarios */}
                    {horarios.length > 0 && (
                        <section className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200">
                            <ul className="divide-y divide-gray-300 dark:divide-gray-600">
                                {horarios.map((h, i) => (
                                    <li key={i} className="flex justify-between py-1 px-1">
                                        <span className="font-medium">{diasSemana[h.dia]}</span>
                                        <span>
                      {h.horaInicio} – {h.horaFin}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* Botón inferior */}
                {interactiva && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClick()
                        }}
                        className="mt-4 px-4 py-2 text-sm font-medium rounded-md
              bg-gradient-to-r from-purple-600 to-indigo-600
              text-white hover:from-purple-700 hover:to-indigo-700
              transition-colors duration-200"
                    >
                        Ver detalles
                    </button>
                )}
            </div>
        </article>
    )
}

/* ========================
   Validación de PropTypes
   ======================== */
Card.propTypes = {
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    horarios: PropTypes.arrayOf(
        PropTypes.shape({
            dia: PropTypes.number.isRequired, // 0 a 6 (Dom a Sáb)
            horaInicio: PropTypes.string.isRequired,
            horaFin: PropTypes.string.isRequired
        })
    ),
    imagen: PropTypes.string,
    interactiva: PropTypes.bool
}
