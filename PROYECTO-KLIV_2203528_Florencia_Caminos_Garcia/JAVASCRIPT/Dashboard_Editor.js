/**
 * ========================================================================
 * Clase principal para el editor de dashboard
 * =======================================================================
 */
class DashboardEditor {
    y;
    x;
    /**
     * Constructor de la clase DashboardEditor
     * Inicializa selectores, estado y variables de la instancia
     */
    constructor() {
        // Selectores CSS para elementos DOM
        this.selectors = {
            canvas: '#dashboardCanvas',
            workspace: '.workspace',
            previewGrid: '.preview-grid',
            fileList: '#file-list',
            sidebarAdd: '#sidebar-add-options',
            sidebarDelete: '#sidebar-delete-options',
            managementSelect: '#management',
            projects: '.project-btn',
            filters: {
                priority: 'select[name="priority-filter"]',
                device: 'select[name="device"]',
                region: 'select[name="region"]',
                newUsers: 'input[name="newUsers"]'
            }
        };

        // Iconos para cada tipo de elemento
        this.icons = {
            chart: '📊',
            table: '📋',
            text: '📝',
            color: '🎨',
            filter: '🔍',
            pdf: '📄'
        };

        // Estado actual de la aplicación
        // noinspection GrazieInspection
        this.state = {
            currentProject: 'personal',      // Proyecto activo actual
            dashboardItems: [],              // Array de elementos del dashboard
            isPreviewMode: false,            // Modo vista previa activado/desactivado
            canvasMode: 'grid',              // Modo de visualización del canvas
            selectedItems: [],               // Elementos seleccionados
            isDragging: false,               // Estado de arrastre activo
            dragStart: { x: 0, y: 0 },       // Posición inicial del arrastre
            canvasZoom: 1.0                  // Nivel de zoom del canvas
        };

        // Mapa para almacenar elementos del canvas
        this.canvasItems = new Map();
        // Array para conexiones entre elementos
        this.connections = [];
        // Referencia al elemento siendo arrastrado
        this.draggingItem = null;
        // Timeout para redimensionamiento
        this.resizeTimeout = null;

        // Inicializar la aplicación
        this.init();
    }

    /**
     * Inicializa el editor de dashboard
     * Configura todos los componentes necesarios
     */
    init() {
        try {
            this.cacheElements();        // Almacena referencias a elementos DOM
            this.setupCanvas();          // Configura el elemento canvas
            this.loadState();            // Carga el estado guardado
            this.setupEventListeners();  // Configura event listeners
            this.renderDashboard();      // Renderiza el dashboard
            this.renderCanvas();         // Renderiza el canvas
        } catch (error) {
            console.error('Error initializing DashboardEditor:', error);
            this.showNotification('Error al inicializar el editor');
        }
    }

    /**
     * Configura el elemento canvas y su contexto 2D
     * @throws {Error} Si el canvas o contexto 2D no están disponibles
     */
    setupCanvas() {
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Could not get 2D context from canvas');
        }

        this.resizeCanvas();

