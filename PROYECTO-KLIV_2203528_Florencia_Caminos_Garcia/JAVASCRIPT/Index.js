class DashboardApp {
    constructor() {
        this.sections = ['Dashboard', 'Projects', 'Tasks', 'Settings', 'Help'];
        this.currentSection = 'Dashboard';
        this.init();
    }

    init() {
        this.initializeApp();
        this.setupAllEvents();
        console.log("Kliv Dashboard Initialized, nice to see you again!");
    }

    initializeApp() {
        document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
        document.querySelectorAll('main section').forEach(section => section.style.display = 'none');

        this.activateSection('Dashboard');
    }

    setupAllEvents() {
        this.setupKeyboardNavigation();
        this.setupHeaderEvents();
        this.setupSidebarEvents();
        this.setupDashboardEvents();
        this.setupProjectsEvents();
        this.setupTasksEvents();
        this.setupSettingsEvents();
        this.setupHelpEvents();
        this.setupGlobalEvents();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const currentIndex = this.sections.findIndex(id => {
                const section = document.getElementById(id);
                return section && section.classList.contains('active-section');
            });

            if (currentIndex === -1) return;

            if (e.key === 'ArrowRight') {
                const nextSection = this.sections[(currentIndex + 1) % this.sections.length];
                this.activateSection(nextSection);
            }

            if (e.key === 'ArrowLeft') {
                const prevSection = this.sections[(currentIndex - 1 + this.sections.length) % this.sections.length];
                this.activateSection(prevSection);
            }
        });
    }

    setupHeaderEvents() {
        const searchButton = document.getElementById('searchButton');
        const searchBox = document.getElementById('searchBox');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        if (searchButton && searchBox) {
            searchButton.addEventListener('click', () => this.handleSearch());

            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });

            searchBox.addEventListener('input', (e) => {
                if (e.target.value.length > 2) this.handleSearch();
            });
        }

        if (userAvatar && userName) {
            userAvatar.addEventListener('click', () => this.toggleUserMenu());
            userName.addEventListener('click', () => this.toggleUserMenu());
        }
    }

    setupSidebarEvents() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Get section ID from menu item ID
                const sectionId = item.id.replace('menu-', '');
                if (sectionId) {
                    this.activateSection(sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
                }
            });
        });
    }

    setupDashboardEvents() {
        const openEditorBtn = document.getElementById('open-editor');

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => {
                this.hideError('errorMessage');

                openEditorBtn.textContent = 'Cargando editor...';
                openEditorBtn.disabled = true;

                setTimeout(() => {
                    if (Math.random() > 0.3) {
                        alert('✅ Editor cargado correctamente');
                        this.activateSection('Projects');
                    } else {
                        this.showError('⚠️ No se pudo abrir el editor, revise la conexión.', 'errorMessage');
                    }

                    openEditorBtn.textContent = 'Ir al Dashboard Editor';
                    openEditorBtn.disabled = false;
                }, 1500);
            });
        }
    }

    setupProjectsEvents() {
        const projectForm = document.getElementById('add-project-content');
        const clearBtn = document.getElementById('clear-form');
        const previewBtn = document.getElementById('preview-content');
        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (!contentInput.value.trim()) {
                    this.showError('⚠️ El contenido del proyecto no puede estar vacío.');
                    return;
                }

                this.hideError();
                this.handleProjectFormSubmit();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                contentInput.value = '';
                targetCardSelect.selectedIndex = 0;
                this.hideError();
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                if (!contentInput.value.trim()) {
                    this.showError('⚠️ No hay contenido para previsualizar.');
                    return;
                }

                alert(`🔍 Vista previa:\n${contentInput.value}`);
            });
        }
    }

    setupTasksEvents() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                row.classList.toggle('task-completed', checkbox.checked);
                this.updateTaskStatistics();
            });
        });

        const addTaskBtn = document.querySelector('.task-actions .btn-primary');
        const removeTaskBtn = document.querySelector('.task-actions .btn-danger');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                console.log('➕ Redirigiendo al administrador de tareas');
                this.activateSection('Tasks');
            });
        }

        if (removeTaskBtn) {
            removeTaskBtn.addEventListener('click', () => {
                this.removeCompletedTasks();
            });
        }

        document.querySelectorAll('#tasks-table tbody tr').forEach(row => {
            row.addEventListener('dblclick', () => {
                this.editTaskInline(row);
            });
        });
    }

    setupSettingsEvents() {
        document.querySelectorAll('#Settings form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.hideError();
                this.handleSettingsSubmit(form);
            });
        });

        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (passwordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('blur', () => {
                if (passwordField.value !== confirmPasswordField.value) {
                    confirmPasswordField.style.borderColor = 'red';
                    this.showError('⚠️ Las contraseñas no coinciden');
                } else {
                    confirmPasswordField.style.borderColor = '#4CAF50';
                    this.hideError();
                }
            });
        }
    }

    setupHelpEvents() {
        document.querySelectorAll('#Help details').forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    const summaryText = detail.querySelector('summary').textContent;
                    console.log('❓ Sección de ayuda abierta:', summaryText);
                }
            });
        });
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
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

    activateSection(sectionId) {
        document.querySelectorAll('main section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });

        const target = document.getElementById(sectionId);
        if (target) {
            target.style.opacity = 0;
            target.style.display = 'block';
            target.classList.add('active-section');

            setTimeout(() => {
                target.style.opacity = 1;
                target.style.transition = 'opacity 0.5s ease-in-out';
            }, 50);
        }

        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });

        const menuItem = document.getElementById(`menu-${sectionId.toLowerCase()}`);
        if (menuItem) {
            menuItem.classList.add('active');
        }

        this.currentSection = sectionId;
    }

    handleSearch() {
        const query = document.getElementById('searchBox').value.trim().toLowerCase();

        if (!query) {
            this.showError('⚠️ Por favor ingrese un término de búsqueda.');
            return;
        }

        this.hideError();

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
            this.showError('🔍 No se encontraron coincidencias.');
        }
    }

    updateTaskStatistics() {
        const total = document.querySelectorAll('.task-checkbox').length;
        const completed = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completed / total) * 100);

        // Actualizar progress bar existente
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = percentage;

            // Animación de conteo
            this.animateNumber(document.querySelector('.task-counter'), completed);
        }

        // Toast de progreso
        if (percentage === 100) {
            this.showToast('¡Todas las tareas completadas! 🎉', 'success');
        }
    }

    animateNumber(element, targetNumber) {
        const start = parseInt(element.textContent) || 0;
        const duration = 1000;
        const step = (targetNumber - start) / (duration / 16);

        let current = start;
        const timer = setInterval(() => {
            current += step;
            element.textContent = Math.round(current);

            if (Math.abs(current - targetNumber) < 1) {
                element.textContent = targetNumber;
                clearInterval(timer);
            }
        }, 16);
    }

    showError(message, targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    hideError(targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    }

    toggleUserMenu() {
        console.log('User menu toggled');
    }

    handleProjectFormSubmit() {
        console.log('Project form submitted');
    }

    updateTaskStatistics() {
        console.log('Task statistics updated');
    }

    removeCompletedTasks() {
        console.log('Completed tasks removed');
    }

    editTaskInline(row) {
        console.log('Editing task inline:', row);
    }

    handleSettingsSubmit(form) {
        console.log('Settings form submitted:', form);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
        <div class="toast-content">
            <span>${type === 'success' ? '✅' : '⚠️'}</span>
            <p>${message}</p>
        </div>
    `;
        document.body.appendChild(toast);

        toast.style.animation = 'fadeInUp 0.6s ease-out forwards';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setupDragAndDrop() {
        const cards = document.querySelectorAll('.projects-grid article');

        cards.forEach(card => {
            card.draggable = true;
            card.addEventListener('dragstart', (e) => {
                card.style.opacity = '0.5';
                e.dataTransfer.setData('text/html', card.outerHTML);
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });
        });
    }


    setupGalleryFilters() {
        const filterButtons = `
        <div class="filter-buttons">
            <button class="btn-secondary active" data-filter="all">Todos</button>
            <button class="btn-secondary" data-filter="ropa">Ropa</button>
            <button class="btn-secondary" data-filter="codigo">Código</button>
            <button class="btn-secondary" data-filter="naturaleza">Naturaleza</button>
        </div>
    `;

        document.querySelector('#Gallery h2').insertAdjacentHTML('afterend', filterButtons);

        document.querySelectorAll('.filter-buttons button').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterGallery(filter);
            });
        });
    }

    setupImageModal() {
        const images = document.querySelectorAll('#gallery-grid img, #dashboard-grid img');

        const modalHTML = `
        <div id="image-modal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img id="modal-image" src="" alt="">
                <div class="modal-actions">
                    <button class="btn-primary">❤️ Me gusta</button>
                    <button class="btn-secondary">💬 Comentar</button>
                    <button class="btn-tertiary">📤 Compartir</button>
                </div>
            </div>
        </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        images.forEach(img => {
            img.addEventListener('click', () => {
                document.getElementById('modal-image').src = img.src;
                document.getElementById('image-modal').style.display = 'flex';
            });
        });
    }

    setupAutoSave() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                input.addEventListener('input', debounce(() => {
                    const formData = new FormData(form);
                    localStorage.setItem(`autosave-${form.id}`, JSON.stringify(Object.fromEntries(formData)));

                    // Mostrar indicador de guardado
                    this.showSaveIndicator();
                }, 1000));
            });
        });
    }

    setupAdvancedSearch() {
        const searchBox = document.getElementById('searchBox');
        const suggestionsHTML = `
        <div id="search-suggestions" class="search-suggestions"></div>
    `;

        searchBox.parentNode.insertAdjacentHTML('afterend', suggestionsHTML);

        searchBox.addEventListener('input', debounce((e) => {
            if (e.target.value.length > 1) {
                this.showSearchSuggestions(e.target.value);
            }
        }, 300));
    }

    setupCharacterCounters() {
        const textInputs = document.querySelectorAll('input[type="text"], textarea');

        textInputs.forEach(input => {
            const maxLength = input.getAttribute('maxlength');
            if (maxLength) {
                const counter = document.createElement('span');
                counter.className = 'char-counter';
                input.parentNode.appendChild(counter);

                input.addEventListener('input', () => {
                    const remaining = maxLength - input.value.length;
                    counter.textContent = `${remaining} caracteres restantes`;
                    counter.style.color = remaining < 10 ? '#e74c3c' : '#666';
                });
            }
        });
    }

    showSearchSuggestions(query) {
        const suggestions = [
            'Dashboard', 'Proyectos', 'Tareas pendientes',
            'Configuración', 'Galería de fotos'
        ].filter(item =>
            item.toLowerCase().includes(query.toLowerCase())
        );

        const suggestionsEl = document.getElementById('search-suggestions');
        suggestionsEl.innerHTML = suggestions.map(suggestion =>
            `<div class="suggestion-item">${suggestion}</div>`
        ).join('');
    }

    setupThemeToggle() {
        const themeToggle = `
        <button id="theme-toggle" class="btn-tertiary">
            🌙 Modo Oscuro
        </button>
    `;

        document.querySelector('#user-info').insertAdjacentHTML('afterbegin', themeToggle);

        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');

            document.getElementById('theme-toggle').innerHTML =
                isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';

            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    showSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.textContent = '✓ Guardado automáticamente';
        document.body.appendChild(indicator);

        setTimeout(() => indicator.remove(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});