/**
 * Dashboard Editor Optimizado
 * Sistema completo de gestión y visualización de dashboards con canvas interactivo
 * @version 1.0.0
 * @author Florencia Antonella Caminos Garcia
 */

/**
 * Clase base para elementos del dashboard
 * @class DashboardElement
 */
class DashboardElement {
    /**
     * Crea una instancia de DashboardElement
     * @param {number} id - Identificador único del elemento
     * @param {string} type - Tipo de elemento (chart, text, table, etc.)
     * @param {number} x - Posición en el eje X
     * @param {number} y - Posición en el eje Y
     * @param {number} width - Ancho del elemento
     * @param {number} height - Alto del elemento
     */
    constructor(id, type, x, y, width, height) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Mueve el elemento en el canvas
     * @method move
     * @param {number} dx - Desplazamiento en el eje X
     * @param {number} dy - Desplazamiento en el eje Y
     */
    move = (dx, dy) => {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Renderiza información del elemento en consola
     * @method render
     */
    render = () => {
        console.log(`Elemento ${this.id} [${this.type}] en (${this.x}, ${this.y}) - ${this.width}x${this.height}`);
    }

    /**
     * Convierte el elemento a formato JSON
     * @method toJSON
     * @returns {Object} Representación JSON del elemento
     */
    toJSON = () => ({
        id: this.id,
        type: this.type,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
    })
}

/**
 * Elemento de tipo gráfico
 * @class ChartElement
 * @extends DashboardElement
 */
class ChartElement extends DashboardElement {
    /**
     * Crea una instancia de ChartElement
     * @param {number} id - Identificador único
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    constructor(id, x, y) {
        super(id, 'chart', x, y, 200, 150);
        this.chartType = 'bar';
    }

    /**
     * Renderiza información específica del gráfico
     * @method render
     */
    render = () => {
        console.log(`📊 Gráfico ${this.id} [${this.chartType}] en (${this.x}, ${this.y})`);
    }
}

/**
 * Elemento de tipo texto
 * @class TextElement
 * @extends DashboardElement
 */
class TextElement extends DashboardElement {
    /**
     * Crea una instancia de TextElement
     * @param {number} id - Identificador único
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    constructor(id, x, y) {
        super(id, 'text', x, y, 120, 40);
        this.content = `Texto ${id}`;
    }

    /**
     * Renderiza información específica del texto
     * @method render
     */
    render = () => {
        console.log(`📝 Texto ${this.id} "${this.content}" en (${this.x}, ${this.y})`);
    }
}

/**
 * Elemento de tipo tabla
 * @class TableElement
 * @extends DashboardElement
 */
class TableElement extends DashboardElement {
    /**
     * Crea una instancia de TableElement
     * @param {number} id - Identificador único
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    constructor(id, x, y) {
        super(id, 'table', x, y, 250, 180);
    }

    /**
     * Renderiza información específica de la tabla
     * @method render
     */
    render = () => {
        console.log(`📋 Tabla ${this.id} en (${this.x}, ${this.y})`);
    }
}

/**
 * Elemento de tipo filtro
 * @class FilterElement
 * @extends DashboardElement
 */
class FilterElement extends DashboardElement {
    /**
     * Crea una instancia de FilterElement
     * @param {number} id - Identificador único
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    constructor(id, x, y) {
        super(id, 'filter', x, y, 150, 60);
    }

    /**
     * Renderiza información específica del filtro
     * @method render
     */
    render = () => {
        console.log(`🎛️ Filtro ${this.id} en (${this.x}, ${this.y})`);
    }
}

/**
 * Elemento de tipo PDF
 * @class PdfElement
 * @extends DashboardElement
 */
class PdfElement extends DashboardElement {
    /**
     * Crea una instancia de PdfElement
     * @param {number} id - Identificador único
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    constructor(id, x, y) {
        super(id, 'pdf', x, y, 180, 220);
    }

    /**
     * Renderiza información específica del PDF
     * @method render
     */
    render = () => {
        console.log(`📄 PDF ${this.id} en (${this.x}, ${this.y})`);
    }
}

/**
 * Clase principal del Dashboard Editor - Gestiona todos los elementos y funcionalidades
 * @class DashboardEditor
 */
class DashboardEditor {
    /**
     * Crea una instancia de DashboardEditor
     */
    constructor() {
        /** @type {DashboardElement[]} */
        this.elements = [];
        this.currentProject = 'personal';
        this.zoomLevel = 1.0;
        this.nextElementId = 1;
        this.gridVisible = true;
        this.gridOpacity = 30;

        /** @type {Object} */
        this.stats = {
            totalElements: 0,
            charts: 0,
            texts: 0,
            tables: 0,
            filters: 0,
            pdfs: 0
        };

        this.initializeCanvas();
        this.updateStatistics();
        this.bindEvents();
    }