        // Mejorar calidad de renderizado
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Redimensionar canvas cuando cambia el tamaño de la ventana
        const self = this;
        window.addEventListener('resize', function () {
            if (self.resizeTimeout) {
                clearTimeout(self.resizeTimeout);
            }
            self.resizeTimeout = setTimeout(function () {
                self.resizeCanvas();
                self.renderCanvas();
            }, 250);
        });
    }

    /**
     * Ajusta el tamaño del canvas al contenedor padre
     */
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;

        const container = this.canvas.parentElement;
        if (!container) return;

        // Obtener dimensiones del contenedor
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width);
        this.canvas.height = Math.floor(rect.height);

        // Guardar dimensiones para uso posterior
        this.canvasBounds = {
            width: rect.width,
            height: rect.height,
            centerX: rect.width / 2,
            centerY: rect.height / 2
        };
    }

    /**
     * Almacena referencias a elementos DOM en propiedades de la clase
     */
    cacheElements() {
        this.canvas = document.querySelector(this.selectors.canvas);
        this.workspace = document.querySelector(this.selectors.workspace);
        this.previewGrid = document.querySelector(this.selectors.previewGrid);
        this.sidebarAdd = document.querySelector(this.selectors.sidebarAdd);
        this.sidebarDelete = document.querySelector(this.selectors.sidebarDelete);
        this.managementSelect = document.querySelector(this.selectors.managementSelect);
        this.projects = document.querySelectorAll(this.selectors.projects);

        // Almacenar elementos de filtro
        this.filters = {
            priority: document.querySelector(this.selectors.filters.priority),
            device: document.querySelector(this.selectors.filters.device),
            region: document.querySelector(this.selectors.filters.region),
            newUsers: document.querySelector(this.selectors.filters.newUsers)
        };

        this.validateElements();
    }

    /**
     * Valida que los elementos DOM requeridos estén presentes
     * @throws {Error} Si faltan elementos requeridos
     */
    validateElements() {
        const requiredElements = {
            canvas: this.canvas,
            workspace: this.workspace,
            previewGrid: this.previewGrid
        };

        const missingElements = [];
        for (const name in requiredElements) {
            if (!requiredElements[name]) {
                missingElements.push(name);
            }
        }

        if (missingElements.length > 0) {
            throw new Error('Required elements not found: ' + missingElements.join(', '));
        }
    }

    /**
     * Configura todos los event listeners de la aplicación
     */
    setupEventListeners() {
        let self = this;

        // Configurar event listeners específicos del canvas
        this.setupCanvasEventListeners();

        // Event listener para acciones en tarjetas de vista previa
        if (this.previewGrid) {
            this.previewGrid.addEventListener('click', function (e) {
                const cardBtn = e.target.closest('.card-btn');
                if (!cardBtn) return;

                let card = cardBtn.closest('.preview-card');
                const id = parseInt(card.dataset.id);
                if (isNaN(id)) return;

                // Manejar acciones de edición o eliminación
                if (cardBtn.classList.contains('btn-edit')) {
                    self.editItem(id);
                } else if (cardBtn.classList.contains('btn-delete')) {
                    self.removeItem(id);
                }
            });
        }
    }

    /**
     * Configura event listeners específicos para el canvas
     */
    setupCanvasEventListeners() {
        if (!this.canvas) return;

        const self = this;

        // Eventos de mouse para el canvas
        this.canvas.addEventListener('mousedown', function (e) {
            self.handleCanvasMouseDown(e);
        });
        this.canvas.addEventListener('mousemove', function (e) {
            self.handleCanvasMouseMove(e);
        });
        this.canvas.addEventListener('mouseup', function () {
            self.handleCanvasMouseUp();
        });
        this.canvas.addEventListener('wheel', function (e) {
            self.handleCanvasWheel(e);
        });
        this.canvas.addEventListener('dblclick', function (e) {
            self.handleCanvasDoubleClick(e);
        });

        // Eventos táctiles para el canvas
        this.canvas.addEventListener('touchstart', function (e) {
            self.handleCanvasTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function (e) {
            self.handleCanvasTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function (e) {
            self.handleCanvasTouchEnd(e);
        });
    }

    /**
     * Calcula la posición del mouse en el canvas considerando el zoom
     * @param {Event} e - Evento del mouse
     * @returns {Object} Coordenadas x, y en el espacio del canvas
     */
    getCanvasMousePos(e) {
        // noinspection JSUndefinedPropertyAssignment
        e.clientY = undefined;
        if (!this.canvas) return { x: 0, y: 0 };

        const rect = this.canvas.getBoundingClientRect();
        // noinspection JSUnresolvedReference
        return {
            x: (e.clientY - rect.left) / this.state.canvasZoom,
            y: (e.clientY - rect.top) / this.state.canvasZoom
        };
    }

    /**
     * Maneja el evento de presionar mouse en el canvas
     * @param {Event} e - Evento del mouse
     */
    handleCanvasMouseDown(e) {
        const pos = this.getCanvasMousePos(e);
        const item = this.getItemAtPosition(pos.x, pos.y);

        if (item) {
            // Iniciar arrastre de elemento
            this.draggingItem = item;
            this.state.dragStart = { x: pos.x, y: pos.y };
            this.canvas.style.cursor = 'grabbing';
        } else {
            // Iniciar arrastre de canvas
            this.state.isDragging = true;
            this.state.dragStart = { x: pos.x, y: pos.y };
        }

        e.preventDefault();
    }

    /**
     * Maneja el evento de mover mouse en el canvas
     * @param {Event} e - Evento del mouse
     */
    handleCanvasMouseMove(e) {
        const pos = this.getCanvasMousePos(e);

        if (this.draggingItem) {
            // Mover elemento arrastrado
            this.draggingItem.canvasX = pos.x - this.draggingItem.width / 2;
            this.draggingItem.canvasY = pos.y - this.draggingItem.height / 2;
            this.renderCanvas();
        } else if (this.state.isDragging) {
            // Mover canvas (panning)
            // Canvas panning can be implemented here
        } else {
            // Cambiar cursor según si hay elemento bajo el mouse
            const item = this.getItemAtPosition(pos.x, pos.y);
            this.canvas.style.cursor = item ? 'grab' : 'default';
        }
    }

    /**
     * Maneja el evento de soltar mouse en el canvas
     */
    handleCanvasMouseUp() {
        if (this.draggingItem) {
            this.saveState();
            this.draggingItem = null;
        }
        this.state.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    /**
     * Maneja el evento de rueda del mouse para zoom
     * @param {Event} e - Evento de rueda del mouse
     */
    handleCanvasWheel(e) {
        // noinspection JSUndefinedPropertyAssignment
        e.deltaY = undefined;
        e.deltaY = undefined;
        e.deltaY = undefined;
        e.deltaY = undefined;
        // noinspection JSUndefinedPropertyAssignment
        e.deltaY = undefined;
        // noinspection JSUndefinedPropertyAssignment
        e.deltaY = undefined;
        e.preventDefault();

        const zoomIntensity = 0.1;
        this.getCanvasMousePos(e);
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = wheel > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

        this.state.canvasZoom *= zoomFactor;
        this.state.canvasZoom = Math.max(0.1, Math.min(3, this.state.canvasZoom));

        this.renderCanvas();
    }

    /**
     * Maneja el evento de doble click en el canvas
     * @param {Event} e - Evento del mouse
     */
    handleCanvasDoubleClick(e) {
        const pos = this.getCanvasMousePos(e);
        const item = this.getItemAtPosition(pos.x, pos.y);

        if (item) {
            // Editar elemento existente
            this.editItem(item.id);
        } else {
            // Agregar nuevo elemento en la posición del click
            this.promptAddItemAtPosition();
        }
    }

    /**
     * Maneja el evento de toque inicial en canvas táctil
     * @param {Event} e - Evento táctil
     */
    handleCanvasTouchStart(e) {
        e.mouseEvent = undefined;
        e.touches = undefined;
        e.mouseEvent = undefined;
        e.touches = undefined;
        e.mouseEvent = undefined;
        e.touches = undefined;
        if (e.touches.length === 1) {
            const touch = e.mouseEvent[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            this.handleCanvasMouseDown(mouseEvent);
        }
        e.preventDefault();
    }

    /**
     * Maneja el evento de movimiento táctil en canvas
     * @param {Event} e - Evento táctil
     */
    handleCanvasTouchMove(e) {
        e["touches"] = undefined;
        e["touches"] = undefined;
        e["touches"] = undefined;
        e["touches"] = undefined;
        if (e["touches"].length === 1) {
            const touch = e["touches"][0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            this.handleCanvasMouseMove(mouseEvent);
        }
        e.preventDefault();
    }

    /**
     * Maneja el evento de fin de toque en canvas
     * @param {Event} e - Evento táctil
     */
    handleCanvasTouchEnd(e) {
        new MouseEvent('mouseup', { bubbles: true });
        this.handleCanvasMouseUp();
        e.preventDefault();
    }

    /**
     * Encuentra un elemento en una posición específica del canvas
     * @param {number} x - Coordenada x
     * @param {number} y - Coordenada y
     * @returns {Object|null} Elemento encontrado o null
     */
    getItemAtPosition(x, y) {
        const items = Array.from(this.canvasItems.values());
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (x >= item.canvasX && x <= item.canvasX + item.width &&
                y >= item.canvasY && y <= item.canvasY + item.height) {
                return item;
            }
        }
        return null;
    }

    /**
     * Solicita al usuario agregar un elemento en una posición específica
     */
    promptAddItemAtPosition() {
        const type = prompt('¿Qué tipo de elemento quieres agregar? (chart, table, text, color, filter, pdf)');
        if (type && this.icons[type]) {
            this.addItem(type);
        }
    }

    /**
     * Agrega un nuevo elemento al dashboard
     * @param {string} type - Tipo de elemento a agregar
     */
    addItem(type) {
        if (!type || !this.icons[type]) {
            this.showNotification('Tipo de elemento no válido');
            return;
        }

        // Calcular posición por defecto si no se especifica
        const defaultX = this.x !== null && this.x !== undefined ? this.x : 50 + Math.random() * (this.canvasBounds.width - 200);
        const defaultY = this.y !== null && this.y !== undefined ? this.y : 50 + Math.random() * (this.canvasBounds.height - 150);

        // Crear nuevo elemento
        const item = {
            id: Date.now() + Math.random(),
            type: type,
            content: this.icons[type] + ' Nuevo ' + type,
            priority: 'Media',
            device: 'all',
            region: 'all',
            newUsers: false,
            createdAt: new Date().toISOString(),
            canvasX: defaultX,
            canvasY: defaultY,
            width: 180,
            height: 120,
            color: this.getItemColor(type)
        };

        // Agregar elemento al estado
        this.state.dashboardItems.push(item);
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();

        // Resetear selector de agregar
        if (this.sidebarAdd) {
            this.sidebarAdd.value = '';
        }

        this.showNotification('Elemento ' + type + ' agregado correctamente');
    }

    /**
     * Obtiene el color asociado a un tipo de elemento
     * @param {string} type - Tipo de elemento
     * @returns {string} Color hexadecimal
     */
    getItemColor(type) {
        const colors = {
            chart: '#4CAF50',
            table: '#2196F3',
            text: '#FF9800',
            color: '#9C27B0',
            filter: '#F44336',
            pdf: '#607D8B'
        };
        return colors[type] || '#666666';
    }

    /**
     * Actualiza el mapa de elementos del canvas
     */
    updateCanvasItems() {
        this.canvasItems.clear();
        for (let i = 0; i < this.state.dashboardItems.length; i++) {
            const item = this.state.dashboardItems[i];
            // Asignar valores por defecto si no existen
            if (item.canvasX === undefined || item.canvasY === undefined) {
                item.canvasX = 50 + Math.random() * (this.canvasBounds.width - 200);
                item.canvasY = 50 + Math.random() * (this.canvasBounds.height - 150);
                item.width = 180;
                item.height = 120;
                item.color = this.getItemColor(item.type);
            }
            this.canvasItems.set(item.id, item);
        }
    }

    /**
     * Renderiza el contenido del canvas
     */
    renderCanvas() {
        if (!this.ctx || !this.canvas) return;

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Aplicar transformaciones (zoom)
        this.ctx.save();
        this.ctx.scale(this.state.canvasZoom, this.state.canvasZoom);

        this.drawGrid();        // Dibujar cuadrícula de fondo

        // Dibujar todos los elementos
        const items = Array.from(this.canvasItems.values());
        for (let i = 0; i < items.length; i++) {
            this.drawCanvasItem(items[i]);
        }

        this.drawConnections(); // Dibujar conexiones entre elementos

        this.ctx.restore();

        this.drawZoomInfo();    // Mostrar información de zoom
    }

    /**
     * Dibuja la cuadrícula de fondo del canvas
     */
    drawGrid() {
        if (!this.ctx || !this.canvasBounds) return;

        const gridSize = 20;
        const width = this.canvasBounds.width;
        const height = this.canvasBounds.height;

        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 0.5;

        // Dibujar líneas verticales
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Dibujar líneas horizontales
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Dibuja un elemento individual en el canvas
     * @param {Object} item - Elemento a dibujar
     */
    drawCanvasItem(item) {
        if (!this.ctx) return;

        const canvasX = item.canvasX;
        const canvasY = item.canvasY;
        const width = item.width;
        const height = item.height;
        const color = item.color;
        const type = item.type;
        const content = item.content;

        // Aplicar sombra
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Dibujar rectángulo del elemento
        this.ctx.fillStyle = color + '20';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(canvasX, canvasY, width, height);
        this.ctx.strokeRect(canvasX, canvasY, width, height);

        // Remover sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Dibujar icono
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = color;
        this.ctx.fillText(this.icons[type], canvasX + 10, canvasY + 30);

        // Dibujar título
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(
            type.charAt(0).toUpperCase() + type.slice(1),
            canvasX + 45,
            canvasY + 30
        );

        // Dibujar contenido (texto envuelto)
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#666';
        const lines = this.wrapText(content, canvasX + 10, canvasY + 50, width - 20);
        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], canvasX + 10, canvasY + 50 + (i * 14));
        }

        this.drawPriorityBadge(item);
    }

    /**
     * Divide texto en líneas para que quepa en el ancho disponible
     * @param {string} text - Texto a dividir
     * @param {number} x - Posición x inicial
     * @param {number} y - Posición y inicial
     * @param {number} maxWidth - Ancho máximo disponible
     * @returns {string[]} Array de líneas de texto
     */
    wrapText(text, x, y, maxWidth) {
        if (!this.ctx) return [text];

        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines.slice(0, 3); // Limitar a 3 líneas
    }

    /**
     * Dibuja la etiqueta de prioridad en un elemento
     * @param {Object} item - Elemento al que agregar la etiqueta
     */
    drawPriorityBadge(item) {
        if (!this.ctx) return;

        const priorityColors = {
            Alta: '#f44336',
            Media: '#ff9800',
            Baja: '#4caf50'
        };

        const badgeWidth = 40;
        const badgeHeight = 16;
        const x = item.canvasX + item.width - badgeWidth - 5;
        const y = item.canvasY + 5;

        // Dibujar fondo de la etiqueta
        this.ctx.fillStyle = priorityColors[item.priority] || '#666';
        this.ctx.fillRect(x, y, badgeWidth, badgeHeight);

        // Dibujar texto de la etiqueta
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(item.priority, x + badgeWidth / 2, y + 11);
        this.ctx.textAlign = 'left';
    }

    /**
     * Dibuja las conexiones entre elementos en el canvas
     */
    drawConnections() {
        if (!this.ctx || this.connections.length === 0) return;

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]); // Línea punteada

        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            const fromItem = this.canvasItems.get(connection.from);
            const toItem = this.canvasItems.get(connection.to);

            if (fromItem && toItem) {
                const fromX = fromItem.canvasX + fromItem.width / 2;
                const fromY = fromItem.canvasY + fromItem.height;
                const toX = toItem.canvasX + toItem.width / 2;
                const toY = toItem.canvasY;

                // Dibujar línea de conexión
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
            }
        }

        this.ctx.setLineDash([]); // Restaurar línea sólida
    }

    /**
     * Dibuja la información de zoom en el canvas
     */
    drawZoomInfo() {
        if (!this.ctx) return;

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Restaurar transformación

        // Dibujar fondo del indicador de zoom
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 80, 25);

        // Dibujar texto del zoom
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Zoom: ' + Math.round(this.state.canvasZoom * 100) + '%', 20, 25);

        this.ctx.restore();
    }

    // Agregar estos métodos a tu clase DashboardEditor
    action;
    projectId;
    type;

    /**
     * Aumenta el zoom del canvas
     */
    zoomIn() {
        this.state.canvasZoom *= 1.1;
        this.state.canvasZoom = Math.min(3, this.state.canvasZoom);
        this.renderCanvas();
    }

    /**
     * Disminuye el zoom del canvas
     */
    zoomOut() {
        this.state.canvasZoom /= 1.1;
        this.state.canvasZoom = Math.max(0.1, this.state.canvasZoom);
        this.renderCanvas();
    }

    /**
     * Restablece el zoom del canvas al valor por defecto
     */
    resetZoom() {
        this.state.canvasZoom = 1.0;
        this.renderCanvas();
    }

    /**
     * Guarda el estado actual en localStorage
     */
    saveState() {
        try {
            const data = JSON.parse(localStorage.getItem('dashboardData')) || {};
            data[this.state.currentProject] = this.state.dashboardItems;
            localStorage.setItem('dashboardData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
            this.showNotification('Error al guardar el dashboard');
        }
    }

    /**
     * Carga el estado guardado desde localStorage
     */
    loadState() {
        try {
            const data = JSON.parse(localStorage.getItem('dashboardData')) || {};
            this.state.dashboardItems = data[this.state.currentProject] || [];
            this.updateCanvasItems();
        } catch (error) {
            console.error('Error loading state:', error);
            this.state.dashboardItems = [];
        }
    }

    /**
     * Renderiza la vista previa del dashboard
     */
    renderDashboard() {
        if (!this.previewGrid) return;

        // Filtrar elementos según filtros aplicados
        const filteredItems = this.state.dashboardItems.filter(function (item) {
            return this.applyFilters(item);
        }.bind(this));

        // Mostrar estado vacío si no hay elementos
        if (filteredItems.length === 0) {
            this.previewGrid.innerHTML = '<div class="empty-state"><p>No hay elementos para mostrar</p><p>Usa el panel de agregar para incluir nuevos elementos</p></div>';
            return;
        }

        // Generar HTML para las tarjetas de vista previa
        let html = '';
        for (let i = 0; i < filteredItems.length; i++) {
            const item = filteredItems[i];
            const typeFormatted = item.type.charAt(0).toUpperCase() + item.type.slice(1);
            const dateFormatted = new Date(item.createdAt).toLocaleDateString();

            html += '<div class="preview-card" data-id="' + item.id + '">' +
                '<div class="card-header">' +
                '<span class="card-icon">' + this.icons[item.type] + '</span>' +
                '<span class="card-title">' + typeFormatted + '</span>' +
                '<span class="card-badge ' + item.priority.toLowerCase() + '">' + item.priority + '</span>' +
                '</div>' +
                '<div class="card-content">' + item.content + '</div>' +
                '<div class="card-actions">' +
                '<button class="card-btn btn-edit">Editar</button>' +
                '<button class="card-btn btn-delete primary">Eliminar</button>' +
                '</div>' +
                '<div class="card-meta">' +
                '<small>Creado: ' + dateFormatted + '</small>' +
                '</div>' +
                '</div>';
        }
        this.previewGrid.innerHTML = html;
    }

    /**
     * Aplica los filtros actuales a un elemento
     * @param {Object} item - Elemento a evaluar
     * @returns {boolean} True si el elemento pasa los filtros
     */
    applyFilters(item) {
        const priorityFilter = this.filters.priority ? this.filters.priority.value : 'all';
        const deviceFilter = this.filters.device ? this.filters.device.value : 'all';
        const regionFilter = this.filters.region ? this.filters.region.value : 'all';
        const newUsersFilter = this.filters.newUsers ? this.filters.newUsers.checked : false;

        // Verificar cada filtro
        if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
        if (deviceFilter !== 'all' && item.device !== deviceFilter) return false;
        if (regionFilter !== 'all' && item.region !== regionFilter) return false;
        return !(newUsersFilter && !item.newUsers);


    }

    /**
     * Elimina todos los elementos de un tipo específico
     * @param {string} type - Tipo de elementos a eliminar
     */
    deleteItem(type) {
        if (!type) return;

        // Confirmar eliminación
        if (!confirm('¿Estás seguro de que quieres eliminar todos los elementos de tipo ' + type + '?')) {
            if (this.sidebarDelete) {
                this.sidebarDelete.value = '';
            }
            return;
        }

        const initialLength = this.state.dashboardItems.length;
        // Filtrar elementos manteniendo solo los que NO son del tipo especificado
        this.state.dashboardItems = this.state.dashboardItems.filter(function (item) {
            return item.type !== type;
        });

        // Verificar si se eliminaron elementos
        if (initialLength === this.state.dashboardItems.length) {
            this.showNotification('No se encontraron elementos de tipo ' + type);
        } else {
            this.updateCanvasItems();
            this.renderDashboard();
            this.renderCanvas();
            this.saveState();
            this.showNotification('Elementos de tipo ' + type + ' eliminados correctamente');
        }

        // Resetear selector de eliminación
        if (this.sidebarDelete) {
            this.sidebarDelete.value = '';
        }
    }

    /**
     * Maneja las acciones de gestión del dashboard
     */
    handleManagement() {
        const actions = {
            saveDashboard: function () {
                this.saveState();
                this.showNotification('Dashboard guardado correctamente');
            }.bind(this),
            loadDashboard: function () {
                this.loadState();
                this.renderDashboard();
                this.renderCanvas();
                this.showNotification('Dashboard cargado correctamente');
            }.bind(this),
            previewMode: function () {
                this.togglePreview();
            }.bind(this),
            exportData: function () {
                this.exportData();
            }.bind(this)
        };

        if (actions[this.action]) {
            actions[this.action]();
        } else {
            console.warn('Unknown action: ' + this.action);
            this.showNotification('Acción desconocida: ' + this.action);
        }

        // Resetear selector de gestión
        if (this.managementSelect) {
            this.managementSelect.value = '';
        }
    }

    /**
     * Cambia al proyecto especificado
     */
    switchProject() {
        this.state.currentProject = this.projectId;

        // Actualizar estado visual de los botones de proyecto
        if (this.projects) {
            this.projects.forEach(function (btn) {
                btn.classList.toggle('active', btn.dataset.project === this.projectId);
            });
        }

        // Cargar y renderizar el nuevo proyecto
        this.loadState();
        this.renderDashboard();
        this.renderCanvas();
        let projectId;
        this.showNotification('Proyecto ' + projectId + ' cargado');
    }

    /**
     * Edita el contenido de un elemento
     * @param {number} id - ID del elemento a editar
     */
    editItem(id) {
        const item = this.state.dashboardItems.find(function (i) {
            return i.id === id;
        });
        if (!item) {
            this.showNotification('Elemento no encontrado');
            return;
        }

        // Solicitar nuevo contenido al usuario
        const newContent = prompt('Editar contenido:', item.content);
        if (newContent && newContent.trim()) {
            item.content = newContent.trim();
            item.updatedAt = new Date().toISOString();
            this.renderDashboard();
            this.renderCanvas();
            this.saveState();
            this.showNotification('Elemento actualizado correctamente');
        }
    }

    /**
     * Elimina un elemento específico
     * @param {number} id - ID del elemento a eliminar
     */
    removeItem(id) {
        const item = this.state.dashboardItems.find(function (i) {
            return i.id === id;
        });
        if (!item) {
            this.showNotification('Elemento no encontrado');
            return;
        }

        // Confirmar eliminación
        if (!confirm('¿Estás seguro de que quieres eliminar este elemento ' + item.type + '?')) return;

        // Filtrar elemento eliminado
        this.state.dashboardItems = this.state.dashboardItems.filter(function (i) {
            return i.id !== id;
        });
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();
        this.showNotification('Elemento eliminado correctamente');
    }

    /**
     * Alterna entre modo vista previa y modo edición
     */
    togglePreview() {
        this.state.isPreviewMode = !this.state.isPreviewMode;
        if (this.workspace) {
            this.workspace.classList.toggle('preview-mode', this.state.isPreviewMode);
        }

        this.showNotification(this.state.isPreviewMode ? 'Modo vista previa activado' : 'Modo vista previa desactivado');
    }

    /**
     * Exporta los datos del dashboard como archivo JSON
     */
    exportData() {
        try {
            const data = {
                project: this.state.currentProject,
                exportDate: new Date().toISOString(),
                items: this.state.dashboardItems
            };

            // Crear y descargar archivo
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-' + this.state.currentProject + '-' + Date.now() + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Datos exportados correctamente');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error al exportar datos');
        }
    }

    /**
     * Muestra una notificación al usuario
     * @param {string} message - Mensaje a mostrar
     */
    showNotification(message) {
        if (this.type === undefined) this.type = 'success';

        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'notification ' + this.type;
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: ' + (this.type === 'error' ? '#f44336' : this.type === 'warning' ? '#ff9800' : '#4CAF50') + '; color: white; border-radius: 4px; z-index: 1000; animation: slideIn 0.3s ease; max-width: 300px; word-wrap: break-word;';

        document.body.appendChild(notification);

        // Eliminar notificación después de 3 segundos
        setTimeout(function () {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

/**
 * Inicializa el DashboardEditor cuando el DOM está listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        try {
            window.dashboardEditor = new DashboardEditor();
        } catch (error) {
            console.error('Failed to initialize DashboardEditor:', error);
        }
    });
} else {
    try {
        window.dashboardEditor = new DashboardEditor();
    } catch (error) {
        console.error('Failed to initialize DashboardEditor:', error);
    }
}