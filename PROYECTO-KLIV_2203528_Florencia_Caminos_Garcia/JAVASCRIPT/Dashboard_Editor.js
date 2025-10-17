// =============================================
// DASHBOARD EDITOR - VERSIÓN COMPLETA Y FUNCIONAL
// =============================================

class DashboardEditor {
    parentElement;
    constructor() {
        this.config = this.initializeConfig();
        this.state = this.initializeState();
        this.elements = {};
        this.canvas = null;
        this.ctx = null;
        this.draggingElement = null;
        this.dragOffset = { x: 0, y: 0 };

        this.initialize();
    }

    /**
     * Configuración centralizada
     */
    initializeConfig() {
        return {
            storageKeys: {
                dashboardState: 'dashboardState',
                currentProject: 'currentProject',
                canvasZoom: 'canvasZoom'
            },
            elementTypes: {
                chart: { name: 'Gráfico', icon: '📊', color: '#3b82f6' },
                table: { name: 'Tabla', icon: '📋', color: '#10b981' },
                text: { name: 'Texto', icon: '📝', color: '#f59e0b' },
                color: { name: 'Color', icon: '🎨', color: '#8b5cf6' },
                filter: { name: 'Filtro', icon: '🔍', color: '#ef4444' },
                pdf: { name: 'PDF', icon: '📄', color: '#6b7280' }
            },
            projects: ['personal', 'trabajo', 'estudio'],
            defaultElements: {
                personal: [
                    { id: 'chart-1', type: 'chart', x: 50, y: 50, width: 300, height: 200, content: 'Gráfico de Productividad Personal' },
                    { id: 'text-1', type: 'text', x: 400, y: 50, width: 250, height: 100, content: 'Mis Objetivos Diarios' }
                ],
                trabajo: [
                    { id: 'table-1', type: 'table', x: 50, y: 50, width: 400, height: 250, content: 'Tabla de Proyectos Laborales' },
                    { id: 'filter-1', type: 'filter', x: 500, y: 50, width: 200, height: 150, content: 'Filtros de Departamento' }
                ],
                estudio: [
                    { id: 'pdf-1', type: 'pdf', x: 50, y: 50, width: 350, height: 400, content: 'Material de Estudio' },
                    { id: 'chart-2', type: 'chart', x: 450, y: 50, width: 300, height: 200, content: 'Progreso de Aprendizaje' }
                ]
            },
            canvas: {
                minZoom: 0.5,
                maxZoom: 2.0,
                defaultZoom: 1.0,
                gridSize: 20
            }
        };
    }

    /**
     * Estado inicial de la aplicación
     */
    initializeState() {
        return {
            currentProject: 'personal',
            elements: [],
            filters: {
                priority: 'all',
                device: 'all',
                region: 'all',
                newUsers: false
            },
            canvasZoom: 1.0,
            isPreviewMode: false,
            nextElementId: 1
        };
    }

    /**
     * Inicialización principal
     */
    initialize() {
        this.loadInitialData();
        this.cacheDOMElements();
        this.initializeCanvas();
        this.setupEventHandlers();
        this.renderDashboard();
        this.showNotification('Dashboard Editor cargado correctamente', 'success');
    }

    /**
     * Carga datos iniciales
     */
    loadInitialData() {
        // Cargar estado guardado
        const savedState = this.getStoredData(this.config.storageKeys.dashboardState);
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }

        // Cargar proyecto actual
        this.state.currentProject = this.getStoredData(this.config.storageKeys.currentProject) || 'personal';

        // Cargar zoom del canvas
        this.state.canvasZoom = parseFloat(this.getStoredData(this.config.storageKeys.canvasZoom)) || 1.0;

