// Task_Mannager.js
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentProject = 'personal';
        this.currentView = 'kanban';
        this.currentEditingTask = null;
        this.filteredTasks = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();

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
    }

    setupEventListeners() {
        const self = this;

        // Event listeners para botones de vista
        const viewButtons = [
            'btn-kanban-view',
            'btn-calendar-view', 
            'btn-list-view'
        ];
        
        viewButtons.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', function() {
                    self.switchView(id.replace('btn-', '').replace('-view', ''));
                });
            }
        });

        // Event listeners para botones principales
        const buttonHandlers = {
            'btn-cancel-task': () => self.closeTaskForm(),
            'theme-toggle': () => self.toggleTheme(),
            'btn-notifications': () => self.toggleNotifications(),
            'btn-help': () => self.showHelp(),
            'close-help': () => self.closeHelp(),
            'btn-new-task-sidebar': () => self.openTaskForm(),
            'btn-new-task': () => self.openTaskForm(),
            'btn-new-task-float': () => self.openTaskForm(),
            'btn-new-project': () => self.openProjectModal(),
            'btn-delete-completed-tasks': () => self.deleteCompletedTasks(),
            'btn-delete-project': () => self.deleteCurrentProject(),
            'save-project': () => self.createNewProjectFromModal(),
            'cancel-project': () => self.closeProjectModal(),
            'add-comment': () => self.addComment(),
            'btn-show-comments': () => self.toggleComments(),
            'confirm-delete': () => self.confirmDeleteTask(),
            'cancel-delete': () => self.closeDeleteModal()
        };

        Object.entries(buttonHandlers).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Formulario de tarea
        const formTask = document.getElementById('formTask');
        if (formTask) {
            formTask.addEventListener('submit', (e) => self.handleTaskSubmit(e));
        }

        // Búsqueda y filtros
        const searchInput = document.getElementById('search-tasks-sidebar');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => self.searchTasks(e.target.value));
        }

        const sortSelects = ['sort-tasks-sidebar', 'sort-tasks-main'];
        sortSelects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => self.sortTasks(e.target.value));
            }
        });

        const filterSelect = document.getElementById('opciones');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => self.filterTasks(e.target.value));
        }

        // Botones de proyecto
        const projectButtons = document.querySelectorAll('.project-btn');
        projectButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                self.switchProject(e.target.dataset.project);
            });
        });

        // Plantillas de tarea
        const taskTemplate = document.getElementById('task-template');
        if (taskTemplate) {
            taskTemplate.addEventListener('change', (e) => self.applyTaskTemplate(e.target.value));
        }

        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
    }

    setupCalendarNavigation() {
        const prevMonth = document.getElementById('prev-month');
        const nextMonth = document.getElementById('next-month');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.navigateCalendar(-1));
        }
        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.navigateCalendar(1));
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

    // ✅ FUNCIÓN MEJORADA: Cambiar vista
    switchView(view) {
        this.currentView = view;

        // Actualizar botones de vista
        const viewButtons = document.querySelectorAll('.view-toggle button');
        viewButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.getElementById('btn-' + view + '-view').classList.add('active');

        // Mostrar vista activa
        const views = document.querySelectorAll('.view');
        views.forEach(function(v) {
            v.classList.remove('active');
        });
        
        let viewId = '';
        switch(view) {
            case 'kanban':
                viewId = 'board';
                break;
            case 'calendar':
                viewId = 'calendar-view';
                break;
            case 'list':
                viewId = 'list-view';
                break;
        }
        
        document.getElementById(viewId).classList.add('active');

        this.renderAllViews();
    }

    // ✅ FUNCIÓN MEJORADA: Cambiar proyecto
    switchProject(project) {
        this.currentProject = project;
        
        // Actualizar botones de proyecto
        const projectButtons = document.querySelectorAll('.project-btn');
        projectButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector('[data-project="' + project + '"]');
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Actualizar selector de proyecto en el formulario
        const taskProjectSelect = document.getElementById('taskProject');
        if (taskProjectSelect) {
            taskProjectSelect.value = project;
        }

        this.filteredTasks = null;
        this.renderAllViews();
        this.updateStats();
    }

    // ✅ FUNCIÓN IMPLEMENTADA: Búsqueda de tareas
    searchTasks(query) {
        if (!query.trim()) {
            this.filteredTasks = null;
            this.renderAllViews();
            return;
        }

        const searchTerm = query.toLowerCase();
        this.filteredTasks = this.tasks.filter(task => 
            task.project === this.currentProject &&
            (
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            )
        );

        this.renderAllViews();
    }

    // ✅ FUNCIÓN IMPLEMENTADA: Ordenar tareas
    sortTasks(criteria) {
        const tasksToSort = this.filteredTasks || 
            this.tasks.filter(task => task.project === this.currentProject);
        
        switch(criteria) {
            case 'fecha':
                tasksToSort.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                    return dateA - dateB;
                });
                break;
            case 'prioridad':
                const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
                tasksToSort.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'nombre':
            case 'titulo':
                tasksToSort.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'reciente':
                tasksToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                return;
        }

        this.filteredTasks = tasksToSort;
        this.renderAllViews();
    }

    // ✅ FUNCIÓN IMPLEMENTADA: Filtrar tareas
    filterTasks(filter) {
        const allProjectTasks = this.tasks.filter(task => task.project === this.currentProject);
        
        switch(filter) {
            case 'Alta':
                this.filteredTasks = allProjectTasks.filter(task => task.priority === 'Alta');
                break;
            case 'Media':
                this.filteredTasks = allProjectTasks.filter(task => task.priority === 'Media');
                break;
            case 'Baja':
                this.filteredTasks = allProjectTasks.filter(task => task.priority === 'Baja');
                break;
            case 'Urgente':
                this.filteredTasks = allProjectTasks.filter(task => 
                    task.tags && task.tags.includes('Urgente')
                );
                break;
            case 'Importante':
                this.filteredTasks = allProjectTasks.filter(task => 
                    task.tags && task.tags.includes('Importante')
                );
                break;
            case 'todas':
            default:
                this.filteredTasks = null;
                break;
        }

        this.renderAllViews();
    }

    // ✅ FUNCIÓN IMPLEMENTADA: Vista de calendario
    renderCalendarView() {
        const calendar = document.getElementById('calendar');
        const currentMonthElement = document.getElementById('current-month');
        
        if (!calendar) return;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Actualizar el mes actual en el header
        if (currentMonthElement) {
            currentMonthElement.textContent = firstDay.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        const tasksToShow = this.filteredTasks || 
            this.tasks.filter(task => task.project === this.currentProject && task.dueDate);

        let calendarHTML = '<div class="calendar-grid">';
        
        // Días de la semana
        calendarHTML += '<div class="calendar-weekdays">';
        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekdays.forEach(day => {
            calendarHTML += `<div class="weekday">${day}</div>`;
        });
        calendarHTML += '</div>';
        
        // Días del mes
        calendarHTML += '<div class="calendar-days">';
        
        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const dateString = currentDate.toISOString().split('T')[0];
            const dayTasks = tasksToShow.filter(task => task.dueDate === dateString);
            const isToday = this.isToday(currentDate);
            
            calendarHTML += `<div class="calendar-day ${isToday ? 'today' : ''}">`;
            calendarHTML += `<div class="day-number">${day}</div>`;
            calendarHTML += '<div class="day-tasks">';
            
            dayTasks.slice(0, 2).forEach(task => {
                const priorityClass = task.priority ? `priority-${task.priority.toLowerCase()}` : '';
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
            
            calendarHTML += '</div></div>';
        }

        calendarHTML += '</div></div>';
        calendar.innerHTML = calendarHTML;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // ✅ FUNCIÓN MEJORADA: Crear elemento de tarea
    createTaskElement(task) {
        const taskElement = document.createElement('li');
        taskElement.className = `task-card priority-${task.priority.toLowerCase()}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha';
        const tagsHTML = task.tags && task.tags.length > 0 ? 
            `<div class="task-tags">${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
        
        const subtasksHTML = task.subtasks && task.subtasks.length > 0 ? 
            `<div class="task-subtasks">📋 ${task.subtasks.length} subtareas</div>` : '';

        taskElement.innerHTML = `
            <div class="task-header">
                <h3>${this.escapeHtml(task.title)}</h3>
                <button class="btn-edit-task" onclick="event.stopPropagation(); window.taskManager.openTaskForm(window.taskManager.getTaskById('${task.id}'))">✏️</button>
            </div>
            <p>${this.escapeHtml(task.description || 'Sin descripción')}</p>
            ${tagsHTML}
            ${subtasksHTML}
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <span class="due-date">📅 ${dueDate}</span>
            </div>
        `;

        const self = this;
        taskElement.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', task.id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', function() {
            taskElement.classList.remove('dragging');
        });

        taskElement.addEventListener('dblclick', function() {
            self.openTaskForm(task);
        });

        return taskElement;
    }

    // ✅ FUNCIÓN MEJORADA: Manejar envío de formulario
    handleTaskSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const title = formData.get('taskTitle')?.trim();
        
        if (!title) {
            alert('❌ El título de la tarea es obligatorio.');
            return;
        }

        const taskData = {
            id: document.getElementById('taskId').value || 'task-' + Date.now(),
            title: title,
            description: formData.get('taskDescription')?.trim() || '',
            priority: formData.get('priority') || 'Media',
            dueDate: formData.get('dueDate') || '',
            project: formData.get('taskProject') || this.currentProject,
            status: formData.get('taskStatus') || 'todo',
            tags: [],
            subtasks: formData.get('subtasks') ? 
                formData.get('subtasks').split(',').map(s => s.trim()).filter(s => s) : [],
            timeEstimate: formData.get('time-estimate') || '',
            createdAt: this.currentEditingTask ? 
                this.getTaskById(this.currentEditingTask)?.createdAt || new Date().toISOString() : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: this.currentEditingTask ? 
                this.getTaskById(this.currentEditingTask)?.comments || [] : []
        };

        // Manejar etiquetas
        const tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
        tagCheckboxes.forEach(function(checkbox) {
            taskData.tags.push(checkbox.value);
        });

        if (this.currentEditingTask) {
            const index = this.tasks.findIndex(t => t.id === this.currentEditingTask);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData };
            }
        } else {
            this.tasks.push(taskData);
        }

        this.saveTasks();
        this.closeTaskForm();
        this.renderAllViews();
        this.updateStats();
        
        this.showNotification(
            this.currentEditingTask ? 'Tarea actualizada' : 'Tarea creada', 
            'success'
        );
    }

    // ✅ FUNCIÓN MEJORADA: Abrir formulario de tarea
    openTaskForm(task = null) {
        const form = document.getElementById('task-form');
        const formTitle = form.querySelector('h2');

        if (task) {
            formTitle.textContent = 'Editar Tarea';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskProject').value = task.project;
            document.getElementById('dueDate').value = task.dueDate || '';
            document.getElementById('subtasks').value = task.subtasks ? task.subtasks.join(', ') : '';
            document.getElementById('time-estimate').value = task.timeEstimate || '';
            
            // Establecer prioridad
            const priorityRadios = document.querySelectorAll('input[name="priority"]');
            priorityRadios.forEach(function(radio) {
                radio.checked = radio.value === task.priority;
            });
            
            // Establecer etiquetas
            const tagCheckboxes = document.querySelectorAll('input[name="tags"]');
            tagCheckboxes.forEach(function(checkbox) {
                checkbox.checked = task.tags ? task.tags.includes(checkbox.value) : false;
            });

            // Cargar comentarios
            this.loadComments(task);

            this.currentEditingTask = task.id;
        } else {
            formTitle.textContent = 'Crear Tarea';
            document.getElementById('formTask').reset();
            document.getElementById('taskProject').value = this.currentProject;
            document.getElementById('comments-list').innerHTML = '';
            this.currentEditingTask = null;
        }

        form.classList.add('active');
    }

    // ✅ NUEVA FUNCIÓN: Cargar comentarios
    loadComments(task) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        commentsList.innerHTML = '';
        
        if (task.comments && task.comments.length > 0) {
            task.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                    <div class="comment-date">${new Date(comment.date).toLocaleString()}</div>
                `;
                commentsList.appendChild(commentElement);
            });
        }
    }

    // ✅ NUEVA FUNCIÓN: Agregar comentario
    addComment() {
        const newCommentInput = document.getElementById('new-comment');
        const commentText = newCommentInput.value.trim();
        
        if (!commentText) return;

        if (!this.currentEditingTask) {
            alert('Debes estar editando una tarea para agregar comentarios');
            return;
        }

        const task = this.getTaskById(this.currentEditingTask);
        if (!task) return;

        if (!task.comments) {
            task.comments = [];
        }

        task.comments.push({
            text: commentText,
            date: new Date().toISOString()
        });

        this.saveTasks();
        this.loadComments(task);
        newCommentInput.value = '';
        
        this.showNotification('Comentario agregado', 'success');
    }

    // ✅ NUEVA FUNCIÓN: Alternar visibilidad de comentarios
    toggleComments() {
        const commentsSection = document.getElementById('task-comments');
        if (commentsSection) {
            commentsSection.classList.toggle('hidden');
        }
    }

    // ✅ FUNCIÓN MEJORADA: Cerrar formulario de tarea
    closeTaskForm() {
        document.getElementById('task-form').classList.remove('active');
        this.currentEditingTask = null;
    }

    // ✅ FUNCIÓN IMPLEMENTADA: Drag and drop
    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');
        const self = this;

        taskLists.forEach(function(list) {
            list.addEventListener('dragover', function(e) {
                e.preventDefault();
                list.classList.add('drop-zone');
            });

            list.addEventListener('dragleave', function() {
                list.classList.remove('drop-zone');
            });

            list.addEventListener('drop', function(e) {
                e.preventDefault();
                list.classList.remove('drop-zone');

                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = list.dataset.status;

                self.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
        }
    }

    // ✅ FUNCIÓN MEJORADA: Renderizar todas las vistas
    renderAllViews() {
        this.renderKanbanView();
        this.renderListView();
        this.renderCalendarView();
    }

    // ✅ FUNCIÓN MEJORADA: Renderizar vista Kanban
    renderKanbanView() {
        const columns = {
            todo: document.querySelector('[data-status="todo"] .task-list'),
            inprogress: document.querySelector('[data-status="inprogress"] .task-list'),
            done: document.querySelector('[data-status="done"] .task-list')
        };

        // Limpiar columnas
        Object.values(columns).forEach(column => {
            if (column) {
                column.innerHTML = '';
            }
        });

        const tasksToRender = this.filteredTasks || 
            this.tasks.filter(task => task.project === this.currentProject);

        const self = this;
        tasksToRender.forEach(task => {
            const taskElement = self.createTaskElement(task);
            if (columns[task.status]) {
                columns[task.status].appendChild(taskElement);
            }
        });

        // Actualizar contadores
        Object.keys(columns).forEach(status => {
            const column = document.querySelector(`[data-status="${status}"]`);
            if (column) {
                const count = tasksToRender.filter(task => task.status === status).length;
                const countElement = column.querySelector('.task-count');
                if (countElement) {
                    countElement.textContent = count;
                }

                const taskList = column.querySelector('.task-list');
                if (taskList && count === 0) {
                    taskList.innerHTML = '<div class="empty-state">No hay tareas</div>';
                }
            }
        });
    }

    // ✅ FUNCIÓN MEJORADA: Renderizar vista de lista
    renderListView() {
        const tbody = document.querySelector('#task-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        const tasksToRender = this.filteredTasks || 
            this.tasks.filter(task => task.project === this.currentProject);

        if (tasksToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No hay tareas en este proyecto
                    </td>
                </tr>
            `;
            return;
        }

        tasksToRender.forEach(task => {
            const row = document.createElement('tr');
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-';
            const tagsHTML = task.tags && task.tags.length > 0 ? 
                task.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '-';
            
            row.innerHTML = `
                <td>${this.escapeHtml(task.title)}</td>
                <td><span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span></td>
                <td>${dueDate}</td>
                <td>${this.getStatusText(task.status)}</td>
                <td>${this.getProjectText(task.project)}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="window.taskManager.openTaskForm(window.taskManager.getTaskById('${task.id}'))">Editar</button>
                    <button class="btn-delete" onclick="window.taskManager.deleteTask('${task.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ✅ NUEVA FUNCIÓN: Aplicar plantilla de tarea
    applyTaskTemplate(templateType) {
        if (!templateType) return;

        const templates = {
            'reunion': {
                title: 'Reunión semanal',
                description: 'Reunión de seguimiento del equipo',
                tags: ['Importante'],
                timeEstimate: '1'
            },
            'revision': {
                title: 'Revisión de código',
                description: 'Revisar pull request y hacer comentarios',
                tags: ['Urgente'],
                timeEstimate: '2'
            },
            'estudio': {
                title: 'Sesión de estudio',
                description: 'Estudiar temas pendientes del curso',
                tags: ['Importante'],
                timeEstimate: '3'
            }
        };

        const template = templates[templateType];
        if (template) {
            document.getElementById('taskTitle').value = template.title;
            document.getElementById('taskDescription').value = template.description;
            document.getElementById('time-estimate').value = template.timeEstimate;
            
            // Establecer etiquetas
            const tagCheckboxes = document.querySelectorAll('input[name="tags"]');
            tagCheckboxes.forEach(checkbox => {
                checkbox.checked = template.tags.includes(checkbox.value);
            });
        }
    }

    // ✅ FUNCIÓN MEJORADA: Modal de proyecto
    openProjectModal() {
        document.getElementById('project-modal').classList.add('active');
    }

    closeProjectModal() {
        document.getElementById('project-modal').classList.remove('active');
        document.getElementById('new-project-name').value = '';
    }

    createNewProjectFromModal() {
        const projectNameInput = document.getElementById('new-project-name');
        const projectName = projectNameInput.value.trim();
        
        if (!projectName) {
            alert('❌ El nombre del proyecto no puede estar vacío.');
            return;
        }

        if (projectName.length > 30) {
            alert('❌ El nombre del proyecto no puede tener más de 30 caracteres.');
            return;
        }

        const projectId = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existingProject = document.querySelector(`[data-project="${projectId}"]`);
        
        if (existingProject) {
            alert('❌ Ya existe un proyecto con ese nombre.');
            return;
        }

        const projectList = document.getElementById('project-list');
        const newProjectItem = document.createElement('li');
        newProjectItem.innerHTML = `<button class="project-btn" data-project="${projectId}" type="button">📁 ${projectName}</button>`;
        projectList.appendChild(newProjectItem);

        const self = this;
        newProjectItem.querySelector('.project-btn').addEventListener('click', function(e) {
            self.switchProject(e.target.dataset.project);
        });

        this.saveProjects();
        this.closeProjectModal();
        this.switchProject(projectId);
        
        this.showNotification(`Proyecto "${projectName}" creado`, 'success');
    }

    // ✅ FUNCIÓN MEJORADA: Eliminar tarea con modal de confirmación
    deleteTask(taskId) {
        this.taskToDelete = taskId;
        document.getElementById('delete-confirm').classList.add('active');
    }

    confirmDeleteTask() {
        if (this.taskToDelete) {
            this.tasks = this.tasks.filter(task => task.id !== this.taskToDelete);
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            this.taskToDelete = null;
            this.showNotification('Tarea eliminada', 'success');
        }
        this.closeDeleteModal();
    }

    closeDeleteModal() {
        document.getElementById('delete-confirm').classList.remove('active');
        this.taskToDelete = null;
    }

    // ✅ FUNCIONES DE PROYECTO (mantener las originales con mejoras)
    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => 
            task.project === this.currentProject && task.status === 'done'
        );

        if (completedTasks.length === 0) {
            alert('ℹ️ No hay tareas completadas para eliminar en este proyecto.');
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar ${completedTasks.length} tarea(s) completada(s) del proyecto actual?`)) {
            this.tasks = this.tasks.filter(task => 
                !(task.project === this.currentProject && task.status === 'done')
            );
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            this.showNotification(`${completedTasks.length} tarea(s) eliminada(s)`, 'success');
        }
    }

    deleteCurrentProject() {
        const defaultProjects = ['personal', 'trabajo', 'estudios'];
        if (defaultProjects.includes(this.currentProject)) {
            alert('❌ No puedes eliminar los proyectos por defecto (Personal, Trabajo, Estudios).');
            return;
        }

        const tasksInProject = this.tasks.filter(task => task.project === this.currentProject);
        const message = `¿Estás seguro de que quieres eliminar el proyecto "${this.currentProject}"?` +
            (tasksInProject.length > 0 ? `\n\nSe eliminarán ${tasksInProject.length} tarea(s) asociadas a este proyecto.` : '');

        if (confirm(message)) {
            this.tasks = this.tasks.filter(task => task.project !== this.currentProject);
            const projectButton = document.querySelector(`[data-project="${this.currentProject}"]`);
            if (projectButton) {
                projectButton.closest('li').remove();
            }

            this.switchProject('personal');
            this.saveTasks();
            this.saveProjects();
            this.renderAllViews();
            this.updateStats();
            this.showNotification('Proyecto eliminado', 'success');
        }
    }

    saveProjects() {
        const projects = [];
        const projectButtons = document.querySelectorAll('.project-btn');
        
        projectButtons.forEach(btn => {
            projects.push({
                id: btn.dataset.project,
                name: btn.textContent.replace(/[📁🏠💼📚]/g, '').trim()
            });
        });
        
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    loadProjects() {
        const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
        const projectList = document.getElementById('project-list');
        const defaultProjects = ['personal', 'trabajo', 'estudios'];

        savedProjects.forEach(project => {
            if (!defaultProjects.includes(project.id)) {
                const existingProject = document.querySelector(`[data-project="${project.id}"]`);
                if (!existingProject) {
                    const newProjectItem = document.createElement('li');
                    newProjectItem.innerHTML = `<button class="project-btn" data-project="${project.id}" type="button">📁 ${project.name}</button>`;
                    projectList.appendChild(newProjectItem);

                    newProjectItem.querySelector('.project-btn').addEventListener('click', (e) => {
                        this.switchProject(e.target.dataset.project);
                    });
                }
            }
        });
    }

    // ✅ FUNCIÓN MEJORADA: Actualizar estadísticas
    updateStats() {
        const filteredTasks = this.tasks.filter(task => task.project === this.currentProject);

        document.getElementById('total-tasks').textContent = filteredTasks.length;
        document.getElementById('completed-tasks').textContent = filteredTasks.filter(task => task.status === 'done').length;
        document.getElementById('inprogress-tasks').textContent = filteredTasks.filter(task => task.status === 'inprogress').length;
        document.getElementById('pending-tasks').textContent = filteredTasks.filter(task => task.status === 'todo').length;

        // Actualizar barra de progreso
        const progress = document.querySelector('.progress');
        if (progress) {
            const total = filteredTasks.length;
            const completed = filteredTasks.filter(task => task.status === 'done').length;
            const progressPercent = total > 0 ? (completed / total) * 100 : 0;
            progress.style.width = progressPercent + '%';
        }

        // Actualizar contador de notificaciones
        const notificationCount = document.getElementById('notification-count');
        if (notificationCount) {
            const overdueTasks = filteredTasks.filter(task => 
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
            ).length;
            notificationCount.textContent = overdueTasks;
        }
    }

    // ✅ FUNCIONES DE TEMA Y NOTIFICACIONES
    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        localStorage.setItem('theme', newTheme);
    }

    toggleNotifications() {
        const dropdown = document.getElementById('notification-list');
        if (dropdown) {
            dropdown.classList.toggle('active');
            
            // Mostrar notificaciones de tareas vencidas
            if (dropdown.classList.contains('active')) {
                const overdueTasks = this.tasks.filter(task => 
                    task.project === this.currentProject && 
                    task.status !== 'done' && 
                    task.dueDate && 
                    new Date(task.dueDate) < new Date()
                );

                dropdown.innerHTML = overdueTasks.length > 0 ? 
                    `<div class="notification-item">Tienes ${overdueTasks.length} tareas vencidas</div>` :
                    `<div class="notification-item">No hay notificaciones</div>`;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ✅ FUNCIONES DE AYUDA Y TECLADO
    showHelp() {
        document.getElementById('shortcut-help').classList.add('active');
    }

    closeHelp() {
        document.getElementById('shortcut-help').classList.remove('active');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.openTaskForm();
                    break;
                case 'p':
                    e.preventDefault();
                    this.openProjectModal();
                    break;
                case 'f':
                    e.preventDefault();
                    const searchInput = document.getElementById('search-tasks-sidebar');
                    if (searchInput) searchInput.focus();
                    break;
                case 's':
                    e.preventDefault();
                    if (document.getElementById('task-form').classList.contains('active')) {
                        document.getElementById('formTask').dispatchEvent(new Event('submit'));
                    }
                    break;
            }
        }

        if (!e.ctrlKey && !e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.switchView('kanban');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchView('calendar');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchView('list');
                    break;
                case 'Escape':
                    this.closeTaskForm();
                    this.closeHelp();
                    this.closeProjectModal();
                    this.closeDeleteModal();
                    break;
            }
        }
    }

    // ✅ FUNCIONES AUXILIARES
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    getStatusText(status) {
        const statusMap = {
            'todo': 'Por hacer',
            'inprogress': 'En progreso',
            'done': 'Completada'
        };
        return statusMap[status] || status;
    }

    getProjectText(project) {
        const projectMap = {
            'personal': 'Personal',
            'trabajo': 'Trabajo',
            'estudios': 'Estudios'
        };
        return projectMap[project] || project;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        try {
            const savedTasks = JSON.parse(localStorage.getItem('tasks'));
            if (savedTasks) {
                this.tasks = savedTasks;
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.taskManager = new TaskManager();
});