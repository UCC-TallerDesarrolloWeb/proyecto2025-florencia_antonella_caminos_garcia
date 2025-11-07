/**
 * @file Gestor principal de tareas con funciones flechas
 * @description Sistema completo de gestión de tareas con vistas Kanban, Calendario y Lista
 * @version 1.0.0
 */

/**
 * @classdesc Clase principal que gestiona todas las operaciones del gestor de tareas
 * @class TaskManager
 */
const TaskManager = () => {
    // Estado interno de la aplicación
    let state = {
        tasks: JSON.parse(localStorage.getItem('tasks')) || [],
        projects: JSON.parse(localStorage.getItem('projects')) || ['Personal'],
        currentProject: 'Personal',
        currentView: 'kanban',
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        theme: localStorage.getItem('theme') || 'light'
    };

    // Referencias a elementos DOM
    const elements = {
        taskForm: document.getElementById('task-form'),
        projectModal: document.getElementById('project-modal'),
        projectList: document.getElementById('project-list'),
        taskProjectSelect: document.getElementById('taskProject'),
        todoList: document.getElementById('todo-tasks'),
        inprogressList: document.getElementById('inprogress_tasks'),
        doneList: document.getElementById('done-tasks'),
        listViewContainer: document.getElementById('list-tasks-container'),
        calendarContainer: document.getElementById('calendar'),
        calendarHeader: document.getElementById('current-month'),
        totalTasksElem: document.getElementById('total-tasks'),
        completedTasksElem: document.getElementById('completed-tasks'),
        inprogressTasksElem: document.getElementById('inprogress-tasks'),
        pendingTasksElem: document.getElementById('pending-tasks')
    };

    /**
     * @method initialize
     * @description Inicializa la aplicación y configura todos los event listeners
     * @returns {void}
     */
    const initialize = () => {
        applyTheme(state.theme);
        bindEvents();
        renderProjects();
        renderTasks();
        updateStats();
        renderCalendar();
        switchToView(state.currentView);
    };

    /**
     * @method bindEvents
     * @description Configura todos los event listeners del DOM
     * @returns {void}
     */
    const bindEvents = () => {
        // Eventos de teclado
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Eventos de drag and drop
        ['todo', 'inprogress', 'done'].forEach(status => {
            const list = document.getElementById(
                status === 'inprogress' ? 'inprogress_tasks' : `${status}-tasks`
            );
            list?.addEventListener('dragover', e => e.preventDefault());
            list?.addEventListener('drop', e => handleDrop(e, status));
        });

        // Navegación del calendario
        document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));
    };

    /**
     * @method handleKeyboardShortcuts
     * @description Maneja los atajos de teclado de la aplicación
     * @param {KeyboardEvent} e - Evento del teclado
     * @returns {void}
     */
    const handleKeyboardShortcuts = (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    openTaskForm();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('search-tasks-sidebar')?.focus();
                    break;
                case 's':
                    e.preventDefault();
                    if (elements.taskForm.style.display === 'block') {
                        handleTaskFormSubmit();
                    }
                    break;
            }
        }

        if (e.key === 'Escape') {
            closeTaskForm();
            closeProjectModal();
        }
    };

    // ==========================
    // GESTIÓN DE TAREAS
    // ==========================

    /**
     * @method openTaskForm
     * @description Abre el formulario para crear/editar tareas
     * @param {Object} task - Tarea existente para editar (opcional)
     * @returns {void}
     */
    const openTaskForm = (task = null) => {
        elements.taskForm.style.display = 'block';
        populateProjectSelect();
        if (task) fillTaskForm(task);
    };

    /**
     * @method closeTaskForm
     * @description Cierra el formulario de tareas y limpia los campos
     * @returns {void}
     */
    const closeTaskForm = () => {
        elements.taskForm.style.display = 'none';
        elements.taskForm.reset();
        document.getElementById('comments-list').innerHTML = '';
        document.getElementById('taskId').value = '';
    };

    /**
     * @method handleTaskFormSubmit
     * @description Maneja el envío del formulario de tareas
     * @returns {void}
     */
    const handleTaskFormSubmit = () => {
        const id = document.getElementById('taskId').value || Date.now().toString();
        const title = document.getElementById('taskTitle').value.trim();
        const project = document.getElementById('taskProject').value;
        const description = document.getElementById('taskDescription').value.trim();
        const status = document.querySelector('input[name="priority"]:checked')?.value.toLowerCase() || 'todo';
        const dueDate = document.getElementById('dueDate').value;
        const tags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(el => el.value);
        const subtasks = document.getElementById('subtasks').value.split(',').map(s => s.trim()).filter(Boolean);

        if (!title) {
            alert('El título es obligatorio');
            return;
        }

        const existingIndex = state.tasks.findIndex(t => t.id === id);
        const taskData = {
            id,
            title,
            project,
            description,
            status,
            dueDate,
            tags,
            subtasks,
            comments: [],
            createdAt: existingIndex > -1 ? state.tasks[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex > -1) {
            state.tasks[existingIndex] = taskData;
        } else {
            state.tasks.push(taskData);
        }

        saveTasks();
        renderTasks();
        renderCalendar();
        closeTaskForm();
    };

    /**
     * @method fillTaskForm
     * @description Rellena el formulario con los datos de una tarea existente
     * @param {Object} task - Tarea a editar
     * @returns {void}
     */
    const fillTaskForm = (task) => {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskProject').value = task.project;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('dueDate').value = task.dueDate;
        document.getElementById('subtasks').value = task.subtasks.join(', ');

        // Seleccionar tags
        document.querySelectorAll('input[name="tags"]').forEach(cb => {
            cb.checked = task.tags.includes(cb.value);
        });

        // Seleccionar prioridad
        const priorityRadio = document.querySelector(
            `input[name="priority"][value="${task.status.charAt(0).toUpperCase() + task.status.slice(1)}"]`
        );
        if (priorityRadio) priorityRadio.checked = true;
    };

    /**
     * @method quickAddTask
     * @description Crea una tarea rápida sin formulario completo
     * @param {string} status - Estado inicial de la tarea
     * @returns {void}
     */
    const quickAddTask = (status = 'todo') => {
        const title = prompt('Título de la tarea rápida:');
        if (title) {
            const taskData = {
                id: Date.now().toString(),
                title: title.trim(),
                project: state.currentProject,
                description: '',
                status: status,
                dueDate: '',
                tags: [],
                subtasks: [],
                comments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            state.tasks.push(taskData);
            saveTasks();
            renderTasks();
        }
    };

    // ==========================
    // GESTIÓN DE PROYECTOS
    // ==========================

    /**
     * @method openProjectModal
     * @description Abre el modal para crear nuevos proyectos
     * @returns {void}
     */
    const openProjectModal = () => {
        elements.projectModal.style.display = 'block';
        document.getElementById('new-project-name').focus();
    };

    /**
     * @method closeProjectModal
     * @description Cierra el modal de proyectos
     * @returns {void}
     */
    const closeProjectModal = () => {
        elements.projectModal.style.display = 'none';
        document.getElementById('new-project-name').value = '';
    };

    /**
     * @method createProjectFromModal
     * @description Crea un nuevo proyecto desde el modal
     * @returns {void}
     */
    const createProjectFromModal = () => {
        const projectName = document.getElementById('new-project-name').value.trim();
        if (!projectName) {
            alert('Ingrese un nombre de proyecto');
            return;
        }

        if (!state.projects.includes(projectName)) {
            state.projects.push(projectName);
            state.currentProject = projectName;
            saveProjects();
            renderProjects();
            renderTasks();
        }

        closeProjectModal();
    };

    /**
     * @method deleteCurrentProject
     * @description Elimina el proyecto actual y sus tareas
     * @returns {void}
     */
    const deleteCurrentProject = () => {
        if (state.currentProject === 'Personal') {
            alert('No se puede eliminar el proyecto por defecto');
            return;
        }

        if (!confirm(`¿Eliminar proyecto "${state.currentProject}"? Se eliminarán todas sus tareas.`)) {
            return;
        }

        state.tasks = state.tasks.filter(t => t.project !== state.currentProject);
        state.projects = state.projects.filter(p => p !== state.currentProject);
        state.currentProject = state.projects[0];

        saveProjects();
        saveTasks();
        renderProjects();
        renderTasks();
    };

    /**
     * @method populateProjectSelect
     * @description Llena el select de proyectos en el formulario
     * @returns {void}
     */
    const populateProjectSelect = () => {
        if (!elements.taskProjectSelect) return;

        elements.taskProjectSelect.innerHTML = '';
        state.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            elements.taskProjectSelect.appendChild(option);
        });
    };

    /**
     * @method renderProjects
     * @description Renderiza la lista de proyectos en la sidebar
     * @returns {void}
     */
    const renderProjects = () => {
        if (!elements.projectList) return;

        elements.projectList.innerHTML = '';
        state.projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project;
            li.className = project === state.currentProject ? 'active' : '';

            li.addEventListener('click', () => {
                state.currentProject = project;
                renderProjects();
                renderTasks();
                updateStats();
            });

            elements.projectList.appendChild(li);
        });
    };

    // ==========================
    // RENDERIZADO DE TAREAS
    // ==========================

    /**
     * @method renderTasks
     * @description Renderiza todas las tareas en las vistas correspondientes
     * @returns {void}
     */
    const renderTasks = () => {
        clearTaskLists();
        const filteredTasks = state.tasks.filter(t => t.project === state.currentProject);

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);

            // Vista Kanban
            switch(task.status) {
                case 'todo':
                    elements.todoList.appendChild(taskElement);
                    break;
                case 'inprogress':
                    elements.inprogressList.appendChild(taskElement);
                    break;
                case 'done':
                    elements.doneList.appendChild(taskElement);
                    break;
            }

            // Vista Lista
            renderTaskInListView(task);
        });

        updateTaskCounts();
        updateStats();
    };

    /**
     * @method createTaskElement
     * @description Crea un elemento DOM para una tarea
     * @param {Object} task - Tarea a renderizar
     * @returns {HTMLElement} Elemento DOM de la tarea
     */
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.status} priority-${task.tags.includes('Alta') ? 'high' : 'normal'}`;
        li.draggable = true;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-header">
                <h4>${escapeHtml(task.title)}</h4>
                <span class="task-priority ${task.tags.includes('Alta') ? 'high' : ''}">
                    ${task.tags.includes('Alta') ? '🔥' : '⚡'}
                </span>
            </div>
            <div class="task-body">
                <p>${escapeHtml(task.description) || 'Sin descripción'}</p>
                ${task.dueDate ? `<span class="task-due">📅 ${formatDate(task.dueDate)}</span>` : ''}
            </div>
            <div class="task-footer">
                <button onclick="window.taskManager.editTask('${task.id}')">✏️</button>
                <button onclick="window.taskManager.deleteTask('${task.id}')">🗑️</button>
            </div>
        `;

        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        li.addEventListener('dblclick', () => openTaskForm(task));

        return li;
    };

    /**
     * @method renderTaskInListView
     * @description Renderiza una tarea en la vista de lista
     * @param {Object} task - Tarea a renderizar
     * @returns {void}
     */
    const renderTaskInListView = (task) => {
        if (!elements.listViewContainer) return;

        const div = document.createElement('div');
        div.className = 'list-task-item';
        div.innerHTML = `
            <div class="list-task-header">
                <h4>${escapeHtml(task.title)}</h4>
                <span class="task-status ${task.status}">${getStatusText(task.status)}</span>
            </div>
            <p>${escapeHtml(task.description) || 'Sin descripción'}</p>
            <div class="list-task-meta">
                ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
                ${task.tags.length > 0 ? `<span>🏷️ ${task.tags.join(', ')}</span>` : ''}
            </div>
        `;

        div.addEventListener('click', () => openTaskForm(task));
        elements.listViewContainer.appendChild(div);
    };

    // ==========================
    // VISTAS Y NAVEGACIÓN
    // ==========================

    /**
     * @method switchToView
     * @description Cambia entre las diferentes vistas de la aplicación
     * @param {string} view - Vista a mostrar ('kanban', 'calendar', 'list')
     * @returns {void}
     */
    const switchToView = (view) => {
        state.currentView = view;

        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));

        // Mostrar vista seleccionada
        const viewElement = document.getElementById(
            view === 'kanban' ? 'board' :
                view === 'calendar' ? 'calendar-view' : 'list-view'
        );
        const buttonElement = document.getElementById(`btn-${view}-view`);

        if (viewElement) viewElement.classList.add('active');
        if (buttonElement) buttonElement.classList.add('active');

        if (view === 'calendar') {
            renderCalendar();
        }
    };

    /**
     * @method renderCalendar
     * @description Renderiza la vista de calendario con las tareas
     * @returns {void}
     */
    const renderCalendar = () => {
        if (!elements.calendarContainer) return;

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
        const lastDate = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
        const today = new Date();

        elements.calendarHeader.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
        elements.calendarContainer.innerHTML = '';

        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        // Encabezados de días
        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Días vacíos iniciales
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Días del mes
        for (let day = 1; day <= lastDate; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';

            const dateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = state.tasks.filter(t =>
                t.dueDate === dateStr && t.project === state.currentProject
            );

            if (day === today.getDate() &&
                state.currentMonth === today.getMonth() &&
                state.currentYear === today.getFullYear()) {
                dayCell.classList.add('today');
            }

            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-number';
            dayLabel.textContent = day;
            dayCell.appendChild(dayLabel);

            dayTasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = `calendar-task priority-${task.tags.includes('Alta') ? 'high' : 'normal'}`;
                taskDiv.textContent = task.title;
                taskDiv.title = task.description;
                dayCell.appendChild(taskDiv);
            });

            calendarGrid.appendChild(dayCell);
        }

        elements.calendarContainer.appendChild(calendarGrid);
    };

    /**
     * @method changeMonth
     * @description Navega entre meses en el calendario
     * @param {number} delta - Dirección del cambio (-1: anterior, 1: siguiente)
     * @returns {void}
     */
    const changeMonth = (delta) => {
        state.currentMonth += delta;

        if (state.currentMonth > 11) {
            state.currentMonth = 0;
            state.currentYear++;
        } else if (state.currentMonth < 0) {
            state.currentMonth = 11;
            state.currentYear--;
        }

        renderCalendar();
    };

    // ==========================
    // BÚSQUEDA Y FILTRADO
    // ==========================

    /**
     * @method searchTasks
     * @description Busca tareas por texto en título y descripción
     * @param {string} query - Texto de búsqueda
     * @returns {void}
     */
    const searchTasks = (query) => {
        const searchTerm = query.toLowerCase().trim();
        const taskItems = document.querySelectorAll('.task-item, .list-task-item');

        taskItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    };

    /**
     * @method filterTasksByCriteria
     * @description Filtra tareas por criterios específicos
     * @param {string} criteria - Criterio de filtrado
     * @returns {void}
     */
    const filterTasksByCriteria = (criteria) => {
        const taskItems = document.querySelectorAll('.task-item, .list-task-item');

        taskItems.forEach(item => {
            const taskId = item.dataset.id;
            const task = state.tasks.find(t => t.id === taskId);

            if (!task) return;

            const shouldShow = !criteria || task.tags.includes(criteria);
            item.style.display = shouldShow ? 'block' : 'none';
        });
    };

    /**
     * @method sortTasks
     * @description Ordena las tareas según el criterio seleccionado
     * @returns {void}
     */
    const sortTasks = () => {
        const sortBy = document.getElementById('sort-tasks-sidebar')?.value || 'fecha';

        state.tasks.sort((a, b) => {
            switch(sortBy) {
                case 'nombre':
                    return a.title.localeCompare(b.title);
                case 'fecha':
                    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
                case 'reciente':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'prioridad':
                    const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
                    return (priorityOrder[b.tags[0]] || 0) - (priorityOrder[a.tags[0]] || 0);
                default:
                    return 0;
            }
        });

        saveTasks();
        renderTasks();
    };

    // ==========================
    // DRAG AND DROP
    // ==========================

    /**
     * @method handleDrop
     * @description Maneja el evento de soltar tareas en las columnas
     * @param {DragEvent} e - Evento de drag and drop
     * @param {string} newStatus - Nuevo estado de la tarea
     * @returns {void}
     */
    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = state.tasks.find(t => t.id === taskId);

        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        }
    };

    // ==========================
    // ESTADÍSTICAS Y MÉTRICAS
    // ==========================

    /**
     * @method updateStats
     * @description Actualiza las estadísticas mostradas en la sidebar
     * @returns {void}
     */
    const updateStats = () => {
        const projectTasks = state.tasks.filter(t => t.project === state.currentProject);
        const total = projectTasks.length;
        const completed = projectTasks.filter(t => t.status === 'done').length;
        const inProgress = projectTasks.filter(t => t.status === 'inprogress').length;
        const pending = projectTasks.filter(t => t.status === 'todo').length;

        if (elements.totalTasksElem) elements.totalTasksElem.textContent = total;
        if (elements.completedTasksElem) elements.completedTasksElem.textContent = completed;
        if (elements.inprogressTasksElem) elements.inprogressTasksElem.textContent = inProgress;
        if (elements.pendingTasksElem) elements.pendingTasksElem.textContent = pending;
    };

    /**
     * @method updateTaskCounts
     * @description Actualiza los contadores de tareas en las columnas Kanban
     * @returns {void}
     */
    const updateTaskCounts = () => {
        const counts = {
            todo: state.tasks.filter(t => t.status === 'todo' && t.project === state.currentProject).length,
            inprogress: state.tasks.filter(t => t.status === 'inprogress' && t.project === state.currentProject).length,
            done: state.tasks.filter(t => t.status === 'done' && t.project === state.currentProject).length
        };

        Object.keys(counts).forEach(status => {
            const countElement = document.querySelector(`#${status} .task-count`);
            if (countElement) countElement.textContent = counts[status];
        });
    };

    // ==========================
    // PERSISTENCIA
    // ==========================

    /**
     * @method saveTasks
     * @description Guarda las tareas en localStorage
     * @returns {void}
     */
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
    };

    /**
     * @method saveProjects
     * @description Guarda los proyectos en localStorage
     * @returns {void}
     */
    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(state.projects));
    };

    // ==========================
    // TEMAS Y CONFIGURACIÓN
    // ==========================

    /**
     * @method toggleTheme
     * @description Alterna entre tema claro y oscuro
     * @returns {void}
     */
    const toggleTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        localStorage.setItem('theme', state.theme);
    };

    /**
     * @method applyTheme
     * @description Aplica el tema seleccionado al documento
     * @param {string} theme - Nombre del tema ('light' o 'dark')
     * @returns {void}
     */
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);

        const lightIcon = document.querySelector('.light-icon');
        const darkIcon = document.querySelector('.dark-icon');

        if (lightIcon && darkIcon) {
            lightIcon.style.display = theme === 'light' ? 'none' : 'inline';
            darkIcon.style.display = theme === 'dark' ? 'none' : 'inline';
        }
    };

    // ==========================
    // FUNCIONES AUXILIARES
    // ==========================

    /**
     * @method clearTaskLists
     * @description Limpia todas las listas de tareas
     * @returns {void}
     */
    const clearTaskLists = () => {
        if (elements.todoList) elements.todoList.innerHTML = '';
        if (elements.inprogressList) elements.inprogressList.innerHTML = '';
        if (elements.doneList) elements.doneList.innerHTML = '';
        if (elements.listViewContainer) elements.listViewContainer.innerHTML = '';
    };

    /**
     * @method escapeHtml
     * @description Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * @method formatDate
     * @description Formatea una fecha para mostrar
     * @param {string} dateString - Fecha en formato string
     * @returns {string} Fecha formateada
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    /**
     * @method getStatusText
     * @description Obtiene el texto descriptivo de un estado
     * @param {string} status - Estado de la tarea
     * @returns {string} Texto del estado
     */
    const getStatusText = (status) => {
        const statusMap = {
            'todo': 'Pendiente',
            'inprogress': 'En Progreso',
            'done': 'Completada'
        };
        return statusMap[status] || status;
    };

    // ==========================
    // API PÚBLICA
    // ==========================

    return {
        // Inicialización
        initialize,

        // Tareas
        openTaskForm,
        closeTaskForm,
        handleTaskFormSubmit,
        quickAddTask,
        editTask: (id) => {
            const task = state.tasks.find(t => t.id === id);
            if (task) openTaskForm(task);
        },
        deleteTask: (id) => {
            if (confirm('¿Eliminar esta tarea?')) {
                state.tasks = state.tasks.filter(t => t.id !== id);
                saveTasks();
                renderTasks();
            }
        },

        // Proyectos
        openProjectModal,
        closeProjectModal,
        createProjectFromModal,
        deleteCurrentProject,

        // Vistas
        switchToView,
        renderCalendar,
        navigateCalendar: () => changeMonth(1), // Para compatibilidad con HTML

        // Búsqueda y Filtrado
        searchTasks,
        filterTasksByCriteria,
        sortTasks,

        // Drag and Drop
        handleDrop,

        // UI y Configuración
        toggleTheme,
        showHelp: () => {
            document.getElementById('shortcut-help').style.display = 'block';
        },
        closeHelp: () => {
            document.getElementById('shortcut-help').style.display = 'none';
        },

        // Métodos de acceso para debugging
        getState: () => ({ ...state }),
        getTasks: () => [...state.tasks],
        getProjects: () => [...state.projects]
    };
};

// ==========================
// INICIALIZACIÓN
// ==========================

/**
 * @description Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = TaskManager();
    window.taskManager.initialize();

    console.log('✅ Task Manager Pro inicializado correctamente');
});