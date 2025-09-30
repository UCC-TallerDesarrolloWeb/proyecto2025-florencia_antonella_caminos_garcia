class TaskMannager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentProject = 'personal';
        this.currentView = 'kanban';
        this.currentEditingTask = null;

        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.updateStats();
        this.renderAllViews();
        this.loadProjects();
    }

    setupEventListeners() {
        document.getElementById('btn-kanban-view').addEventListener('click', () => this.switchView('kanban'));
        document.getElementById('btn-calendar-view').addEventListener('click', () => this.switchView('calendar'));
        document.getElementById('btn-list-view').addEventListener('click', () => this.switchView('list'));
        document.querySelectorAll('.project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchProject(e.target.dataset.project));
        });
        document.getElementById('formTask').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('btn-cancel-task').addEventListener('click', () => this.closeTaskForm());
        document.getElementById('search-tasks-sidebar').addEventListener('input', (e) => this.searchTasks(e.target.value));
        document.getElementById('sort-tasks-sidebar').addEventListener('change', (e) => this.sortTasks(e.target.value));
        document.getElementById('opciones').addEventListener('change', (e) => this.filterTasks(e.target.value));

        this.setupDragAndDrop();

        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('btn-notifications').addEventListener('click', () => this.toggleNotifications());
        document.getElementById('btn-help').addEventListener('click', () => this.showHelp());
        document.getElementById('close-help').addEventListener('click', () => this.closeHelp());
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        document.getElementById('btn-new-task-sidebar').addEventListener('click', () => this.openTaskForm());
        document.getElementById('btn-new-project').addEventListener('click', () => this.openProjectForm());
        document.getElementById('btn-delete-completed-tasks').addEventListener('click', () => this.deleteCompletedTasks());
        document.getElementById('btn-delete-project').addEventListener('click', () => this.deleteCurrentProject());
        document.getElementById('btn-new-task').addEventListener('click', () => this.openTaskForm());
    }

    openProjectForm() {
        const projectName = prompt('📁 Ingresa el nombre del nuevo proyecto:');
        if (projectName && projectName.trim()) {
            this.createNewProject(projectName.trim());
        }
    }

    createNewProject(projectName) {
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-');

        const existingProject = document.querySelector(`[data-project="${projectId}"]`);
        if (existingProject) {
            alert('❌ Ya existe un proyecto con ese nombre.');
            return;
        }

        const projectList = document.getElementById('project-list');
        const newProjectItem = document.createElement('li');
        newProjectItem.innerHTML = `
        <button class="project-btn" data-project="${projectId}" type="button">📁 ${projectName}</button>
    `;
        projectList.appendChild(newProjectItem);

        newProjectItem.querySelector('.project-btn').addEventListener('click', (e) => {
            this.switchProject(e.target.dataset.project);
        });

        this.saveProjects();

        alert(`✅ Proyecto "${projectName}" creado exitosamente.`);
    }

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
            alert(`✅ ${completedTasks.length} tarea(s) completada(s) eliminada(s).`);
        }
    }

    deleteCurrentProject() {
        const defaultProjects = ['personal', 'trabajo', 'estudios'];
        if (defaultProjects.includes(this.currentProject)) {
            alert('❌ No puedes eliminar los proyectos por defecto (Personal, Trabajo, Estudios).');
            return;
        }

        const tasksInProject = this.tasks.filter(task => task.project === this.currentProject);

        let message = `¿Estás seguro de que quieres eliminar el proyecto "${this.currentProject}"?`;
        if (tasksInProject.length > 0) {
            message += `\n\nSe eliminarán ${tasksInProject.length} tarea(s) asociadas a este proyecto.`;
        }

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

            alert('✅ Proyecto eliminado exitosamente.');
        }
    }

    saveProjects() {
        const projects = [];
        document.querySelectorAll('.project-btn').forEach(btn => {
            projects.push({
                id: btn.dataset.project,
                name: btn.textContent.replace(/[📁🏠💼📚]/, '').trim()
            });
        });
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    loadProjects() {
        const savedProjects = JSON.parse(localStorage.getItem('projects'));
        if (savedProjects) {
            const projectList = document.getElementById('project-list');

            const defaultProjects = ['personal', 'trabajo', 'estudios'];
            const existingProjects = new Set();

            savedProjects.forEach(project => {
                if (!defaultProjects.includes(project.id)) {
                    const newProjectItem = document.createElement('li');
                    newProjectItem.innerHTML = `
                    <button class="project-btn" data-project="${project.id}" type="button">📁 ${project.name}</button>
                `;
                    projectList.appendChild(newProjectItem);

                    newProjectItem.querySelector('.project-btn').addEventListener('click', (e) => {
                        this.switchProject(e.target.dataset.project);
                    });
                }
            });
        }
    }

    switchView(view) {
        this.currentView = view;

        document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${view}-view`).classList.add('active');

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view === 'kanban' ? 'board' : view + '-view'}`).classList.add('active');

        this.renderAllViews();
    }

    switchProject(project) {
        this.currentProject = project;
        document.querySelectorAll('.project-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-project="${project}"]`).classList.add('active');

        this.renderAllViews();
        this.updateStats();
    }

    handleTaskSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const taskData = {
            id: document.getElementById('taskId').value || Date.now().toString(),
            title: formData.get('taskTitle'),
            description: formData.get('taskDescription'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            project: formData.get('taskProject'),
            status: 'todo',
            tags: [],
            subtasks: formData.get('subtasks') ? formData.get('subtasks').split(',').map(s => s.trim()) : [],
            timeEstimate: formData.get('time-estimate'),
            createdAt: new Date().toISOString(),
            comments: []
        };

        document.querySelectorAll('input[name="tags"]:checked').forEach(checkbox => {
            taskData.tags.push(checkbox.value);
        });

        if (this.currentEditingTask) {
            const index = this.tasks.findIndex(t => t.id === this.currentEditingTask);
            this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            this.tasks.push(taskData);
        }

        this.saveTasks();
        this.closeTaskForm();
        this.renderAllViews();
        this.updateStats();
    }

    openTaskForm(task = null) {
        const form = document.getElementById('task-form');
        const formTitle = form.querySelector('h2');

        if (task) {
            const index = this.tasks.findIndex(t => t.id === this.currentEditingTask);
            this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            this.tasks.push(tasksData);
        }

        this.saveTasks();
        this.closeTaskForm();
        this.renderAllViews();
        this.updateStats();
    }

    openTaskForm(task = null) {
        const form = document.getElementById('task-form');
        const formTitle = form.querySelector('h2');

        if (task) {
            formTitle.textContent = 'Editar Tarea';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskProject').value = task.project;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('subtasks').value = task.subtasks.join(', ');
            document.getElementById('time-estimate').value = task.timeEstimate;
            document.querySelectorAll('input[name="priority"]').forEach(radio => {
                radio.checked = radio.value === task.priority;
            });
            document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
                checkbox.checked = task.tags.includes(checkbox.value);
            });

            this.currentEditingTask = task.id;
        } else {
            formTitle.textContent = 'Crear Tarea';
            document.getElementById('formTask').reset();
            document.getElementById('taskProject').value = this.currentProject;
            this.currentEditingTask = null;
        }

        form.classList.add('active');
    }

    closeTaskForm() {
        document.getElementById('task-form').classList.remove('active');
        this.currentEditingTask = null;
    }

    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');

        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drop-zone');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drop-zone');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drop-zone');

                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = list.dataset.status;

                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
        }
    }

    renderAllViews() {
        this.renderKanbanView();
        this.renderListView();
        this.renderCalendarView();
    }

    renderKanbanView() {
        const columns = {
            todo: document.querySelector('[data-status="todo"] .task-list'),
            inprogress: document.querySelector('[data-status="inprogress"] .task-list'),
            done: document.querySelector('[data-status="done"] .task-list')
        };

        Object.values(columns).forEach(column => {
            column.innerHTML = '';
            column.classList.remove('empty');
        });

        const filteredTasks = this.tasks.filter(task =>
            task.project === this.currentProject
        );

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            columns[task.status].appendChild(taskElement);
        });

        document.querySelectorAll('.column').forEach(column => {
            const status = column.dataset.status;
            const count = filteredTasks.filter(task => task.status === status).length;
            column.querySelector('.task-count').textContent = count;

            if (count === 0) {
                column.querySelector('.task-list').classList.add('empty');
            }
        });

    }

    createTaskElement(task) {
        const taskElement = document.createElement('li');
        taskElement.className = `task-card priority-${task.priority.toLowerCase()}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="task-meta">
                <span class="priority">${task.priority}</span>
                <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</span>
            </div>
        `;

        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });

        taskElement.addEventListener('dblclick', () => {
            this.openTaskForm(task);
        });

        return taskElement;
    }

    renderListView() {
        const tbody = document.querySelector('#task-table tbody');
        tbody.innerHTML = '';

        const filteredTasks = this.tasks.filter(task =>
            task.project === this.currentProject
        );

        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.title}</td>
                <td><span class="priority">${task.priority}</span></td>
                <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                <td>${this.getStatusText(task.status)}</td>
                <td>${this.getProjectText(task.project)}</td>
                <td>
                    <button onclick="taskManager.openTaskForm(${JSON.stringify(task).replace(/"/g, '&quot;')})">Editar</button>
                    <button onclick="taskManager.deleteTask('${task.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCalendarView() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '<p>Vista de calendario - Implementación pendiente</p>';
    }

    searchTasks(query) {
        console.log('Buscando:', query);
    }

    sortTasks(criteria) {
        console.log('Ordenando por:', criteria);
    }

    filterTasks(filter) {
        console.log('Filtrando por:', filter);
    }

    updateStats() {
        const filteredTasks = this.tasks.filter(task => task.project === this.currentProject);

        document.getElementById('total-tasks').textContent = filteredTasks.length;
        document.getElementById('completed-tasks').textContent = filteredTasks.filter(task => task.status === 'done').length;
        document.getElementById('inprogress-tasks').textContent = filteredTasks.filter(task => task.status === 'inprogress').length;
        document.getElementById('pending-tasks').textContent = filteredTasks.filter(task => task.status === 'todo').length;

        const progress = document.querySelector('.progress');
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(task => task.status === 'done').length;
        const progressPercent = total > 0 ? (completed / total) * 100 : 0;

        progress.style.width = `${progressPercent}%`;
    }

    deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';

        localStorage.setItem('theme', newTheme);
    }

    toggleNotifications() {
        const dropdown = document.getElementById('notification-list');
        dropdown.classList.toggle('active');
    }

    showHelp() {
        document.getElementById('shortcut-help').classList.add('active');
    }

    closeHelp() {
        document.getElementById('shortcut-help').classList.remove('active');
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.openTaskForm();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('search-tasks-sidebar').focus();
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
                    break;
            }
        }
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
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

function openTaskForm() {
    window.taskManager.openTaskForm();
}

function deleteTask(taskId) {
    window.taskManager.deleteTask(taskId);
}
