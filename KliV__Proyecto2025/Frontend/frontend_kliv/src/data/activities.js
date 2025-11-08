/**
 * activities.js
 * =====================================
 * Lista de actividades del centro deportivo / gimnasio.
 * Cada actividad incluye su descripción y horarios semanales.
 *
 * @typedef {Object} Horario
 * @property {number} day - Día de la semana (0=domingo, 6=sábado)
 * @property {string} startTime - Hora de inicio en formato 24 h (HH:MM)
 * @property {string} endTime - Hora de fin en formato 24 h (HH:MM)
 *
 * @typedef {Object} Actividad
 * @property {string} name - Nombre de la actividad
 * @property {string} description - Breve descripción
 * @property {Horario[]} schedule - Lista de horarios disponibles
 */

export const activities = [
    {
        name: "Taekwondo",
        description: "Arte marcial coreano enfocado en la disciplina y el autocontrol.",
        schedule: [
            { day: 2, startTime: "18:30", endTime: "20:00" }, // Martes
            { day: 4, startTime: "18:30", endTime: "20:00" }  // Jueves
        ]
    },
    {
        name: "Zumba",
        description: "Clase de baile con ritmos latinos que combina ejercicio y diversión.",
        schedule: [
            { day: 1, startTime: "19:30", endTime: "20:30" }, // Lunes
            { day: 3, startTime: "19:30", endTime: "20:30" }  // Miércoles
        ]
    },
    {
        name: "Yoga",
        description: "Sesión de relajación y estiramiento para mejorar flexibilidad y concentración.",
        schedule: [
            { day: 2, startTime: "08:00", endTime: "09:00" }, // Martes
            { day: 5, startTime: "08:00", endTime: "09:00" }  // Viernes
        ]
    }
]

/**
 * Devuelve el nombre del día según el número (0 = domingo)
 * @param {number} dayNumber
 * @returns {string}
 */
export function getDayName(dayNumber) {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return days[dayNumber] || "Día inválido"
}

/**
 * Devuelve todos los horarios de una actividad por nombre (insensible a mayúsculas)
 * @param {string} activityName
 * @returns {Horario[] | null}
 */
export function getScheduleByActivity(activityName) {
    const activity = activities.find(a => a.name.toLowerCase() === activityName.toLowerCase())
    return activity ? activity.schedule : null
}
