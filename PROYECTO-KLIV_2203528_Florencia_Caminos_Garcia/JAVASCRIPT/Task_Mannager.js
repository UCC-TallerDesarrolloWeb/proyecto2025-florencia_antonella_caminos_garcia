// Task_Manager.js - Gestor completo de tareas con múltiples vistas y funcionalidades

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.currentProject = "personal";
        this.currentView = "kanban";
        this.currentEditingTask = null;
        this.filteredTasks = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.hideCompletedTasks = localStorage.getItem('hideCompletedTasks') === 'true' || false;
        this.dailyGoal = parseInt(localStorage.getItem("dailyGoal")) || 5;
        this.customTags = JSON.parse(localStorage.getItem("customTags")) || [];
        this.actionHistory = [];
        this.activeTimers = {};
        this.tutorialShown = localStorage.getItem("tutorialShown") === "true";
        this.currentDeletingTask = null;

        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.updateStats();
        this.renderAllViews();
        this.loadProjects();
        this.applySavedTheme();
        this.setupCalendarNavigation();

        if (!this.tutorialShown) {
            setTimeout(() => this.showTutorial(), 1000);
        }
    }

    setupEventListeners() {
        const self = this;

        // Configurar botones de cambio de vista
        const viewButtons = [
            "btn-kanban-view",
            "btn-calendar-view",
            "btn-list-view",
        ];

        viewButtons.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("click", function () {
                    self.switchView(id.replace("btn-", "").replace("-view", ""));
                });
            }
        });

        // Mapeo de handlers para botones principales
        const buttonHandlers = {
            "btn-cancel-task": () => self.closeTaskForm(),
            "theme-toggle": () => self.toggleTheme(),
            "btn-notifications": () => self.toggleNotifications(),
            "btn-help": () => self.showHelp(),
            "close-help": () => self.closeHelp(),
            "btn-new-task-sidebar": () => self.openTaskForm(),
            "btn-new-task": () => self.openTaskForm(),
            "btn-new-task-float": () => self.openTaskForm(),
            "btn-new-project": () => self.openProjectModal(),
            "btn-delete-completed-tasks": () => self.deleteCompletedTasks(),
            "btn-delete-project": () => self.deleteCurrentProject(),
            "save-project": () => self.createNewProjectFromModal(),
            "cancel-project": () => self.closeProjectModal(),
            "add-comment": () => self.addComment(),
            "btn-show-comments": () => self.toggleComments(),
            "confirm-delete": () => self.confirmDeleteTask(),
            "cancel-delete": () => self.closeDeleteModal(),
            "btn-daily-summary": () => this.showDailySummary(),
            "btn-set-goal": () => this.setDailyGoal(),
            "btn-add-tag": () => this.addCustomTag(),
            "btn-undo": () => this.undoLastAction(),
            "btn-tutorial": () => this.showTutorial(),
        };

        Object.entries(buttonHandlers).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("click", handler);
            }
        });

        // Formulario de tarea
        const formTask = document.getElementById("formTask");
        if (formTask) {
            formTask.addEventListener("submit", (e) => self.handleTaskSubmit(e));
        }

        // Búsqueda y filtros
        const searchInput = document.getElementById("search-tasks-sidebar");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => self.searchTasks(e.target.value));
        }

        const sortSelects = ["sort-tasks-sidebar", "sort-tasks-main"];
        sortSelects.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("change", (e) => self.sortTasks(e.target.value));
            }
        });

        const filterSelect = document.getElementById("opciones");
        if (filterSelect) {
            filterSelect.addEventListener("change", (e) => self.filterTasks(e.target.value));
        }

        // Botones de proyecto
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('project-btn')) {
                this.switchProject(e.target.dataset.project);
            }
        });

        // Plantillas de tarea
        const taskTemplate = document.getElementById("task-template");
        if (taskTemplate) {
            taskTemplate.addEventListener("change", (e) => this.applyTaskTemplate(e.target.value));
        }

        // Botones adicionales en tarjetas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-favorite')) {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.toggleFavorite(taskId);
            }
            if (e.target.classList.contains('btn-timer')) {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.toggleTimer(taskId);
            }
            if (e.target.classList.contains('btn-export')) {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.exportTask(taskId);
            }
            if (e.target.classList.contains('btn-edit-task')) {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.openTaskForm(this.getTaskById(taskId));
            }
            if (e.target.classList.contains('btn-delete-task')) {
                const taskId = e.target.closest('.list-task-item').dataset.taskId;
                this.showDeleteModal(taskId);
            }
        });

        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
    }

    setupCalendarNavigation() {
        const prevMonth = document.getElementById("prev-month");
        const nextMonth = document.getElementById("next-month");

        if (prevMonth) {
            prevMonth.addEventListener("click", () => this.navigateCalendar(-1));
        }
        if (nextMonth) {
            nextMonth.addEventListener("click", () => this.navigateCalendar(1));
        }
    }

    navigateCalendar(direction) {
        this.currentMonth += direction;

        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }

        this.renderCalendarView();
    }

    switchView(view) {
        this.currentView = view;

        const viewButtons = document.querySelectorAll(".view-toggle button");
        viewButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        const activeButton = document.getElementById("btn-" + view + "-view");
        if (activeButton) {
            activeButton.classList.add("active");
        }

        const views = document.querySelectorAll(".view");
        views.forEach(function (v) {
            v.classList.remove("active");
        });

        let viewId = "";
        switch (view) {
            case "kanban":
                viewId = "board";
                break;
            case "calendar":
                viewId = "calendar-view";
                break;
            case "list":
                viewId = "list-view";
                break;
        }

        const activeView = document.getElementById(viewId);
        if (activeView) {
            activeView.classList.add("active");
        }

        this.renderAllViews();
    }

    switchProject(project) {
        this.currentProject = project;

        const projectButtons = document.querySelectorAll(".project-btn");
        projectButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        const activeButton = document.querySelector('[data-project="' + project + '"]');
        if (activeButton) {
            activeButton.classList.add("active");
        }

        const taskProjectSelect = document.getElementById("taskProject");
        if (taskProjectSelect) {
            taskProjectSelect.value = project;
        }

        this.filteredTasks = null;
        this.renderAllViews();
        this.updateStats();
    }

    searchTasks(query) {
        if (!query.trim()) {
            this.filteredTasks = null;
            this.renderAllViews();
            return;
        }

        const searchTerm = query.toLowerCase();
        this.filteredTasks = this.tasks.filter(
            (task) =>
                task.project === this.currentProject &&
                (task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchTerm))))
        );

        this.renderAllViews();
    }

    sortTasks(criteria) {
        const tasksToSort = this.filteredTasks || this.tasks.filter((task) => task.project === this.currentProject);

        switch (criteria) {
            case "fecha":
                tasksToSort.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                    return dateA - dateB;
                });
                break;
            case "prioridad":
                const priorityOrder = { Alta: 3, Media: 2, Baja: 1 };
                tasksToSort.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case "nombre":
            case "titulo":
                tasksToSort.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "reciente":
                tasksToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                return;
        }

        this.filteredTasks = tasksToSort;
        this.renderAllViews();
    }

    filterTasks(filter) {
        const allProjectTasks = this.tasks.filter((task) => task.project === this.currentProject);

        switch (filter) {
            case "Alta":
                this.filteredTasks = allProjectTasks.filter((task) => task.priority === "Alta");
                break;
            case "Media":
                this.filteredTasks = allProjectTasks.filter((task) => task.priority === "Media");
                break;
            case "Baja":
                this.filteredTasks = allProjectTasks.filter((task) => task.priority === "Baja");
                break;
            case "Urgente":
                this.filteredTasks = allProjectTasks.filter((task) => task.tags && task.tags.includes("Urgente"));
                break;
            case "Importante":
                this.filteredTasks = allProjectTasks.filter((task) => task.tags && task.tags.includes("Importante"));
                break;
            case "todas":
            default:
                this.filteredTasks = null;
                break;
        }

        this.renderAllViews();
    }

    renderCalendarView() {
        const calendar = document.getElementById("calendar");
        const currentMonthElement = document.getElementById("current-month");

        if (!calendar) return;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        if (currentMonthElement) {
            currentMonthElement.textContent = firstDay.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
            });
        }

        const tasksToShow = this.filteredTasks || this.tasks.filter(
            (task) => task.project === this.currentProject && task.dueDate
        );

        let calendarHTML = '<div class="calendar-grid">';
        calendarHTML += '<div class="calendar-weekdays">';

        const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        weekdays.forEach((day) => {
            calendarHTML += `<div class="weekday">${day}</div>`;
        });

        calendarHTML += "</div>";
        calendarHTML += '<div class="calendar-days">';

        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const dateString = currentDate.toISOString().split("T")[0];
            const dayTasks = tasksToShow.filter((task) => task.dueDate === dateString);
            const isToday = this.isToday(currentDate);

            calendarHTML += `<div class="calendar-day ${isToday ? "today" : ""}">`;
            calendarHTML += `<div class="day-number">${day}</div>`;
            calendarHTML += '<div class="day-tasks">';

            dayTasks.slice(0, 2).forEach((task) => {
                const priorityClass = task.priority ? `priority-${task.priority.toLowerCase()}` : "";
                calendarHTML += `
                    <div class="calendar-task ${priorityClass}" 
                         onclick="window.taskManager.openTaskForm(window.taskManager.getTaskById('${task.id}'))"
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

    isToday(date) {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    createTaskElement(task) {
        const taskElement = document.createElement("li");
        taskElement.className = `task-card priority-${task.priority.toLowerCase()}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sin fecha";
        const tagsHTML = task.tags && task.tags.length > 0
            ? `<div class="task-tags">${task.tags.map((tag) => `<span class="tag" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</span>`).join("")}</div>`
            : "";

        const subtasksHTML = task.subtasks && task.subtasks.length > 0
            ? `<div class="task-subtasks">📋 ${task.subtasks.length} subtareas</div>`
            : "";

        const favoriteIcon = task.favorite ? "⭐" : "☆";
        const timerHTML = this.activeTimers[task.id]
            ? `<span class="timer-active" data-timer-id="${task.id}">⏱️ 0s</span>`
            : task.timeSpent
                ? `<span class="time-spent">⏱️ ${this.formatTime(task.timeSpent)}</span>`
                : "";

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title-group">
                    <button class="btn-favorite" title="Marcar como favorita">${favoriteIcon}</button>
                    <h3>${this.escapeHtml(task.title)}</h3>
                </div>
                <div class="task-actions">
                    <button class="btn-timer" title="Iniciar/Detener temporizador">⏱️</button>
                    <button class="btn-export" title="Exportar tarea">📤</button>
                    <button class="btn-edit-task" title="Editar">✏️</button>
                </div>
            </div>
            <p>${this.escapeHtml(task.description || "Sin descripción")}</p>
            ${tagsHTML}
            ${subtasksHTML}
            ${timerHTML}
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <span class="due-date">📅 ${dueDate}</span>
            </div>
        `;

        const self = this;
        taskElement.addEventListener("dragstart", function (e) {
            e.dataTransfer.setData("text/plain", task.id);
            taskElement.classList.add("dragging");
        });

        taskElement.addEventListener("dragend", function () {
            taskElement.classList.remove("dragging");
        });

        taskElement.addEventListener("dblclick", function () {
            self.openTaskForm(task);
        });

        taskElement.addEventListener("click", function (e) {
            if (e.target.classList.contains("tag")) {
                e.stopPropagation();
                const tagName = e.target.dataset.tag;
                self.searchByTag(tagName);
            }
        });

        return taskElement;
    }

    handleTaskSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const title = formData.get("taskTitle")?.trim();

        if (!title) {
            this.showNotification("El título de la tarea es obligatorio.", "error");
            return;
        }

        const taskData = {
            id: document.getElementById("taskId").value || "task-" + Date.now(),
            title: title,
            description: formData.get("taskDescription")?.trim() || "",
            priority: formData.get("priority") || "Media",
            dueDate: formData.get("dueDate") || "",
            project: formData.get("taskProject") || this.currentProject,
            status: formData.get("taskStatus") || "todo",
            tags: [],
            subtasks: formData.get("subtasks")
                ? formData.get("subtasks").split(",").map((s) => s.trim()).filter((s) => s)
                : [],
            timeEstimate: formData.get("time-estimate") || "",
            createdAt: this.currentEditingTask
                ? this.getTaskById(this.currentEditingTask)?.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Procesar etiquetas
        const tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
        taskData.tags = Array.from(tagCheckboxes).map(cb => cb.value);

        // Procesar favoritos
        const favoriteCheckbox = document.getElementById("taskFavorite");
        if (favoriteCheckbox) {
            taskData.favorite = favoriteCheckbox.checked;
        }

        // Actualizar o crear tarea
        const existingTaskIndex = this.tasks.findIndex(t => t.id === taskData.id);
        if (existingTaskIndex !== -1) {
            // Preservar datos existentes
            const existingTask = this.tasks[existingTaskIndex];
            taskData.timeSpent = existingTask.timeSpent || 0;
            taskData.comments = existingTask.comments || [];
            taskData.favorite = existingTask.favorite || false;
            this.tasks[existingTaskIndex] = taskData;
            this.addToHistory("Tarea actualizada: " + taskData.title);
        } else {
            // Crear nueva tarea
            taskData.timeSpent = 0;
            taskData.comments = [];
            taskData.favorite = false;
            this.tasks.push(taskData);
            this.addToHistory("Tarea creada: " + taskData.title);
        }

        this.saveTasks();
        this.closeTaskForm();
        this.renderAllViews();
        this.updateStats();
        this.showNotification("Tarea guardada correctamente", "success");
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    }

    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    openTaskForm(task = null) {
        this.currentEditingTask = task ? task.id : null;
        const form = document.getElementById("task-form");

        if (!form) return;

        if (task) {
            // Modo edición
            document.getElementById("taskId").value = task.id;
            document.getElementById("taskTitle").value = task.title;
            document.getElementById("taskDescription").value = task.description || "";
            document.getElementById("priority").value = task.priority;
            document.getElementById("dueDate").value = task.dueDate || "";
            document.getElementById("taskProject").value = task.project;
            document.getElementById("time-estimate").value = task.timeEstimate || "";
            document.getElementById("subtasks").value = task.subtasks ? task.subtasks.join(", ") : "";

            // Limpiar y marcar etiquetas
            document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
                checkbox.checked = false;
            });

            if (task.tags) {
                task.tags.forEach(tag => {
                    const checkbox = document.querySelector(`input[name="tags"][value="${tag}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }

            // Cargar comentarios si existen
            if (task.comments) {
                this.renderComments(task.comments);
            }
        } else {
            // Modo creación
            document.getElementById("formTask").reset();
            document.getElementById("taskId").value = "";
            document.getElementById("taskProject").value = this.currentProject;
            document.getElementById("comments-list").innerHTML = '<div class="empty-state">No hay comentarios</div>';
        }

        form.classList.add("active");
    }

    closeTaskForm() {
        const form = document.getElementById("task-form");
        if (form) {
            form.classList.remove("active");
        }
        this.currentEditingTask = null;
    }

    renderAllViews() {
        this.renderKanbanView();
        this.renderListView();
        this.renderCalendarView();
        this.updateStats();
    }

    renderKanbanView() {
        if (this.currentView !== "kanban") return;

        const columns = {
            todo: document.getElementById("todo-tasks"),
            inprogress: document.getElementById("inprogress-tasks"),
            done: document.getElementById("done-tasks")
        };

        // Limpiar columnas
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = "";
        });

        const tasksToShow = this.filteredTasks || this.tasks.filter(task => task.project === this.currentProject);

        // Aplicar filtro de tareas completadas si está activo
        const filteredTasks = this.hideCompletedTasks
            ? tasksToShow.filter(task => task.status !== 'done')
            : tasksToShow;

        // Distribuir tareas en columnas
        filteredTasks.forEach(task => {
            const column = columns[task.status];
            if (column) {
                const taskElement = this.createTaskElement(task);
                column.appendChild(taskElement);
            }
        });

        // Actualizar contadores
        this.updateColumnCounters();
    }

    updateColumnCounters() {
        const columns = ['todo', 'inprogress', 'done'];
        columns.forEach(status => {
            const counter = document.querySelector(`#${status} .task-count`);
            if (counter) {
                const count = this.tasks.filter(task =>
                    task.project === this.currentProject && task.status === status
                ).length;
                counter.textContent = count;
            }
        });
    }

    renderListView() {
        if (this.currentView !== "list") return;

        const listContainer = document.getElementById("list-tasks");
        if (!listContainer) return;

        const tasksToShow = this.filteredTasks || this.tasks.filter(task => task.project === this.currentProject);

        // Aplicar filtro de tareas completadas si está activo
        const filteredTasks = this.hideCompletedTasks
            ? tasksToShow.filter(task => task.status !== 'done')
            : tasksToShow;

        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<p class="no-tasks">No hay tareas para mostrar</p>';
            return;
        }

        let listHTML = '<div class="task-list-view">';
        filteredTasks.forEach(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sin fecha";

            listHTML += `
                <div class="list-task-item" data-task-id="${task.id}">
                    <div class="list-task-main">
                        <div class="list-task-header">
                            <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} 
                                   onchange="window.taskManager.toggleTaskStatus('${task.id}')">
                            <h3 class="list-task-title">${this.escapeHtml(task.title)}</h3>
                            <button class="btn-favorite">${task.favorite ? '⭐' : '☆'}</button>
                        </div>
                        <p class="list-task-description">${this.escapeHtml(task.description || "Sin descripción")}</p>
                        ${task.tags && task.tags.length > 0 ?
                    `<div class="list-task-tags">${task.tags.map(tag =>
                        `<span class="tag" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</span>`
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

    toggleTaskStatus(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            this.addToHistory(`Tarea marcada como ${task.status === 'done' ? 'completada' : 'pendiente'}: ${task.title}`);
        }
    }

    toggleFavorite(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.favorite = !task.favorite;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderAllViews();
            this.addToHistory(`Tarea ${task.favorite ? 'marcada como favorita' : 'quitada de favoritos'}: ${task.title}`);
        }
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.task-column');

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');

                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.id;
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.getTaskById(taskId);
        if (task && task.status !== newStatus) {
            const oldStatus = task.status;
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            this.addToHistory(`Tarea movida de ${oldStatus} a ${newStatus}: ${task.title}`);
        }
    }

    updateStats() {
        const projectTasks = this.tasks.filter(task => task.project === this.currentProject);
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(task => task.status === 'done').length;
        const pendingTasks = totalTasks - completedTasks;

        const totalElement = document.getElementById('total-tasks');
        const completedElement = document.getElementById('completed-tasks');
        const pendingElement = document.getElementById('pending-tasks');

        if (totalElement) totalElement.textContent = totalTasks;
        if (completedElement) completedElement.textContent = completedTasks;
        if (pendingElement) pendingElement.textContent = pendingTasks;

        this.updateDailyProgress();
        this.updateColumnCounters();
    }

    updateDailyProgress() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.updatedAt).toDateString();
            return taskDate === today && task.status === 'done';
        });

        const progress = todayTasks.length;
        const goal = this.dailyGoal;
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

    loadProjects() {
        const projects = JSON.parse(localStorage.getItem("projects")) || [
            { name: "personal", color: "#3b82f6" },
            { name: "trabajo", color: "#ef4444" },
            { name: "estudios", color: "#10b981" }
        ];

        const projectList = document.getElementById("project-list");
        if (projectList) {
            projectList.innerHTML = projects.map(project => `
                <li><button class="project-btn ${this.currentProject === project.name ? 'active' : ''}" 
                        data-project="${project.name}" type="button"
                        style="--project-color: ${project.color}">
                    ${project.name === 'personal' ? '🏠' : project.name === 'trabajo' ? '💼' : '📚'} 
                    ${project.name.charAt(0).toUpperCase() + project.name.slice(1)}
                </button></li>
            `).join('');
        }

        const projectSelect = document.getElementById("taskProject");
        if (projectSelect) {
            projectSelect.innerHTML = projects.map(project =>
                `<option value="${project.name}">${project.name.charAt(0).toUpperCase() + project.name.slice(1)}</option>`
            ).join('');
        }
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    }

    showTutorial() {
        const tutorialSteps = [
            "¡Bienvenido al Gestor de Tareas!",
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
                localStorage.setItem("tutorialShown", "true");
                this.tutorialShown = true;
            }
        };
        showStep();
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    searchByTag(tagName) {
        const searchInput = document.getElementById("search-tasks-sidebar");
        if (searchInput) {
            searchInput.value = tagName;
            this.searchTasks(tagName);
        }
    }

    addToHistory(action) {
        this.actionHistory.unshift({
            action: action,
            timestamp: new Date().toISOString()
        });

        if (this.actionHistory.length > 50) {
            this.actionHistory.pop();
        }
    }

    undoLastAction() {
        if (this.actionHistory.length === 0) {
            this.showNotification("No hay acciones para deshacer", "warning");
            return;
        }

        const lastAction = this.actionHistory.shift();
        this.showNotification(`Deshaciendo: ${lastAction.action}`, "info");
        this.renderAllViews();
    }

    openProjectModal() {
        const modal = document.getElementById("project-modal");
        if (modal) {
            modal.classList.add("active");
        }
    }

    closeProjectModal() {
        const modal = document.getElementById("project-modal");
        if (modal) {
            modal.classList.remove("active");
        }
    }

    createNewProjectFromModal() {
        const projectNameInput = document.getElementById("new-project-name");
        const projectName = projectNameInput ? projectNameInput.value.trim() : '';

        if (!projectName) {
            this.showNotification("Por favor ingresa un nombre para el proyecto", "error");
            return;
        }

        this.createNewProject(projectName, "#7E57C2");
        this.closeProjectModal();
    }

    createNewProject(name, color) {
        const projects = JSON.parse(localStorage.getItem("projects")) || [];

        // Verificar si el proyecto ya existe
        if (projects.find(p => p.name === name.toLowerCase())) {
            this.showNotification("Ya existe un proyecto con ese nombre", "warning");
            return;
        }

        projects.push({ name: name.toLowerCase(), color: color });
        localStorage.setItem("projects", JSON.stringify(projects));
        this.loadProjects();
        this.switchProject(name.toLowerCase());
        this.showNotification(`Proyecto "${name}" creado correctamente`, "success");
    }

    toggleTimer(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) return;

        if (this.activeTimers[taskId]) {
            // Detener temporizador
            const elapsed = Math.floor((Date.now() - this.activeTimers[taskId].startTime) / 1000);
            task.timeSpent = (task.timeSpent || 0) + elapsed;
            delete this.activeTimers[taskId];
            this.saveTasks();
            this.addToHistory(`Temporizador detenido para: ${task.title} (${this.formatTime(elapsed)})`);
            this.showNotification(`Temporizador detenido: ${this.formatTime(elapsed)}`, "info");
        } else {
            // Iniciar temporizador
            this.activeTimers[taskId] = {
                startTime: Date.now(),
                taskId: taskId
            };
            this.addToHistory(`Temporizador iniciado para: ${task.title}`);
            this.showNotification("Temporizador iniciado", "success");
        }

        this.renderAllViews();
        this.updateActiveTimers();
    }

    updateActiveTimers() {
        Object.keys(this.activeTimers).forEach(taskId => {
            const timerElement = document.querySelector(`[data-timer-id="${taskId}"]`);
            if (timerElement) {
                const elapsed = Math.floor((Date.now() - this.activeTimers[taskId].startTime) / 1000);
                timerElement.textContent = `⏱️ ${this.formatTime(elapsed)}`;
            }
        });

        if (Object.keys(this.activeTimers).length > 0) {
            setTimeout(() => this.updateActiveTimers(), 1000);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openTaskForm();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.switchView('kanban');
                        break;
                    case 'l':
                        e.preventDefault();
                        this.switchView('list');
                        break;
                    case 'c':
                        e.preventDefault();
                        this.switchView('calendar');
                        break;
                }
            }

            // Atajos numéricos para vistas
            if (e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                const views = ['kanban', 'calendar', 'list'];
                this.switchView(views[parseInt(e.key) - 1]);
            }
        });
    }

    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task =>
            task.project === this.currentProject && task.status === 'done'
        );

        if (completedTasks.length === 0) {
            this.showNotification("No hay tareas completadas para eliminar", "warning");
            return;
        }

        this.showCustomModal('Eliminar Tareas Completadas', `
            <div class="delete-confirm-warning">
                <div class="warning-icon">⚠️</div>
                <h3>¿Eliminar ${completedTasks.length} tareas completadas?</h3>
                <p>Esta acción no se puede deshacer y eliminará permanentemente todas las tareas completadas del proyecto actual.</p>
            </div>
        `, [
            {
                text: 'Eliminar',
                action: () => {
                    const initialLength = this.tasks.length;
                    this.tasks = this.tasks.filter(task =>
                        !(task.project === this.currentProject && task.status === 'done')
                    );

                    if (this.tasks.length < initialLength) {
                        this.saveTasks();
                        this.renderAllViews();
                        this.updateStats();
                        this.addToHistory("Tareas completadas eliminadas");
                        this.showNotification(`${completedTasks.length} tareas completadas eliminadas`, "success");
                    }
                },
                type: 'danger'
            },
            { text: 'Cancelar', action: 'close', type: 'secondary' }
        ]);
    }

    showDeleteModal(taskId) {
        this.currentDeletingTask = taskId;
        const modal = document.getElementById("delete-confirm");
        if (modal) {
            modal.classList.add("active");
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById("delete-confirm");
        if (modal) {
            modal.classList.remove("active");
        }
        this.currentDeletingTask = null;
    }

    confirmDeleteTask() {
        if (this.currentDeletingTask) {
            const task = this.getTaskById(this.currentDeletingTask);
            this.tasks = this.tasks.filter(t => t.id !== this.currentDeletingTask);
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            this.addToHistory(`Tarea eliminada: ${task.title}`);
            this.showNotification("Tarea eliminada correctamente", "success");
        }
        this.closeDeleteModal();
    }

    // Sistema de notificaciones
    toggleNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (notificationList) {
            notificationList.classList.toggle('active');
        }
    }

    showHelp() {
        const helpModal = document.getElementById('shortcut-help');
        if (helpModal) {
            helpModal.classList.add('active');
        }
    }

    closeHelp() {
        const helpModal = document.getElementById('shortcut-help');
        if (helpModal) {
            helpModal.classList.remove('active');
        }
    }

    // Sistema de comentarios
    addComment() {
        const commentInput = document.getElementById('new-comment');
        const commentText = commentInput ? commentInput.value.trim() : '';

        if (!commentText) {
            this.showNotification('El comentario no puede estar vacío', 'warning');
            return;
        }

        if (!this.currentEditingTask) {
            this.showNotification('No hay una tarea seleccionada para comentar', 'error');
            return;
        }

        const task = this.getTaskById(this.currentEditingTask);
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
        this.saveTasks();
        this.renderComments(task.comments);
        commentInput.value = '';

        this.showNotification('Comentario agregado correctamente', 'success');
        this.addToHistory(`Comentario agregado a: ${task.title}`);
    }

    renderComments(comments) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<div class="empty-state">No hay comentarios</div>';
            return;
        }

        const sortedComments = comments.sort((a, b) => new Date(b.date) - new Date(a.date));

        commentsList.innerHTML = sortedComments.map(comment => `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
                    <button class="btn-icon btn-delete-comment" onclick="window.taskManager.deleteComment('${comment.id}', '${this.currentEditingTask}')">🗑️</button>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `).join('');
    }

    deleteComment(commentId, taskId) {
        const task = this.getTaskById(taskId);
        if (!task || !task.comments) return;

        const commentIndex = task.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex !== -1) {
            task.comments.splice(commentIndex, 1);
            this.saveTasks();
            this.renderComments(task.comments);
            this.showNotification('Comentario eliminado', 'success');
            this.addToHistory(`Comentario eliminado de: ${task.title}`);
        }
    }

    toggleComments() {
        const commentsSection = document.getElementById('task-comments');
        const commentsButton = document.getElementById('btn-show-comments');

        if (commentsSection && commentsButton) {
            const isHidden = commentsSection.classList.toggle('hidden');
            commentsButton.textContent = isHidden ? 'Mostrar Comentarios' : 'Ocultar Comentarios';

            if (!isHidden && this.currentEditingTask) {
                const task = this.getTaskById(this.currentEditingTask);
                if (task) {
                    this.renderComments(task.comments);
                }
            }
        }
    }

    // Funcionalidades adicionales implementadas
    showDailySummary() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.updatedAt).toDateString();
            return taskDate === today && task.status === 'done';
        });

        const totalTimeSpent = todayTasks.reduce((total, task) => total + (task.timeSpent || 0), 0);
        const goalProgress = todayTasks.length;
        const goalPercentage = Math.min((goalProgress / this.dailyGoal) * 100, 100);

        const summaryHTML = `
            <div class="daily-summary">
                <h3>📊 Resumen Diario - ${new Date().toLocaleDateString()}</h3>
                <div class="summary-stats">
                    <div class="stat-card">
                        <span class="stat-number">${goalProgress}/${this.dailyGoal}</span>
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
                                    <strong>${this.escapeHtml(task.title)}</strong>
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

    setDailyGoal() {
        this.showCustomModal('Establecer Meta Diaria', `
            <div class="goal-setting">
                <p>¿Cuántas tareas quieres completar por día?</p>
                <input type="number" id="new-goal-input" min="1" max="50" value="${this.dailyGoal}" class="form-input">
                <div class="goal-suggestions">
                    <button type="button" onclick="window.taskManager.setSuggestedGoal(3)" class="btn-sm">3 (Fácil)</button>
                    <button type="button" onclick="window.taskManager.setSuggestedGoal(5)" class="btn-sm">5 (Normal)</button>
                    <button type="button" onclick="window.taskManager.setSuggestedGoal(8)" class="btn-sm">8 (Desafiante)</button>
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
    }

    setSuggestedGoal(goal) {
        const input = document.getElementById('new-goal-input');
        if (input) {
            input.value = goal;
        }
    }

    saveDailyGoal(newGoal) {
        if (!newGoal || isNaN(newGoal) || newGoal < 1) {
            this.showNotification('La meta debe ser un número mayor a 0', 'error');
            return;
        }

        this.dailyGoal = newGoal;
        localStorage.setItem("dailyGoal", newGoal.toString());
        this.updateStats();
        this.showNotification(`Meta diaria establecida en: ${newGoal} tareas`, 'success');
        this.closeAllModals();
    }

    addCustomTag() {
        const newTag = prompt("Agregar nueva etiqueta:");
        if (newTag && !this.customTags.includes(newTag)) {
            this.customTags.push(newTag);
            localStorage.setItem("customTags", JSON.stringify(this.customTags));
            this.showNotification(`Etiqueta "${newTag}" agregada`, 'success');
        }
    }

    exportTask(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            const taskData = JSON.stringify(task, null, 2);
            const blob = new Blob([taskData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tarea-${task.title}-${task.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Tarea exportada correctamente', 'success');
        }
    }

    applyTaskTemplate(templateName) {
        const templates = {
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
        };

        const template = templates[templateName];
        if (template) {
            document.getElementById('taskTitle').value = template.title;
            document.getElementById('taskDescription').value = template.description;
            document.getElementById('priority').value = template.priority;
            document.getElementById('time-estimate').value = template.timeEstimate;
            document.getElementById('subtasks').value = template.subtasks;

            // Aplicar etiquetas
            document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
                checkbox.checked = template.tags.includes(checkbox.value);
            });

            this.showNotification(`Plantilla "${templateName}" aplicada`, 'success');
        }
    }

    deleteCurrentProject() {
        if (this.currentProject === "personal") {
            this.showNotification('No se puede eliminar el proyecto personal por defecto', 'error');
            return;
        }

        const projectTasks = this.tasks.filter(task => task.project === this.currentProject);

        this.showCustomModal('Eliminar Proyecto', `
            <div class="delete-project-warning">
                <div class="warning-icon">⚠️</div>
                <h3>¿Eliminar proyecto "${this.currentProject}"?</h3>
                <p>Esta acción eliminará permanentemente:</p>
                <ul>
                    <li>${projectTasks.length} tareas en total</li>
                    <li>${projectTasks.filter(t => t.status === 'done').length} tareas completadas</li>
                    <li>${projectTasks.filter(t => t.status !== 'done').length} tareas pendientes</li>
                </ul>
                <p><strong>Escribe el nombre del proyecto para confirmar:</strong></p>
                <input type="text" id="confirm-project-name" placeholder="${this.currentProject}" class="form-input">
            </div>
        `, [
            {
                text: 'Eliminar Proyecto',
                action: () => {
                    const confirmInput = document.getElementById('confirm-project-name');
                    if (confirmInput && confirmInput.value === this.currentProject) {
                        this.confirmProjectDeletion();
                    } else {
                        this.showNotification('El nombre no coincide', 'error');
                    }
                },
                type: 'danger'
            },
            { text: 'Cancelar', action: 'close', type: 'secondary' }
        ]);
    }

    confirmProjectDeletion() {
        const projects = JSON.parse(localStorage.getItem("projects")) || [];
        const updatedProjects = projects.filter(p => p.name !== this.currentProject);
        localStorage.setItem("projects", JSON.stringify(updatedProjects));

        const tasksBefore = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.project !== this.currentProject);
        const tasksDeleted = tasksBefore - this.tasks.length;

        this.saveTasks();
        this.currentProject = "personal";
        this.loadProjects();
        this.renderAllViews();
        this.updateStats();

        this.showNotification(`Proyecto eliminado (${tasksDeleted} tareas eliminadas)`, 'success');
        this.closeAllModals();
    }

    // Funciones auxiliares
    showNotification(message, type = 'info') {
        // Implementación simple de notificación
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(`[${type.toUpperCase()}] ${message}`);
    }

    showCustomModal(title, content, buttons = []) {
        // Implementación simple de modal personalizado
        const modalContent = `
            <h3>${title}</h3>
            ${content}
            <div class="modal-actions">
                ${buttons.map(btn => `<button class="btn btn-${btn.type}">${btn.text}</button>`).join('')}
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    ${modalContent}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal al hacer clic en los botones
        modal.querySelectorAll('.btn').forEach((button, index) => {
            button.addEventListener('click', () => {
                if (buttons[index].action === 'close') {
                    modal.remove();
                } else if (typeof buttons[index].action === 'function') {
                    buttons[index].action();
                }
            });
        });

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);

        // Aplicar el icono correcto
        const themeButton = document.getElementById('theme-toggle');
        if (themeButton) {
            const moonIcon = themeButton.querySelector('.moon-icon');
            const sunIcon = themeButton.querySelector('.sun-icon');

            if (savedTheme === "dark") {
                moonIcon.style.display = "none";
                sunIcon.style.display = "block";
            } else {
                moonIcon.style.display = "block";
                sunIcon.style.display = "none";
            }
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function () {
    window.taskManager = new TaskManager();
});