    /**
     * Inicializa el canvas y su contexto
     * @method initializeCanvas
     */
    initializeCanvas = () => {
        this.canvas = document.getElementById('dashboard-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderCanvas();
    }

    /**
     * Agrega un nuevo elemento al dashboard
     * @method agregarElemento
     * @param {string} type - Tipo de elemento a agregar
     */
    agregarElemento = (type) => {
        const baseX = (this.elements.length % 4) * 220;
        const baseY = Math.floor(this.elements.length / 4) * 170;

        let newElement;
        switch (type) {
            case 'chart':
                newElement = new ChartElement(this.nextElementId, baseX, baseY);
                break;
            case 'text':
                newElement = new TextElement(this.nextElementId, baseX, baseY);
                break;
            case 'table':
                newElement = new TableElement(this.nextElementId, baseX, baseY);
                break;
            case 'filter':
                newElement = new FilterElement(this.nextElementId, baseX, baseY);
                break;
            case 'pdf':
                newElement = new PdfElement(this.nextElementId, baseX, baseY);
                break;
            default:
                newElement = new DashboardElement(this.nextElementId, type, baseX, baseY, 100, 80);
        }

        this.elements.push(newElement);
        this.nextElementId++;
        this.updateStatistics();
        this.renderCanvas();
        this.mostrarNotificacion(`✅ Elemento ${type} agregado con ID: ${this.nextElementId - 1}`);
    }

    /**
     * Elimina un elemento del dashboard por ID
     * @method eliminarElemento
     * @returns {boolean} True si se eliminó correctamente
     */
    eliminarElemento = () => {
        const idInput = document.getElementById('eliminar-id');
        const id = parseInt(idInput.value);
        if (!isNaN(id)) {
            dashboardEditor.eliminarElemento();
        } else {
            dashboardEditor.mostrarNotificacion('❌ Por favor ingresa un ID válido', 'error');
        }
    };


    /**
     * Busca un elemento en el dashboard por ID
     * @method buscarElemento
     * @returns {DashboardElement|null} Elemento encontrado o null
     */
    buscarElemento = () => {
        const idInput = document.getElementById('buscar-id');
        const id = parseInt(idInput.value);
        if (!isNaN(id)) {
            dashboardEditor.buscarElemento(id);
        } else {
            dashboardEditor.mostrarNotificacion('❌ Por favor ingresa un ID válido', 'error');
        }
    }

    /**
     * Resalta visualmente un elemento en el canvas
     * @method highlightElement
     * @param {DashboardElement} elemento - Elemento a resaltar
     */
    highlightElement = (elemento) => {
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(elemento.x, elemento.y, elemento.width, elemento.height);

        setTimeout(() => {
            this.renderCanvas();
        }, 1000);
    }

    /**
     * Mueve múltiples elementos en el canvas
     * @method moverElementos
     * @param {number[]} ids - Array de ID de elementos a mover
     * @param {number} dx - Desplazamiento en X
     * @param {number} dy - Desplazamiento en Y
     */
    moverElementos = (ids, dx, dy) => {
        let movedCount = 0;

        ids.forEach(id => {
            const elemento = this.elements.find(elem => elem.id === id);
            if (elemento) {
                elemento.move(parseFloat(dx), parseFloat(dy));
                movedCount++;
            }
        });

        this.renderCanvas();
        this.mostrarNotificacion(`🚚 Movidos ${movedCount} elementos por (${dx}, ${dy})`);
    }

    /**
     * Ajusta el nivel de zoom del dashboard
     * @method ajustarZoom
     * @param {number} factor - Factor de zoom (1.2 para zoom in, 0.8 para zoom out)
     */
    ajustarZoom = (factor) => {
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5.0, this.zoomLevel));
        this.actualizarVista();
        this.mostrarNotificacion(`🔍 Zoom ajustado a: ${this.zoomLevel.toFixed(1)}x`);
    }

