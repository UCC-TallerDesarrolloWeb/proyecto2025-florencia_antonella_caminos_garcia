// =============================================
// TASK MANAGER 
// =============================================

// noinspection JSValidateTypes
class TaskMannager {
    constructor() {
        this.config = this.initializeConfig();
        this.state = this.initializeState();
        this.elements = {};
        this.notifications = null;
        this.initialize();
    }

    /**
     * Configuración centralizada de la aplicación
     */
    initializeConfig() {
        return {
            storageKeys: {
                tasks: "tasks",
                projects: "projects",
                theme: "theme",
                dailyGoal: "dailyGoal",
                customTags: "customTags",
                tutorialShown: "tutorialShown",
                hideCompleted: "hideCompletedTasks"
            },
            defaultProjects: [
                { name: "personal", color: "#3b82f6", icon: "🏠" },
                { name: "trabajo", color: "#ef4444", icon: "💼" },
                { name: "estudios", color: "#10b981", icon: "📚" }
            ],
            priorityOrder: { Alta: 3, Media: 2, Baja: 1 },
            views: ["kanban", "calendar", "list"],
            taskTemplates: {
                reunion: {
                    title: 'Reunión Semanal',
                    description: 'Reunión de seguimiento y planificación semanal.',
                    priority: 'Media',
                    tags: ['Importante', 'Reunión'],
                    timeEstimate: '1.5',
                    subtasks: ['Preparar agenda, Enviar invitaciones, Tomar notas']
                },
                revision: {
                    title: 'Revisión de Código',
                    description: 'Revisar pull requests y asegurar la calidad del código.',
                    priority: 'Alta',
                    tags: ['Urgente', 'Técnico'],
                    timeEstimate: '2',
                    subtasks: ['Revisar cambios, Probar funcionalidad, Dar feedback']
                },
                estudio: {
                    title: 'Sesión de Estudio',
                    description: 'Tiempo dedicado al aprendizaje y estudio.',
                    priority: 'Media',
                    tags: ['Aprendizaje', 'Personal'],
                    timeEstimate: '3',
                    subtasks: ['Repasar temas, Hacer ejercicios, Tomar apuntes']
                }
            },
            colors: [
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
            ]
        };
    }


    /**
     * Estado inicial de la aplicación
     */
    initializeState() {
        const now = new Date();
        return {
            tasks: [],
            projects: [],
            currentProject: "personal",
            currentView: "kanban",
            currentEditingTask: null,
            filteredTasks: null,
            currentMonth: now.getMonth(),
            currentYear: now.getFullYear(),
            hideCompletedTasks: false,
            dailyGoal: 5,
            customTags: [],
            actionHistory: [],
            activeTimers: {},
            tutorialShown: false,
            currentDeletingTask: null,
            searchQuery: '',
            sortCriteria: 'fecha'
        };
    }

    /**
     * Inicializa proyectos por defecto si no existen
     */
    initializeDefaultProjects() {
        if (!this.state.projects || this.state.projects.length === 0) {
            this.state.projects = [...this.config.defaultProjects];
            this.setStoredData(this.config.storageKeys.projects, this.state.projects);
        }
    }

    /**
     * Punto de entrada principal - Configura toda la aplicación
     */
    initialize() {
        this.loadInitialData();
        this.initializeDefaultProjects();
        this.cacheDOMElements();
        this.setupEventHandlers();
        this.applySavedSettings();
        this.renderApplication();
        this.setupNotificationSystem();

        if (!this.state.tutorialShown) {
            this.showTutorialWithDelay();
        }
    }

    /**
     * Carga datos persistentes desde localStorage
     */
    loadInitialData() {
        const storage = this.config.storageKeys;

        this.state.tasks = this.getStoredData(storage.tasks) || [];
        this.state.hideCompletedTasks = this.getStoredData(storage.hideCompleted) === 'true';
        this.state.dailyGoal = parseInt(this.getStoredData(storage.dailyGoal)) || 5;
        this.state.customTags = this.getStoredData(storage.customTags) || [];
        this.state.tutorialShown = this.getStoredData(storage.tutorialShown) === "true";

        this.state.projects = this.getStoredData(storage.projects) || this.config.defaultProjects;

        this.applyTheme(this.getStoredData(storage.theme) || "light");
    }

    /**
     * Sistema unificado de notificaciones
     */
    setupNotificationSystem() {
        this.notifications = new NotificationManager();

        // Reemplazar método legacy por el nuevo sistema
        this.showNotification = (message, type = 'info', duration = 4000) => {
            return this.notifications.show(message, type, duration);
        };
    }

    /**
     * Obtiene datos del localStorage de forma segura
     */
    getStoredData(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (error) {
            console.warn(`Error cargando datos para clave ${key}:`, error);
            return null;
        }
    }

