document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btnNewProject').addEventListener('click', showProjectModal);
    document.getElementById('save-project').addEventListener('click', saveProject);
    document.getElementById('cancel-project').addEventListener('click', hideProjectModal);

    document.querySelectorAll('.project-btn').forEach(btn => {
        btn.addEventListener('click', switchProject);
    });

    document.getElementById('new-task').addEventListener('click', showTaskForm);
    document.getElementById('btnNewTask').addEventListener('click', showTaskForm);
    document.getElementById('btn-cancel-task').addEventListener('click', hideTaskForm);
    document.getElementById('formTask').addEventListener('submit', saveTask);
    document.getElementById('btn-show-comments').addEventListener('click', toggleComments);
    document.getElementById('add-comment').addEventListener('click', addComment);

    document.getElementById('menu').addEventListener('click', toggleMenu);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('btn-help').addEventListener('click', showHelp);
    document.getElementById('close-help').addEventListener('click', hideHelp);

    document.getElementById('btn-kanban-view').addEventListener('click', () => switchView('kanban'));
    document.getElementById('btn-calendar-view').addEventListener('click', () => switchView('calendar'));
    document.getElementById('btn-list-view').addEventListener('click', () => switchView('list'));

    document.getElementById('prev-month').addEventListener('click', previousMonth);
    document.getElementById('next-month').addEventListener('click', nextMonth);

    document.getElementById('search-tasks').addEventListener('input', filterTasks);
    document.getElementById('search-tasks-main').addEventListener('input', filterTasks);
    document.getElementById('sort-tasks-main').addEventListener('change', sortTasks);
    document.getElementById('sort-tasks').addEventListener('change', sortTasks);
    document.getElementById('search-tasks-sidebar').addEventListener('input', filterTasks);
    document.getElementById('sort-tasks-sidebar').addEventListener('change', sortTasks);

    document.getElementById('project-filters').addEventListener('change', applyFilters);

    document.getElementById('btn-notifications').addEventListener('click', toggleNotifications);

    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete').addEventListener('click', hideDeleteConfirm);

    document.getElementById('task-template').addEventListener('change', applyTemplate);

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyboardShortcuts);

    initializeApp();
});

function initializeApp() {
    loadTasks();
    updateStats();
    renderCalendar();
    updateTaskCounts();
}

function showProjectModal() {
    document.getElementById('project-modal').style.display = 'block';
}

function hideProjectModal() {
    document.getElementById('project-modal').style.display = 'none';
}

function saveProject() {
    const projectName = document.getElementById('new-project-name').value.trim();
    if (projectName) {
        createProject(projectName);
        hideProjectModal();
        document.getElementById('new-project-name').value = '';
    }
}

function switchProject(event) {
    document.querySelectorAll('.project-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const project = event.target.dataset.project;
    filterTasksByProject(project);
}

function showTaskForm() {
    document.getElementById('task-form').style.display = 'block';
}

function hideTaskForm() {
    document.getElementById('task-form').style.display = 'none';
    document.getElementById('formTask').reset();
}

function saveTask(event) {
    event.preventDefault();
    const taskData = collectTaskData();
    if (taskData.id) {
        updateTask(taskData);
    } else {
        createTask(taskData);
    }
    hideTaskForm();
    updateStats();
    updateTaskCounts();
}

function toggleComments() {
    const comments = document.getElementById('task-comments');
    comments.style.display = comments.style.display === 'none' ? 'block' : 'none';
}

function addComment() {
    const commentText = document.getElementById('new-comment').value.trim();
    if (commentText) {
        createComment(commentText);
        document.getElementById('new-comment').value = '';
    }
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

function showHelp() {
    document.getElementById('shortcut-help').style.display = 'block';
}

function hideHelp() {
    document.getElementById('shortcut-help').style.display = 'none';
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${viewName}-view`).classList.add('active');
    document.getElementById(`btn-${viewName}-view`).classList.add('active');

    if (viewName === 'calendar') {
        renderCalendar();
    } else if (viewName === 'list') {
        renderListView();
    }
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function filterTasks() {
    const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
    );
    renderTasks(filteredTasks);
}

function sortTasks() {
    const sortBy = document.getElementById('sort-tasks').value;
    const sortedTasks = [...tasks].sort((a, b) => {
        switch (sortBy) {
            case 'fecha': return new Date(a.dueDate) - new Date(b.dueDate);
            case 'prioridad': return priorityWeights[b.priority] - priorityWeights[a.priority];
            case 'nombre': return a.title.localeCompare(b.title);
            default: return 0;
        }
    });
    renderTasks(sortedTasks);
}

function applyFilters() {
    const selectedFilters = Array.from(document.querySelectorAll('input[name="filter"]:checked'))
        .map(checkbox => checkbox.value);
    filterTasksByPriority(selectedFilters);
}

function toggleNotifications() {
    const dropdown = document.getElementById('notification-list');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function confirmDelete() {
    if (taskToDelete) {
        deleteTask(taskToDelete);
        taskToDelete = null;
    }
    hideDeleteConfirm();
}

function hideDeleteConfirm() {
    document.getElementById('delete-confirm').style.display = 'none';
}

function applyTemplate() {
    const template = document.getElementById('task-template').value;
    if (template) {
        loadTemplate(template);
    }
}

function handleOutsideClick(event) {
    if (!event.target.closest('#notification-list') && !event.target.closest('#btn-notifications')) {
        document.getElementById('notification-list').style.display = 'none';
    }

    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

function handleKeyboardShortcuts(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    switch (event.key) {
        case 'n':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                showTaskForm();
            }
            break;
        case 'Escape':
            hideTaskForm();
            hideProjectModal();
            hideHelp();
            hideDeleteConfirm();
            break;
        case 'f':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                document.getElementById('search-tasks').focus();
            }
            break;
        case 's':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (document.getElementById('task-form').style.display === 'block') {
                    document.getElementById('formTask').dispatchEvent(new Event('submit'));
                }
            }
            break;
        case '1':
            event.preventDefault();
            switchView('kanban');
            break;
        case '2':
            event.preventDefault();
            switchView('calendar');
            break;
        case '3':
            event.preventDefault();
            switchView('list');
            break;
    }
}