    /**
     * Reinicia el Zoom a su valor por defecto (1.0)
     * @method resetZoom
     */
    resetZoom = () => {
        this.zoomLevel = 1.0;
        this.actualizarVista();
        this.mostrarNotificacion('🔍 Zoom reiniciado a 1.0x');
    }

    /**
     * Cambia el proyecto actual del dashboard
     * @method cambiarProyecto
     * @param {string} proyecto - Nombre del proyecto (personal, trabajo, estudio)
     */
    cambiarProyecto = (proyecto) => {
        this.currentProject = proyecto;
        this.actualizarVista();
        this.mostrarNotificacion(`📁 Proyecto cambiado a: ${proyecto}`);
    }

    /**
     * Ejecuta un comando directo en el dashboard
     * @method ejecutarComando
     * @param {string} comando - Comando a ejecutar
     */
    ejecutarComando = (comando) => {
        console.log(`🎯 Ejecutando comando: ${comando}`);

        switch (comando) {
            case 'add chart':
                this.agregarElemento('chart');
                break;
            case 'add text':
                this.agregarElemento('text');
                break;
            case 'add table':
                this.agregarElemento('table');
                break;
            case 'zoom in':
                this.ajustarZoom(1.2);
                break;
            case 'zoom out':
                this.ajustarZoom(0.8);
                break;
            case 'reset zoom':
                this.resetZoom();
                break;
            case 'estadisticas':
                this.actualizarEstadisticas();
                break;
            case 'personal':
                this.cambiarProyecto();
                break;
            case 'trabajo':
                this.cambiarProyecto();
                break;
            case 'estudio':
                this.cambiarProyecto();
                break;
            case 'limpiar':
                this.limpiarCanvas();
                break;
            default:
                this.mostrarNotificacion(`❌ Comando desconocido: ${comando}`, 'error');
        }
    }

    /**
     * Renderiza la vista completa del dashboard
     * @method renderizarVista
     */
    renderizarVista = () => {
        this.renderCanvas();
        this.actualizarVista();
    }