    /**
     * Guarda datos en localStorage con manejo de errores
     */
    setStoredData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error guardando datos para clave ${key}:`, error);
            return false;
        }
    }

    /**
     * Guarda todas las tareas en el almacenamiento
     */
    saveTasksToStorage() {
        this.setStoredData(this.config.storageKeys.tasks, this.state.tasks);
    }

    /**
     * Cachea referencias DOM críticas para mejor performance
     */
    cacheDOMElements() {
        const elements = [
            // Sidebar elements
            'sidebar', 'search-tasks-sidebar', 'sort-tasks-sidebar', 'project-list',
            'total-tasks', 'completed-tasks', 'pending-tasks', 'inprogress-tasks', 'daily-progress',
            'btn-new-task-sidebar', 'btn-new-project', 'btn-delete-completed-tasks', 'btn-delete-project',
            'btn-daily-summary', 'btn-set-goal', 'btn-add-tag', 'btn-undo', 'btn-tutorial',

            // Main view elements
            'kanban', 'board', 'calendar-view', 'list-view',
            'todo-tasks', 'inprogress-tasks', 'done-tasks', 'list-tasks-container',
            'btn-kanban-view', 'btn-calendar-view', 'btn-list-view',

            // Modal elements
            'task-form', 'project-modal', 'shortcut-help', 'delete-confirm',
            'formTask', 'taskId', 'taskTitle', 'taskDescription', 'taskProject', 'dueDate',
            'time-estimate', 'subtasks', 'task-template', 'new-comment', 'comments-list',
            'btn-show-comments', 'btn-cancel-task', 'add-comment',
            'new-project-name', 'save-project', 'cancel-project',
            'confirm-delete', 'cancel-delete', 'close-help',

            // Header elements
            'theme-toggle', 'btn-notifications', 'btn-help', 'notification-list',
            'btn-quick-add-task', 'btn-quick-add-project',

            // Calendar elements
            'calendar', 'current-month', 'prev-month', 'next-month',

            // Floating buttons
            'btn-new-task-float', 'btn-new-task-main'
        ];

        elements.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    /**
     * Configuración de eventos mejorada
     */
    setupEventHandlers() {
        this.setupGlobalEventHandlers();
        this.setupKeyboardHandlers();
        this.setupDragAndDrop();
        this.setupModalHandlers();
    }

    /**
     * Manejadores de eventos globales
     */
    setupGlobalEventHandlers() {
        // Delegación de eventos para elementos dinámicos
        document.addEventListener('click', (event) => {
            this.handleGlobalClick(event);
        });

        // Búsqueda en tiempo real
        if (this.elements['search-tasks-sidebar']) {
            this.elements['search-tasks-sidebar'].addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });
        }

        // Ordenación
        if (this.elements['sort-tasks-sidebar']) {
            this.elements['sort-tasks-sidebar'].addEventListener('change', (e) => {
                this.sortTasks(e.target.value);
            });
        }

        // Filtros de proyecto
        const filterOptions = document.getElementById('filter-options');
        if (filterOptions) {
            filterOptions.addEventListener('change', (e) => {
                this.filterTasksByCriteria(e.target.value);
            });
        }
    }

    /**
     * Manejo de clics globales
     */
    handleGlobalClick(event) {
        const target = event.target;
        const taskCard = target.closest('[data-task-id]');

        if (taskCard) {
            this.handleTaskCardClick(event, taskCard);
            return;
        }

        // Manejar clics en proyectos
        if (target.closest('.project-btn')) {
            target.closest('.project-btn');
            this.switchToProject();
            return;
        }

        // Cerrar modales al hacer clic fuera
        if (target.classList.contains('modal') || target.classList.contains('modal-overlay')) {
            this.closeAllModals();
        }
    }

    /**
     * Manejo de clics en tarjetas de tareas
     */
    handleTaskCardClick(event, taskCard) {
        const taskId = taskCard.dataset.taskId;
        const task = this.getTaskById(taskId);
        if (!task) return;

        const actionMap = {
            'btn-favorite': () => this.toggleTaskFavorite(taskId),
            'btn-timer': () => this.toggleTaskTimer(taskId),
            'btn-export': () => this.exportTaskData(taskId),
            'btn-edit-task': () => this.openTaskForm(task),
            'btn-delete-task': () => this.showDeleteConfirmation(taskId),
            'tag': () => {
                event.stopPropagation();
                const tag = event.target.dataset.tag;
                if (tag) this.searchByTag(tag);
            }
        };

        for (const [className, action] of Object.entries(actionMap)) {
            if (event.target.classList.contains(className) || event.target.closest(`.${className}`)) {
                event.preventDefault();
                event.stopPropagation();
                action();
                break;
            }
        }

        // Doble clic para editar
        if (event.detail === 2) {
            this.openTaskForm(task);
        }
    }

    /**
     * Manejadores de teclado mejorados
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (event) => {
            // Atajos globales
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'n':
                        event.preventDefault();
                        this.openTaskForm();
                        break;
                    case 'f':
                        event.preventDefault();
                        this.elements['search-tasks-sidebar']?.focus();
                        break;
                    case 's':
                        event.preventDefault();
                        if (this.state.currentEditingTask) {
                            this.handleTaskFormSubmit(event);
                        }
                        break;
                }
            }

            // Atajos de vista
            if (!event.ctrlKey && !event.metaKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        this.switchToView('kanban');
                        break;
                    case '2':
                        event.preventDefault();
                        this.switchToView('calendar');
                        break;
                    case '3':
                        event.preventDefault();
                        this.switchToView('list');
                        break;
                    case 'Escape':
                        this.closeAllModals();
                        break;
                }
            }
        });
    }

    /**
     * Sistema de drag and drop mejorado
     */
    setupDragAndDrop() {
        const columns = document.querySelectorAll('.column, [data-status]');

        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        const taskId = event.dataTransfer.getData('text/plain');
        const newStatus = event.currentTarget.dataset.status;

        if (taskId && newStatus) {
            this.updateTaskStatus(taskId, newStatus);
        }
    }

    /**
     * Manejadores de modales
     */
    setupModalHandlers() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Prevenir cierre al hacer clic dentro del modal
        document.querySelectorAll('.modal-content').forEach(modalContent => {
            modalContent.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });
    }

    /**
     * Gestión de vistas mejorada
     */
    switchToView(view) {
        if (!this.config.views.includes(view)) return;

        this.state.currentView = view;
        this.state.filteredTasks = null;

        // Actualizar botones de vista
        document.querySelectorAll('.view-toggle button').forEach(button => {
            button.classList.toggle('active', button.id === `btn-${view}-view`);
        });

        // Mostrar vista activa
        document.querySelectorAll('.view').forEach(viewElement => {
            viewElement.classList.remove('active');
        });

        const viewMap = {
            kanban: 'board',
            calendar: 'calendar-view',
            list: 'list-view'
        };

        const activeView = document.getElementById(viewMap[view]);
        if (activeView) {
            activeView.classList.add('active');
        }

        this.renderCurrentView();
        this.showNotification(`Vista cambiada a: ${view}`, 'info');
    }

    /**
     * Renderizado de vista actual
     */
    renderCurrentView() {
        const renderers = {
            kanban: () => this.renderKanbanView(),
            calendar: () => this.renderCalendarView(),
            list: () => this.renderListView()
        };

        if (renderers[this.state.currentView]) {
            renderers[this.state.currentView]();
        }

        this.updateStatistics();
    }

    /**
     * Renderizado de vista Kanban mejorado
     */
    renderKanbanView() {
        const columns = {
            'todo': this.elements['todo-tasks'],
            'inprogress': this.elements['inprogress-tasks'],
            'done': this.elements['done-tasks']
        };

        // Limpiar columnas
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = '';
        });

        const tasksToShow = this.getCurrentProjectTasks();

        if (tasksToShow.length === 0) {
            Object.values(columns).forEach(column => {
                if (column) {
                    column.innerHTML = '<div class="no-tasks-message">🎉 No hay tareas en este proyecto</div>';
                }
            });
            return;
        }

        // Renderizar tareas
        tasksToShow.forEach(task => {
            const column = columns[task.status];
            if (column) {
                column.appendChild(this.createTaskElement(task));
            }
        });

        this.updateColumnCounters();
    }

    /**
     * Creación de elemento de tarea mejorado
     */
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card priority-${task.priority.toLowerCase()}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        const dueDate = task.dueDate ?
            new Date(task.dueDate).toLocaleDateString() :
            "Sin fecha";

        const tagsHTML = task.tags && task.tags.length > 0 ?
            `<div class="task-tags">${task.tags.map(tag =>
                `<span class="tag" data-tag="${this.escapeHTML(tag)}">${this.escapeHTML(tag)}</span>`
            ).join('')}</div>` : '';

        const favoriteIcon = task.favorite ? '⭐' : '☆';
        const timerHTML = this.state.activeTimers[task.id] ?
            `<span class="timer-active" data-timer-id="${task.id}">⏱️ 0s</span>` : '';

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title-group">
                    <button class="btn-favorite" title="Marcar como favorita">${favoriteIcon}</button>
                    <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
                </div>
                <div class="task-actions">
                    <button class="btn-timer" title="Iniciar/Detener temporizador">⏱️</button>
                    <button class="btn-edit-task" title="Editar tarea">✏️</button>
                    <button class="btn-delete-task" title="Eliminar tarea">🗑️</button>
                </div>
            </div>
            <p class="task-description">${this.escapeHTML(task.description || "Sin descripción")}</p>
            ${tagsHTML}
            ${timerHTML}
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <span class="due-date">📅 ${dueDate}</span>
                ${task.timeEstimate ? `<span class="time-estimate">⏰ ${task.timeEstimate}h</span>` : ''}
            </div>
        `;

