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
        this.resizeTimeout = null;

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
            this.showNotification('Error al inicializar el editor', 'error');
        }
    }

    setupCanvas() {
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Could not get 2D context from canvas');
        }

        this.resizeCanvas();
        
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        var self = this;
        window.addEventListener('resize', function() {
            if (self.resizeTimeout) {
                clearTimeout(self.resizeTimeout);
            }
            self.resizeTimeout = setTimeout(function() {
                self.resizeCanvas();
                self.renderCanvas();
            }, 250);
        });
    }

    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        var container = this.canvas.parentElement;
        if (!container) return;

        var rect = container.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width);
        this.canvas.height = Math.floor(rect.height);
        
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
        
        this.filters = {
            priority: document.querySelector(this.selectors.filters.priority),
            device: document.querySelector(this.selectors.filters.device),
            region: document.querySelector(this.selectors.filters.region),
            newUsers: document.querySelector(this.selectors.filters.newUsers)
        };

        this.validateElements();
    }

    validateElements() {
        var requiredElements = {
            canvas: this.canvas,
            workspace: this.workspace,
            previewGrid: this.previewGrid
        };

        var missingElements = [];
        for (var name in requiredElements) {
            if (!requiredElements[name]) {
                missingElements.push(name);
            }
        }

        if (missingElements.length > 0) {
            throw new Error('Required elements not found: ' + missingElements.join(', '));
        }
    }

    setupEventListeners() {
        var self = this;

        if (this.sidebarAdd) {
            this.sidebarAdd.addEventListener('change', function(e) {
                self.addItem(e.target.value);
            });
        }

        if (this.sidebarDelete) {
            this.sidebarDelete.addEventListener('change', function(e) {
                self.deleteItem(e.target.value);
            });
        }

        if (this.managementSelect) {
            this.managementSelect.addEventListener('change', function(e) {
                self.handleManagement(e.target.value);
            });
        }
        
        if (this.projects) {
            this.projects.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    self.switchProject(e.target.dataset.project);
                });
            });
        }

        for (var key in this.filters) {
            var filter = this.filters[key];
            if (filter) {
                filter.addEventListener('change', function() {
                    self.renderDashboard();
                    self.renderCanvas();
                });
            }
        }

        this.setupCanvasEventListeners();
        
        if (this.previewGrid) {
            this.previewGrid.addEventListener('click', function(e) {
                var cardBtn = e.target.closest('.card-btn');
                if (!cardBtn) return;

                var card = cardBtn.closest('.preview-card');
                var id = parseInt(card.dataset.id);
                if (isNaN(id)) return;

                if (cardBtn.classList.contains('btn-edit')) {
                    self.editItem(id);
                } else if (cardBtn.classList.contains('btn-delete')) {
                    self.removeItem(id);
                }
            });
        }
    }

    setupCanvasEventListeners() {
        if (!this.canvas) return;

        var self = this;

        this.canvas.addEventListener('mousedown', function(e) {
            self.handleCanvasMouseDown(e);
        });
        this.canvas.addEventListener('mousemove', function(e) {
            self.handleCanvasMouseMove(e);
        });
        this.canvas.addEventListener('mouseup', function(e) {
            self.handleCanvasMouseUp(e);
        });
        this.canvas.addEventListener('wheel', function(e) {
            self.handleCanvasWheel(e);
        });
        this.canvas.addEventListener('dblclick', function(e) {
            self.handleCanvasDoubleClick(e);
        });
        
        this.canvas.addEventListener('touchstart', function(e) {
            self.handleCanvasTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            self.handleCanvasTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            self.handleCanvasTouchEnd(e);
        });
    }

    getCanvasMousePos(e) {
        if (!this.canvas) return { x: 0, y: 0 };
        
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.state.canvasZoom,
            y: (e.clientY - rect.top) / this.state.canvasZoom
        };
    }

    handleCanvasMouseDown(e) {
        var pos = this.getCanvasMousePos(e);
        var item = this.getItemAtPosition(pos.x, pos.y);
        
        if (item) {
            this.draggingItem = item;
            this.state.dragStart = { x: pos.x, y: pos.y };
            this.canvas.style.cursor = 'grabbing';
        } else {
            this.state.isDragging = true;
            this.state.dragStart = { x: pos.x, y: pos.y };
        }
        
        e.preventDefault();
    }

    handleCanvasMouseMove(e) {
        var pos = this.getCanvasMousePos(e);
        
        if (this.draggingItem) {
            this.draggingItem.canvasX = pos.x - this.draggingItem.width / 2;
            this.draggingItem.canvasY = pos.y - this.draggingItem.height / 2;
            this.renderCanvas();
        } else if (this.state.isDragging) {
            // Canvas panning can be implemented here
        } else {
            var item = this.getItemAtPosition(pos.x, pos.y);
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
        
        var zoomIntensity = 0.1;
        var mousePos = this.getCanvasMousePos(e);
        
        var wheel = e.deltaY < 0 ? 1 : -1;
        var zoomFactor = wheel > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
        
        this.state.canvasZoom *= zoomFactor;
        this.state.canvasZoom = Math.max(0.1, Math.min(3, this.state.canvasZoom));
        
        this.renderCanvas();
    }

    handleCanvasDoubleClick(e) {
        var pos = this.getCanvasMousePos(e);
        var item = this.getItemAtPosition(pos.x, pos.y);
        
        if (item) {
            this.editItem(item.id);
        } else {
            this.promptAddItemAtPosition(pos.x, pos.y);
        }
    }

    handleCanvasTouchStart(e) {
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            this.handleCanvasMouseDown(mouseEvent);
        }
        e.preventDefault();
    }

    handleCanvasTouchMove(e) {
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            this.handleCanvasMouseMove(mouseEvent);
        }
        e.preventDefault();
    }

    handleCanvasTouchEnd(e) {
        var mouseEvent = new MouseEvent('mouseup', { bubbles: true });
        this.handleCanvasMouseUp(mouseEvent);
        e.preventDefault();
    }

    getItemAtPosition(x, y) {
        var items = Array.from(this.canvasItems.values());
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (x >= item.canvasX && x <= item.canvasX + item.width &&
                y >= item.canvasY && y <= item.canvasY + item.height) {
                return item;
            }
        }
        return null;
    }

    promptAddItemAtPosition(x, y) {
        var type = prompt('¿Qué tipo de elemento quieres agregar? (chart, table, text, color, filter, pdf)');
        if (type && this.icons[type]) {
            this.addItem(type, x, y);
        }
    }

    addItem(type, x, y) {
        if (!type || !this.icons[type]) {
            this.showNotification('Tipo de elemento no válido', 'error');
            return;
        }

        var defaultX = x !== null && x !== undefined ? x : 50 + Math.random() * (this.canvasBounds.width - 200);
        var defaultY = y !== null && y !== undefined ? y : 50 + Math.random() * (this.canvasBounds.height - 150);

        var item = {
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

        this.state.dashboardItems.push(item);
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();
        
        if (this.sidebarAdd) {
            this.sidebarAdd.value = '';
        }
        
        this.showNotification('Elemento ' + type + ' agregado correctamente');
    }

    getItemColor(type) {
        var colors = {
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
        for (var i = 0; i < this.state.dashboardItems.length; i++) {
            var item = this.state.dashboardItems[i];
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

    renderCanvas() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.scale(this.state.canvasZoom, this.state.canvasZoom);

        this.drawGrid();
        
        var items = Array.from(this.canvasItems.values());
        for (var i = 0; i < items.length; i++) {
            this.drawCanvasItem(items[i]);
        }

        this.drawConnections();

        this.ctx.restore();

        this.drawZoomInfo();
    }

    drawGrid() {
        if (!this.ctx || !this.canvasBounds) return;

        var gridSize = 20;
        var width = this.canvasBounds.width;
        var height = this.canvasBounds.height;

        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 0.5;

        for (var x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        for (var y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawCanvasItem(item) {
        if (!this.ctx) return;

        var canvasX = item.canvasX;
        var canvasY = item.canvasY;
        var width = item.width;
        var height = item.height;
        var color = item.color;
        var type = item.type;
        var content = item.content;

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
        this.ctx.fillText(
            type.charAt(0).toUpperCase() + type.slice(1), 
            canvasX + 45, 
            canvasY + 30
        );

        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#666';
        var lines = this.wrapText(content, canvasX + 10, canvasY + 50, width - 20, 12);
        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], canvasX + 10, canvasY + 50 + (i * 14));
        }

        this.drawPriorityBadge(item);
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
        if (!this.ctx) return [text];

        var words = text.split(' ');
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = this.ctx.measureText(currentLine + " " + word).width;
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
        if (!this.ctx) return;

        var priorityColors = {
            Alta: '#f44336',
            Media: '#ff9800',
            Baja: '#4caf50'
        };

        var badgeWidth = 40;
        var badgeHeight = 16;
        var x = item.canvasX + item.width - badgeWidth - 5;
        var y = item.canvasY + 5;

        this.ctx.fillStyle = priorityColors[item.priority] || '#666';
        this.ctx.fillRect(x, y, badgeWidth, badgeHeight);
        
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(item.priority, x + badgeWidth / 2, y + 11);
        this.ctx.textAlign = 'left';
    }

    drawConnections() {
        if (!this.ctx || this.connections.length === 0) return;

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);

        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            var fromItem = this.canvasItems.get(connection.from);
            var toItem = this.canvasItems.get(connection.to);
            
            if (fromItem && toItem) {
                var fromX = fromItem.canvasX + fromItem.width / 2;
                var fromY = fromItem.canvasY + fromItem.height;
                var toX = toItem.canvasX + toItem.width / 2;
                var toY = toItem.canvasY;

                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
            }
        }

        this.ctx.setLineDash([]);
    }

    drawZoomInfo() {
        if (!this.ctx) return;

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 80, 25);
        
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Zoom: ' + Math.round(this.state.canvasZoom * 100) + '%', 20, 25);
        
        this.ctx.restore();
    }

    saveState() {
        try {
            var data = JSON.parse(localStorage.getItem('dashboardData')) || {};
            data[this.state.currentProject] = this.state.dashboardItems;
            localStorage.setItem('dashboardData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
            this.showNotification('Error al guardar el dashboard', 'error');
        }
    }

    loadState() {
        try {
            var data = JSON.parse(localStorage.getItem('dashboardData')) || {};
            this.state.dashboardItems = data[this.state.currentProject] || [];
            this.updateCanvasItems();
        } catch (error) {
            console.error('Error loading state:', error);
            this.state.dashboardItems = [];
        }
    }

    renderDashboard() {
        if (!this.previewGrid) return;

        var filteredItems = this.state.dashboardItems.filter(function(item) {
            return this.applyFilters(item);
        }.bind(this));
        
        if (filteredItems.length === 0) {
            this.previewGrid.innerHTML = '<div class="empty-state"><p>No hay elementos para mostrar</p><p>Usa el panel de agregar para incluir nuevos elementos</p></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < filteredItems.length; i++) {
            var item = filteredItems[i];
            var typeFormatted = item.type.charAt(0).toUpperCase() + item.type.slice(1);
            var dateFormatted = new Date(item.createdAt).toLocaleDateString();
            
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

    applyFilters(item) {
        var priorityFilter = this.filters.priority ? this.filters.priority.value : 'all';
        var deviceFilter = this.filters.device ? this.filters.device.value : 'all';
        var regionFilter = this.filters.region ? this.filters.region.value : 'all';
        var newUsersFilter = this.filters.newUsers ? this.filters.newUsers.checked : false;

        if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
        if (deviceFilter !== 'all' && item.device !== deviceFilter) return false;
        if (regionFilter !== 'all' && item.region !== regionFilter) return false;
        if (newUsersFilter && !item.newUsers) return false;
        
        return true;
    }

    deleteItem(type) {
        if (!type) return;

        if (!confirm('¿Estás seguro de que quieres eliminar todos los elementos de tipo ' + type + '?')) {
            if (this.sidebarDelete) {
                this.sidebarDelete.value = '';
            }
            return;
        }

        var initialLength = this.state.dashboardItems.length;
        this.state.dashboardItems = this.state.dashboardItems.filter(function(item) {
            return item.type !== type;
        });
        
        if (initialLength === this.state.dashboardItems.length) {
            this.showNotification('No se encontraron elementos de tipo ' + type, 'warning');
        } else {
            this.updateCanvasItems();
            this.renderDashboard();
            this.renderCanvas();
            this.saveState();
            this.showNotification('Elementos de tipo ' + type + ' eliminados correctamente');
        }
        
        if (this.sidebarDelete) {
            this.sidebarDelete.value = '';
        }
    }

    handleManagement(action) {
        var actions = {
            saveDashboard: function() {
                this.saveState();
                this.showNotification('Dashboard guardado correctamente');
            }.bind(this),
            loadDashboard: function() {
                this.loadState();
                this.renderDashboard();
                this.renderCanvas();
                this.showNotification('Dashboard cargado correctamente');
            }.bind(this),
            previewMode: function() {
                this.togglePreview();
            }.bind(this),
            exportData: function() {
                this.exportData();
            }.bind(this)
        };

        if (actions[action]) {
            actions[action]();
        } else {
            console.warn('Unknown action: ' + action);
            this.showNotification('Acción desconocida: ' + action, 'error');
        }

        if (this.managementSelect) {
            this.managementSelect.value = '';
        }
    }

    switchProject(projectId) {
        this.state.currentProject = projectId;
        
        if (this.projects) {
            this.projects.forEach(function(btn) {
                btn.classList.toggle('active', btn.dataset.project === projectId);
            });
        }
        
        this.loadState();
        this.renderDashboard();
        this.renderCanvas();
        this.showNotification('Proyecto ' + projectId + ' cargado');
    }

    editItem(id) {
        var item = this.state.dashboardItems.find(function(i) {
            return i.id === id;
        });
        if (!item) {
            this.showNotification('Elemento no encontrado', 'error');
            return;
        }

        var newContent = prompt('Editar contenido:', item.content);
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
        var item = this.state.dashboardItems.find(function(i) {
            return i.id === id;
        });
        if (!item) {
            this.showNotification('Elemento no encontrado', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar este elemento ' + item.type + '?')) return;

        this.state.dashboardItems = this.state.dashboardItems.filter(function(i) {
            return i.id !== id;
        });
        this.updateCanvasItems();
        this.renderDashboard();
        this.renderCanvas();
        this.saveState();
        this.showNotification('Elemento eliminado correctamente');
    }

    togglePreview() {
        this.state.isPreviewMode = !this.state.isPreviewMode;
        if (this.workspace) {
            this.workspace.classList.toggle('preview-mode', this.state.isPreviewMode);
        }
        
        this.showNotification(
            this.state.isPreviewMode ? 'Modo vista previa activado' : 'Modo vista previa desactivado'
        );
    }

    exportData() {
        try {
            var data = {
                project: this.state.currentProject,
                exportDate: new Date().toISOString(),
                items: this.state.dashboardItems
            };
            
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-' + this.state.currentProject + '-' + Date.now() + '.json';
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

    showNotification(message, type) {
        if (type === undefined) type = 'success';
        
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: ' + (type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50') + '; color: white; border-radius: 4px; z-index: 1000; animation: slideIn 0.3s ease; max-width: 300px; word-wrap: break-word;';

        document.body.appendChild(notification);

        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    destroy() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        if (this.canvas) {
            var newCanvas = this.canvas.cloneNode(true);
            if (this.canvas.parentNode) {
                this.canvas.parentNode.replaceChild(newCanvas, this.canvas);
            }
        }

        this.resizeTimeout = null;
        this.draggingItem = null;
        this.canvasItems.clear();
        this.connections = [];
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
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