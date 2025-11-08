/**
 * @class DashboardEditor
 * @classdesc Editor de dashboard optimizado con matrices y funciones eficientes
 */
class DashboardEditor {
    /**
     * @constructor
     * @desc Inicializa el dashboard con configuración optimizada
     */
    constructor() {
        /** @type {number} */
        this.FILAS = 40;

        /** @type {number} */
        this.COLUMNAS = 60;

        /** @type {Array<Array<number>>} */
        this.grid = [];

        /** @type {Array<Object>} */
        this.elementos = [];

        /** @type {number} */
        this.zoom = 1.0;

        /** @type {string} */
        this.proyecto = "personal";

        /** @type {number} */
        this.nextId = 1;

        this.inicializar();
    }

    /**
     * Inicializa la matriz del grid
     * @method inicializar
     */
    inicializar = () => {
        this.inicializarGrid();
        this.cargarElementosProyecto();
        this.renderizarVista();
        this.mostrarNotificacion('Dashboard optimizado cargado', 'success');
    }

    /**
     * Inicializa la matriz grid con ceros
     * @method inicializarGrid
     */
    inicializarGrid = () => {
        this.grid = Array.from({ length: this.FILAS }, () =>
            Array.from({ length: this.COLUMNAS }, () => 0)
        );
    }

    /**
     * Agrega un elemento al dashboard de forma optimizada
     * @method agregarElemento
     * @param {string} tipo - Tipo de elemento
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {boolean} True si se agregó correctamente
     */
    agregarElemento = (tipo, x = 5, y = 5) => {
        if (!this.validarPosicion(x, y)) return false;

        const nuevoElemento = {
            id: this.nextId++,
            x, y,
            ancho: 200,
            alto: 150,
            tipo,
            contenido: `${tipo} ${this.nextId}`
        };

        if (this.reservarEspacio(nuevoElemento)) {
            this.elementos.push(nuevoElemento);
            this.renderizarVista();
            return true;
        }
        return false;
    }

    /**
     * Válida si una posición está dentro de los límites del grid
     * @method validarPosicion
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {boolean} True si la posición es válida
     */
    validarPosicion = (x, y) =>
        x >= 0 && x < this.COLUMNAS && y >= 0 && y < this.FILAS

    /**
     * Reserva espacio en el grid para un elemento
     * @method reservarEspacio
     * @param {Object} elemento - Elemento a reservar espacio
     * @returns {boolean} True si se pudo reservar el espacio
     */
    reservarEspacio = (elemento) => {
        const finX = Math.min(elemento.x + elemento.ancho / 20, this.COLUMNAS - 1);
        const finY = Math.min(elemento.y + elemento.alto / 20, this.FILAS - 1);

        // Verificar colisiones en una sola pasada
        for (let i = elemento.y; i <= finY; i++) {
            for (let j = elemento.x; j <= finX; j++) {
                if (this.grid[i]?.[j] !== 0) return false;
            }
        }

        // Reservar espacio
        for (let i = elemento.y; i <= finY; i++) {
            for (let j = elemento.x; j <= finX; j++) {
                if (this.grid[i]) this.grid[i][j] = elemento.id;
            }
        }
        return true;
    }

    /**
     * Busca un elemento por ID de forma optimizada
     * @method buscarElemento
     * @param {number} id - ID del elemento a buscar
     * @returns {Object|null} Elemento encontrado o null
     */
    buscarElemento = (id) =>
        this.elementos.find(elemento => elemento.id === id) || null

    /**
     * Elimina un elemento usando técnica swap-and-pop
     * @method eliminarElemento
     * @param {number} id - ID del elemento a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    eliminarElemento = (id) => {
        const indice = this.elementos.findIndex(elemento => elemento.id === id);

        if (indice === -1) return false;

        this.liberarEspacio(this.elementos[indice]);

        // Swap-and-pop para eliminación O(1)
        if (indice !== this.elementos.length - 1) {
            [this.elementos[indice], this.elementos[this.elementos.length - 1]] =
                [this.elementos[this.elementos.length - 1], this.elementos[indice]];
        }

        this.elementos.pop();
        this.renderizarVista();
        return true;
    }

    /**
     * Libera el espacio ocupado por un elemento en el grid
     * @method liberarEspacio
     * @param {Object} elemento - Elemento a liberar
     */
    liberarEspacio = (elemento) => {
        const finX = Math.min(elemento.x + elemento.ancho / 20, this.COLUMNAS - 1);
        const finY = Math.min(elemento.y + elemento.alto / 20, this.FILAS - 1);

        for (let i = elemento.y; i <= finY; i++) {
            for (let j = elemento.x; j <= finX; j++) {
                if (this.grid[i]) this.grid[i][j] = 0;
            }
        }
    }