        // Configurar eventos
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });

        return taskElement;
    }

    /**
     * Gestión de formularios mejorada
     */
    openTaskForm(task = null) {
        this.state.currentEditingTask = task ? task.id : null;
        const form = this.elements['task-form'];

        if (!form) return;

        if (task) {
            // Modo edición
            this.populateTaskForm(task);
        } else {
            // Modo creación
            this.elements['formTask'].reset();
            this.elements['taskId'].value = '';
            this.elements['taskProject'].value = this.state.currentProject;
            this.elements['comments-list'].innerHTML = '<div class="empty-state">No hay comentarios</div>';
        }

        form.classList.add('active');
        this.elements['taskTitle'].focus();
    }

    /**
     * Rellenar formulario con datos de tarea
     */
    populateTaskForm(task) {
        this.elements['taskId'].value = task.id;
        this.elements['taskTitle'].value = task.title;
        this.elements['taskDescription'].value = task.description || '';
        this.elements['dueDate'].value = task.dueDate || '';
        this.elements['taskProject'].value = task.project;
        this.elements['time-estimate'].value = task.timeEstimate || '';
        this.elements['subtasks'].value = task.subtasks ? task.subtasks.join(', ') : '';

        // Prioridad
        document.querySelectorAll('input[name="priority"]').forEach(radio => {
            radio.checked = radio.value === task.priority;
        });

        // Etiquetas
        document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
            checkbox.checked = task.tags ? task.tags.includes(checkbox.value) : false;
        });

        // Comentarios
        this.renderTaskComments(task.comments || []);
    }

    /**
     * Manejo de envío de formulario mejorado
     */
    handleTaskFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const title = formData.get('taskTitle')?.trim();

        if (!title) {
            this.showNotification('El título de la tarea es obligatorio', 'error');
            return;
        }

        const taskData = this.prepareTaskData(formData);

        try {
            this.saveTask(taskData);
            this.closeTaskForm();
            this.renderApplication();
            this.showNotification('Tarea guardada correctamente', 'success');
        } catch (error) {
            this.showNotification('Error al guardar la tarea', 'error');
            console.error('Error saving task:', error);
        }
    }

    /**
     * Preparar datos de tarea
     */
    prepareTaskData(formData) {
        const isEditing = !!this.elements['taskId'].value;
        const taskId = this.elements['taskId'].value || 'task-' + Date.now();

        return {
            id: taskId,
            title: formData.get('taskTitle').trim(),
            description: formData.get('taskDescription')?.trim() || '',
            priority: formData.get('priority') || 'Media',
            dueDate: formData.get('dueDate') || '',
            project: formData.get('taskProject') || this.state.currentProject,
            status: isEditing ? this.getTaskById(taskId)?.status || 'todo' : 'todo',
            tags: Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value),
            subtasks: formData.get('subtasks') ?
                formData.get('subtasks').split(',').map(s => s.trim()).filter(s => s) : [],
            timeEstimate: formData.get('time-estimate') || '',
            timeSpent: isEditing ? this.getTaskById(taskId)?.timeSpent || 0 : 0,
            comments: isEditing ? this.getTaskById(taskId)?.comments || [] : [],
            favorite: isEditing ? this.getTaskById(taskId)?.favorite || false : false,
            createdAt: isEditing ? this.getTaskById(taskId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Búsqueda mejorada
     */
    searchTasks(query) {
        this.state.searchQuery = query.toLowerCase().trim();

        if (!this.state.searchQuery) {
            this.state.filteredTasks = null;
        } else {
            this.state.filteredTasks = this.state.tasks.filter(task =>
                task.project === this.state.currentProject &&
                (task.title.toLowerCase().includes(this.state.searchQuery) ||
                    task.description.toLowerCase().includes(this.state.searchQuery) ||
                    (task.tags && task.tags.some(tag =>
                        tag.toLowerCase().includes(this.state.searchQuery)))
                )
            );
        }

        this.renderApplication();

        if (this.state.searchQuery && this.state.filteredTasks.length === 0) {
            this.showNotification(`No se encontraron tareas para "${query}"`, 'warning');
        }
    }

    /**
     * Ordenación mejorada
     */
    sortTasks(criteria) {
        this.state.sortCriteria = criteria;
        const tasks = this.state.filteredTasks || this.getCurrentProjectTasks();

        switch (criteria) {
            case 'fecha':
                tasks.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                    return dateA - dateB;
                });
                break;
            case 'prioridad':
                tasks.sort((a, b) =>
                    this.config.priorityOrder[b.priority] - this.config.priorityOrder[a.priority]
                );
                break;
            case 'nombre':
                tasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'reciente':
                tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        this.state.filteredTasks = tasks;
        this.renderApplication();
    }

    /**
     * Tarea rápida - IMPLEMENTACIÓN COMPLETA
     */
    quickAddTask(status = 'todo') {
        const title = prompt('Título de la tarea rápida:');
        if (!title?.trim()) return;

        const taskData = {
            title: title.trim(),
            project: this.state.currentProject,
            status: status,
            priority: 'Media',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.addTask(taskData);
    }

    /**
     * Agregar tarea con datos
     */
    addTask(taskData = null) {
        if (taskData) {
            const newTask = {
                id: 'task-' + Date.now(),
                title: taskData.title || 'Nueva Tarea',
                description: taskData.description || '',
                priority: taskData.priority || 'Media',
                dueDate: taskData.dueDate || '',
                project: taskData.project || this.state.currentProject,
                status: taskData.status || 'todo',
                tags: taskData.tags || [],
                subtasks: taskData.subtasks || [],
                timeEstimate: taskData.timeEstimate || '',
                timeSpent: 0,
                comments: [],
                favorite: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.state.tasks.push(newTask);
            this.saveTasksToStorage();
            this.renderApplication();
            this.addToHistory(`Tarea creada: ${newTask.title}`);
            this.showNotification('Tarea agregada correctamente', 'success');
            return newTask;
        } else {
            this.openTaskForm();
        }
    }
    /**
     * Utilidades mejoradas
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    generateRandomColor() {
        return this.config.colors[
            Math.floor(Math.random() * this.config.colors.length)
            ];
    }

    /**
     * Cerrar todos los modales
     */
    closeAllModals() {
        document.querySelectorAll('.modal, .modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        this.state.currentEditingTask = null;
        this.state.currentDeletingTask = null;
    }

    // ... (otros métodos se mantienen similares pero mejorados)
    /**
     * Obtener tarea por ID
     */
    getTaskById(id) {
        return this.state.tasks.find(task => task.id === id);
    }

    /**
     * Obtener tareas del proyecto actual
     */
    getCurrentProjectTasks() {
        return this.state.filteredTasks ||
            this.state.tasks.filter(task => task.project === this.state.currentProject);
    }

    /**
     * Actualizar estadísticas
     */
    updateStatistics() {
        const projectTasks = this.getCurrentProjectTasks();

        this.updateTaskCounters(projectTasks);
        this.updateDailyProgress();
        this.updateColumnCounters();
        this.updateProjectCounters();
    }

    updateTaskCounters(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'inprogress').length;
        const pending = total - completed - inProgress;

        this.updateCounterElement('total-tasks', total);
        this.updateCounterElement('completed-tasks', completed);
        this.updateCounterElement('inprogress-tasks', inProgress);
        this.updateCounterElement('pending-tasks', pending);
    }

    updateCounterElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    /**
     * Actualiza progreso diario
     */
    updateDailyProgress() {
        const today = new Date().toDateString();
        const todayTasks = this.state.tasks.filter(task => {
            const taskDate = new Date(task.updatedAt).toDateString();
            return taskDate === today && task.status === 'done';
        });

        const progress = todayTasks.length;
        const goal = this.state.dailyGoal;
        const progressElement = document.getElementById('daily-progress');

        if (progressElement) {
            progressElement.textContent = `${progress}/${goal}`;

            const progressBar = document.querySelector('.progress');
            if (progressBar) {
                const percentage = Math.min((progress / goal) * 100, 100);
                progressBar.style.width = percentage + '%';
            }
        }
    }

    /**
     * Actualiza contadores de columnas
     */
    updateColumnCounters() {
        const columns = ['todo', 'inprogress', 'done'];

        columns.forEach(status => {
            const counter = document.querySelector(`#${status} .task-count, [data-status="${status}"] .task-count`);
            if (!counter) {
                return;
            }
            counter.textContent = this.state.tasks.filter(
                task => task.project === this.state.currentProject && task.status === status
            ).length;
        });
    }

    /**
     * Actualiza contadores de proyectos
     */
    updateProjectCounters() {
        const projects = this.state.projects || this.config.defaultProjects;

        projects.forEach(project => {
            const projectCount = this.state.tasks.filter(
                task => task.project === project.name
            ).length;

            const projectElement = document.querySelector(
                `[data-project="${project.name}"] .project-count`
            );

            if (projectElement) {
                projectElement.textContent = projectCount;
            }
        });
    }

    // =============================================
    // MÉTODOS DE COMENTARIOS
    // =============================================

    /**
     * Agrega comentario a tarea
     */
    addCommentToTask() {
        const commentInput = this.elements['new-comment'];
        const commentText = commentInput ? commentInput.value.trim() : '';

        if (!commentText) {
            this.showNotification('El comentario no puede estar vacío', 'warning');
            return;
        }

        if (!this.state.currentEditingTask) {
            this.showNotification('No hay una tarea seleccionada para comentar', 'error');
            return;
        }

        const task = this.getTaskById(this.state.currentEditingTask);
        if (!task) {
            this.showNotification('Tarea no encontrada', 'error');
            return;
        }

        if (!task.comments) {
            task.comments = [];
        }

        const comment = {
            id: 'comment-' + Date.now(),
            text: commentText,
            date: new Date().toISOString(),
            author: 'Usuario'
        };

        task.comments.push(comment);
        this.saveTasksToStorage();
        this.renderTaskComments(task.comments);

        if (commentInput) {
            commentInput.value = '';
        }

        this.showNotification('Comentario agregado correctamente', 'success');
        this.addToHistory(`Comentario agregado a: ${task.title}`);
    }

    /**
     * Renderiza comentarios de tarea
     */
    renderTaskComments(comments) {
        const commentsList = this.elements['comments-list'];
        if (!commentsList) return;

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<div class="empty-state">No hay comentarios</div>';
            return;
        }

        const sortedComments = comments.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        commentsList.innerHTML = sortedComments.map(comment => `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
                    <button class="btn-icon btn-delete-comment">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                <div class="comment-text">${this.escapeHTML(comment.text)}</div>
            </div>
        `).join('');
    }
    /**
     * Alterna visibilidad de comentarios
     */
    toggleCommentsVisibility() {
        const commentsSection = document.getElementById('task-comments');
        const commentsButton = this.elements['btn-show-comments'];

        if (commentsSection && commentsButton) {
            const isHidden = commentsSection.classList.toggle('hidden');
            commentsButton.innerHTML = isHidden ?
                '<span class="material-symbols-outlined">visibility</span> Mostrar Comentarios' :
                '<span class="material-symbols-outlined">visibility_off</span> Ocultar Comentarios';

            if (!isHidden && this.state.currentEditingTask) {
                const task = this.getTaskById(this.state.currentEditingTask);
                if (task) {
                    this.renderTaskComments(task.comments);
                }
            }
        }
    }

    // =============================================
    // MÉTODOS DE ELIMINACIÓN
    // =============================================

    /**
     * Elimina tareas completadas
     */
    deleteCompletedTasks() {
        const completedTasks = this.state.tasks.filter(
            task => task.project === this.state.currentProject && task.status === 'done'
        );

        if (completedTasks.length === 0) {
            this.showNotification("No hay tareas completadas para eliminar", "warning");
            return;
        }

        this.showConfirmationModal(
            'Eliminar Tareas Completadas',
            `¿Eliminar ${completedTasks.length} tareas completadas? Esta acción no se puede deshacer.`,
            () => {
                const initialLength = this.state.tasks.length;
                this.state.tasks = this.state.tasks.filter(
                    task => !(task.project === this.state.currentProject && task.status === 'done')
                );

                if (this.state.tasks.length < initialLength) {
                    this.saveTasksToStorage();
                    this.renderApplication();
                    this.addToHistory("Tareas completadas eliminadas");
                    this.showNotification(`${completedTasks.length} tareas completadas eliminadas`, "success");
                }
            }
        );
    }

    /**
     * Muestra confirmación de eliminación
     */
    showDeleteConfirmation(taskId) {
        this.state.currentDeletingTask = taskId;
        if (this.elements['delete-confirm']) {
            this.elements['delete-confirm'].classList.add('active');
        }
    }

    /**
     * Cierra modal de eliminación
     */
    closeDeleteModal() {
        if (this.elements['delete-confirm']) {
            this.elements['delete-confirm'].classList.remove('active');
        }
        this.state.currentDeletingTask = null;
    }

    /**
     * Confirma eliminación de tarea
     */
    confirmTaskDeletion() {
        if (this.state.currentDeletingTask) {
            const task = this.getTaskById(this.state.currentDeletingTask);
            this.state.tasks = this.state.tasks.filter(
                t => t.id !== this.state.currentDeletingTask
            );

            // Detener temporizador si está activo
            if (this.state.activeTimers[this.state.currentDeletingTask]) {
                delete this.state.activeTimers[this.state.currentDeletingTask];
            }

            this.saveTasksToStorage();
            this.renderApplication();
            this.addToHistory(`Tarea eliminada: ${task.title}`);
            this.showNotification("Tarea eliminada correctamente", "success");
        }
        this.closeDeleteModal();
    }

    /**
     * Elimina proyecto actual
     */
    deleteCurrentProject() {
        if (this.state.currentProject === "personal") {
            this.showNotification('No se puede eliminar el proyecto personal por defecto', 'error');
            return;
        }

        const projectTasks = this.state.tasks.filter(
            task => task.project === this.state.currentProject
        );

        this.showConfirmationModal(
            'Eliminar Proyecto',
            `¿Eliminar proyecto "${this.state.currentProject}"? Se eliminarán ${projectTasks.length} tareas.`,
            () => {
                const projects = this.state.projects || [];
                const updatedProjects = projects.filter(
                    p => p.name !== this.state.currentProject
                );

                this.state.projects = updatedProjects;
                this.setStoredData(this.config.storageKeys.projects, updatedProjects);

                // Eliminar tareas del proyecto
                const tasksBefore = this.state.tasks.length;
                this.state.tasks = this.state.tasks.filter(
                    task => task.project !== this.state.currentProject
                );
                const tasksDeleted = tasksBefore - this.state.tasks.length;

                this.saveTasksToStorage();
                this.state.currentProject = "personal";
                this.loadProjectsList();
                this.renderApplication();

                this.addToHistory(`Proyecto eliminado: ${this.state.currentProject}`);
                this.showNotification(`Proyecto eliminado (${tasksDeleted} tareas eliminadas)`, 'success');
            },
            true
        );
    }

    // =============================================
    // MÉTODOS DE TEMA Y CONFIGURACIÓN
    // =============================================

    /**
     * Alterna entre tema claro y oscuro
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        this.applyTheme(newTheme);
        this.setStoredData(this.config.storageKeys.theme, newTheme);
    }

    /**
     * Aplica tema
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Actualizar icono del botón de tema
        const themeButton = this.elements['theme-toggle'];
        if (themeButton) {
            const darkIcon = themeButton.querySelector('.dark-icon');
            const lightIcon = themeButton.querySelector('.light-icon');

            if (theme === 'dark') {
                if (darkIcon) darkIcon.style.display = 'block';
                if (lightIcon) lightIcon.style.display = 'none';
            } else {
                if (darkIcon) darkIcon.style.display = 'none';
                if (lightIcon) lightIcon.style.display = 'block';
            }
        }
    }

    /**
     * Alterna notificaciones
     */
    toggleNotifications() {
        if (this.elements['notification-list']) {
            this.elements['notification-list'].classList.toggle('active');
        }
    }

    /**
     * Muestra ayuda
     */
    showHelp() {
        if (this.elements['shortcut-help']) {
            this.elements['shortcut-help'].classList.add('active');
        }
    }

    /**
     * Cierra ayuda
     */
    closeHelp() {
        if (this.elements['shortcut-help']) {
            this.elements['shortcut-help'].classList.remove('active');
        }
    }

    // =============================================
    // MÉTODOS DE UTILIDAD
    // =============================================
    /**
     * Aplica plantilla de tarea
     */
    applyTaskTemplate(templateName) {
        const template = this.config.taskTemplates[templateName];
        if (template) {
            this.elements['taskTitle'].value = template.title;
            this.elements['taskDescription'].value = template.description;

            const priorityField = document.querySelector(`input[name="priority"][value="${template.priority}"]`);
            if (priorityField) priorityField.checked = true;

            this.elements['time-estimate'].value = template.timeEstimate;
            this.elements['subtasks'].value = template.subtasks;

            // Aplicar etiquetas
            document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
                checkbox.checked = template.tags.includes(checkbox.value);
            });

            this.showNotification(`Plantilla "${templateName}" aplicada`, 'success');
        }
    }

    /**
     * Exporta tarea a JSON
     */
    exportTaskData(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            const taskData = JSON.stringify(task, null, 2);
            const blob = new Blob([taskData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tarea-${task.title}-${task.id}.json`;
            link.click();
            URL.revokeObjectURL(url);
            this.showNotification('Tarea exportada correctamente', 'success');
        }
    }

    /**
     * Agrega etiqueta personalizada
     */
    addCustomTag() {
        const newTag = prompt("Agregar nueva etiqueta:");
        if (newTag && !this.state.customTags.includes(newTag)) {
            this.state.customTags.push(newTag);
            this.setStoredData(this.config.storageKeys.customTags, this.state.customTags);
            this.showNotification(`Etiqueta "${newTag}" agregada`, 'success');
        }
    }

    /**
     * Agrega acción al historial con límite de tamaño
     */
    addToHistory(action) {
        this.state.actionHistory.unshift({
            action: action,
            timestamp: new Date().toISOString()
        });

        // Mantener historial limitado para performance
        if (this.state.actionHistory.length > 50) {
            this.state.actionHistory.pop();
        }
    }

    /**
     * Deshace última acción
     */
    undoLastAction() {
        if (this.state.actionHistory.length === 0) {
            this.showNotification("No hay acciones para deshacer", "warning");
            return;
        }

        const lastAction = this.state.actionHistory.shift();
        this.showNotification(`Deshaciendo: ${lastAction.action}`, "info");
        this.renderApplication();
    }

    /**
     * Muestra tutorial
     */
    showTutorial() {
        const tutorialSteps = [
            "¡Bienvenido a TaskFlow Pro!",
            "1. Crea tareas usando el botón '+'",
            "2. Organízalas en proyectos diferentes",
            "3. Usa las vistas Kanban, Lista o Calendario",
            "4. Arrastra tareas entre columnas",
            "5. Establece metas diarias"
        ];

        let currentStep = 0;

        const showStep = () => {
            if (currentStep < tutorialSteps.length) {
                this.showNotification(tutorialSteps[currentStep], 'info');
                currentStep++;
                setTimeout(showStep, 2000);
            } else {
                this.setStoredData(this.config.storageKeys.tutorialShown, "true");
                this.state.tutorialShown = true;
            }
        };

        showStep();
    }

    /**
     * Muestra tutorial con retraso
     */
    showTutorialWithDelay() {
        setTimeout(() => {
            this.showTutorial();
        }, 1000);
    }

    // =============================================
    // SISTEMA DE MODALES Y UI
    // =============================================

    /**
     * Muestra un modal personalizado con contenido dinámico
     */
    showCustomModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="btn-close">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-actions">
                        ${buttons.map(btn =>
            `<button class="btn btn-${btn.type}">${btn.text}</button>`
        ).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalEvents(modal, buttons);
        return modal;
    }

    /**
     * Configura eventos para el modal
     */
    setupModalEvents(modal, buttons) {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        // Cierre por botón X o clic fuera
        modal.querySelector('.btn-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => event.target === modal && closeModal());

        // Configurar botones de acción
        modal.querySelectorAll('.btn').forEach((button, index) => {
            button.addEventListener('click', () => {
                const buttonConfig = buttons[index];
                if (buttonConfig.action === 'close') {
                    closeModal();
                } else if (typeof buttonConfig.action === 'function') {
                    buttonConfig.action();
                    closeModal();
                }
            });
        });
    }

    /**
     * Muestra modal de confirmación para acciones destructivas
     */
    showConfirmationModal(title, message, confirmAction, isDanger = false) {
        this.showCustomModal(title, `
            <div class="confirmation-content">
                <div class="warning-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `, [
            {
                text: isDanger ? 'Eliminar' : 'Confirmar',
                action: confirmAction,
                type: isDanger ? 'danger' : 'primary'
            },
            { text: 'Cancelar', action: 'close', type: 'secondary' }
        ]);
    }

    /**
     * Muestra resumen diario
     */
    showDailySummary() {
        const today = new Date().toDateString();
        const todayTasks = this.state.tasks.filter(task => {
            const taskDate = new Date(task.updatedAt).toDateString();
            return taskDate === today && task.status === 'done';
        });

        const totalTimeSpent = todayTasks.reduce((total, task) =>
            total + (task.timeSpent || 0), 0
        );

        const goalProgress = todayTasks.length;
        const goalPercentage = Math.min((goalProgress / this.state.dailyGoal) * 100, 100);

        const summaryHTML = `
            <div class="daily-summary">
                <h3>📊 Resumen Diario - ${new Date().toLocaleDateString()}</h3>
                <div class="summary-stats">
                    <div class="stat-card">
                        <span class="stat-number">${goalProgress}/${this.state.dailyGoal}</span>
                        <span class="stat-label">Tareas Completadas</span>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${goalPercentage}%"></div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.formatTime(totalTimeSpent)}</span>
                        <span class="stat-label">Tiempo Total Dedicado</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${todayTasks.length}</span>
                        <span class="stat-label">Total de Tareas</span>
                    </div>
                </div>
                ${todayTasks.length > 0 ? `
                    <div class="completed-tasks-list">
                        <h4>Tareas Completadas Hoy:</h4>
                        <ul>
                            ${todayTasks.map(task => `
                                <li>
                                    <strong>${this.escapeHTML(task.title)}</strong>
                                    ${task.timeSpent ? ` - ${this.formatTime(task.timeSpent)}` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : '<p class="empty-state">No completaste tareas hoy</p>'}
            </div>
        `;

        this.showCustomModal('Resumen Diario', summaryHTML, [
            { text: 'Cerrar', action: 'close', type: 'primary' },
            { text: 'Establecer Nueva Meta', action: () => this.setDailyGoal(), type: 'secondary' }
        ]);
    }

    /**
     * Establece meta diaria
     */
    setDailyGoal() {
        this.showCustomModal('Establecer Meta Diaria', `
            <div class="goal-setting">
                <p>¿Cuántas tareas quieres completar por día?</p>
                <input type="number" id="new-goal-input" min="1" max="50" value="${this.state.dailyGoal}" class="form-input">
                <div class="goal-suggestions">
                    <button type="button" class="btn-sm" data-goal="3">3 (Fácil)</button>
                    <button type="button" class="btn-sm" data-goal="5">5 (Normal)</button>
                    <button type="button" class="btn-sm" data-goal="8">8 (Desafiante)</button>
                </div>
            </div>
        `, [
            {
                text: 'Guardar Meta',
                action: () => {
                    const input = document.getElementById('new-goal-input');
                    const newGoal = parseInt(input.value);
                    this.saveDailyGoal(newGoal);
                },
                type: 'primary'
            },
            { text: 'Cancelar', action: 'close', type: 'secondary' }
        ]);

        // Configurar botones de sugerencia
        setTimeout(() => {
            document.querySelectorAll('[data-goal]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('new-goal-input').value = parseInt(btn.dataset.goal);
                });
            });
        }, 100);
    }

    /**
     * Guarda meta diaria
     */
    saveDailyGoal(newGoal) {
        if (!newGoal || isNaN(newGoal) || newGoal < 1) {
            this.showNotification('La meta debe ser un número mayor a 0', 'error');
            return;
        }

        this.state.dailyGoal = newGoal;
        this.setStoredData(this.config.storageKeys.dailyGoal, newGoal);
        this.updateStatistics();
        this.showNotification(`Meta diaria establecida en: ${newGoal} tareas`, 'success');
        this.closeAllModals();
    }
    saveTask(taskData) {

    }

    closeTaskForm() {

    }

    renderListView() {

    }

    renderApplication() {

    }

    filterTasksByCriteria(value) {

    }

    applySavedSettings() {

    }

    renderCalendarView() {

    }

    switchToProject() {

    }

    toggleTaskFavorite(taskId) {

    }

    toggleTaskTimer(taskId) {

    }

    searchByTag(tag) {

    }

    updateTaskStatus(taskId, newStatus) {

    }

    loadProjectsList() {

    }
}

