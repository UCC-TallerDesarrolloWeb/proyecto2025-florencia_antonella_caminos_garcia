// =============================================
// TASK MANAGER - JavaScript Puro Optimizado
// =============================================

/**
 * Sistema completo de gestión de tareas con múltiples vistas
 * Características: Kanban, Calendario, Lista, Temporizadores, Estadísticas
 */
class TaskManager {
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
            currentDeletingTask: null
        };
    }

    // =============================================
    // INICIALIZACIÓN PRINCIPAL
    // =============================================

    /**
     * Punto de entrada principal - Configura toda la aplicación
     */
    initialize() {
        this.loadInitialData();
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

        this.applyTheme(this.getStoredData(storage.theme) || "light");
    }

    /**
     * Sistema unificado de notificaciones
     */
    setupNotificationSystem() {
        this.notifications = new NotificationManager(this);

        // Reemplazar método legacy por el nuevo sistema
        this.showNotification = (message, type = 'info', duration = 4000) => {
            return this.notifications.show(message, type, duration);
        };
    }

    // =============================================
    // GESTIÓN DE DATOS PERSISTENTES
    // =============================================

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

    // =============================================
    // CONFIGURACIÓN DE INTERFAZ Y EVENTOS
    // =============================================

    /**
     * Cachea referencias DOM críticas para mejor performance
     */
    cacheDOMElements() {
        const criticalElements = [
            'sidebar', 'kanban', 'task-form', 'project-modal',
            'shortcut-help', 'delete-confirm', 'notification-list',
            'search-tasks-sidebar', 'sort-tasks-sidebar', 'opciones',
            'task-table', 'calendar', 'current-month', 'project-list',
            'total-tasks', 'completed-tasks', 'pending-tasks',
            'btn-kanban-view', 'btn-calendar-view', 'btn-list-view',
            'prev-month', 'next-month', 'formTask', 'taskId',
            'taskTitle', 'taskDescription', 'taskProject', 'dueDate',
            'time-estimate', 'subtasks', 'task-template', 'new-comment',
            'comments-list', 'btn-new-task-sidebar', 'btn-new-project',
            'btn-delete-completed-tasks', 'btn-delete-project',
            'theme-toggle', 'btn-notifications', 'btn-help'
        ];

        criticalElements.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    /**
     * Configuración centralizada de todos los manejadores de eventos
     */
    setupEventHandlers() {
        this.setupViewHandlers();
        this.setupButtonHandlers();
        this.setupFormHandlers();
        this.setupDynamicEventHandlers();
        this.setupKeyboardHandlers();
        this.setupDragAndDrop();
    }

    /**
     * Configura manejadores para cambio de vistas
     */
    setupViewHandlers() {
        const viewButtons = ['btn-kanban-view', 'btn-calendar-view', 'btn-list-view'];

        viewButtons.forEach(buttonId => {
            const button = this.elements[buttonId];
            if (button) {
                button.addEventListener('click', () => {
                    const view = buttonId.replace('btn-', '').replace('-view', '');
                    this.switchToView(view);
                });
            }
        });

        // Navegación del calendario
        if (this.elements['prev-month']) {
            this.elements['prev-month'].addEventListener('click', () => this.navigateCalendar(-1));
        }
        if (this.elements['next-month']) {
            this.elements['next-month'].addEventListener('click', () => this.navigateCalendar(1));
        }
    }

    /**
     * Configura manejadores para botones principales
     */
    setupButtonHandlers() {
        const buttonConfig = {
            'btn-cancel-task': () => this.closeTaskForm(),
            'theme-toggle': () => this.toggleTheme(),
            'btn-notifications': () => this.toggleNotifications(),
            'btn-help': () => this.showHelp(),
            'close-help': () => this.closeHelp(),
            'btn-new-task-sidebar': () => this.openTaskForm(),
            'btn-new-task': () => this.openTaskForm(),
            'btn-new-task-float': () => this.openTaskForm(),
            'btn-new-project': () => this.openProjectModal(),
            'btn-delete-completed-tasks': () => this.deleteCompletedTasks(),
            'btn-delete-project': () => this.deleteCurrentProject(),
            'save-project': () => this.createProjectFromModal(),
            'cancel-project': () => this.closeProjectModal(),
            'add-comment': () => this.addCommentToTask(),
            'btn-show-comments': () => this.toggleCommentsVisibility(),
            'confirm-delete': () => this.confirmTaskDeletion(),
            'cancel-delete': () => this.closeDeleteModal(),
            'btn-daily-summary': () => this.showDailySummary(),
            'btn-set-goal': () => this.setDailyGoal(),
            'btn-add-tag': () => this.addCustomTag(),
            'btn-undo': () => this.undoLastAction(),
            'btn-tutorial': () => this.showTutorial(),
            'btn-quick-add-task': () => this.addTask(),
            'btn-quick-add-project': () => this.addProject()
        };

        Object.keys(buttonConfig).forEach(buttonId => {
            const element = document.getElementById(buttonId);
            if (element) {
                element.addEventListener('click', buttonConfig[buttonId]);
            }
        });

        // Botones de acción rápida en columnas
        document.querySelectorAll('.btn-quick-add').forEach(button => {
            button.addEventListener('click', (event) => {
                const project = event.currentTarget.dataset.project || this.state.currentProject;
                const status = event.currentTarget.dataset.status || 'todo';
                this.addTask({
                    title: 'Nueva Tarea',
                    project: project,
                    status: status
                });
            });
        });
    }

    /**
     * Configura manejadores para formularios
     */
    setupFormHandlers() {
        // Formulario principal de tareas
        if (this.elements['formTask']) {
            this.elements['formTask'].addEventListener('submit', (event) => {
                this.handleTaskFormSubmit(event);
            });
        }

        // Búsqueda y filtros
        if (this.elements['search-tasks-sidebar']) {
            this.elements['search-tasks-sidebar'].addEventListener('input', (event) => {
                this.searchTasks(event.target.value);
            });
        }

        // Ordenamiento
        ['sort-tasks-sidebar', 'sort-tasks-main'].forEach(selectId => {
            const element = document.getElementById(selectId);
            if (element) {
                element.addEventListener('change', (event) => {
                    this.sortTasks(event.target.value);
                });
            }
        });

        // Filtros
        if (this.elements['opciones']) {
            this.elements['opciones'].addEventListener('change', (event) => {
                this.filterTasksByCriteria(event.target.value);
            });
        }

        // Plantillas de tareas
        if (this.elements['task-template']) {
            this.elements['task-template'].addEventListener('change', (event) => {
                this.applyTaskTemplate(event.target.value);
            });
        }
    }

    /**
     * Configura manejadores para elementos dinámicos
     */
    setupDynamicEventHandlers() {
        document.addEventListener('click', (event) => {
            this.handleDynamicClick(event);
        });

        document.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox' && event.target.closest('.list-task-item')) {
                const taskCard = event.target.closest('[data-task-id]');
                if (taskCard) {
                    this.toggleTaskStatus(taskCard.dataset.taskId);
                }
            }
        });
    }

    /**
     * Maneja eventos de clicks en elementos dinámicos (delegación de eventos)
     */
    handleDynamicClick(event) {
        const target = event.target;
        const taskCard = target.closest('[data-task-id]');

        if (!taskCard) return;

        const taskId = taskCard.dataset.taskId;
        const task = this.getTaskById(taskId);
        if (!task) return;

        // Mapeo de acciones basado en clases CSS
        const actionMap = {
            'btn-favorite': () => this.toggleTaskFavorite(taskId),
            'btn-timer': () => this.toggleTaskTimer(taskId),
            'btn-export': () => this.exportTaskData(taskId),
            'btn-edit-task': () => this.openTaskForm(task),
            'btn-delete-task': () => this.showDeleteConfirmation(taskId),
            'project-btn': (btn) => this.switchToProject(btn.dataset.project),
            'tag': (tag) => { event.stopPropagation(); this.searchByTag(tag.dataset.tag); },
            'btn-delete-comment': (comment) => this.deleteTaskComment(comment.closest('.comment').dataset.commentId, this.state.currentEditingTask),
            'calendar-task': (taskEl) => {
                const calendarTask = this.getTaskById(taskEl.dataset.taskId);
                if (calendarTask) this.openTaskForm(calendarTask);
            }
        };

        // Ejecutar acción correspondiente
        for (const [className, action] of Object.entries(actionMap)) {
            const element = target.classList.contains(className) ? target : target.closest(`.${className}`);
            if (element) {
                action(element);
                break;
            }
        }
    }

    /**
     * Configura atajos de teclado para productividad
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (event) => {
            const keyHandlers = {
                'n': () => {
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.openTaskForm();
                    }
                },
                'k': () => {
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.switchToView('kanban');
                    }
                },
                'l': () => {
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.switchToView('list');
                    }
                },
                'c': () => {
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.switchToView('calendar');
                    }
                },
                'N': () => {
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.addTask();
                    }
                },
                'P': () => {
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.addProject();
                    }
                }
            };

            if (keyHandlers[event.key]) {
                keyHandlers[event.key]();
            }

            // Atajos numéricos para vistas (1-3)
            if (event.key >= '1' && event.key <= '3') {
                event.preventDefault();
                const viewIndex = parseInt(event.key) - 1;
                if (this.config.views[viewIndex]) {
                    this.switchToView(this.config.views[viewIndex]);
                }
            }
        });
    }

    /**
     * Configura sistema de drag and drop
     */
    setupDragAndDrop() {
        const columns = document.querySelectorAll('.task-column');

        columns.forEach(column => {
            column.addEventListener('dragover', (event) => {
                event.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (event) => {
                event.preventDefault();
                column.classList.remove('drag-over');

                const taskId = event.dataTransfer.getData('text/plain');
                const newStatus = column.id.replace('-tasks', '');
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    /**
     * Aplica configuraciones guardadas
     */
    applySavedSettings() {
        this.loadProjectsList();
    }

    // =============================================
    // GESTIÓN DE VISTAS Y RENDERIZADO
    // =============================================

    /**
     * Renderiza toda la aplicación
     */
    renderApplication() {
        this.updateStatistics();
        this.renderCurrentView();
    }

    /**
     * Cambia entre las diferentes vistas de la aplicación
     */
    switchToView(view) {
        this.state.currentView = view;
        this.state.filteredTasks = null;

        // Actualizar UI de navegación
        this.updateActiveViewButtons(view);
        this.showActiveView(view);
        this.renderCurrentView();
    }

    /**
     * Actualiza los botones de navegación de vistas
     */
    updateActiveViewButtons(activeView) {
        document.querySelectorAll('.view-toggle button').forEach(button => {
            button.classList.toggle('active', button.id === `btn-${activeView}-view`);
        });
    }

    /**
     * Muestra la vista activa y oculta las demás
     */
    showActiveView(activeView) {
        const viewMap = { kanban: 'board', calendar: 'calendar-view', list: 'list-view' };

        document.querySelectorAll('.view').forEach(viewElement => {
            viewElement.classList.remove('active');
        });

        const activeViewElement = document.getElementById(viewMap[activeView]);
        if (activeViewElement) {
            activeViewElement.classList.add('active');
        }
    }

    /**
     * Renderiza la vista actual basada en el estado
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
     * Renderiza vista Kanban con columnas y tareas
     */
    renderKanbanView() {
        const columns = ['todo', 'inprogress', 'done'].reduce((acc, status) => {
            acc[status] = document.getElementById(`${status}-tasks`);
            return acc;
        }, {});

        // Limpiar y preparar columnas
        Object.values(columns).forEach(column => column && (column.innerHTML = ''));

        const tasksToShow = this.getCurrentProjectTasks();
        const filteredTasks = this.filterCompletedTasks(tasksToShow);

        // Renderizar tareas en columnas correspondientes
        filteredTasks.forEach(task => {
            const column = columns[task.status];
            if (column) {
                column.appendChild(this.createTaskElement(task));
            }
        });

        this.updateColumnCounters();
    }

    /**
     * Obtiene tareas del proyecto actual, con soporte para filtros
     */
    getCurrentProjectTasks() {
        return this.state.filteredTasks ||
            this.state.tasks.filter(task => task.project === this.state.currentProject);
    }

    /**
     * Filtra tareas completadas según la configuración
     */
    filterCompletedTasks(tasks) {
        return this.state.hideCompletedTasks ?
            tasks.filter(task => task.status !== 'done') :
            tasks;
    }

    /**
     * Renderiza vista de lista
     */
    renderListView() {
        const listContainer = this.elements['list-tasks'];
        if (!listContainer) return;

        const tasksToShow = this.getCurrentProjectTasks();
        const filteredTasks = this.filterCompletedTasks(tasksToShow);

        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<p class="no-tasks">No hay tareas para mostrar</p>';
            return;
        }

        let listHTML = '<div class="task-list-view">';

        filteredTasks.forEach(task => {
            const dueDate = task.dueDate ?
                new Date(task.dueDate).toLocaleDateString() :
                "Sin fecha";

            listHTML += `
            <div class="list-task-item" data-task-id="${task.id}">
            <div class="list-task-main">
                <div class="list-task-header">
                <input type="checkbox" ${task.status === 'done' ? 'checked' : ''}>
                <h3 class="list-task-title">${this.escapeHTML(task.title)}</h3>
                <button class="btn-favorite">${task.favorite ? '⭐' : '☆'}</button>
                </div>
                <p class="list-task-description">${this.escapeHTML(task.description || "Sin descripción")}</p>
                ${task.tags && task.tags.length > 0 ?
                        `<div class="list-task-tags">${task.tags.map(tag =>
                            `<span class="tag" data-tag="${this.escapeHTML(tag)}">${this.escapeHTML(tag)}</span>`
                        ).join('')}</div>` : ''}
            </div>
            <div class="list-task-meta">
                <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <span class="due-date">📅 ${dueDate}</span>
                <div class="list-task-actions">
                <button class="btn-edit-task">✏️</button>
                <button class="btn-delete-task">🗑️</button>
                </div>
            </div>
            </div>
        `;
        });

        listHTML += '</div>';
        listContainer.innerHTML = listHTML;
    }

    /**
     * Renderiza vista de calendario
     */
    renderCalendarView() {
        const calendar = this.elements['calendar'];
        const currentMonthElement = this.elements['current-month'];

        if (!calendar) return;

        const firstDay = new Date(this.state.currentYear, this.state.currentMonth, 1);
        const lastDay = new Date(this.state.currentYear, this.state.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        if (currentMonthElement) {
            currentMonthElement.textContent = firstDay.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
            });
        }

        const tasksToShow = this.state.filteredTasks ||
            this.state.tasks.filter(task =>
                task.project === this.state.currentProject && task.dueDate
            );

        let calendarHTML = '<div class="calendar-grid">';
        calendarHTML += '<div class="calendar-weekdays">';

        const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        weekdays.forEach(day => {
            calendarHTML += `<div class="weekday">${day}</div>`;
        });

        calendarHTML += "</div>";
        calendarHTML += '<div class="calendar-days">';

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.state.currentYear, this.state.currentMonth, day);
            const dateString = currentDate.toISOString().split("T")[0];
            const dayTasks = tasksToShow.filter(task => task.dueDate === dateString);
            const isToday = this.isToday(currentDate);

            calendarHTML += `<div class="calendar-day ${isToday ? "today" : ""}" data-date="${dateString}">`;
            calendarHTML += `<div class="day-number">${day}</div>`;
            calendarHTML += '<div class="day-tasks">';

            dayTasks.slice(0, 2).forEach(task => {
                const priorityClass = task.priority ? `priority-${task.priority.toLowerCase()}` : "";
                calendarHTML += `
            <div class="calendar-task ${priorityClass}" 
                data-task-id="${task.id}"
                title="${task.title}">
                ${task.title}
            </div>
        `;
            });

            if (dayTasks.length > 2) {
                calendarHTML += `<div class="more-tasks">+${dayTasks.length - 2} más</div>`;
            }

            calendarHTML += "</div></div>";
        }

        calendarHTML += "</div></div>";
        calendar.innerHTML = calendarHTML;
    }

    /**
     * Navegación del calendario
     */
    navigateCalendar(direction) {
        this.state.currentMonth += direction;

        if (this.state.currentMonth < 0) {
            this.state.currentMonth = 11;
            this.state.currentYear--;
        } else if (this.state.currentMonth > 11) {
            this.state.currentMonth = 0;
            this.state.currentYear++;
        }

        this.renderCalendarView();
    }

    // =============================================
    // GESTIÓN DE TAREAS - CRUD
    // =============================================

    /**
     * Maneja la creación y actualización de tareas
     */
    handleTaskFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const title = formData.get("taskTitle")?.trim();

        if (!title) {
            this.showNotification("El título de la tarea es obligatorio.", "error");
            return;
        }

        const taskData = this.prepareTaskData(formData);
        this.saveTask(taskData);
        this.closeTaskForm();
        this.renderApplication();
        this.showNotification("Tarea guardada correctamente", "success");
    }

    /**
     * Prepara los datos de la tarea desde el formulario
     */
    prepareTaskData(formData) {
        const isEditing = !!this.elements['taskId'].value;

        return {
            id: this.elements['taskId'].value || "task-" + Date.now(),
            title: formData.get("taskTitle")?.trim(),
            description: formData.get("taskDescription")?.trim() || "",
            priority: formData.get("priority") || "Media",
            dueDate: formData.get("dueDate") || "",
            project: formData.get("taskProject") || this.state.currentProject,
            status: "todo",
            tags: Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value),
            subtasks: formData.get("subtasks") ?
                formData.get("subtasks").split(",").map(s => s.trim()).filter(s => s) : [],
            timeEstimate: formData.get("time-estimate") || "",
            createdAt: isEditing ?
                this.getTaskById(this.state.currentEditingTask)?.createdAt || new Date().toISOString() :
                new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    /**
     * Guarda o actualiza una tarea en el sistema
     */
    saveTask(taskData) {
        const existingIndex = this.state.tasks.findIndex(t => t.id === taskData.id);

        if (existingIndex !== -1) {
            // Actualizar tarea existente preservando datos sensibles
            this.updateExistingTask(existingIndex, taskData);
        } else {
            // Crear nueva tarea con valores por defecto
            this.createNewTask(taskData);
        }

        this.saveTasksToStorage();
    }

    /**
     * Actualiza una tarea existente preservando datos históricos
     */
    updateExistingTask(index, newData) {
        const existingTask = this.state.tasks[index];

        // Preservar datos que no vienen del formulario
        newData.timeSpent = existingTask.timeSpent || 0;
        newData.comments = existingTask.comments || [];
        newData.favorite = existingTask.favorite || false;

        this.state.tasks[index] = newData;
        this.addToHistory("Tarea actualizada: " + newData.title);
    }

    /**
     * Crea una nueva tarea con valores por defecto
     */
    createNewTask(taskData) {
        taskData.timeSpent = 0;
        taskData.comments = [];
        taskData.favorite = false;

        this.state.tasks.push(taskData);
        this.addToHistory("Tarea creada: " + taskData.title);
    }

    /**
     * Crea elemento DOM para tarea
     */
    createTaskElement(task) {
        const taskElement = document.createElement("li");
        taskElement.className = `task-card priority-${task.priority.toLowerCase()}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        const dueDate = task.dueDate ?
            new Date(task.dueDate).toLocaleDateString() :
            "Sin fecha";

        const tagsHTML = task.tags && task.tags.length > 0 ?
            `<div class="task-tags">${task.tags.map(tag =>
                `<span class="tag" data-tag="${this.escapeHTML(tag)}">${this.escapeHTML(tag)}</span>`
            ).join("")}</div>` : "";

        const subtasksHTML = task.subtasks && task.subtasks.length > 0 ?
            `<div class="task-subtasks">📋 ${task.subtasks.length} subtareas</div>` : "";

        const favoriteIcon = task.favorite ? "⭐" : "☆";
        const timerHTML = this.state.activeTimers[task.id] ?
            `<span class="timer-active" data-timer-id="${task.id}">⏱️ 0s</span>` :
            task.timeSpent ?
                `<span class="time-spent">⏱️ ${this.formatTime(task.timeSpent)}</span>` : "";

        taskElement.innerHTML = `
        <div class="task-header">
            <div class="task-title-group">
            <button class="btn-favorite" title="Marcar como favorita">${favoriteIcon}</button>
            <h3>${this.escapeHTML(task.title)}</h3>
            </div>
            <div class="task-actions">
            <button class="btn-timer" title="Iniciar/Detener temporizador">⏱️</button>
            <button class="btn-export" title="Exportar tarea">📤</button>
            <button class="btn-edit-task" title="Editar">✏️</button>
            </div>
        </div>
        <p>${this.escapeHTML(task.description || "Sin descripción")}</p>
        ${tagsHTML}
        ${subtasksHTML}
        ${timerHTML}
        <div class="task-meta">
            <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <span class="due-date">📅 ${dueDate}</span>
        </div>
    `;

        // Configurar eventos de drag and drop
        taskElement.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", task.id);
            taskElement.classList.add("dragging");
        });

        taskElement.addEventListener("dragend", () => {
            taskElement.classList.remove("dragging");
        });

        taskElement.addEventListener("dblclick", () => {
            this.openTaskForm(task);
        });

        return taskElement;
    }

    /**
     * Abre formulario de tarea
     */
    openTaskForm(task = null) {
        this.state.currentEditingTask = task ? task.id : null;
        const form = this.elements['task-form'];

        if (!form) return;

        if (task) {
            // Modo edición
            this.elements['taskId'].value = task.id;
            this.elements['taskTitle'].value = task.title;
            this.elements['taskDescription'].value = task.description || "";

            const priorityField = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
            if (priorityField) priorityField.checked = true;

            this.elements['dueDate'].value = task.dueDate || "";
            this.elements['taskProject'].value = task.project;
            this.elements['time-estimate'].value = task.timeEstimate || "";
            this.elements['subtasks'].value = task.subtasks ? task.subtasks.join(", ") : "";

            // Marcar etiquetas
            document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
                checkbox.checked = task.tags ? task.tags.includes(checkbox.value) : false;
            });

            // Cargar comentarios
            if (task.comments) {
                this.renderTaskComments(task.comments);
            }
        } else {
            // Modo creación
            this.elements['formTask'].reset();
            this.elements['taskId'].value = "";
            this.elements['taskProject'].value = this.state.currentProject;
            this.elements['comments-list'].innerHTML = '<div class="empty-state">No hay comentarios</div>';
        }

        form.classList.add("active");
    }

    /**
     * Cierra formulario de tarea
     */
    closeTaskForm() {
        if (this.elements['task-form']) {
            this.elements['task-form'].classList.remove("active");
        }
        this.state.currentEditingTask = null;
    }

    /**
     * Obtiene tarea por ID
     */
    getTaskById(id) {
        return this.state.tasks.find(task => task.id === id);
    }

    /**
     * Cambia estado de tarea
     */
    toggleTaskStatus(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            task.updatedAt = new Date().toISOString();
            this.saveTasksToStorage();
            this.renderApplication();
            this.addToHistory(`Tarea marcada como ${task.status === 'done' ? 'completada' : 'pendiente'}: ${task.title}`);
        }
    }

    /**
     * Alternar favorito de tarea
     */
    toggleTaskFavorite(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.favorite = !task.favorite;
            task.updatedAt = new Date().toISOString();
            this.saveTasksToStorage();
            this.renderApplication();
            this.addToHistory(`Tarea ${task.favorite ? 'marcada como favorita' : 'quitada de favoritos'}: ${task.title}`);
        }
    }

    /**
     * Actualiza estado de tarea (drag and drop)
     */
    updateTaskStatus(taskId, newStatus) {
        const task = this.getTaskById(taskId);
        if (task && task.status !== newStatus) {
            const oldStatus = task.status;
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            this.saveTasksToStorage();
            this.renderApplication();
            this.addToHistory(`Tarea movida de ${oldStatus} a ${newStatus}: ${task.title}`);
        }
    }

    // =============================================
    // MÉTODOS DE GESTIÓN DE PROYECTOS
    // =============================================

    /**
     * Cambia proyecto actual
     */
    switchToProject(project) {
        this.state.currentProject = project;
        this.state.filteredTasks = null;

        // Actualizar botones activos
        document.querySelectorAll('.project-btn').forEach(button => {
            button.classList.remove('active');
        });

        const activeButton = document.querySelector(`[data-project="${project}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Actualizar select de proyecto en formulario
        if (this.elements['taskProject']) {
            this.elements['taskProject'].value = project;
        }

        this.renderApplication();
    }

    /**
     * Carga lista de proyectos
     */
    loadProjectsList() {
        const projects = this.getStoredData(this.config.storageKeys.projects) || this.config.defaultProjects;
        const projectList = this.elements['project-list'];

        if (projectList) {
            projectList.innerHTML = projects.map(project => {
                const projectCount = this.state.tasks.filter(task => task.project === project.name).length;
                return `
            <li>
                <button class="project-btn ${this.state.currentProject === project.name ? 'active' : ''}" 
                        data-project="${project.name}" type="button">
                <span class="project-icon">${project.icon}</span>
                <span class="project-name">${project.name.charAt(0).toUpperCase() + project.name.slice(1)}</span>
                <span class="project-count">${projectCount}</span>
                </button>
            </li>
        `;
            }).join('');
        }

        // Actualizar select de proyecto en formulario
        const projectSelect = this.elements['taskProject'];
        if (projectSelect) {
            projectSelect.innerHTML = projects.map(project =>
                `<option value="${project.name}">${project.name.charAt(0).toUpperCase() + project.name.slice(1)}</option>`
            ).join('');
        }
    }

    /**
     * Abre modal de nuevo proyecto
     */
    openProjectModal() {
        if (this.elements['project-modal']) {
            this.elements['project-modal'].classList.add('active');
        }
    }

    /**
     * Cierra modal de proyecto
     */
    closeProjectModal() {
        if (this.elements['project-modal']) {
            this.elements['project-modal'].classList.remove('active');
        }
    }

    /**
     * Crea proyecto desde modal
     */
    createProjectFromModal() {
        const projectNameInput = document.getElementById('new-project-name');
        const projectName = projectNameInput ? projectNameInput.value.trim() : '';

        if (!projectName) {
            this.showNotification("Por favor ingresa un nombre para el proyecto", "error");
            return;
        }

        this.addProject({
            name: projectName,
            color: this.generateRandomColor(),
            icon: '📁'
        });
        this.closeProjectModal();
    }

    /**
     * Agrega nuevo proyecto
     */
    addProject(projectData = null) {
        if (projectData) {
            const projects = this.getStoredData(this.config.storageKeys.projects) || this.config.defaultProjects;

            const newProject = {
                name: projectData.name.toLowerCase(),
                color: projectData.color || this.generateRandomColor(),
                icon: projectData.icon || '📁'
            };

            // Verificar si el proyecto ya existe
            if (projects.find(p => p.name === newProject.name)) {
                this.showNotification('Ya existe un proyecto con ese nombre', 'warning');
                return null;
            }

            projects.push(newProject);
            this.setStoredData(this.config.storageKeys.projects, projects);

            this.loadProjectsList();
            this.switchToProject(newProject.name);

            this.addToHistory(`Proyecto creado: ${newProject.name}`);
            this.showNotification(`Proyecto "${projectData.name}" creado correctamente`, 'success');
            return newProject;
        } else {
            this.openProjectModal();
        }
    }

    /**
     * Agrega nueva tarea
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

    // =============================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // =============================================

    /**
     * Busca tareas por texto
     */
    searchTasks(query) {
        if (!query.trim()) {
            this.state.filteredTasks = null;
            this.renderApplication();
            return;
        }

        const searchTerm = query.toLowerCase();
        this.state.filteredTasks = this.state.tasks.filter(
            task => task.project === this.state.currentProject &&
                (task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm))))
        );

        this.renderApplication();
    }

    /**
     * Ordena tareas por criterio
     */
    sortTasks(criteria) {
        const tasksToSort = this.state.filteredTasks ||
            this.state.tasks.filter(task => task.project === this.state.currentProject);

        switch (criteria) {
            case "fecha":
                tasksToSort.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                    return dateA - dateB;
                });
                break;
            case "prioridad":
                tasksToSort.sort((a, b) =>
                    this.config.priorityOrder[b.priority] - this.config.priorityOrder[a.priority]
                );
                break;
            case "nombre":
            case "titulo":
                tasksToSort.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "reciente":
                tasksToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        this.state.filteredTasks = tasksToSort;
        this.renderApplication();
    }

    /**
     * Filtra tareas por criterio
     */
    filterTasksByCriteria(filter) {
        const allProjectTasks = this.state.tasks.filter(
            task => task.project === this.state.currentProject
        );

        switch (filter) {
            case "Alta":
                this.state.filteredTasks = allProjectTasks.filter(task => task.priority === "Alta");
                break;
            case "Media":
                this.state.filteredTasks = allProjectTasks.filter(task => task.priority === "Media");
                break;
            case "Baja":
                this.state.filteredTasks = allProjectTasks.filter(task => task.priority === "Baja");
                break;
            case "Urgente":
                this.state.filteredTasks = allProjectTasks.filter(task =>
                    task.tags && task.tags.includes("Urgente"));
                break;
            case "Importante":
                this.state.filteredTasks = allProjectTasks.filter(task =>
                    task.tags && task.tags.includes("Importante"));
                break;
            default:
                this.state.filteredTasks = null;
                break;
        }

        this.renderApplication();
    }

    /**
     * Busca por etiqueta
     */
    searchByTag(tagName) {
        if (this.elements['search-tasks-sidebar']) {
            this.elements['search-tasks-sidebar'].value = tagName;
            this.searchTasks(tagName);
        }
    }

    // =============================================
    // MÉTODOS DE TEMPORIZADOR
    // =============================================

    /**
     * Alterna temporizador de tarea
     */
    toggleTaskTimer(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) return;

        if (this.state.activeTimers[taskId]) {
            this.stopTaskTimer(taskId, task);
        } else {
            this.startTaskTimer(taskId, task);
        }

        this.renderApplication();
        this.updateActiveTimers();
    }

    /**
     * Detiene el temporizador y calcula el tiempo transcurrido
     */
    stopTaskTimer(taskId, task) {
        const elapsed = Math.floor((Date.now() - this.state.activeTimers[taskId].startTime) / 1000);
        task.timeSpent = (task.timeSpent || 0) + elapsed;
        delete this.state.activeTimers[taskId];

        this.saveTasksToStorage();
        this.addToHistory(`Temporizador detenido para: ${task.title} (${this.formatTime(elapsed)})`);
        this.showNotification(`Temporizador detenido: ${this.formatTime(elapsed)}`, "info");
    }

    /**
     * Inicia un nuevo temporizador para la tarea
     */
    startTaskTimer(taskId, task) {
        this.state.activeTimers[taskId] = {
            startTime: Date.now(),
            taskId: taskId
        };

        this.addToHistory(`Temporizador iniciado para: ${task.title}`);
        this.showNotification("Temporizador iniciado", "success");
    }

    /**
     * Actualiza temporizadores activos
     */
    updateActiveTimers() {
        Object.keys(this.state.activeTimers).forEach(taskId => {
            const timerElement = document.querySelector(`[data-timer-id="${taskId}"]`);
            if (timerElement) {
                const elapsed = Math.floor((Date.now() - this.state.activeTimers[taskId].startTime) / 1000);
                timerElement.textContent = `⏱️ ${this.formatTime(elapsed)}`;
            }
        });

        if (Object.keys(this.state.activeTimers).length > 0) {
            setTimeout(() => {
                this.updateActiveTimers();
            }, 1000);
        }
    }

    // =============================================
    // SISTEMA DE ESTADÍSTICAS Y ACTUALIZACIÓN
    // =============================================

    /**
     * Actualiza todas las estadísticas y contadores
     */
    updateStatistics() {
        const projectTasks = this.getCurrentProjectTasks();

        this.updateTaskCounters(projectTasks);
        this.updateDailyProgress();
        this.updateColumnCounters();
        this.updateProjectCounters();
    }

    /**
     * Actualiza contadores principales de tareas
     */
    updateTaskCounters(projectTasks) {
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(task => task.status === 'done').length;
        const pendingTasks = totalTasks - completedTasks;

        this.updateCounterElement('total-tasks', totalTasks);
        this.updateCounterElement('completed-tasks', completedTasks);
        this.updateCounterElement('pending-tasks', pendingTasks);
    }

    /**
     * Actualiza un elemento contador específico
     */
    updateCounterElement(elementId, value) {
        if (this.elements[elementId]) {
            this.elements[elementId].textContent = value;
        }
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
            const counter = document.querySelector(`#${status} .task-count`);
            if (counter) {
                const count = this.state.tasks.filter(
                    task => task.project === this.state.currentProject && task.status === status
                ).length;
                counter.textContent = count;
            }
        });
    }

    /**
     * Actualiza contadores de proyectos
     */
    updateProjectCounters() {
        const projects = this.getStoredData(this.config.storageKeys.projects) || this.config.defaultProjects;

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
     * Elimina comentario de tarea
     */
    deleteTaskComment(commentId, taskId) {
        const task = this.getTaskById(taskId);
        if (!task || !task.comments) return;

        const commentIndex = task.comments.findIndex(
            comment => comment.id === commentId
        );

        if (commentIndex !== -1) {
            task.comments.splice(commentIndex, 1);
            this.saveTasksToStorage();
            this.renderTaskComments(task.comments);
            this.showNotification('Comentario eliminado', 'success');
            this.addToHistory(`Comentario eliminado de: ${task.title}`);
        }
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
                const projects = this.getStoredData(this.config.storageKeys.projects) || [];
                const updatedProjects = projects.filter(
                    p => p.name !== this.state.currentProject
                );

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
     * Formatea segundos a formato humano (horas, minutos, segundos)
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    /**
     * Escapa HTML para prevenir ataques XSS
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Verifica si una fecha corresponde al día actual
     */
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Genera color aleatorio
     */
    generateRandomColor() {
        return this.config.colors[
            Math.floor(Math.random() * this.config.colors.length)
        ];
    }

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

        // Cierre por botón X o click fuera
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
                    const goal = parseInt(btn.dataset.goal);
                    document.getElementById('new-goal-input').value = goal;
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

    /**
     * Cierra todos los modales
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.remove();
                }
            }, 300);
        });
    }
}

// =============================================
// SISTEMA DE NOTIFICACIONES MEJORADO
// =============================================

/**
 * Gestor avanzado de notificaciones con animaciones y personalización
 */
class NotificationManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
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
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
        let progressInterval;
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

        if (options.pulse) {
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

    /**
     * Actualiza notificación existente
     */
    update(id, updates) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element } = notificationData;

        if (updates.message) {
            const messageElement = element.querySelector('.notification-message');
            if (messageElement) {
                messageElement.textContent = updates.message;
            }
        }

        if (updates.type) {
            element.className = element.className.replace(/notification-\w+/, `notification-${updates.type}`);
        }

        if (updates.icon) {
            const iconElement = element.querySelector('.notification-icon');
            if (iconElement) {
                iconElement.textContent = updates.icon;
            }
        }
    }

    /**
     * Elimina todas las notificaciones
     */
    clearAll() {
        this.notifications.forEach((_, id) => {
            this.remove(id);
        });
    }

    /**
     * Muestra notificación de tarea completada
     */
    taskCompleted(taskTitle, timeSpent = 0) {
        const timeText = timeSpent > 0 ? ` en ${this.taskManager.formatTime(timeSpent)}` : '';
        return this.success(`✅ Tarea completada: "${taskTitle}"${timeText}`, 3000, {
            action: {
                label: 'Deshacer',
                handler: () => this.taskManager.undoLastAction()
            }
        });
    }

    /**
     * Muestra notificación de progreso
     */
    progress(message, current, total, id = null) {
        const percentage = Math.round((current / total) * 100);
        const progressMessage = `${message} (${current}/${total} - ${percentage}%)`;

        if (id && this.notifications.has(id)) {
            this.update(id, { message: progressMessage });
            return id;
        } else {
            return this.show(progressMessage, 'info', 0, { icon: '📊' });
        }
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
        window.taskManager = new TaskManager();

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