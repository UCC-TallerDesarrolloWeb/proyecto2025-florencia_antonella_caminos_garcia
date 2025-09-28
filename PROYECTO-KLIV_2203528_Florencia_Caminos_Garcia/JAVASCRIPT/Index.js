document.addEventListener("keydown", function () {
    inicializeApp();
    setupHeaderEvents();
    setupSidebarEvents();
    setupDashboardEvents();
    setupProjectsEvents();
    setupTasksEvents();
    setupSettingsEvents();
    setupHelpEvents();
    setupGlobalEvents();

    const sections = ['Dashboard', 'Projects', 'Tasks', 'Settings', 'Help'];
    let currentIndex = sections.findIndex(id => {
        const section = document.getElementById(id);
        return section && section.classList.contains('active-section');
    });

    if (currentIndex === -1) currentIndex = 0;

    if (e.key === 'ArrowRight') {
        activateSection(sections[(currentIndex + 1) % sections.length]);
    }

    if (e.key === 'ArrowLeft') {
        activateSection(sections[(currentIndex - 1 + sections.length) % sections.length]);
    }
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

function handleSearch() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();

    if (!query) {
        showError('⚠️ Por favor ingrese un término de búsqueda.');
        return;
    }

    hideError();

    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
    });

    let found = false;
    document.querySelectorAll('main section').forEach(section => {
        if (section.textContent.toLowerCase().includes(query)) {
            section.style.display = 'block';
            section.classList.add('active-section');
            section.querySelectorAll('*').forEach(el => {
                if (el.textContent.toLowerCase().includes(query)) {
                    el.classList.add('search-highlight');
                    found = true;
                }
            });
        } else {
            section.style.display = 'none';
            section.classList.remove('active-section');
        }
    });

    if (!found) {
        showError('🔍 No se encontraron coincidencias.');
    }
}


function toggleSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.opacity = 0;
        target.style.display = 'block';
        setTimeout(() => {
            target.style.opacity = 1;
            target.style.transition = 'opacity 0.5s ease-in-out';
        }, 50);
    }
}

function showError(message, targetId = 'errorMessage') {
    const errorContainer = document.getElementById(targetId);
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
}

function hideError(targetId = 'errorMessage') {
    const errorContainer = document.getElementById(targetId);
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
    }
}


document.addEventListener('keydown', function (e) {
    const sections = ['Dashboard', 'Projects', 'Tasks', 'Settings', 'Help'];
    let currentIndex = sections.findIndex(id => document.getElementById(id).style.display === 'block');

    if (e.key === 'ArrowRight') {
        const next = sections[(currentIndex + 1) % sections.length];
        toggleSection(next);
    }

    if (e.key === 'ArrowLeft') {
        const prev = sections[(currentIndex - 1 + sections.length) % sections.length];
        toggleSection(prev);
    }
});

function activateSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-section');
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active-section');
    }

    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const menuItem = document.getElementById(`menu-${sectionId.toLowerCase()}`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

