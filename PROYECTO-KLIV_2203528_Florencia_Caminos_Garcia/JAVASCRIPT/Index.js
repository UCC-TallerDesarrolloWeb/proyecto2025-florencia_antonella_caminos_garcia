document.addEventListener("DOMContentLoaded", function () {
    inicializeApp();
    setupHeaderEvents();
    setupSidebarEvents();
    setupDashboardEvents();
    setupProjectsEvents();
    setupTasksEvents();
    setupSettingsEvents();
    setupHelpEvents();
    setupGlobalEvents();
});

function inicializeApp() {
    console.log("Kliv Dasboard Initialized, nice to see you again!");

    document.querySelectorAll('.error-msg').forEach(el => { el.style.display = 'none' });
    document.querySelectorAll('main section').forEach(section => { section.style.display = 'none'; });
    document.getElementById('Dashboard').style.display = 'block';
    document.getElementById('menu-dashboard').classList.add('active');
}

function setupHeaderEvents() {
    const searchButton = document.getElementById('searchButton');
    const searchBox = document.getElementById('searchBox');

    if (searchButton && searchBox) {
        searchButton.addEventListener('click', handleSearch);
        searchBox.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });

        searchBox.addEventListener('input', function () {
            if (this.value.length > 2) {
                handleSearch();
            }
        });
    }

    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (userAvatar && userName) {
        userAvatar.addEventListener('click', toggleUserMenu);
        userName.addEventListener('click', toggleUserMenu);
    }
}

function setupSidebarEvents() {
    const sidebarmenu = document.querySelectorAll('.sidebar-item');

    sidebarmenu.forEach(item => {
        item.addEventListener('click', function () {
            sidebarmenu.forEach(i => i.classList.remove('active'));
            this.classList.add('active');


        });
    });

    function setupDashboardEvents() {
        const openEditorBtn = document.getElementById('open-editor');

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', function () {
                const errorMsg = document.querySelector('#Dashboard .error-msg');

                errorMsg.style.display = 'none';
                this.textContent = 'Cargando editor...';
                this.disabled = true;

                setTimeout(() => {
                    if (Math.random() > 0.3) {
                        alert('✅ Editor cargado correctamente');
                        window.location.href = '#editor';
                    } else {
                        errorMsg.style.display = 'block';
                        errorMsg.textContent = '⚠️ No se pudo abrir el editor, revise la conexión.';
                    }

                    this.textContent = 'Ir al Dashboard Editor';
                    this.disabled = false;
                }, 1500);
            });
        }
    }

    function setupProjectsEvents() {
        const projectForm = document.getElementById('add-project-content');
        const clearBtn = document.getElementById('clear-form');
        const previewBtn = document.getElementById('preview-content');
        const targetCardSelect = document.getElementById('target-card');
        const contentInput = document.getElementById('project-content-text');

        if (projectForm) {
            projectForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleProjectFormSubmit();
            });
        }
    }

    function setupTasksEvents() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const row = this.closest('tr');
                if (this.checked) {
                    row.style.opacity = '0.6';
                    row.style.textDecoration = 'line-through';
                    row.style.background = '#f0f0f0';
                } else {
                    row.style.opacity = '1';
                    row.style.textDecoration = 'none';
                    row.style.background = '';
                }

                updateTaskStatistics();
            });
        });

        const addTaskBtn = document.querySelector('.task-actions .btn-primary');
        const removeTaskBtn = document.querySelector('.task-actions .btn-danger');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', function () {
                console.log('➕ Redirigiendo al administrador de tareas');
            });
        }

        if (removeTaskBtn) {
            removeTaskBtn.addEventListener('click', function () {
                removeCompletedTasks();
            });
        }

        document.querySelectorAll('#tasks-table tbody tr').forEach(row => {
            row.addEventListener('dblclick', function () {
                editTaskInline(this);
            });
        });
    }

    function setupSettingsEvents() {
        document.querySelectorAll('#Settings form').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                handleSettingsSubmit(this);
            });
        });

        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (passwordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('blur', function () {
                if (passwordField.value !== confirmPasswordField.value) {
                    this.style.borderColor = 'red';
                    showError('⚠️ Las contraseñas no coinciden');
                } else {
                    this.style.borderColor = '#4CAF50';
                }
            });
        }
    }

    function setupHelpEvents() {
        document.querySelectorAll('#Help details').forEach(detail => {
            detail.addEventListener('toggle', function () {
                if (this.open) {
                    console.log('❓ Sección de ayuda abierta:', this.querySelector('summary').textContent);
                }
            });
        });
    }

    function setupGlobalEvents() {
    }
    function setupGlobalEvents() {
        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchBox').focus();
            }

            if (e.key === 'Escape') {
                document.getElementById('searchBox').value = '';
                document.querySelectorAll('.search-highlight').forEach(el => {
                    el.classList.remove('search-highlight');
                });
            }
        });
    }
}
