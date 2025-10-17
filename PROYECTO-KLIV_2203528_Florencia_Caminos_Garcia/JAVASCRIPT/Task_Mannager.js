// noinspection JSValidateTypes,GrazieInspection,JSUndefinedPropertyAssignment,JSUnresolvedReference

/**
 * ====================
 * Task_Mannager.js 
 * ====================
 */

/** 
 * Clase principal TaskManager que maneja tareas, proyectos y vistas
 */
class TaskManager {
    e;
    /** 
     * Constructor de la clase
     * Inicializa tareas, proyectos, vistas, elementos del DOM, calendario y estadísticas
     */
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.projects = JSON.parse(localStorage.getItem('projects')) || ['Personal'];
        this.currentProject = this.projects[0];
        this.today = new Date();

        /** 
         *  Elementos del DOM  
         */
        this.taskForm = document.getElementById('task-form');
        this.projectModal = document.getElementById('project-modal');
        this.projectList = document.getElementById('project-list');
        this.taskProjectSelect = document.getElementById('taskProject');
        this.todoList = document.getElementById('todo-tasks');
        this.inprogressList = document.getElementById('inprogress_tasks');
        this.doneList = document.getElementById('done-tasks');
        this.listViewContainer = document.getElementById('list-tasks-container');
        this.calendarContainer = document.getElementById('calendar');
        this.calendarHeader = document.getElementById('current-month');

        /** 
         *  Estado del calendario  
         */
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();

        /** 
         *  Elementos de estadísticas  
         */
        this.totalTasksElem = document.getElementById('total-tasks');
        this.completedTasksElem = document.getElementById('completed-tasks');
        this.inprogressTasksElem = document.getElementById('inprogress-tasks');
        this.pendingTasksElem = document.getElementById('pending-tasks');