        // Cargar elementos por defecto si no hay elementos guardados
        if (!this.state.elements || this.state.elements.length === 0) {
            this.state.elements = [...(this.config.defaultElements[this.state.currentProject] || [])];
        }
    }

    /**
     * Cache de elementos DOM
     */
    cacheDOMElements() {
        const elements = [
            // Sidebar
            'sidebar-add-options', 'sidebar-delete-options', 'priority-filter',
            'device-filter', 'region-filter', 'newUsers', 'management',

            // Header
            'saveBtn', 'previewBtn', 'exportBtn',

            // Canvas
            'dashboardCanvas', 'zoomInBtn', 'zoomOutBtn', 'resetZoomBtn',

            // Preview
            'preview-container'
        ];

        elements.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });

        // Botones de proyecto
        this.elements.projectButtons = document.querySelectorAll('.project-btn');
    }

    /**
     * Inicialización del canvas
     */
    initializeCanvas() {
        this.canvas = this.elements['dashboardCanvas'];
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Configurar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Configurar eventos del canvas
        this.setupCanvasEvents();
    }

    /**
     * Ajustar tamaño del canvas
     */
    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.renderCanvas();
        }
    }

    /**
     * Configurar eventos del canvas
     */
    setupCanvasEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());

        // Soporte táctil
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleCanvasTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleCanvasMouseUp());
    }

    /**
     * Configurar manejadores de eventos
     */
    setupEventHandlers() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Eventos de filtros
        if (this.elements['priority-filter']) {
            this.elements['priority-filter'].addEventListener('change', () => this.handleFilterChange());
        }
        if (this.elements['device-filter']) {
            this.elements['device-filter'].addEventListener('change', () => this.handleFilterChange());
        }
        if (this.elements['region-filter']) {
            this.elements['region-filter'].addEventListener('change', () => this.handleFilterChange());
        }
        if (this.elements['newUsers']) {
            this.elements['newUsers'].addEventListener('change', () => this.handleFilterChange());
        }

        // Actualizar botones de proyecto activos
        this.updateProjectButtons();
    }

    /**
     * Manejado de teclado
     * @param {number} event 
     */
    handleKeyboard(event) {
        // Atajos globales
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.saveState();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportData();
                    break;
                case 'p':
                    event.preventDefault();
                    this.togglePreview();
                    break;
            }
        }

        // Eliminar elemento seleccionado
        if (event.key === 'Delete' && this.draggingElement) {
            this.deleteElement(this.draggingElement.id);
        }

        // Navegación entre proyectos con números
        if (event.key >= '1' && event.key <= '3') {
            const projectIndex = parseInt(event.key) - 1;
            const project = this.config.projects[projectIndex];
            if (project) {
                this.switchProject(project);
            }
        }
    }

    /**
     * Cambiar proyecto
     * @param {null} [project=null] 
     */
    switchProject(project = null) {
        // Determinar proyecto desde el botón clickeado
        if (!project && event) {
            const button = event.target.closest('.project-btn');
            if (button) {
                project = button.dataset.project;
            }
        }

        if (!project || !this.config.projects.includes(project)) {
            return;
        }

        // Guardar estado actual antes de cambiar
        this.saveProjectState();

        // Cambiar proyecto
        this.state.currentProject = project;

        // Cargar elementos del proyecto
        this.loadProjectElements();

        // Actualizar UI
        this.updateProjectButtons();
        this.renderDashboard();

        this.showNotification(`Proyecto cambiado a: ${project}`, 'info');
    }

    /**
     * Guardar estado del proyecto actual
     */
    saveProjectState() {
        const projectData = {
            elements: this.state.elements,
            filters: this.state.filters
        };

        localStorage.setItem(`dashboard_${this.state.currentProject}`, JSON.stringify(projectData));
    }

    /**
     * Cargar elementos del proyecto
     */
    loadProjectElements() {
        const savedData = localStorage.getItem(`dashboard_${this.state.currentProject}`);

        if (savedData) {
            const projectData = JSON.parse(savedData);
            this.state.elements = projectData.elements || [];
            this.state.filters = projectData.filters || this.state.filters;
        } else {
            // Usar elementos por defecto
            this.state.elements = [...(this.config.defaultElements[this.state.currentProject] || [])];
        }
    }

    /**
     * Actualizar botones de proyecto
     */
    updateProjectButtons() {
        if (!this.elements.projectButtons) return;

        this.elements.projectButtons.forEach(button => {
            const isActive = button.dataset.project === this.state.currentProject;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }

    /**
     * Agregar elemento al dashboard
     * @param {number} type 
     */
    addItem(type) {
        if (!type) return;

        const elementType = this.config.elementTypes[type];
        if (!elementType) {
            this.showNotification('Tipo de elemento no válido', 'error');
            return;
        }

        const newElement = {
            id: `${type}-${Date.now()}`,
            type: type,
            x: 50 + (this.state.elements.length * 20),
            y: 50 + (this.state.elements.length * 20),
            width: 200,
            height: 150,
            content: `${elementType.name} ${this.state.elements.length + 1}`,
            project: this.state.currentProject,
            createdAt: new Date().toISOString()
        };

        this.state.elements.push(newElement);
        this.renderDashboard();
        this.showNotification(`${elementType.name} agregado correctamente`, 'success');

        // Resetear selector
        if (this.elements['sidebar-add-options']) {
            this.elements['sidebar-add-options'].value = '';
        }
    }

    /**
     * Eliminar elementos por tipo
     * @param {number} type 
     */
    deleteItem(type) {
        if (!type) return;

        const elementType = this.config.elementTypes[type];
        if (!elementType) {
            this.showNotification('Tipo de elemento no válido', 'error');
            return;
        }

        const elementsToDelete = this.state.elements.filter(el => el.type === type);

        if (elementsToDelete.length === 0) {
            this.showNotification(`No hay ${elementType.name.toLowerCase()}s para eliminar`, 'warning');
            return;
        }

        if (confirm(`¿Eliminar ${elementsToDelete.length} ${elementType.name.toLowerCase()}(s)?`)) {
            this.state.elements = this.state.elements.filter(el => el.type !== type);
            this.renderDashboard();
            this.showNotification(`${elementsToDelete.length} ${elementType.name.toLowerCase()}(s) eliminados`, 'success');
        }

        // Resetear selector
        if (this.elements['sidebar-delete-options']) {
            this.elements['sidebar-delete-options'].value = '';
        }
    }

    /**
     * Eliminar elemento específico
     * @param {number} elementId 
     */
    deleteElement(elementId) {
        this.state.elements = this.state.elements.filter(el => el.id !== elementId);
        this.renderDashboard();
        this.showNotification('Elemento eliminado', 'success');
    }

    /**
     * Manejar cambio de filtros
     */
    handleFilterChange() {
        this.state.filters = {
            priority: this.elements['priority-filter']?.value || 'all',
            device: this.elements['device-filter']?.value || 'all',
            region: this.elements['region-filter']?.value || 'all',
            newUsers: this.elements['newUsers']?.checked || false
        };

        this.renderDashboard();
    }

    /**
     * Renderizar dashboard completo
     */
    renderDashboard() {
        this.renderCanvas();
        this.renderPreview();
        this.updateElementCounters();
    }

    /**
     * Renderizar canvas
     */
    renderCanvas() {
        if (!this.ctx || !this.canvas) return;

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar grid
        this.drawGrid();

        // Dibujar elementos
        this.state.elements.forEach(element => {
            this.drawElement(element);
        });
    }

    /**
     * Dibujar grid en el canvas
     */
    drawGrid() {
        const gridSize = this.config.canvas.gridSize * this.state.canvasZoom;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 0.5;

        // Líneas verticales
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Dibujar elemento en el canvas
     * @param {number} element 
     */
    drawElement(element) {
        const typeConfig = this.config.elementTypes[element.type];
        if (!typeConfig) return;

        const x = element.x * this.state.canvasZoom;
        const y = element.y * this.state.canvasZoom;
        const width = element.width * this.state.canvasZoom;
        const height = element.height * this.state.canvasZoom;

        // Fondo del elemento
        this.ctx.fillStyle = typeConfig.color + '20';
        this.ctx.strokeStyle = typeConfig.color;
        this.ctx.lineWidth = 2;

        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);

        // Icono y texto
        this.ctx.fillStyle = typeConfig.color;
        this.ctx.font = '14px Arial';
        this.ctx.fillText(typeConfig.icon, x + 10, y + 25);
        this.ctx.fillText(element.content, x + 40, y + 25);

        // Indicador de tipo
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillText(typeConfig.name, x + 10, y + height - 10);

        // Resaltar elemento arrastrado
        if (this.draggingElement === element) {
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    /**
     * Renderizar vista previa
     */
    renderPreview() {
        const previewContainer = this.elements['preview-container'];
        if (!previewContainer) return;

        if (this.state.elements.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay elementos para mostrar</p>
                    <p>Usa el panel de agregar para incluir nuevos elementos</p>
                </div>
            `;
            return;
        }

        let previewHTML = '<div class="preview-grid">';

        this.state.elements.forEach(element => {
            const typeConfig = this.config.elementTypes[element.type];
            previewHTML += `
                <div class="preview-item" data-element-id="${element.id}">
                    <div class="preview-header">
                        <span class="preview-icon">${typeConfig.icon}</span>
                        <span class="preview-title">${this.escapeHTML(element.content)}</span>
                        <button class="preview-delete" onclick="window.dashboardEditor.deleteElement('${element.id}')" aria-label="Eliminar elemento">
                            🗑️
                        </button>
                    </div>
                    <div class="preview-content">
                        <p><strong>Tipo:</strong> ${typeConfig.name}</p>
                        <p><strong>Posición:</strong> ${element.x}px, ${element.y}px</p>
                        <p><strong>Tamaño:</strong> ${element.width} × ${element.height}</p>
                    </div>
                </div>
            `;
        });

        previewHTML += '</div>';
        previewContainer.innerHTML = previewHTML;
    }

    /**
     * Actualizar contadores de elementos
     */
    updateElementCounters() {
        const counters = {};

        // Contar elementos por tipo
        this.state.elements.forEach(element => {
            counters[element.type] = (counters[element.type] || 0) + 1;
        });

        // Actualizar opciones del sidebar con contadores
        Object.keys(this.config.elementTypes).forEach(type => {
            const count = counters[type] || 0;
            const option = document.querySelector(`#sidebar-add-options option[value="${type}"]`);
            if (option) {
                const typeConfig = this.config.elementTypes[type];
                option.textContent = `${typeConfig.icon} ${typeConfig.name} (${count})`;
            }
        });
    }

    /**
     * Manejar eventos del canvas - Mouse Down
     * @param {number} event 
     */
    handleCanvasMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.state.canvasZoom;
        const y = (event.clientY - rect.top) / this.state.canvasZoom;

        // Buscar elemento clickeado
        this.draggingElement = this.state.elements.find(element =>
            x >= element.x && x <= element.x + element.width &&
            y >= element.y && y <= element.y + element.height
        );

        if (this.draggingElement) {
            this.dragOffset.x = x - this.draggingElement.x;
            this.dragOffset.y = y - this.draggingElement.y;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    /**
     * Manejar eventos del canvas - Mouse Move
     * @param {number} event 
     */
    handleCanvasMouseMove(event) {
        if (!this.draggingElement) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.state.canvasZoom;
        const y = (event.clientY - rect.top) / this.state.canvasZoom;

        // Actualizar posición del elemento
        this.draggingElement.x = Math.max(0, x - this.dragOffset.x);
        this.draggingElement.y = Math.max(0, y - this.dragOffset.y);

        // Ajustar a grid
        const gridSize = this.config.canvas.gridSize;
        this.draggingElement.x = Math.round(this.draggingElement.x / gridSize) * gridSize;
        this.draggingElement.y = Math.round(this.draggingElement.y / gridSize) * gridSize;

        this.renderCanvas();
    }

    /**
     * Manejar eventos del canvas - Mouse Up
     */
    handleCanvasMouseUp() {
        if (this.draggingElement) {
            this.draggingElement = null;
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Manejar eventos táctiles del canvas
     * @param {Array} event 
     */
    handleCanvasTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleCanvasTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    /**
     * Control de zoom
     */
    zoomIn() {
        this.state.canvasZoom = Math.min(
            this.config.canvas.maxZoom,
            this.state.canvasZoom + 0.1
        );
        this.saveCanvasZoom();
        this.renderCanvas();
        this.showNotification(`Zoom: ${Math.round(this.state.canvasZoom * 100)}%`, 'info');
    }

    zoomOut() {
        this.state.canvasZoom = Math.max(
            this.config.canvas.minZoom,
            this.state.canvasZoom - 0.1
        );
        this.saveCanvasZoom();
        this.renderCanvas();
        this.showNotification(`Zoom: ${Math.round(this.state.canvasZoom * 100)}%`, 'info');
    }

    resetZoom() {
        this.state.canvasZoom = this.config.canvas.defaultZoom;
        this.saveCanvasZoom();
        this.renderCanvas();
        this.showNotification('Zoom restablecido', 'success');
    }

    /**
     * Guardar zoom del canvas
     */
    saveCanvasZoom() {
        this.setStoredData(this.config.storageKeys.canvasZoom, this.state.canvasZoom.toString());
    }

    /**
     * Manejar acciones de gestión
     */
    handleManagement() {
        const action = this.elements['management']?.value;
        if (!action) return;

        const actions = {
            saveDashboard: () => this.saveState(),
            loadDashboard: () => this.loadState(),
            previewMode: () => this.togglePreview(),
            exportData: () => this.exportData()
        };

        if (actions[action]) {
            actions[action]();
        }

        // Resetear selector
        this.elements['management'].value = '';
    }

    /**
     * Guardar estado
     */
    saveState() {
        const stateToSave = {
            elements: this.state.elements,
            filters: this.state.filters,
            canvasZoom: this.state.canvasZoom,
            currentProject: this.state.currentProject
        };

        if (this.setStoredData(this.config.storageKeys.dashboardState, stateToSave)) {
            this.showNotification('Dashboard guardado correctamente', 'success');
        } else {
            this.showNotification('Error al guardar el dashboard', 'error');
        }
    }

    /**
     * Cargar estado
     */
    loadState() {
        const savedState = this.getStoredData(this.config.storageKeys.dashboardState);
        if (savedState) {
            this.state = { ...this.state, ...savedState };
            this.renderDashboard();
            this.updateProjectButtons();
            this.showNotification('Dashboard cargado correctamente', 'success');
        } else {
            this.showNotification('No hay estado guardado', 'warning');
        }
    }

    /**
     * Alternar vista previa
     */
    togglePreview() {
        this.state.isPreviewMode = !this.state.isPreviewMode;

        const previewBtn = this.elements['previewBtn'];
        const canvasContainer = document.querySelector('.canvas-container');

        if (this.state.isPreviewMode) {
            canvasContainer.style.display = 'none';
            previewBtn.innerHTML = '<span aria-hidden="true">✏️</span> Modo Edición';
            previewBtn.setAttribute('aria-label', 'Cambiar a modo edición');
            this.showNotification('Modo vista previa activado', 'info');
        } else {
            canvasContainer.style.display = 'block';
            previewBtn.innerHTML = '<span aria-hidden="true">👁️</span> Vista Previa';
            previewBtn.setAttribute('aria-label', 'Cambiar a vista previa');
            this.showNotification('Modo edición activado', 'info');
        }
    }

    /**
     * Exportar datos
     */
    exportData() {
        const exportData = {
            project: this.state.currentProject,
            elements: this.state.elements,
            filters: this.state.filters,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-${this.state.currentProject}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(link.href);
        this.showNotification('Datos exportados correctamente', 'success');
    }

    /**
     * 
     * @param {textContent} text 
     * @returns 
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 
     * @param {number} message 
     * @param {string} type 
     */

    showNotification(message, type = 'info') {
        // Sistema simple de notificaciones
        const notification = document.createElement('div');
        notification.className = `dashboard-notification dashboard-notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Autoeliminar después de 4 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    /**
     * 
     * @param {number} key 
     * @returns {null}
     */

    getStoredData(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (error) {
            console.warn(`Error loading ${key}:`, error);
            return null;
        }
    }

    /**
     * 
     * @param {number} key 
     * @param {stringify} data 
     * @returns 
     */
    setStoredData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
}

// Inicialización de la aplicación
function initializeDashboardEditor() {
    try {
        window.dashboardEditor = new DashboardEditor();

        // Manejo global de errores
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

// Añadir estilos CSS para las notificaciones
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