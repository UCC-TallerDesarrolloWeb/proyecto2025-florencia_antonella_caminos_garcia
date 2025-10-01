class DashboardEditor {
    constructor() {
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

        this.icons = {
            chart: '📊',
            table: '📋',
            text: '📝',
            color: '🎨',
            filter: '🔍',
            pdf: '📄'
        };

        this.state = {
            currentProject: 'personal',
            dashboardItems: [],
            isPreviewMode: false,
            canvasMode: 'grid',
            selectedItems: [],
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            canvasZoom: 1.0
        };

        this.canvasItems = new Map();
        this.connections = [];
        this.draggingItem = null;

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.setupCanvas();
            this.loadState();
            this.setupEventListeners();
            this.renderDashboard();
            this.renderCanvas();
        } catch (error) {
            console.error('Error initializing DashboardEditor:', error);
        }
    }

    setupCanvas() {
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.renderCanvas();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.canvasBounds = {
            width: rect.width,
            height: rect.height,
            centerX: rect.width / 2,
            centerY: rect.height / 2
        };
    }

    cacheElements() {
        this.canvas = document.querySelector(this.selectors.canvas);
        this.workspace = document.querySelector(this.selectors.workspace);
        this.previewGrid = document.querySelector(this.selectors.previewGrid);
        this.fileList = document.querySelector(this.selectors.fileList);
        this.sidebarAdd = document.querySelector(this.selectors.sidebarAdd);
        this.sidebarDelete = document.querySelector(this.selectors.sidebarDelete);
        this.managementSelect = document.querySelector(this.selectors.managementSelect);
        this.projects = document.querySelectorAll(this.selectors.projects);
        
        this.filters = {};
        Object.entries(this.selectors.filters).forEach(([key, selector]) => {
            this.filters[key] = document.querySelector(selector);
        });

        this.validateElements();
    }

    validateElements() {
        const requiredElements = {
            canvas: this.canvas,
            workspace: this.workspace,
            previewGrid: this.previewGrid
        };

        Object.entries(requiredElements).forEach(([name, element]) => {
            if (!element) throw new Error(`Required element ${name} not found`);
        });
    }

    setupEventListeners() {
        this.sidebarAdd?.addEventListener('change', e => this.addItem(e.target.value));
        this.sidebarDelete?.addEventListener('change', e => this.deleteItem(e.target.value));
        this.managementSelect?.addEventListener('change', e => this.handleManagement(e.target.value));
        
        this.projects.forEach(btn => {
            btn.addEventListener('click', e => this.switchProject(e.target.dataset.project));
        });

        Object.values(this.filters).forEach(filter => {
            filter?.addEventListener('change', () => {
                this.renderDashboard();
                this.renderCanvas();
            });
        });

        this.setupCanvasEventListeners();
        
        this.previewGrid?.addEventListener('click', e => {
            const cardBtn = e.target.closest('.card-btn');
            if (!cardBtn) return;

            const card = cardBtn.closest('.preview-card');
            const id = parseInt(card?.dataset.id);
            if (!id) return;

            if (cardBtn.classList.contains('btn-edit')) {
                this.editItem(id);
            } else if (cardBtn.classList.contains('btn-delete')) {
                this.removeItem(id);
            }
        });
    }

    setupCanvasEventListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', e => this.handleCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.handleCanvasMouseUp(e));
        this.canvas.addEventListener('wheel', e => this.handleCanvasWheel(e));
        this.canvas.addEventListener('dblclick', e => this.handleCanvasDoubleClick(e));
        
        this.canvas.addEventListener('touchstart', e => this.handleCanvasTouchStart(e));
        this.canvas.addEventListener('touchmove', e => this.handleCanvasTouchMove(e));
        this.canvas.addEventListener('touchend', e => this.handleCanvasTouchEnd(e));
    }

    getCanvasMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.state.canvasZoom,
            y: (e.clientY - rect.top) / this.state.canvasZoom
        };
    }

    handleCanvasMouseDown(e) {
        const pos = this.getCanvasMousePos(e);
        const item = this.getItemAtPosition(pos.x, pos.y);
        
        if (item) {
            this.draggingItem = item;
            this.state.dragStart = { ...pos };
            this.canvas.style.cursor = 'grabbing';
        } else {
            this.state.isDragging = true;
            this.state.dragStart = { ...pos };
        }
        
        e.preventDefault();
    }

    handleCanvasMouseMove(e) {
        const pos = this.getCanvasMousePos(e);
        
        if (this.draggingItem) {
            this.draggingItem.canvasX = pos.x - this.draggingItem.width / 2;
            this.draggingItem.canvasY = pos.y - this.draggingItem.height / 2;
            this.renderCanvas();
        } else if (this.state.isDragging) {

        } else {
            const item = this.getItemAtPosition(pos.x, pos.y);
            this.canvas.style.cursor = item ? 'grab' : 'default';
        }
    }

    handleCanvasMouseUp(e) {
        if (this.draggingItem) {
            this.saveState();
            this.draggingItem = null;
        }
        this.state.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    handleCanvasWheel(e) {
        e.preventDefault();
        
        const zoomIntensity = 0.1;
        const mousePos = this.getCanvasMousePos(e);
        
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = wheel > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
        
        this.state.canvasZoom *= zoomFactor;
        this.state.canvasZoom = Math.max(0.1, Math.min(3, this.state.canvasZoom));
        
        this.renderCanvas();
    }

    handleCanvasDoubleClick(e) {
        const pos = this.getCanvasMousePos(e);
        const item = this.getItemAtPosition(pos.x, pos.y);
        
        if (item) {
            this.editItem(item.id);
        } else {
            this.promptAddItemAtPosition(pos.x, pos.y);
        }
    }

    handleCanvasTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleCanvasMouseDown(mouseEvent);
        }
        e.preventDefault();
    }

    handleCanvasTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleCanvasMouseMove(mouseEvent);
        }
        e.preventDefault();
    }

    handleCanvasTouchEnd(e) {
        const mouseEvent = new MouseEvent('mouseup');
        this.handleCanvasMouseUp(mouseEvent);
        e.preventDefault();
    }

    getItemAtPosition(x, y) {
        for (const item of this.canvasItems.values()) {
            if (x >= item.canvasX && x <= item.canvasX + item.width &&
                y >= item.canvasY && y <= item.canvasY + item.height) {
                return item;
            }
        }
        return null;
    }

    promptAddItemAtPosition(x, y) {
        const type = prompt('¿Qué tipo de elemento quieres agregar? (chart, table, text, color, filter, pdf)');
        if (type && this.icons[type]) {
            this.addItem(type, x, y);
        }
    }

    addItem(type, x = null, y = null) {
        if (!type) return;

        const defaultX = x !== null ? x : 50 + Math.random() * (this.canvasBounds.width - 200);
        const defaultY = y !== null ? y : 50 + Math.random() * (this.canvasBounds.height - 150);

        const item = {
            id: Date.now() + Math.random(),
            type,
            content: `${this.icons[type]} Nuevo ${type}`,
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

        this.state.dashboardItems.push(item);
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();
        this.sidebarAdd.value = '';
        this.showNotification(`Elemento ${type} agregado correctamente`);
    }

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

    updateCanvasItems() {
        this.canvasItems.clear();
        this.state.dashboardItems.forEach(item => {
            if (item.canvasX === undefined || item.canvasY === undefined) {
                item.canvasX = 50 + Math.random() * (this.canvasBounds.width - 200);
                item.canvasY = 50 + Math.random() * (this.canvasBounds.height - 150);
                item.width = 180;
                item.height = 120;
                item.color = this.getItemColor(item.type);
            }
            this.canvasItems.set(item.id, item);
        });
    }

    renderCanvas() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.scale(this.state.canvasZoom, this.state.canvasZoom);

        this.drawGrid();
        
        this.canvasItems.forEach(item => {
            this.drawCanvasItem(item);
        });

        this.drawConnections();

        this.ctx.restore();

        this.drawZoomInfo();
    }

    drawGrid() {
        const gridSize = 20;
        const width = this.canvasBounds.width;
        const height = this.canvasBounds.height;

        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawCanvasItem(item) {
        const { canvasX, canvasY, width, height, color, type, content } = item;

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        this.ctx.fillStyle = color + '20';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(canvasX, canvasY, width, height);
        this.ctx.strokeRect(canvasX, canvasY, width, height);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = color;
        this.ctx.fillText(this.icons[type], canvasX + 10, canvasY + 30);

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), canvasX + 45, canvasY + 30);

        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#666';
        const lines = this.wrapText(content, canvasX + 10, canvasY + 50, width - 20, 12);
        lines.forEach((line, index) => {
            this.ctx.fillText(line, canvasX + 10, canvasY + 50 + (index * 14));
        });

        this.drawPriorityBadge(item);
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
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
        return lines.slice(0, 3);
    }

    drawPriorityBadge(item) {
        const priorityColors = {
            Alta: '#f44336',
            Media: '#ff9800',
            Baja: '#4caf50'
        };

        const badgeWidth = 40;
        const badgeHeight = 16;
        const x = item.canvasX + item.width - badgeWidth - 5;
        const y = item.canvasY + 5;

        this.ctx.fillStyle = priorityColors[item.priority] || '#666';
        this.ctx.fillRect(x, y, badgeWidth, badgeHeight);
        
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(item.priority, x + badgeWidth / 2, y + 11);
        this.ctx.textAlign = 'left';
    }

    drawConnections() {
        if (this.connections.length === 0) return;

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);

        this.connections.forEach(connection => {
            const fromItem = this.canvasItems.get(connection.from);
            const toItem = this.canvasItems.get(connection.to);
            
            if (fromItem && toItem) {
                const fromX = fromItem.canvasX + fromItem.width / 2;
                const fromY = fromItem.canvasY + fromItem.height;
                const toX = toItem.canvasX + toItem.width / 2;
                const toY = toItem.canvasY;

                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
            }
        });

        this.ctx.setLineDash([]);
    }

    drawZoomInfo() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 80, 25);
        
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Zoom: ${Math.round(this.state.canvasZoom * 100)}%`, 20, 25);
        
        this.ctx.restore();
    }

    saveState() {
        try {
            const data = JSON.parse(localStorage.getItem('dashboardData')) || {};
            data[this.state.currentProject] = this.state.dashboardItems;
            localStorage.setItem('dashboardData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
            this.showNotification('Error al guardar el dashboard', 'error');
        }
    }

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

    renderDashboard() {
        if (!this.previewGrid) return;

        const filteredItems = this.state.dashboardItems.filter(item => this.applyFilters(item));
        
        if (filteredItems.length === 0) {
            this.previewGrid.innerHTML = `
                <div class="empty-state">
                    <p>No hay elementos para mostrar</p>
                    <p>Usa el panel de agregar para incluir nuevos elementos</p>
                </div>
            `;
            return;
        }

        this.previewGrid.innerHTML = filteredItems.map(item => `
            <div class="preview-card" data-id="${item.id}">
                <div class="card-header">
                    <span class="card-icon">${this.icons[item.type]}</span>
                    <span class="card-title">${item.type.charAt(0).toUpperCase() + item.slice(1)}</span>
                    <span class="card-badge ${item.priority.toLowerCase()}">${item.priority}</span>
                </div>
                <div class="card-content">${item.content}</div>
                <div class="card-actions">
                    <button class="card-btn btn-edit">Editar</button>
                    <button class="card-btn btn-delete primary">Eliminar</button>
                </div>
                <div class="card-meta">
                    <small>Creado: ${new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
    }

    applyFilters(item) {
        const filterConditions = {
            priority: () => this.filters.priority.value === 'all' || item.priority === this.filters.priority.value,
            device: () => this.filters.device.value === 'all' || item.device === this.filters.device.value,
            region: () => this.filters.region.value === 'all' || item.region === this.filters.region.value,
            newUsers: () => !this.filters.newUsers.checked || item.newUsers
        };

        return Object.values(filterConditions).every(condition => condition());
    }

    deleteItem(type) {
        if (!type) return;

        if (!confirm(`¿Estás seguro de que quieres eliminar todos los elementos de tipo ${type}?`)) {
            this.sidebarDelete.value = '';
            return;
        }

        const initialLength = this.state.dashboardItems.length;
        this.state.dashboardItems = this.state.dashboardItems.filter(item => item.type !== type);
        
        if (initialLength === this.state.dashboardItems.length) {
            this.showNotification(`No se encontraron elementos de tipo ${type}`, 'warning');
        } else {
            this.updateCanvasItems();
            this.renderDashboard();
            this.renderCanvas();
            this.saveState();
            this.showNotification(`Elementos de tipo ${type} eliminados correctamente`);
        }
        
        this.sidebarDelete.value = '';
    }

    handleManagement(action) {
        const actions = {
            saveDashboard: () => {
                this.saveState();
                this.showNotification('Dashboard guardado correctamente');
            },
            loadDashboard: () => {
                this.loadState();
                this.renderDashboard();
                this.renderCanvas();
                this.showNotification('Dashboard cargado correctamente');
            },
            previewMode: () => this.togglePreview(),
            exportData: () => this.exportData()
        };

        if (actions[action]) {
            actions[action]();
        } else {
            console.warn(`Unknown action: ${action}`);
        }

        this.managementSelect.value = '';
    }

    switchProject(projectId) {
        this.state.currentProject = projectId;
        
        this.projects.forEach(btn => btn.classList.toggle('active', btn.dataset.project === projectId));
        
        this.loadState();
        this.renderDashboard();
        this.renderCanvas();
        this.showNotification(`Proyecto ${projectId} cargado`);
    }

    editItem(id) {
        const item = this.state.dashboardItems.find(i => i.id === id);
        if (!item) return;

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

    removeItem(id) {
        const item = this.state.dashboardItems.find(i => i.id === id);
        if (!item) return;

        if (!confirm(`¿Estás seguro de que quieres eliminar este elemento ${item.type}?`)) return;

        this.state.dashboardItems = this.state.dashboardItems.filter(i => i.id !== id);
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();
        this.showNotification('Elemento eliminado correctamente');
    }

    togglePreview() {
        this.state.isPreviewMode = !this.state.isPreviewMode;
        this.workspace?.classList.toggle('preview-mode', this.state.isPreviewMode);
        
        this.showNotification(
            this.state.isPreviewMode ? 'Modo vista previa activado' : 'Modo vista previa desactivado'
        );
    }

    exportData() {
        try {
            const data = {
                project: this.state.currentProject,
                exportDate: new Date().toISOString(),
                items: this.state.dashboardItems
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-${this.state.currentProject}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Datos exportados correctamente');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error al exportar datos', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardEditor = new DashboardEditor();
    });
} else {
    window.dashboardEditor = new DashboardEditor();
}