        /** 
         * Inicialización de eventos y renderizado inicial
         */
        this.bindEvents();
        this.renderProjects();
        this.renderTasks();
        this.updateStats();
        this.renderCalendar();
        this.switchToView('kanban');
    }

    /** 
     *  Eventos 
     * @description Vincula botones, formularios, filtros, búsqueda y drag & drop a funciones correspondientes
     */
    bindEvents() {
        /** Abrir modales de tareas y proyectos */
        document.querySelectorAll('#btn-new-task-sidebar, #btn-new-task-float, #btn-new-task-main')
            .forEach(btn => btn.addEventListener('click', () => this.openTaskForm()));
        document.getElementById('btn-new-project').addEventListener('click', () => this.openProjectModal());
        document.getElementById('btn-delete-project').addEventListener('click', () => this.deleteCurrentProject());

        /** Formularios */
        this.taskForm.addEventListener('submit', () => this.handleTaskFormSubmit());
        document.getElementById('save-project').addEventListener('click', () => this.createProjectFromModal());
        document.getElementById('cancel-project').addEventListener('click', () => this.closeProjectModal());

        /** Cambiar vistas */
        document.getElementById('btn-kanban-view').addEventListener('click', () => this.switchToView('kanban'));
        document.getElementById('btn-calendar-view').addEventListener('click', () => this.switchToView('calendar'));
        document.getElementById('btn-list-view').addEventListener('click', () => this.switchToView('list'));

        /** Búsqueda y filtros */
        document.getElementById('search-tasks-sidebar').addEventListener('input', e => this.searchTasks(e.target.value));
        document.getElementById('sort-tasks-sidebar').addEventListener('change', () => this.sortTasks());
        document.getElementById('filter-options').addEventListener('change', e => this.filterTasksByCriteria(e.target.value));

        /** Drag & Drop Kanban */
        ['todo', 'inprogress', 'done'].forEach(status => {
            const list = document.getElementById(status === 'inprogress' ? 'inprogress_tasks' : `${status}-tasks`);
            list.addEventListener('dragover', e => e.preventDefault());
            list.addEventListener('drop', e => this.handleDrop(e, status));
        });

        /** Navegación calendario */
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
    }

    /** 
     *  Modales 
     * @description Abrir el formulario de tarea
     * @param {Object|null} task - Si se pasa un objeto tarea, el formulario se llena con sus datos
     */
    openTaskForm(task = null) {
        this.taskForm.style.display = 'block';
        this.populateProjectSelect();
        if (task) this.fillTaskForm(task);
    }

    /** 
     * @description Cierra el formulario de tarea y limpia campos
     */
    closeTaskForm() {
        this.taskForm.style.display = 'none';
        this.taskForm.reset();
        document.getElementById('comments-list').innerHTML = '';
    }

    /** 
     * @description Abre el modal para crear un proyecto nuevo
     */
    openProjectModal() {
        this.projectModal.style.display = 'block';
    }

    /** 
     * @description Cierra el modal de proyecto y limpia el input
     */
    closeProjectModal() {
        this.projectModal.style.display = 'none';
        document.getElementById('new-project-name').value = '';
    }

    /** 
     *  Proyectos 
     * @description Crea un nuevo proyecto desde el modal
     */
    createProjectFromModal() {
        const projectName = document.getElementById('new-project-name').value.trim();
        if (!projectName) return alert("Ingrese un nombre de proyecto");
        if (!this.projects.includes(projectName)) {
            this.projects.push(projectName);
            this.currentProject = projectName;
            this.saveProjects();
            this.renderProjects();
        }
        this.closeProjectModal();
    }

    /** 
     * @description Elimina el proyecto actual y sus tareas asociadas
     */
    deleteCurrentProject() {
        if (this.currentProject === 'Personal') {
            alert("No se puede eliminar el proyecto por defecto.");
            return;
        }
        if (!confirm(`¿Eliminar proyecto "${this.currentProject}"? Se eliminarán también sus tareas.`)) return;

        this.tasks = this.tasks.filter(t => t.project !== this.currentProject);
        this.projects = this.projects.filter(p => p !== this.currentProject);
        this.currentProject = this.projects[0];
        this.saveProjects();
        this.saveTasks();
        this.renderProjects();
        this.renderTasks();
    }

    /** 
     * @description Llena el select de proyectos del formulario de tarea
     */
    populateProjectSelect() {
        this.taskProjectSelect.innerHTML = '';
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            this.taskProjectSelect.appendChild(option);
        });
    }

    /** 
     * @description Renderiza la lista de proyectos en la barra lateral
     */
    renderProjects() {
        this.projectList.innerHTML = '';
        this.projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project;
            li.addEventListener('click', () => {
                this.currentProject = project;
                this.renderTasks();
            });
            this.projectList.appendChild(li);
        });
    }

    /** 
     * @description Guarda los proyectos en localStorage
     */
    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    /**
     *  Tareas
     * @description Maneja el submit del formulario de tarea
     */
    handleTaskFormSubmit() {
        this.e.preventDefault();
        const id = document.getElementById('taskId').value || Date.now();
        const title = document.getElementById('taskTitle').value.trim();
        const project = document.getElementById('taskProject').value;
        const description = document.getElementById('taskDescription').value.trim();
        const status = document.querySelector('input[name="priority"]:checked').value.toLowerCase();
        const dueDate = document.getElementById('dueDate').value;
        const tags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(el => el.value);
        const subtasks = document.getElementById('subtasks').value.split(',').map(s => s.trim()).filter(Boolean);

        const existingIndex = this.tasks.findIndex(t => t.id === id);
        const taskData = { id, title, project, description, status, dueDate, tags, subtasks, comments: [] };

        if (existingIndex > -1) this.tasks[existingIndex] = taskData;
        else this.tasks.push(taskData);

        this.saveTasks();
        this.renderTasks();
        this.renderCalendar();
        this.closeTaskForm();
    }

    /** 
     * @description Crea un elemento <li> draggable para el tablero Kanban
     * @param {Object} task - Objeto tarea
     * @returns {HTMLElement} - Elemento <li> listo para añadir al DOM
     */
    addTaskToBoard(task) {
        const li = document.createElement('li');
        li.textContent = task.title;
        li.setAttribute('draggable', true);
        li.dataset.id = task.id;

        li.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', task.id));
        li.addEventListener('dblclick', () => this.openTaskForm(task));

        return li;
    }

    /** 
     * @description Renderiza todas las tareas según proyecto y vista
     */
    renderTasks() {
        this.todoList.innerHTML = '';
        this.inprogressList.innerHTML = '';
        this.doneList.innerHTML = '';
        this.listViewContainer.innerHTML = '';
        this.renderCalendar();

        const filteredTasks = this.tasks.filter(t => t.project === this.currentProject);

        filteredTasks.forEach(task => {
            const li = this.addTaskToBoard(task);

            if (task.status === 'todo') this.todoList.appendChild(li);
            if (task.status === 'inprogress') this.inprogressList.appendChild(li);
            if (task.status === 'done') this.doneList.appendChild(li);

            const div = document.createElement('div');
            div.textContent = `[${task.status.toUpperCase()}] ${task.title} - ${task.description}`;
            if (task.subtasks.length) div.textContent += ` | Subtareas: ${task.subtasks.join(', ')}`;
            this.listViewContainer.appendChild(div);
        });

        this.updateStats();
    }

    /** 
     * @description Guarda todas las tareas en localStorage
     */
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    /** 
     * @description Llena el formulario con datos de una tarea existente
     * @param {Object} task - Tarea a editar
     */
    fillTaskForm(task) {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskProject').value = task.project;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('dueDate').value = task.dueDate;
        document.getElementById('subtasks').value = task.subtasks.join(', ');
        document.querySelectorAll('input[name="tags"]').forEach(cb => cb.checked = task.tags.includes(cb.value));
        document.querySelector(`input[name="priority"][value="${task.status.charAt(0).toUpperCase() + task.status.slice(1)}"]`).checked = true;
    }

    /** 
     *  Estadísticas 
     * @description Actualiza la sección de estadísticas del proyecto actual
     */
    updateStats() {
        const projectTasks = this.tasks.filter(t => t.project === this.currentProject);
        this.totalTasksElem.textContent = projectTasks.length;
        this.completedTasksElem.textContent = projectTasks.filter(t => t.status === 'done').length;
        this.inprogressTasksElem.textContent = projectTasks.filter(t => t.status === 'inprogress').length;
        this.pendingTasksElem.textContent = projectTasks.filter(t => t.status === 'todo').length;
    }

    /** 
     *  Vistas 
     * @description Cambia entre Kanban, Calendario y Lista
     * @param {string} view - Nombre de la vista: 'kanban', 'calendar', 'list'
     */
    switchToView(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        if (view === 'kanban') document.getElementById('board').classList.add('active');
        if (view === 'calendar') document.getElementById('calendar-view').classList.add('active');
        if (view === 'list') document.getElementById('list-view').classList.add('active');

        document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${view}-view`).classList.add('active');
    }

    /** 
     *  Búsqueda y Filtros 
     * @param {string} query - Texto a buscar en los títulos de tareas
     */
    searchTasks(query) {
        query = query.toLowerCase();
        this.tasks.forEach(task => {
            task.visible = task.title.toLowerCase().includes(query);
        });
        this.renderTasks();
    }

    /** 
     * @param {string} criteria - Filtro por tag
     */
    filterTasksByCriteria(criteria) {
        this.tasks.forEach(task => {
            task.visible = !criteria || task.tags.includes(criteria);
        });
        this.renderTasks();
    }

    /** 
     * @description Ordena las tareas según opción seleccionada
     */
    sortTasks() {
        const sortBy = document.getElementById('sort-tasks-sidebar').value;
        this.tasks.sort((a, b) => {
            if (sortBy === 'nombre') return a.title.localeCompare(b.title);
            if (sortBy === 'fecha') return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
            if (sortBy === 'reciente') return b.id - a.id;
            if (sortBy === 'prioridad') return (a.status || '').localeCompare(b.status || '');
        });
        this.renderTasks();
    }

    /** 
     *  Drag & Drop 
     * @param {Event} e - Evento drop
     * @param {string} newStatus - Nuevo estado: 'todo', 'inprogress', 'done'
     */
    handleDrop(e, newStatus) {

        e.dataTransfer = undefined;
        e.dataTransfer = undefined;
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
        }
    }

    /** 
     *  Calendario 
     * @description Renderiza el calendario mensual y las tareas de cada día
     */
    renderCalendar() {
        this.calendarContainer.innerHTML = '';
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const lastDate = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        this.calendarHeader.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('calendar-grid');

        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(d => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day-header');
            dayHeader.textContent = d;
            calendarGrid.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day');
            calendarGrid.appendChild(emptyCell);
        }

        for (let d = 1; d <= lastDate; d++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            const dayLabel = document.createElement('div');
            dayLabel.textContent = d;
            dayLabel.classList.add('day-number');

            if (d === this.today.getDate() && this.currentMonth === this.today.getMonth() && this.currentYear === this.today.getFullYear()) {
                dayCell.classList.add('today');
            }

            const dayTasks = this.tasks.filter(t => t.dueDate === `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` && t.project === this.currentProject);
            dayTasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('calendar-task');
                taskDiv.textContent = task.title;
                dayCell.appendChild(taskDiv);
            });

            dayCell.appendChild(dayLabel);
            calendarGrid.appendChild(dayCell);
        }

        this.calendarContainer.appendChild(calendarGrid);
    }

    /** 
     * @description Cambia el mes mostrado en el calendario
     * @param {number} delta - Incremento (1) o decremento (-1) del mes
     */
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
        if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
        this.renderCalendar();
    }
}

/** 
 *  Inicialización 
 */
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