    /**
     * Renderiza toda la vista del dashboard
     * @method renderizarVista
     */
    renderizarVista = () => {
        this.renderizarCanvas();
        this.mostrarResumen();
        this.actualizarEstadisticas();
    }

    /**
     * Renderiza el canvas usando la matriz grid
     * @method renderizarCanvas
     */
    renderizarCanvas = () => {
        console.log(`\n=== CANVAS (${this.proyecto}) - Zoom: ${this.zoom}x ===`);

        // Renderizado optimizado con saltos
        for (let y = 0; y < this.FILAS; y += 2) {
            let linea = '';
            for (let x = 0; x < this.COLUMNAS; x += 2) {
                const celda = this.grid[y]?.[x] || 0;
                linea += celda === 0 ? '·' : String.fromCharCode(65 + (celda % 5));
            }
            console.log(linea);
        }
    }

    /**
     * Muestra resumen de elementos activos
     * @method mostrarResumen
     */
    mostrarResumen = () => {
        console.log(`Elementos activos: ${this.elementos.length}`);
    }

    /**
     * Mueve múltiples elementos de forma optimizada
     * @method moverElementos
     * @param {Array<number>} ids - Array de ID a mover
     * @param {number} dx - Desplazamiento X
     * @param {number} dy - Desplazamiento Y
     */
    moverElementos = (ids, dx, dy) => {
        // Verificar movimientos primero
        const movimientosValidos = ids.every(id => {
            const elemento = this.buscarElemento(id);
            return elemento && this.validarMovimiento(elemento, dx, dy);
        });

        if (!movimientosValidos) return;

        // Aplicar movimientos
        ids.forEach(id => {
            const elemento = this.buscarElemento(id);
            if (elemento) {
                this.liberarEspacio(elemento);
                elemento.x += dx;
                elemento.y += dy;
                this.reservarEspacio(elemento);
            }
        });

        this.renderizarVista();
    }

    /**
     * Válida si un movimiento es posible
     * @method validarMovimiento
     * @param {Object} elemento - Elemento a mover
     * @param {number} dx - Desplazamiento X
     * @param {number} dy - Desplazamiento Y
     * @returns {boolean} True si el movimiento es válido
     */
    validarMovimiento = (elemento, dx, dy) => {
        const nuevoX = elemento.x + dx;
        const nuevoY = elemento.y + dy;
        const finX = nuevoX + elemento.ancho / 20;
        const finY = nuevoY + elemento.alto / 20;

        return this.validarPosicion(nuevoX, nuevoY) &&
            this.validarPosicion(finX, finY);
    }

    /**
     * Ajusta el nivel de zoom
     * @method ajustarZoom
     * @param {number} factor - Factor de zoom
     */
    ajustarZoom = (factor) => {
        this.zoom = Math.max(0.5, Math.min(3.0, this.zoom * factor));
        this.mostrarNotificacion(`Zoom: ${this.zoom.toFixed(1)}x`, 'info');
        this.renderizarVista();
    }

    /**
     * Cambia el proyecto actual
     * @method cambiarProyecto
     * @param {string} nuevoProyecto - Nombre del nuevo proyecto
     */
    cambiarProyecto = (nuevoProyecto) => {
        // Limpiar estado actual en una sola operación
        this.elementos = [];
        this.inicializarGrid();
        this.proyecto = nuevoProyecto;

        this.cargarElementosProyecto();
        this.mostrarNotificacion(`Proyecto: ${nuevoProyecto}`, 'success');
        this.renderizarVista();
    }

    /**
     * Carga elementos por defecto del proyecto
     * @method cargarElementosProyecto
     */
    cargarElementosProyecto = () => {
        const configProyectos = {
            personal: [['chart', 2, 2], ['text', 10, 2]],
            trabajo: [['table', 2, 2], ['filter', 15, 2]],
            estudio: [['pdf', 2, 2], ['chart', 20, 2]]
        };

        const elementos = configProyectos[this.proyecto] || [];
        elementos.forEach(([tipo, x, y]) => this.agregarElemento(tipo, x, y));
    }