    /**
     * Renderiza todos los elementos en el canvas
     * @method renderCanvas
     */
    renderCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gridVisible) {
            this.dibujarGrid();
        }

        this.elements.forEach(elemento => {
            this.dibujarElemento(elemento);
        });
    }

    /**
     * Dibuja la cuadrícula (grid) en el canvas
     * @method dibujarGrid
     */
    dibujarGrid = () => {
        const opacity = this.gridOpacity / 100;
        this.ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
        this.ctx.lineWidth = 1;

        const gridSize = 20;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Dibuja un elemento específico en el canvas
     * @method dibujarElemento
     * @param {DashboardElement} elemento - Elemento a dibujar
     */
    dibujarElemento = (elemento) => {
        this.ctx.fillStyle = this.getColorForType(elemento.type);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;

        this.ctx.fillRect(elemento.x, elemento.y, elemento.width, elemento.height);
        this.ctx.strokeRect(elemento.x, elemento.y, elemento.width, elemento.height);

        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
            `${elemento.type.toUpperCase()} ${elemento.id}`,
            elemento.x + 5,
            elemento.y + 15
        );
    }

    /**
     * Obtiene el color correspondiente para cada tipo de elemento
     * @method getColorForType
     * @param {string} type - Tipo de elemento
     * @returns {string} Color en formato rgba
     */
    getColorForType = (type) => {
        const colors = {
            chart: 'rgba(255, 99, 132, 0.6)',
            text: 'rgba(54, 162, 235, 0.6)',
            table: 'rgba(255, 206, 86, 0.6)',
            filter: 'rgba(75, 192, 192, 0.6)',
            pdf: 'rgba(153, 102, 255, 0.6)'
        };
        return colors[type] || 'rgba(199, 199, 199, 0.6)';
    }

    /**
     * Actualiza todos los elementos visuales de la interfaz
     * @method actualizarVista
     */
    actualizarVista = () => {
        document.getElementById('proyecto-actual').textContent = this.currentProject;
        document.getElementById('zoom-actual').textContent = this.zoomLevel.toFixed(1) + 'x';
        document.getElementById('elementos-actual').textContent = this.elements.length.toString();

        document.getElementById('proyecto-visual').textContent = this.currentProject;
        document.getElementById('zoom-visual').textContent = this.zoomLevel.toFixed(1) + 'x';
        document.getElementById('elementos-count').textContent = this.elements.length.toString();

        this.actualizarListaElementos();
    }

    /**
     * Actualiza la lista de elementos en la interfaz
     * @method actualizarListaElementos
     */
    actualizarListaElementos = () => {
        const lista = document.getElementById('lista-elementos');
        lista.innerHTML = '';

        this.elements.forEach(elemento => {
            const div = document.createElement('div');
            div.className = 'elemento-item';
            div.innerHTML = `
                <strong>${elemento.type.toUpperCase()} ${elemento.id}</strong> 
                - (${elemento.x}, ${elemento.y}) - ${elemento.width}x${elemento.height}
            `;
            lista.appendChild(div);
        });
    }

    /**
     * Actualiza las estadísticas del dashboard
     * @method actualizarEstadisticas
     */
    actualizarEstadisticas = () => {
        this.stats = {
            totalElements: this.elements.length,
            charts: this.elements.filter(e => e.type === 'chart').length,
            texts: this.elements.filter(e => e.type === 'text').length,
            tables: this.elements.filter(e => e.type === 'table').length,
            filters: this.elements.filter(e => e.type === 'filter').length,
            pdfs: this.elements.filter(e => e.type === 'pdf').length
        };

        this.mostrarEstadisticas();
        this.mostrarNotificacion('📊 Estadísticas actualizadas');
    }

    /**
     * Muestra las estadísticas en la interfaz
     * @method mostrarEstadisticas
     */
    mostrarEstadisticas = () => {
        const contenedor = document.getElementById('estadisticas-actuales');
        contenedor.innerHTML = `
            <div>Total elementos: ${this.stats.totalElements}</div>
            <div>Gráficos: ${this.stats.charts}</div>
            <div>Textos: ${this.stats.texts}</div>
            <div>Tablas: ${this.stats.tables}</div>
            <div>Filtros: ${this.stats.filters}</div>
            <div>PDFs: ${this.stats.pdfs}</div>
        `;
    }

    /**
     * Muestra un resumen general del dashboard
     * @method mostrarResumen
     */
    mostrarResumen = () => {
        this.mostrarNotificacion(
            `📊 RESUMEN: ${this.elements.length} elementos en proyecto '${this.currentProject}' con zoom ${this.zoomLevel.toFixed(1)}x`
        );
    }

    /**
     * Alterna la visibilidad del grid
     * @method mostrarGrid
     */
    mostrarGrid = () => {
        this.gridVisible = !this.gridVisible;
        this.renderCanvas();
        this.mostrarNotificacion(this.gridVisible ? '✅ Grid visible' : '❌ Grid oculto');
    }

    /**
     * Ajusta la opacidad del grid
     * @method ajustarOpacidadGrid
     * @param {number} valor - Valor de opacidad (0-100)
     */
    ajustarOpacidadGrid = (valor) => {
        this.gridOpacity = parseInt(valor);
        this.renderCanvas();
    }

    /**
     * Limpia completamente el canvas eliminando todos los elementos
     * @method limpiarCanvas
     */
    limpiarCanvas = () => {
        this.elements = [];
        this.nextElementId = 1;
        this.updateStatistics();
        this.renderCanvas();
        this.mostrarNotificacion('🧹 Canvas limpiado - Todos los elementos eliminados');
    }

    /**
     * Exporta el canvas como imagen PNG
     * @method exportarCanvas
     */
    exportarCanvas = () => {
        const enlace = document.createElement('a');
        enlace.download = `dashboard-${this.currentProject}-${new Date().toISOString().slice(0, 10)}.png`;
        enlace.href = this.canvas.toDataURL();
        enlace.click();
        this.mostrarNotificacion('💾 Canvas exportado como imagen');
    }

    /**
     * Renderiza el canvas completo y muestra notificación
     * @method renderizarCanvasCompleto
     */
    renderizarCanvasCompleto = () => {
        this.renderCanvas();
        this.mostrarNotificacion('🎨 Vista completa renderizada');
    }

    /**
     * Muestra el estado completo del dashboard en la consola
     * @method mostrarEnConsola
     */
    mostrarEnConsola = () => {
        console.log('=== ESTADO EN CONSOLA ===');
        console.log('Proyecto:', this.currentProject);
        console.log('Zoom:', this.zoomLevel + 'x');
        console.log('Grid:', this.gridVisible ? 'visible' : 'oculto');
        console.log('Opacidad Grid:', this.gridOpacity);
        console.log('Elementos:', this.elements.length);
        console.log('Elementos detallados:');
        this.elements.forEach(elem => console.log(' -', elem.toJSON()));
        console.log('=========================');

        this.mostrarNotificacion('📟 Estado mostrado en consola');
    }

    /**
     * Muestra una notificación en la interfaz
     * @method mostrarNotificacion
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de notificación (info, error)
     */
    mostrarNotificacion = (mensaje, tipo = 'info') => {
        const notificaciones = document.getElementById('lista-notificaciones');
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerHTML = `
            <span class="hora">${new Date().toLocaleTimeString()}</span>
            <span class="mensaje">${mensaje}</span>
        `;

        notificaciones.insertBefore(notificacion, notificaciones.firstChild);

        if (notificaciones.children.length > 10) {
            notificaciones.removeChild(notificaciones.lastChild);
        }

        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 5000);
    }

    /**
     * Vincula eventos del DOM a los métodos correspondientes
     * @method bindEvents
     */
    bindEvents = () => {
        document.getElementById('buscar-id')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscarElemento(parseInt(e.target.value));
        });

        document.getElementById('eliminar-id')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.eliminarElemento();
        });

        this.actualizarVista();
        this.actualizarEstadisticas();
    }

    /**
     * Actualiza las estadísticas (alias de actualizarEstadisticas)
     * @method updateStatistics
     */
    updateStatistics = () => {
        this.actualizarEstadisticas();
    }

    /**
     * Elimina un elemento del dashboard por ID
     * @method eliminarElemento
     * @param {number} id - ID del elemento a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    eliminarElemento = (id) => {
        const index = this.elements.findIndex(elem => elem.id === id);
        if (index !== -1) {
            const elementoEliminado = this.elements[index];
            this.elements.splice(index, 1);
            this.updateStatistics();
            this.renderCanvas();
            this.mostrarNotificacion(`🗑️ Elemento ${id} (${elementoEliminado.type}) eliminado correctamente`);
            return true;
        }
        this.mostrarNotificacion(`❌ Elemento ${id} no encontrado`, 'error');
        return false;
    }
}

/**
 * Busca un elemento por ID desde la interfaz
 * @method buscarElemento
 * @global
 */
let buscarElemento = () => {
    const id = parseInt(document.getElementById('buscar-id').value);
    if (id) {
        dashboardEditor.buscarElemento(id);
    }
}

/**
 * Elimina un elemento por ID desde la interfaz
 * @method eliminarElemento
 * @global
 */
let eliminarElemento = () => {
    const id = parseInt(document.getElementById('eliminar-id').value);
    if (id) {
        dashboardEditor.eliminarElemento();
    }
}

/**
 * Mueve múltiples elementos desde la interfaz
 * @method moverElementos
 * @global
 */
let moverElementos = () => {
    const idsStr = document.getElementById('ids-mover').value;
    const dx = parseFloat(document.getElementById('dx').value) || 0;
    const dy = parseFloat(document.getElementById('dy').value) || 0;

    const ids = idsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length > 0) {
        dashboardEditor.moverElementos(ids, dx, dy);
    }
}

// Inicializar el dashboard editor
const dashboardEditor = new DashboardEditor();

// Hacer disponible globalmente para los onclick del HTML
window.dashboardEditor = dashboardEditor;
window.buscarElemento = buscarElemento;
window.eliminarElemento = eliminarElemento;
window.moverElementos = moverElementos;