// =============================================
// SISTEMA DE NOTIFICACIONES MEJORADO
// =============================================

/**
 * Gestor avanzado de notificaciones con animaciones y personalización
 */
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    /**
     * Inicializa el sistema de notificaciones
     */
    init() {
        this.createContainer();
        this.injectStyles();
    }

    /**
     * Crea el contenedor principal de notificaciones
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-manager';
        this.container.className = 'notification-manager';
        document.body.appendChild(this.container);
    }

    /**
     * Inyecta estilos CSS necesarios para las notificaciones
     */
    injectStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = `
      .notification-manager {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      }

      .notification {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: all;
        position: relative;
        overflow: hidden;
        border-left: 4px solid;
      }

      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }

      .notification.hide {
        transform: translateX(400px);
        opacity: 0;
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
        margin-bottom: -10px;
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .notification-icon {
        font-size: 1.4em;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .notification-message {
        flex: 1;
        color: var(--text-color);
        font-size: 0.95em;
        line-height: 1.4;
        margin: 0;
      }

      .notification-close {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        color: var(--text-muted);
        flex-shrink: 0;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: var(--text-color);
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        opacity: 0.3;
        transition: width linear;
      }

      /* Variantes de notificación */
      .notification-success { border-left-color: #10b981; color: #10b981; }
      .notification-error { border-left-color: #ef4444; color: #ef4444; }
      .notification-warning { border-left-color: #f59e0b; color: #f59e0b; }
      .notification-info { border-left-color: #3b82f6; color: #3b82f6; }
      .notification-loading { border-left-color: #8b5cf6; color: #8b5cf6; }

      /* Efectos de hover */
      .notification:hover {
        transform: translateX(0) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
      }

      .notification:hover .notification-progress {
        opacity: 0.5;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .notification-manager {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
        .notification { border-radius: 8px; }
      }
    `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Muestra una notificación con opciones avanzadas
     */
    show(message, type = 'info', duration = 5000, options = {}) {
        const id = this.generateNotificationId();
        const notification = this.createNotificationElement(id, message, type, duration, options);

        this.container.appendChild(notification);
        this.animateNotificationIn(notification);
        this.setupNotificationLifecycle(id, notification, duration, options);

        this.limitNotifications();
        return id;
    }

    /**
     * Genera un ID único para la notificación
     */
    generateNotificationId() {
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Crea el elemento DOM de la notificación
     */
    createNotificationElement(id, message, type, duration, options) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.id = id;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };

        const progressBar = duration > 0 ?
            `<div class="notification-progress" style="width: 100%"></div>` : '';

        notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${options.icon || icons[type] || icons.info}</span>
        <p class="notification-message">${message}</p>
        <button class="notification-close" title="Cerrar">×</button>
      </div>
      ${progressBar}
    `;

        return notification;
    }

    /**
     * Anima la entrada de la notificación
     */
    animateNotificationIn(notification) {
        // Forzar reflow para que la animación funcione
        notification.offsetHeight;
        notification.classList.add('show');
    }

    /**
     * Configura el ciclo de vida de la notificación
     */
    setupNotificationLifecycle(id, notification, duration, options) {
        let timeLeft = duration;

        if (duration > 0) {
            const { timeout, interval } = this.setupAutoDismiss(id, notification, duration);
            this.notifications.set(id, { element: notification, timeout, progressInterval: interval });
        } else {
            this.notifications.set(id, { element: notification });
        }

        this.setupNotificationInteractions(id, notification, duration, timeLeft);

        if (options.action) {
            this.addActionButton(notification, options.action);
        }

        if (options.options) {
            notification.classList.add('notification-pulse');
        }
    }

    /**
     * Configura el auto-descarte de la notificación
     */
    setupAutoDismiss(id, notification, duration) {
        let timeLeft = duration;
        const progressElement = notification.querySelector('.notification-progress');

        const progressInterval = setInterval(() => {
            timeLeft -= 100;
            const percentage = (timeLeft / duration) * 100;
            if (progressElement) {
                progressElement.style.width = percentage + '%';
            }
        }, 100);

        const timeout = setTimeout(() => {
            this.remove(id);
        }, duration);

        return { timeout, interval: progressInterval };
    }

    /**
     * Configura las interacciones de la notificación
     */
    setupNotificationInteractions(id, notification, duration, timeLeft) {
        // Configurar evento de cierre
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(id);
        });

        // Pausar progreso al hacer hover
        notification.addEventListener('mouseenter', () => {
            const notificationData = this.notifications.get(id);
            if (notificationData && notificationData.timeout) {
                clearTimeout(notificationData.timeout);
                clearInterval(notificationData.progressInterval);
            }
        });

        // Reanudar progreso al salir
        notification.addEventListener('mouseleave', () => {
            const notificationData = this.notifications.get(id);
            if (notificationData && duration > 0) {
                notificationData.timeout = setTimeout(() => {
                    this.remove(id);
                }, timeLeft);
            }
        });
    }

    /**
     * Agrega un botón de acción a la notificación
     */
    addActionButton(notification, action) {
        const content = notification.querySelector('.notification-content');
        const actionButton = document.createElement('button');
        actionButton.className = 'notification-action';
        actionButton.textContent = action.label;
        actionButton.style.cssText = `
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      cursor: pointer;
      margin-left: 8px;
    `;

        action.handler = function () {

        };
        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            action.handler();
            this.remove(notification.id);
        });

        content.appendChild(actionButton);
    }

    /**
     * Limita el número máximo de notificaciones visibles
     */
    limitNotifications(max = 5) {
        const notifications = Array.from(this.container.children);
        if (notifications.length > max) {
            const excess = notifications.slice(0, notifications.length - max);
            excess.forEach(notification => {
                this.remove(notification.id);
            });
        }
    }

    /**
     * Elimina notificación con animación
     */
    remove(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element, timeout, progressInterval } = notificationData;

        if (timeout) clearTimeout(timeout);
        if (progressInterval) clearInterval(progressInterval);

        element.classList.remove('show');
        element.classList.add('hide');

        setTimeout(() => {
            if (element.parentElement) {
                element.remove();
            }
            this.notifications.delete(id);
        }, 400);
    }

    /**
     * Muestra notificación de éxito
     */
    success(message, duration = 3000, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    /**
     * Muestra notificación de error
     */
    error(message, duration = 5000, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    /**
     * Muestra notificación de advertencia
     */
    warning(message, duration = 4000, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    /**
     * Muestra notificación de información
     */
    info(message, duration = 4000, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    /**
     * Muestra notificación de carga
     */
    loading(message, options = {}) {
        return this.show(message, 'loading', 0, { ...options, icon: '⏳' });
    }
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

/**
 * Inicializa la aplicación verificando compatibilidad
 */
function initializeApplication() {
    if (typeof Storage === 'undefined') {
        alert('Tu navegador no soporta almacenamiento local. La aplicación no funcionará correctamente.');
        return;
    }

    try {
        window.taskManager = new TaskMannager();

        // Manejo global de errores
        window.addEventListener('error', (event) => {
            console.error('Error no capturado:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada no manejada:', event.reason);
        });
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        alert('Error al iniciar la aplicación. Por favor recarga la página.');
    }
}

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}