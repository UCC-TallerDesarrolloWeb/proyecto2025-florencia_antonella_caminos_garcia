class TaskManager {
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
        var self = this;

        document.getElementById('btn-kanban-view').addEventListener('click', function() {
            self.switchView('kanban');
        });
        document.getElementById('btn-calendar-view').addEventListener('click', function() {
            self.switchView('calendar');
        });
        document.getElementById('btn-list-view').addEventListener('click', function() {
            self.switchView('list');
        });
        
        var projectButtons = document.querySelectorAll('.project-btn');
        projectButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                self.switchProject(e.target.dataset.project);
            });
        });
        
        document.getElementById('formTask').addEventListener('submit', function(e) {
            self.handleTaskSubmit(e);
        });
        document.getElementById('btn-cancel-task').addEventListener('click', function() {
            self.closeTaskForm();
        });
        document.getElementById('search-tasks-sidebar').addEventListener('input', function(e) {
            self.searchTasks(e.target.value);
        });
        document.getElementById('sort-tasks-sidebar').addEventListener('change', function(e) {
            self.sortTasks(e.target.value);
        });
        document.getElementById('opciones').addEventListener('change', function(e) {
            self.filterTasks(e.target.value);
        });

        this.setupDragAndDrop();

        document.getElementById('theme-toggle').addEventListener('click', function() {
            self.toggleTheme();
        });
        document.getElementById('btn-notifications').addEventListener('click', function() {
            self.toggleNotifications();
        });
        document.getElementById('btn-help').addEventListener('click', function() {
            self.showHelp();
        });
        document.getElementById('close-help').addEventListener('click', function() {
            self.closeHelp();
        });
        document.addEventListener('keydown', function(e) {
            self.handleKeyboardShortcuts(e);
        });
        document.getElementById('btn-new-task-sidebar').addEventListener('click', function() {
            self.openTaskForm();
        });
        document.getElementById('btn-new-project').addEventListener('click', function() {
            self.openProjectForm();
        });
        document.getElementById('btn-delete-completed-tasks').addEventListener('click', function() {
            self.deleteCompletedTasks();
        });
        document.getElementById('btn-delete-project').addEventListener('click', function() {
            self.deleteCurrentProject();
        });
        document.getElementById('btn-new-task').addEventListener('click', function() {
            self.openTaskForm();
        });
    }

    openProjectForm() {
        var projectName = prompt('📁 Ingresa el nombre del nuevo proyecto:');
        if (projectName && projectName.trim()) {
            this.createNewProject(projectName.trim());
        }
    }

    createNewProject(projectName) {
        var projectId = projectName.toLowerCase().replace(/\s+/g, '-');

        var existingProject = document.querySelector('[data-project="' + projectId + '"]');
        if (existingProject) {
            alert('❌ Ya existe un proyecto con ese nombre.');
            return;
        }

        var projectList = document.getElementById('project-list');
        var newProjectItem = document.createElement('li');
        newProjectItem.innerHTML = '<button class="project-btn" data-project="' + projectId + '" type="button">📁 ' + projectName + '</button>';
        projectList.appendChild(newProjectItem);

        var self = this;
        newProjectItem.querySelector('.project-btn').addEventListener('click', function(e) {
            self.switchProject(e.target.dataset.project);
        });

        this.saveProjects();
        alert('✅ Proyecto "' + projectName + '" creado exitosamente.');
    }

    deleteCompletedTasks() {
        var completedTasks = this.tasks.filter(function(task) {
            return task.project === this.currentProject && task.status === 'done';
        }.bind(this));

        if (completedTasks.length === 0) {
            alert('ℹ️ No hay tareas completadas para eliminar en este proyecto.');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar ' + completedTasks.length + ' tarea(s) completada(s) del proyecto actual?')) {
            this.tasks = this.tasks.filter(function(task) {
                return !(task.project === this.currentProject && task.status === 'done');
            }.bind(this));
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
            alert('✅ ' + completedTasks.length + ' tarea(s) completada(s) eliminada(s).');
        }
    }

    deleteCurrentProject() {
        var defaultProjects = ['personal', 'trabajo', 'estudios'];
        if (defaultProjects.includes(this.currentProject)) {
            alert('❌ No puedes eliminar los proyectos por defecto (Personal, Trabajo, Estudios).');
            return;
        }

        var tasksInProject = this.tasks.filter(function(task) {
            return task.project === this.currentProject;
        }.bind(this));

        var message = '¿Estás seguro de que quieres eliminar el proyecto "' + this.currentProject + '"?';
        if (tasksInProject.length > 0) {
            message += '\n\nSe eliminarán ' + tasksInProject.length + ' tarea(s) asociadas a este proyecto.';
        }

        if (confirm(message)) {
            this.tasks = this.tasks.filter(function(task) {
                return task.project !== this.currentProject;
            }.bind(this));

            var projectButton = document.querySelector('[data-project="' + this.currentProject + '"]');
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
        var projects = [];
        var projectButtons = document.querySelectorAll('.project-btn');
        var self = this;
        projectButtons.forEach(function(btn) {
            projects.push({
                id: btn.dataset.project,
                name: btn.textContent.replace(/[📁🏠💼📚]/g, '').trim()
            });
        });
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    loadProjects() {
        var savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
        var projectList = document.getElementById('project-list');

        var defaultProjects = ['personal', 'trabajo', 'estudios'];
        var self = this;

        savedProjects.forEach(function(project) {
            if (!defaultProjects.includes(project.id)) {
                var existingProject = document.querySelector('[data-project="' + project.id + '"]');
                if (!existingProject) {
                    var newProjectItem = document.createElement('li');
                    newProjectItem.innerHTML = '<button class="project-btn" data-project="' + project.id + '" type="button">📁 ' + project.name + '</button>';
                    projectList.appendChild(newProjectItem);

                    newProjectItem.querySelector('.project-btn').addEventListener('click', function(e) {
                        self.switchProject(e.target.dataset.project);
                    });
                }
            }
        });
    }

    switchView(view) {
        this.currentView = view;

        var viewButtons = document.querySelectorAll('.view-toggle button');
        viewButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.getElementById('btn-' + view + '-view').classList.add('active');

        var views = document.querySelectorAll('.view');
        views.forEach(function(v) {
            v.classList.remove('active');
        });
        var viewId = view === 'kanban' ? 'board' : view + '-view';
        document.getElementById(viewId).classList.add('active');

        this.renderAllViews();
    }

    switchProject(project) {
        this.currentProject = project;
        var projectButtons = document.querySelectorAll('.project-btn');
        projectButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        var activeButton = document.querySelector('[data-project="' + project + '"]');
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.renderAllViews();
        this.updateStats();
    }

    handleTaskSubmit(e) {
        e.preventDefault();

        var formData = new FormData(e.target);
        var taskData = {
            id: document.getElementById('taskId').value || Date.now().toString(),
            title: formData.get('taskTitle'),
            description: formData.get('taskDescription'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            project: formData.get('taskProject'),
            status: formData.get('taskStatus') || 'todo',
            tags: [],
            subtasks: formData.get('subtasks') ? formData.get('subtasks').split(',').map(function(s) { return s.trim(); }) : [],
            timeEstimate: formData.get('time-estimate'),
            createdAt: new Date().toISOString(),
            comments: []
        };

        var tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
        var self = this;
        tagCheckboxes.forEach(function(checkbox) {
            taskData.tags.push(checkbox.value);
        });

        if (this.currentEditingTask) {
            var index = this.tasks.findIndex(function(t) {
                return t.id === self.currentEditingTask;
            });
            if (index !== -1) {
                for (var key in taskData) {
                    this.tasks[index][key] = taskData[key];
                }
            }
        } else {
            this.tasks.push(taskData);
        }

        this.saveTasks();
        this.closeTaskForm();
        this.renderAllViews();
        this.updateStats();
    }

    openTaskForm(task) {
        if (task === undefined) task = null;
        
        var form = document.getElementById('task-form');
        var formTitle = form.querySelector('h2');

        if (task) {
            formTitle.textContent = 'Editar Tarea';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskProject').value = task.project;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('subtasks').value = task.subtasks ? task.subtasks.join(', ') : '';
            document.getElementById('time-estimate').value = task.timeEstimate || '';
            
            var priorityRadios = document.querySelectorAll('input[name="priority"]');
            priorityRadios.forEach(function(radio) {
                radio.checked = radio.value === task.priority;
            });
            
            var tagCheckboxes = document.querySelectorAll('input[name="tags"]');
            tagCheckboxes.forEach(function(checkbox) {
                checkbox.checked = task.tags ? task.tags.includes(checkbox.value) : false;
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
        var taskLists = document.querySelectorAll('.task-list');
        var self = this;

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

                var taskId = e.dataTransfer.getData('text/plain');
                var newStatus = list.dataset.status;

                self.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        var self = this;
        var taskIndex = this.tasks.findIndex(function(task) {
            return task.id === taskId;
        });
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
        var columns = {
            todo: document.querySelector('[data-status="todo"] .task-list'),
            inprogress: document.querySelector('[data-status="inprogress"] .task-list'),
            done: document.querySelector('[data-status="done"] .task-list')
        };

        for (var status in columns) {
            if (columns[status]) {
                columns[status].innerHTML = '';
                columns[status].classList.remove('empty');
            }
        }

        var filteredTasks = this.tasks.filter(function(task) {
            return task.project === this.currentProject;
        }.bind(this));

        var self = this;
        filteredTasks.forEach(function(task) {
            var taskElement = self.createTaskElement(task);
            if (columns[task.status]) {
                columns[task.status].appendChild(taskElement);
            }
        });

        var columnElements = document.querySelectorAll('.column');
        columnElements.forEach(function(column) {
            var status = column.dataset.status;
            var count = filteredTasks.filter(function(task) {
                return task.status === status;
            }).length;
            var countElement = column.querySelector('.task-count');
            if (countElement) {
                countElement.textContent = count;
            }

            var taskList = column.querySelector('.task-list');
            if (taskList) {
                if (count === 0) {
                    taskList.classList.add('empty');
                }
            }
        });
    }

    createTaskElement(task) {
        var taskElement = document.createElement('li');
        taskElement.className = 'task-card priority-' + task.priority.toLowerCase();
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        var dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha';
        
        taskElement.innerHTML = '<h3>' + task.title + '</h3>' +
            '<p>' + task.description + '</p>' +
            '<div class="task-meta">' +
            '<span class="priority">' + task.priority + '</span>' +
            '<span>' + dueDate + '</span>' +
            '</div>';

        var self = this;
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

    renderListView() {
        var tbody = document.querySelector('#task-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        var filteredTasks = this.tasks.filter(function(task) {
            return task.project === this.currentProject;
        }.bind(this));

        var self = this;
        filteredTasks.forEach(function(task) {
            var row = document.createElement('tr');
            var dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-';
            
            row.innerHTML = '<td>' + task.title + '</td>' +
                '<td><span class="priority">' + task.priority + '</span></td>' +
                '<td>' + dueDate + '</td>' +
                '<td>' + self.getStatusText(task.status) + '</td>' +
                '<td>' + self.getProjectText(task.project) + '</td>' +
                '<td>' +
                '<button onclick="window.taskManager.openTaskForm(window.taskManager.getTaskById(\'' + task.id + '\'))">Editar</button>' +
                '<button onclick="window.taskManager.deleteTask(\'' + task.id + '\')">Eliminar</button>' +
                '</td>';
            tbody.appendChild(row);
        });
    }

    getTaskById(taskId) {
        return this.tasks.find(function(task) {
            return task.id === taskId;
        });
    }

    renderCalendarView() {
        var calendar = document.getElementById('calendar');
        if (!calendar) return;
        
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
        var filteredTasks = this.tasks.filter(function(task) {
            return task.project === this.currentProject;
        });

        document.getElementById('total-tasks').textContent = filteredTasks.length;
        document.getElementById('completed-tasks').textContent = filteredTasks.filter(function(task) {
            return task.status === 'done';
        }).length;
        document.getElementById('inprogress-tasks').textContent = filteredTasks.filter(function(task) {
            return task.status === 'inprogress';
        }).length;
        document.getElementById('pending-tasks').textContent = filteredTasks.filter(function(task) {
            return task.status === 'todo';
        }).length;

        var progress = document.querySelector('.progress');
        if (progress) {
            var total = filteredTasks.length;
            var completed = filteredTasks.filter(function(task) {
                return task.status === 'done';
            }).length;
            var progressPercent = total > 0 ? (completed / total) * 100 : 0;
            progress.style.width = progressPercent + '%';
        }
    }

    deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(function(task) {
                return task.id !== taskId;
            });
            this.saveTasks();
            this.renderAllViews();
            this.updateStats();
        }
    }

    toggleTheme() {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';

        localStorage.setItem('theme', newTheme);
    }

    toggleNotifications() {
        var dropdown = document.getElementById('notification-list');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    showHelp() {
        var helpModal = document.getElementById('shortcut-help');
        if (helpModal) {
            helpModal.classList.add('active');
        }
    }

    closeHelp() {
        var helpModal = document.getElementById('shortcut-help');
        if (helpModal) {
            helpModal.classList.remove('active');
        }
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
                    var searchInput = document.getElementById('search-tasks-sidebar');
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
                    break;
            }
        }
    }

    getStatusText(status) {
        var statusMap = {
            'todo': 'Por hacer',
            'inprogress': 'En progreso',
            'done': 'Completada'
        };
        return statusMap[status] || status;
    }

    getProjectText(project) {
        var projectMap = {
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
        var savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (savedTasks) {
            this.tasks = savedTasks;
        }

        var savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.taskManager = new TaskManager();
});