    /**
     * Calcula estadísticas del dashboard
     * @method calcularEstadisticas
     * @returns {Object} Estadísticas calculadas
     */
    calcularEstadisticas = () => {
        const celdasOcupadas = this.grid.flat().filter(celda => celda !== 0).length;
        const totalCeldas = this.FILAS * this.COLUMNAS;

        return {
            totalElementos: this.elementos.length,
            espacioOcupado: celdasOcupadas,
            densidad: (celdasOcupadas / totalCeldas * 100).toFixed(1)
        };
    }

    /**
     * Muestra estadísticas en consola
     * @method actualizarEstadisticas
     */
    actualizarEstadisticas = () => {
        const stats = this.calcularEstadisticas();
        console.log(
            `Estadísticas: ${stats.totalElementos} elementos, ` +
            `${stats.espacioOcupado} celdas (${stats.densidad}% densidad)`
        );
    }

    /**
     * Muestra notificación en consola
     * @method mostrarNotificacion
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de notificación
     */
    mostrarNotificacion = (mensaje, tipo = 'info') => {
        const iconos = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        console.log(`${iconos[tipo] || 'ℹ️'} ${mensaje}`);
    }

    /**
     * Ejecuta comandos de forma unificada
     * @method ejecutarComando
     * @param {string} comando - Comando a ejecutar
     * @param {Array} args - Argumentos del comando
     */
    ejecutarComando = (comando, ...args) => {
        const comandos = {
            'add chart': () => this.agregarElemento('chart', ...args),
            'add text': () => this.agregarElemento('text', ...args),
            'add table': () => this.agregarElemento('table', ...args),
            'zoom in': () => this.ajustarZoom(1.2),
            'zoom out': () => this.ajustarZoom(0.8),
            'reset zoom': () => { this.zoom = 1.0; this.renderizarVista(); },
            'estadisticas': () => this.actualizarEstadisticas(),
            'personal': () => this.cambiarProyecto('personal'),
            'trabajo': () => this.cambiarProyecto('trabajo'),
            'estudio': () => this.cambiarProyecto('estudio'),
            'limpiar': () => {
                this.elementos = [];
                this.inicializarGrid();
                this.renderizarVista();
            }
        };

        const ejecutar = comandos[comando];
        if (ejecutar) {
            ejecutar();
        } else {
            this.mostrarNotificacion(`Comando no reconocido: ${comando}`, 'error');
        }
    }
}

// =============================================
// INICIALIZACIÓN Y DEMOSTRACIÓN
// =============================================

/**
 * Inicializa y demo del Dashboard Editor
 * @function demoDashboard
 */
const demoDashboard = () => {
    const dashboard = new DashboardEditor();

    console.log('=== DEMO DASHBOARD EDITOR OPTIMIZADO ===');

    // Demo de funcionalidades
    setTimeout(() => dashboard.ejecutarComando('add chart'), 100);
    setTimeout(() => dashboard.ejecutarComando('add text'), 200);
    setTimeout(() => dashboard.ejecutarComando('zoom in'), 300);
    setTimeout(() => dashboard.ejecutarComando('estadisticas'), 400);
    setTimeout(() => dashboard.ejecutarComando('trabajo'), 500);

    return dashboard;
}

// Inicializar cuando esté listo
if (typeof window !== 'undefined') {
    window.addEventListener('load', demoDashboard);
} else {
    // Entorno Node.js
    demoDashboard();
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardEditor, demoDashboard };
}
/**
 * Inicializa el Dashboard Editor cuando el DOM está listo
 * @function initializeDashboardEditor
 */
const initializeDashboardEditor = () => {
    try {
        window.dashboardEditor = new DashboardEditor();
        window.addEventListener('error', (event) => {
            console.error('Error en Dashboard Editor:', event.error);
        });
    } catch (error) {
        console.error('Error inicializando Dashboard Editor:', error);
        alert('Error al cargar el Dashboard Editor. Por favor recarga la página.');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboardEditor);
} else {
    initializeDashboardEditor();
}

// Estilos CSS para las notificaciones
const notificationStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.dashboard-notification {
    font-family: system-ui, -apple-system, sans-serif;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-close:hover {
    opacity: 0.8;
}
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);