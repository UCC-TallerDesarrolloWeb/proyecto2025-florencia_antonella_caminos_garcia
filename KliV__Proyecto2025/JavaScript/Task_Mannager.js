/**
 * @file Gestor completo optimizado de tareas con funciones flecha
 * @description Sistema eficiente de gestión de tareas con todas las funcionalidades
 * @version 3.0.0
 * @author Florencia Antonella Caminos Garcia
 */

/**
 * @classdesc Clase completa optimizada que gestiona todas las operaciones
 * @class TaskManager
 * @returns {Object} API pública completa con métodos optimizados
 */
const TaskManager = () => {
    // Estado interno optimizado
    const state = {
        tasks: JSON.parse(localStorage.getItem('tasks')) || [],
        projects: JSON.parse(localStorage.getItem('projects')) || ['Personal'],
        currentProject: 'Personal',
        currentView: 'kanban',
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        theme: localStorage.getItem('theme') || 'light'
    };

    // Cache para optimización
    let taskCache = new Map();
    let cacheDirty = true;
    let currentTaskToDelete = null;

    // Constantes para comparaciones rápidas
    const STATUS = {
        TODO: 'todo',
        INPROGRESS: 'inprogress',
        DONE: 'done'
    };

    // Referencias a elementos DOM
    const elements = {
        taskForm: document.getElementById('task-form'),
        projectModal: document.getElementById('project-modal'),
        deleteConfirmModal: document.getElementById('delete-confirm'),
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

    // ==========================
    // FUNCIONES DE CIERRE OPTIMIZADAS
    // ==========================

    /**
     * @method closeTaskForm
     * @description Cierra el formulario de tareas y restablece todos los campos
     *              a sus valores por defecto. Limpia los comentarios y el ID de tarea.
     * @returns {void}
     */
    const closeTaskForm = () => {
        if (!elements.taskForm) return;

        // Ocultar el formulario
        elements.taskForm.style.display = 'none';

        // Restablecer el formulario a valores por defecto
        elements.taskForm.reset();

        // Limpiar comentarios
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = '';
        }

        // Limpiar ID de tarea
        const taskIdInput = document.getElementById('taskId');
        if (taskIdInput) {
            taskIdInput.value = '';
        }

        // Restablecer visibilidad de comentarios si estaba oculta
        const commentsSection = document.getElementById('task-comments');
        const showCommentsBtn = document.getElementById('btn-show-comments');
        if (commentsSection && showCommentsBtn) {
            commentsSection.style.display = 'block';
            showCommentsBtn.textContent = 'Ocultar Comentarios';
        }

        console.log('📝 Formulario de tarea cerrado');
    };

    /**
     * @method closeDeleteModal
     * @description Cierra el modal de confirmación de eliminación y restablece
     *              el estado de la tarea pendiente de eliminación.
     * @returns {void}
     */
    const closeDeleteModal = () => {
        // Restablecer la tarea pendiente de eliminación
        currentTaskToDelete = null;

        // Ocultar el modal
        if (elements.deleteConfirmModal) {
            elements.deleteConfirmModal.style.display = 'none';
        }

        console.log('🗑️ Modal de eliminación cerrado');
    };

    /**
     * @method closeProjectModal
     * @description Cierra el modal de creación de proyectos y limpia el campo
     *              de nombre del proyecto.
     * @returns {void}
     */
    const closeProjectModal = () => {
        if (!elements.projectModal) return;

        // Ocultar el modal
        elements.projectModal.style.display = 'none';

        // Limpiar el campo de nombre del proyecto
        const projectNameInput = document.getElementById('new-project-name');
        if (projectNameInput) {
            projectNameInput.value = '';
        }

        console.log('📁 Modal de proyecto cerrado');
    };

    /**
     * @method initialize
     * @description Inicializa la aplicación completamente
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
     * @description Configura todos los event listeners de manera eficiente
     * @returns {void}
     */
    const bindEvents = () => {
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Drag and drop optimizado
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
     * @description Maneja atajos de teclado de forma optimizada
     * @param {KeyboardEvent} e - Evento del teclado
     * @returns {void}
     */
    const handleKeyboardShortcuts = (e) => {
        if (e.ctrlKey || e.metaKey) {
            const actions = {
                'n': () => { e.preventDefault(); openTaskForm(); },
                'f': () => { e.preventDefault(); document.getElementById('search-tasks-sidebar')?.focus(); },
                's': () => { e.preventDefault(); elements.taskForm.style.display === 'block' && handleTaskFormSubmit(); }
            };
            actions[e.key]?.();
        }

        if (e.key === 'Escape') {
            closeTaskForm();
            closeProjectModal();
            closeDeleteModal();
            closeHelp();
        }
    };

    // ==========================
    // GESTIÓN COMPLETA DE TAREAS
    // ==========================

    /**
     * @method deleteTask
     * @description Elimina una tarea de manera eficiente con confirmación
     * @param {string} taskId - ID de la tarea a eliminar
     * @returns {void}
     */
    const deleteTask = (taskId) => {
        currentTaskToDelete = taskId;

        // Mostrar modal de confirmación
        if (elements.deleteConfirmModal) {
            elements.deleteConfirmModal.style.display = 'block';
        } else {
            // Fallback: confirmación básica si no hay modal
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                confirmTaskDeletion();
            }
        }
    };

    /**
     * @method confirmTaskDeletion
     * @description Confirma y ejecuta la eliminación de la tarea
     * @returns {void}
     */
    const confirmTaskDeletion = () => {
        if (!currentTaskToDelete) return;

        const initialLength = state.tasks.length;
        state.tasks = state.tasks.filter(t => t.id !== currentTaskToDelete);

        const deleted = state.tasks.length < initialLength;
        if (deleted) {
            cacheDirty = true;
            saveTasks();
            renderTasks();
            renderCalendar();
            updateStats();
        }

        // Limpiar y cerrar modal
        currentTaskToDelete = null;
        closeDeleteModal();
    };

    /**
     * @method deleteCompletedTasks
     * @description Elimina todas las tareas completadas del proyecto actual
     * @returns {void}
     */
    const deleteCompletedTasks = () => {
        if (!confirm('¿Estás seguro de que quieres eliminar todas las tareas completadas?')) {
            return;
        }

        const initialLength = state.tasks.length;
        state.tasks = state.tasks.filter(t =>
            !(t.project === state.currentProject && t.status === STATUS.DONE)
        );

        if (state.tasks.length < initialLength) {
            cacheDirty = true;
            saveTasks();
            renderTasks();
            renderCalendar();
            updateStats();
        }
    };

    /**
     * @method openTaskForm
     * @description Abre el formulario para crear/editar tareas
     * @param {Object} task - Tarea existente para editar
     * @returns {void}
     */
    const openTaskForm = (task = null) => {
        elements.taskForm.style.display = 'block';
        populateProjectSelect();
        task && fillTaskForm(task);
    };

    /**
     * @method handleTaskFormSubmit
     * @description Maneja el envío del formulario de manera optimizada
     * @returns {void}
     */
    const handleTaskFormSubmit = () => {
        const id = document.getElementById('taskId').value || Date.now().toString();
        const title = document.getElementById('taskTitle').value.trim();
        const project = document.getElementById('taskProject').value;
        const description = document.getElementById('taskDescription').value.trim();
        const status = document.querySelector('input[name="priority"]:checked')?.value.toLowerCase() || STATUS.TODO;
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
            comments: existingIndex > -1 ? state.tasks[existingIndex].comments : [],
            createdAt: existingIndex > -1 ? state.tasks[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex > -1) {
            state.tasks[existingIndex] = taskData;
        } else {
            state.tasks.push(taskData);
        }

        cacheDirty = true;
        saveTasks();
        renderTasks();
        renderCalendar();
        closeTaskForm();
    };

    /**
     * @method fillTaskForm
     * @description Rellena el formulario con datos de tarea existente
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

        // Renderizar comentarios
        renderTaskComments(task);
    };

    /**
     * @method renderTaskComments
     * @description Renderiza comentarios de tarea de manera eficiente
     * @param {Object} task - Tarea con comentarios
     * @returns {void}
     */
    const renderTaskComments = (task) => {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        commentsList.innerHTML = '';
        task.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.innerHTML = `
                <strong>${escapeHtml(comment.author)}</strong>
                <span class="comment-time">${formatDate(comment.timestamp)}</span>
                <p>${escapeHtml(comment.text)}</p>
            `;
            commentsList.appendChild(commentDiv);
        });
    };

    /**
     * @method quickAddTask
     * @description Crea tarea rápida de manera optimizada
     * @param {string} status - Estado de la tarea
     * @returns {void}
     */
    const quickAddTask = (status = STATUS.TODO) => {
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
            cacheDirty = true;
            saveTasks();
            renderTasks();
        }
    };

    // ==========================
    // GESTIÓN COMPLETA DE PROYECTOS
    // ==========================

    /**
     * @method openProjectModal
     * @description Abre modal de proyectos
     * @returns {void}
     */
    const openProjectModal = () => {
        elements.projectModal.style.display = 'block';
        document.getElementById('new-project-name').focus();
    };

    /**
     * @method createProjectFromModal
     * @description Crea proyecto desde modal
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
            cacheDirty = true;
            saveProjects();
            renderProjects();
            renderTasks();
        }

        closeProjectModal();
    };

    /**
     * @method deleteCurrentProject
     * @description Elimina proyecto actual y sus tareas
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

        cacheDirty = true;
        saveProjects();
        saveTasks();
        renderProjects();
        renderTasks();
    };

    /**
     * @method populateProjectSelect
     * @description Llena select de proyectos de manera eficiente
     * @returns {void}
     */
    const populateProjectSelect = () => {
        const selectElement = elements.taskProjectSelect;
        if (!selectElement || selectElement.tagName !== "SELECT") return;

        selectElement.innerHTML = "";
        state.projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project;
            option.textContent = project;
            selectElement.appendChild(option);
        });
    };

    /**
     * @method renderProjects
     * @description Renderiza lista de proyectos optimizada
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
                cacheDirty = true;
                renderProjects();
                renderTasks();
                updateStats();
            });

            elements.projectList.appendChild(li);
        });
    };

    // ==========================
    // RENDERIZADO COMPLETO OPTIMIZADO
    // ==========================

    /**
     * @method renderTasks
     * @description Renderiza todas las tareas de manera eficiente
     * @returns {void}
     */
    const renderTasks = () => {
        clearTaskLists();
        cacheDirty = false;

        const filteredTasks = state.tasks.filter(t => t.project === state.currentProject);

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            getTaskList(task.status)?.appendChild(taskElement);
            renderTaskInListView(task);
        });

        updateTaskCounts();
        updateStats();
    };

    /**
     * @method createTaskElement
     * @description Crea elemento DOM optimizado para tarea
     * @param {Object} task - Tarea a renderizar
     * @returns {HTMLElement} - Elemento DOM creado
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
     * @description Renderiza tarea en vista de lista
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
    // VISTAS Y NAVEGACIÓN COMPLETAS
    // ==========================

    /**
     * @method switchToView
     * @description Cambia entre vistas de manera optimizada
     * @param {string} view - Vista a mostrar
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
     * @description Renderiza calendario de manera eficiente
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
     * @description Cambia mes en calendario
     * @param {number} delta - Dirección del cambio
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
    // BÚSQUEDA Y FILTRADO COMPLETOS
    // ==========================

    /**
     * @method searchTasks
     * @description Búsqueda eficiente con cache
     * @param {string} query - Texto de búsqueda
     * @returns {void}
     */
    const searchTasks = (query) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            renderTasks();
            return;
        }

        const cacheKey = `search_${searchTerm}_${state.currentProject}`;
        if (!cacheDirty && taskCache.has(cacheKey)) {
            renderFilteredTasks(taskCache.get(cacheKey));
            return;
        }

        const results = state.tasks.filter(task =>
            task.project === state.currentProject &&
            (task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm))
        );

        taskCache.set(cacheKey, results);
        renderFilteredTasks(results);
    };

    /**
     * @method filterTasksByCriteria
     * @description Filtrado eficiente por criterios
     * @param {string} criteria - Criterio de filtrado
     * @returns {void}
     */
    const filterTasksByCriteria = (criteria) => {
        if (!criteria) {
            renderTasks();
            return;
        }

        const cacheKey = `filter_${criteria}_${state.currentProject}`;
        if (!cacheDirty && taskCache.has(cacheKey)) {
            renderFilteredTasks(taskCache.get(cacheKey));
            return;
        }

        const results = state.tasks.filter(task =>
            task.project === state.currentProject && task.tags.includes(criteria)
        );

        taskCache.set(cacheKey, results);
        renderFilteredTasks(results);
    };

    /**
     * @method sortTasks
     * @description Ordena tareas de manera optimizada
     * @returns {void}
     */
    const sortTasks = () => {
        const sortBy = document.getElementById('sort-tasks-sidebar')?.value || 'fecha';

        state.tasks.sort((a, b) => {
            const sorters = {
                'nombre': () => a.title.localeCompare(b.title),
                'fecha': () => new Date(a.dueDate || 0) - new Date(b.dueDate || 0),
                'reciente': () => new Date(b.createdAt) - new Date(a.createdAt),
                'prioridad': () => {
                    const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
                    return (priorityOrder[b.tags[0]] || 0) - (priorityOrder[a.tags[0]] || 0);
                }
            };
            return sorters[sortBy]?.() || 0;
        });

        cacheDirty = true;
        saveTasks();
        renderTasks();
    };

    // ==========================
    // DRAG AND DROP OPTIMIZADO
    // ==========================

    /**
     * @method handleDrop
     * @description Maneja drop de tareas entre columnas
     * @param {DragEvent} e - Evento de drop
     * @param {string} newStatus - Nuevo estado
     * @returns {void}
     */
    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = state.tasks.find(t => t.id === taskId);

        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            cacheDirty = true;
            saveTasks();
            renderTasks();
        }
    };

    // ==========================
    // ESTADÍSTICAS Y MÉTRICAS COMPLETAS
    // ==========================

    /**
     * @method updateStats
     * @description Actualiza estadísticas de manera eficiente
     * @returns {void}
     */
    const updateStats = () => {
        const stats = getStats();

        const updates = [
            { elem: elements.totalTasksElem, value: stats.total },
            { elem: elements.completedTasksElem, value: stats.completed },
            { elem: elements.inprogressTasksElem, value: stats.inprogress },
            { elem: elements.pendingTasksElem, value: stats.pending }
        ];

        updates.forEach(({ elem, value }) => {
            if (elem) elem.textContent = value;
        });
    };

    /**
     * @method getStats
     * @description Calcula estadísticas en una sola pasada
     * @returns {Object} - Estadísticas calculadas
     */
    const getStats = () => {
        const stats = { total: 0, completed: 0, inprogress: 0, pending: 0 };

        state.tasks.forEach(task => {
            if (task.project === state.currentProject) {
                stats.total++;
                if (task.status === STATUS.DONE) stats.completed++;
                else if (task.status === STATUS.INPROGRESS) stats.inprogress++;
                else if (task.status === STATUS.TODO) stats.pending++;
            }
        });

        return stats;
    };

    /**
     * @method updateTaskCounts
     * @description Actualiza contadores de tareas
     * @returns {void}
     */
    const updateTaskCounts = () => {
        const counts = {
            todo: state.tasks.filter(t => t.status === STATUS.TODO && t.project === state.currentProject).length,
            inprogress: state.tasks.filter(t => t.status === STATUS.INPROGRESS && t.project === state.currentProject).length,
            done: state.tasks.filter(t => t.status === STATUS.DONE && t.project === state.currentProject).length
        };

        Object.keys(counts).forEach(status => {
            const countElement = document.querySelector(`#${status} .task-count`);
            if (countElement) countElement.textContent = counts[status];
        });
    };

    // ==========================
    // FUNCIONALIDADES ADICIONALES COMPLETAS
    // ==========================

    /**
     * @method addCommentToTask
     * @description Agrega comentario a tarea actual
     * @returns {void}
     */
    const addCommentToTask = () => {
        const taskId = document.getElementById('taskId').value;
        const commentText = document.getElementById('new-comment').value.trim();

        if (!taskId || !commentText) {
            alert('No hay tarea activa o comentario vacío');
            return;
        }

        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const comment = {
                id: Date.now().toString(),
                text: commentText,
                timestamp: new Date().toISOString(),
                author: 'Usuario'
            };

            task.comments.push(comment);
            task.updatedAt = new Date().toISOString();

            cacheDirty = true;
            saveTasks();
            renderTaskComments(task);
            document.getElementById('new-comment').value = '';
        }
    };

    /**
     * @method addCustomTag
     * @description Agrega etiqueta personalizada
     * @returns {void}
     */
    const addCustomTag = () => {
        const newTag = prompt('Ingresa el nombre de la nueva etiqueta:');
        if (newTag && newTag.trim()) {
            const tagsContainer = document.querySelector('.tags-container');
            if (tagsContainer) {
                const tagId = `tag-${newTag.toLowerCase().replace(/\s+/g, '-')}`;

                if (!document.getElementById(tagId)) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = tagId;
                    checkbox.name = 'tags';
                    checkbox.value = newTag;

                    const label = document.createElement('label');
                    label.htmlFor = tagId;
                    label.textContent = newTag;

                    tagsContainer.appendChild(checkbox);
                    tagsContainer.appendChild(label);
                } else {
                    alert('Esta etiqueta ya existe');
                }
            }
        }
    };

    /**
     * @method applyTaskTemplate
     * @description Aplica plantilla predefinida
     * @param {string} templateName - Nombre de la plantilla
     * @returns {void}
     */
    const applyTaskTemplate = (templateName) => {
        const templates = {
            reunion: {
                title: 'Reunión semanal',
                description: 'Reunión de seguimiento y planificación semanal',
                tags: ['Importante'],
                priority: 'Media'
            },
            revision: {
                title: 'Revisión de código',
                description: 'Revisar pull requests y código del equipo',
                tags: ['Urgente', 'Importante'],
                priority: 'Alta'
            },
            estudio: {
                title: 'Sesión de estudio',
                description: 'Tiempo dedicado al aprendizaje y desarrollo profesional',
                tags: ['Opcional'],
                priority: 'Baja'
            }
        };

        const template = templates[templateName];
        if (template) {
            document.getElementById('taskTitle').value = template.title;
            document.getElementById('taskDescription').value = template.description;

            const priorityRadio = document.querySelector(
                `input[name="priority"][value="${template.priority}"]`
            );
            if (priorityRadio) priorityRadio.checked = true;

            document.querySelectorAll('input[name="tags"]').forEach(cb => {
                cb.checked = template.tags.includes(cb.value);
            });
        }
    };

    /**
     * @method showDailySummary
     * @description Muestra resumen diario
     * @returns {void}
     */
    const showDailySummary = () => {
        const today = new Date().toISOString().split("T")[0];
        const todayTasks = state.tasks.filter(task => {
            const taskDate = task.dueDate ? task.dueDate.split("T")[0] : null;
            return taskDate === today;
        });

        const completedToday = todayTasks.filter(task => task.status === STATUS.DONE).length;
        const pendingToday = todayTasks.filter(task => task.status === STATUS.TODO).length;

        alert(`📊 Resumen Diario - ${formatDate(today)}\n\n` +
            `✅ Completadas hoy: ${completedToday}\n` +
            `⏳ Pendientes hoy: ${pendingToday}\n` +
            `📋 Total tareas del día: ${todayTasks.length}`);
    };

    /**
     * @method setDailyGoal
     * @description Establece meta diaria
     * @returns {void}
     */
    const setDailyGoal = () => {
        const GoalManager = {
            get: () => {
                const stored = localStorage.getItem('dailyGoal');
                return stored && !isNaN(stored) ? parseInt(stored) : 5;
            },
            set: (goal) => {
                localStorage.setItem('dailyGoal', goal.toString());
                return goal;
            },
            validate: (input) => {
                if (input === null) return { valid: false, reason: 'cancelled' };
                const number = parseInt(input);
                if (isNaN(number)) return { valid: false, reason: 'not-a-number' };
                if (number <= 0) return { valid: false, reason: 'too-low' };
                if (number > 100) return { valid: false, reason: 'too-high' };
                return { valid: true, value: number };
            }
        };

        const currentGoal = GoalManager.get();
        const userInput = prompt('Establecer meta diaria de tareas completadas:', currentGoal);
        const validation = GoalManager.validate(userInput);

        switch (validation.reason) {
            case 'cancelled': break;
            case 'not-a-number': alert('Por favor, introduce un número válido.'); break;
            case 'too-low': alert('La meta debe ser mayor que cero.'); break;
            case 'too-high': alert('La meta no puede ser mayor a 100 tareas.'); break;
            default: GoalManager.set(validation.value);
        }
    };

    /**
     * @method showHelp
     * @description Muestra ayuda de atajos
     * @returns {void}
     */
    const showHelp = () => {
        document.getElementById('shortcut-help').style.display = 'block';
    };

    /**
     * @method closeHelp
     * @description Cierra ayuda
     * @returns {void}
     */
    const closeHelp = () => {
        document.getElementById('shortcut-help').style.display = 'none';
    };

    /**
     * @method showTutorial
     * @description Muestra tutorial
     * @returns {void}
     */
    const showTutorial = () => {
        const tutorialContent = `
🎯 TUTORIAL - TASK MANAGER PRO

📋 VISTAS DISPONIBLES:
• Kanban: Organiza tareas en columnas (To Do, In Progress, Done)
• Calendario: Ve tus tareas organizadas por fechas
• Lista: Vista compacta de todas las tareas

🚀 FUNCIONALIDADES PRINCIPALES:
• Crear tareas con título, descripción, prioridad y fecha
• Arrastrar y soltar entre columnas
• Buscar y filtrar tareas
• Gestión de múltiples proyectos
• Comentarios en tareas
• Estadísticas de productividad

⌨️ ATAJOS DE TECLADO:
• Ctrl+N: Nueva tarea
• Ctrl+F: Buscar
• Ctrl+S: Guardar tarea
• Esc: Cerrar modales

💡 CONSEJOS:
• Usa etiquetas para categorizar tus tareas
• Establece metas diarias para mantener la productividad
• Revisa las estadísticas para trackear tu progreso
    `;
        alert(tutorialContent);
    };

    /**
     * @method toggleCommentsVisibility
     * @description Muestra/oculta comentarios
     * @returns {void}
     */
    const toggleCommentsVisibility = () => {
        const commentsSection = document.getElementById('task-comments');
        const btn = document.getElementById('btn-show-comments');

        if (commentsSection && btn) {
            const isVisible = commentsSection.style.display !== 'none';
            commentsSection.style.display = isVisible ? 'none' : 'block';
            btn.textContent = isVisible ? 'Mostrar Comentarios' : 'Ocultar Comentarios';
        }
    };

    /**
     * @method toggleNotifications
     * @description Activa/desactiva notificaciones
     * @returns {void}
     */
    const toggleNotifications = () => {
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
        const newStatus = !notificationsEnabled;

        localStorage.setItem('notificationsEnabled', newStatus.toString());

        const btn = document.getElementById('btn-notifications');
        if (btn) {
            btn.textContent = newStatus ? '🔔' : '🔕';
        }

        alert(`Notificaciones ${newStatus ? 'activadas' : 'desactivadas'}`);
    };

    /**
     * @method undoLastAction
     * @description Intenta deshacer última acción
     * @returns {void}
     */
    const undoLastAction = () => {
        const lastTaskCount = localStorage.getItem('lastTaskCount');
        const currentCount = state.tasks.length;

        if (lastTaskCount && parseInt(lastTaskCount) > currentCount) {
            alert('Última acción: Eliminación de tarea. No se puede recuperar automáticamente.');
        } else {
            alert('Funcionalidad de deshacer no disponible en esta versión');
        }
    };

    // ==========================
    // PERSISTENCIA OPTIMIZADA
    // ==========================

    /**
     * @method saveTasks
     * @description Guarda tareas en localStorage
     * @returns {void}
     */
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        localStorage.setItem('lastTaskCount', state.tasks.length.toString());
    };

    /**
     * @method saveProjects
     * @description Guarda proyectos en localStorage
     * @returns {void}
     */
    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(state.projects));
    };

    /**
     * @method saveData
     * @description Guarda todos los datos
     * @returns {void}
     */
    const saveData = () => {
        saveTasks();
        saveProjects();
    };

    // ==========================
    // TEMAS Y CONFIGURACIÓN
    // ==========================

    /**
     * @method toggleTheme
     * @description Alterna entre temas
     * @returns {void}
     */
    const toggleTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        localStorage.setItem('theme', state.theme);
    };

    /**
     * @method applyTheme
     * @description Aplica tema al documento
     * @param {string} theme - Tema a aplicar
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
    // FUNCIONES AUXILIARES OPTIMIZADAS
    // ==========================

    /**
     * @method getTaskList
     * @description Obtiene lista de tareas por estado
     * @param {string} status - Estado de las tareas
     * @returns {HTMLElement} - Elemento de lista
     */
    const getTaskList = (status) => {
        const listIds = {
            [STATUS.TODO]: 'todo-tasks',
            [STATUS.INPROGRESS]: 'inprogress_tasks',
            [STATUS.DONE]: 'done-tasks'
        };
        return document.getElementById(listIds[status]);
    };

    /**
     * @method clearTaskLists
     * @description Limpia todas las listas de tareas
     * @returns {void}
     */
    const clearTaskLists = () => {
        ['todo-tasks', 'inprogress_tasks', 'done-tasks', 'list-tasks-container']
            .forEach(id => {
                const element = document.getElementById(id);
                if (element) element.innerHTML = '';
            });
    };

    /**
     * @method renderFilteredTasks
     * @description Renderiza tareas filtradas
     * @param {Array} tasks - Tareas a renderizar
     * @returns {void}
     */
    const renderFilteredTasks = (tasks) => {
        clearTaskLists();

        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            getTaskList(task.status)?.appendChild(taskElement);
            renderTaskInListView(task);
        });

        updateTaskCounts();
    };

    /**
     * @method escapeHtml
     * @description Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * @method formatDate
     * @description Formatea fecha para mostrar
     * @param {string} dateString - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    /**
     * @method getStatusText
     * @description Obtiene texto descriptivo de estado
     * @param {string} status - Estado de la tarea
     * @returns {string} - Texto del estado
     */
    const getStatusText = (status) => {
        const statusMap = {
            'todo': 'Pendiente',
            'inprogress': 'En Progreso',
            'done': 'Completada'
        };
        return statusMap[status] || status;
    };

    /**
     * @method getTasks
     * @description Obtiene todas las tareas
     * @returns {Array} - Array de tareas
     */
    const getTasks = () => [...state.tasks];

    /**
     * @method navigateCalendar
     * @description Navega al mes siguiente
     * @returns {void}
     */
    const navigateCalendar = () => changeMonth(1);

    // ==========================
    // API PÚBLICA COMPLETA
    // ==========================

    return {
        // Inicialización
        initialize,

        // Gestión de tareas
        openTaskForm: () => openTaskForm(),
        closeTaskForm,
        handleTaskFormSubmit,
        editTask: (id) => {
            const task = state.tasks.find(t => t.id === id);
            task && openTaskForm(task);
        },
        deleteTask,
        quickAddTask,
        deleteCompletedTasks,

        // Gestión de proyectos
        openProjectModal,
        closeProjectModal,
        createProjectFromModal,
        deleteCurrentProject,

        // Búsqueda y filtrado
        searchTasks,
        filterTasksByCriteria,
        sortTasks,

        // Vistas
        switchToView,
        renderCalendar,
        navigateCalendar,

        // Comentarios y plantillas
        addCommentToTask,
        applyTaskTemplate,
        toggleCommentsVisibility,

        // Utilidades
        toggleTheme,
        toggleNotifications,
        showHelp,
        closeHelp,
        showTutorial,
        showDailySummary,
        setDailyGoal,
        addCustomTag,
        undoLastAction,

        // Confirmaciones
        confirmTaskDeletion,
        closeDeleteModal,

        // Getters
        getTasks
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