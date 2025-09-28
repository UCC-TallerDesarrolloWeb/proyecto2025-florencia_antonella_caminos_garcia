const CONFIG = {
    SECTIONS: ['Dashboard', 'Projects', 'Tasks', 'Settings', 'Help'],
    DEFAULT_SECTION: 'Dashboard',
    ANIMATION_DELAY: 50,
    SEARCH_MIN_LENGTH: 2,
    AUTO_SAVE_DELAY: 1000,
    TOAST_DURATION: 3000,
    SUGGESTION_MIN_LENGTH: 1
};

const SELECTORS = {
    errorMessages: '.error-msg',
    sections: 'main section',
    sidebarItems: '.sidebar-item',
    taskCheckboxes: '.task-checkbox',
    forms: 'form'
};

const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    animateNumber(element, targetNumber, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
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
    },

    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }
};

class NotificationManager {
    static showError(message, targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    static hideError(targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    }

    static showToast(message, type = 'success') {
        const toast = Utils.createElement('div', `toast toast-${type}`, `
            <div class="toast-content">
                <span>${type === 'success' ? '✅' : '⚠️'}</span>
                <p>${message}</p>
            </div>
        `);

        document.body.appendChild(toast);
        toast.style.animation = 'fadeInUp 0.6s ease-out forwards';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    }

    static showSaveIndicator() {
        const indicator = Utils.createElement('div', 'save-indicator', '✓ Guardado automáticamente');
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }
}

class NavigationManager {
    constructor(dashboardApp) {
        this.app = dashboardApp;
        this.currentSection = CONFIG.DEFAULT_SECTION;
    }

    activateSection(sectionId) {
        document.querySelectorAll(SELECTORS.sections).forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });

        const target = document.getElementById(sectionId);
        if (target) {
            this._animateSection(target);
        }

        this._updateSidebar(sectionId);
        this.currentSection = sectionId;
    }

    _animateSection(target) {
        target.style.opacity = 0;
        target.style.display = 'block';
        target.classList.add('active-section');

        setTimeout(() => {
            target.style.opacity = 1;
            target.style.transition = 'opacity 0.5s ease-in-out';
        }, CONFIG.ANIMATION_DELAY);
    }

    _updateSidebar(sectionId) {
        document.querySelectorAll(SELECTORS.sidebarItems).forEach(item => {
            item.classList.remove('active');
        });

        const menuItem = document.getElementById(`menu-${sectionId.toLowerCase()}`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }
}

class SearchManager {
    constructor(notificationManager) {
        this.notifications = notificationManager;
        this.setupAdvancedSearch();
    }

    handleSearch() {
        const query = document.getElementById('searchBox').value.trim().toLowerCase();

        if (!query) {
            NotificationManager.showError('⚠️ Por favor ingrese un término de búsqueda.');
            return;
        }

        NotificationManager.hideError();
        this._clearHighlights();

        const found = this._searchInSections(query);

        if (!found) {
            NotificationManager.showError('🔍 No se encontraron coincidencias.');
        }
    }

    _clearHighlights() {
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
    }

    _searchInSections(query) {
        let found = false;
        document.querySelectorAll(SELECTORS.sections).forEach(section => {
            if (section.textContent.toLowerCase().includes(query)) {
                section.style.display = 'block';
                section.classList.add('active-section');
                this._highlightMatches(section, query);
                found = true;
            } else {
                section.style.display = 'none';
                section.classList.remove('active-section');
            }
        });
        return found;
    }

    _highlightMatches(section, query) {
        section.querySelectorAll('*').forEach(el => {
            if (el.textContent.toLowerCase().includes(query)) {
                el.classList.add('search-highlight');
            }
        });
    }

    setupAdvancedSearch() {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;

        const suggestionsHTML = '<div id="search-suggestions" class="search-suggestions"></div>';
        searchBox.parentNode.insertAdjacentHTML('afterend', suggestionsHTML);

        searchBox.addEventListener('input', Utils.debounce((e) => {
            if (e.target.value.length > CONFIG.SUGGESTION_MIN_LENGTH) {
                this.showSearchSuggestions(e.target.value);
            }
        }, 300));
    }

    showSearchSuggestions(query) {
        const suggestions = CONFIG.SECTIONS
            .concat(['Tareas pendientes', 'Configuración', 'Galería de fotos'])
            .filter(item => item.toLowerCase().includes(query.toLowerCase()));

        const suggestionsEl = document.getElementById('search-suggestions');
        if (suggestionsEl) {
            suggestionsEl.innerHTML = suggestions
                .map(suggestion => `<div class="suggestion-item">${suggestion}</div>`)
                .join('');
        }
    }
}

class TaskManager {
    updateStatistics() {
        const total = document.querySelectorAll(SELECTORS.taskCheckboxes).length;
        const completed = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completed / total) * 100);

        this._updateProgressBar(percentage);
        this._updateCounter(completed);

        if (percentage === 100) {
            NotificationManager.showToast('¡Todas las tareas completadas! 🎉', 'success');
        }
    }

    _updateProgressBar(percentage) {
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = percentage;
        }
    }

    _updateCounter(completed) {
        const counter = document.querySelector('.task-counter');
        if (counter) {
            Utils.animateNumber(counter, completed);
        }
    }

    removeCompletedTasks() {
        document.querySelectorAll('.task-checkbox:checked').forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                row.remove();
            }
        });
        this.updateStatistics();
    }

    editTaskInline(row) {
        const cell = row.querySelector('td:nth-child(2)');
        if (cell) {
            const originalText = cell.textContent;
            const input = Utils.createElement('input', 'form-control', '');
            input.value = originalText;

            cell.innerHTML = '';
            cell.appendChild(input);
            input.focus();

            input.addEventListener('blur', () => {
                cell.textContent = input.value || originalText;
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        }
    }
}

class DashboardApp {
    constructor() {
        this.sections = CONFIG.SECTIONS;
        this.navigationManager = new NavigationManager(this);
        this.searchManager = new SearchManager();
        this.taskManager = new TaskManager();
        this.eventHandlers = new Map();

        this.init();
    }

    init() {
        this.initializeApp();
        this.setupAllEvents();
        this.setupEnhancements();
        console.log("Kliv Dashboard Initialized, nice to see you again!");
    }

    initializeApp() {
        document.querySelectorAll(SELECTORS.errorMessages)
            .forEach(el => el.style.display = 'none');

        document.querySelectorAll(SELECTORS.sections)
            .forEach(section => section.style.display = 'none');

        this.navigationManager.activateSection(CONFIG.DEFAULT_SECTION);
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

    setupEnhancements() {
        this.setupThemeToggle();
        this.setupAutoSave();
        this.setupCharacterCounters();
        this.setupDragAndDrop();
        this.setupImageModal();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const currentIndex = this.sections.findIndex(id => {
                const section = document.getElementById(id);
                return section && section.classList.contains('active-section');
            });

            if (currentIndex === -1) return;

            const handlers = {
                'ArrowRight': () => {
                    const nextSection = this.sections[(currentIndex + 1) % this.sections.length];
                    this.navigationManager.activateSection(nextSection);
                },
                'ArrowLeft': () => {
                    const prevSection = this.sections[(currentIndex - 1 + this.sections.length) % this.sections.length];
                    this.navigationManager.activateSection(prevSection);
                }
            };

            if (handlers[e.key]) {
                handlers[e.key]();
            }
        });
    }

    setupHeaderEvents() {
        const elements = {
            searchButton: document.getElementById('searchButton'),
            searchBox: document.getElementById('searchBox'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name')
        };

        if (elements.searchButton && elements.searchBox) {
            elements.searchButton.addEventListener('click', () => this.searchManager.handleSearch());
            elements.searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchManager.handleSearch();
            });
            elements.searchBox.addEventListener('input', (e) => {
                if (e.target.value.length > CONFIG.SEARCH_MIN_LENGTH) {
                    this.searchManager.handleSearch();
                }
            });
        }

        if (elements.userAvatar && elements.userName) {
            [elements.userAvatar, elements.userName].forEach(el => {
                el.addEventListener('click', () => this.toggleUserMenu());
            });
        }
    }

    setupSidebarEvents() {
        document.querySelectorAll(SELECTORS.sidebarItems).forEach(item => {
            item.addEventListener('click', () => {

                document.querySelectorAll(SELECTORS.sidebarItems)
                    .forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const sectionId = item.id.replace('menu-', '');
                if (sectionId) {
                    const formattedId = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                    this.navigationManager.activateSection(formattedId);
                }
            });
        });
    }

    setupTasksEvents() {
        document.querySelectorAll(SELECTORS.taskCheckboxes).forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                row.classList.toggle('task-completed', checkbox.checked);
                this.taskManager.updateStatistics();
            });
        });

        const addTaskBtn = document.querySelector('.task-actions .btn-primary');
        const removeTaskBtn = document.querySelector('.task-actions .btn-danger');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.navigationManager.activateSection('Tasks');
            });
        }

        if (removeTaskBtn) {
            removeTaskBtn.addEventListener('click', () => {
                this.taskManager.removeCompletedTasks();
            });
        }

        document.querySelectorAll('#tasks-table tbody tr').forEach(row => {
            row.addEventListener('dblclick', () => {
                this.taskManager.editTaskInline(row);
            });
        });
    }

    setupAutoSave() {
        document.querySelectorAll(SELECTORS.forms).forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                input.addEventListener('input', Utils.debounce(() => {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    localStorage.setItem(`autosave-${form.id}`, JSON.stringify(data));
                    NotificationManager.showSaveIndicator();
                }, CONFIG.AUTO_SAVE_DELAY));
            });
        });
    }

    setupThemeToggle() {
        const themeToggle = Utils.createElement('button', 'btn-tertiary', '🌙 Modo Oscuro');
        themeToggle.id = 'theme-toggle';

        const userInfo = document.querySelector('#user-info');
        if (userInfo) {
            userInfo.insertAdjacentElement('afterbegin', themeToggle);

            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');

                themeToggle.innerHTML = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }
    }

    setupCharacterCounters() {
        document.querySelectorAll('input[type="text"], textarea').forEach(input => {
            const maxLength = input.getAttribute('maxlength');
            if (maxLength) {
                const counter = Utils.createElement('span', 'char-counter');
                input.parentNode.appendChild(counter);

                input.addEventListener('input', () => {
                    const remaining = maxLength - input.value.length;
                    counter.textContent = `${remaining} caracteres restantes`;
                    counter.style.color = remaining < 10 ? '#e74c3c' : '#666';
                });

                // Trigger inicial
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    setupDashboardEvents() {
        const openEditorBtn = document.getElementById('open-editor');
        if (!openEditorBtn) return;

        openEditorBtn.addEventListener('click', async () => {
            if (typeof NotificationManager !== "undefined" && NotificationManager.hideError) {
                NotificationManager.hideError('errorMessage');
            }
            openEditorBtn.textContent = 'Cargando editor...';
            openEditorBtn.disabled = true;

            try {
                await this.simulateEditorLoad();
                window.location.href = '../HTML/Dashboard_Editor.html';
            } catch (error) {
                console.error("Error al cargar el editor:", error);

                window.location.href = '../HTML/Dashboard_Editor.html';
            } finally {
                openEditorBtn.textContent = 'Ir al Dashboard Editor';
                openEditorBtn.disabled = false;
            }
        });
    }

    async simulateEditorLoad() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 ? resolve() : reject(new Error('Fallo de conexión'));
            }, 1500);
        });
    }

    setupProjectsEvents() {
        const form = document.getElementById('add-project-content');
        const clearBtn = document.getElementById('clear-form');
        const previewBtn = document.getElementById('preview-content');

        if (form) {
            form.addEventListener('submit', this.handleProjectSubmit.bind(this));
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', this.clearProjectForm.bind(this));
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', this.previewProject.bind(this));
        }
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        const contentInput = document.getElementById('project-content-text');

        if (!contentInput.value.trim()) {
            NotificationManager.showError('⚠️ El contenido del proyecto no puede estar vacío.');
            return;
        }

        NotificationManager.hideError();
        console.log('Project form submitted');
        NotificationManager.showToast('Proyecto creado exitosamente');
    }

    clearProjectForm() {
        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (contentInput) contentInput.value = '';
        if (targetCardSelect) targetCardSelect.selectedIndex = 0;
        NotificationManager.hideError();
    }

    previewProject() {
        const contentInput = document.getElementById('project-content-text');

        if (!contentInput.value.trim()) {
            NotificationManager.showError('⚠️ No hay contenido para previsualizar.');
            return;
        }

        alert(`🔍 Vista previa:\n${contentInput.value}`);
    }

    setupSettingsEvents() {
        document.querySelectorAll('#Settings form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                NotificationManager.hideError();
                this.handleSettingsSubmit(form);
            });
        });

        this.setupPasswordValidation();
    }

    setupPasswordValidation() {
        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (passwordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('blur', () => {
                const isValid = passwordField.value === confirmPasswordField.value;
                confirmPasswordField.style.borderColor = isValid ? '#4CAF50' : 'red';

                if (isValid) {
                    NotificationManager.hideError();
                } else {
                    NotificationManager.showError('⚠️ Las contraseñas no coinciden');
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
            const shortcuts = {
                'f': () => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                        document.getElementById('searchBox')?.focus();
                    }
                },
                'Escape': () => {
                    const searchBox = document.getElementById('searchBox');
                    if (searchBox) searchBox.value = '';
                    this.searchManager._clearHighlights();
                }
            };

            if (shortcuts[e.key]) {
                shortcuts[e.key]();
            }
        });
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

    setupImageModal() {
        const images = document.querySelectorAll('#gallery-grid img, #dashboard-grid img');

        const modalHTML = `
            <div id="image-modal" class="modal">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <img id="modal-image" src="" alt="">
                    <div class="modal-actions">
                        <button class="btn-primary">❤️ Me gusta</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        images.forEach(img => {
            img.addEventListener('click', () => {
                const modalImage = document.getElementById('modal-image');
                const modal = document.getElementById('image-modal');

                if (modalImage && modal) {
                    modalImage.src = img.src;
                    modal.style.display = 'flex';
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.id === 'image-modal') {
                document.getElementById('image-modal').style.display = 'none';
            }
        });
    }

    toggleUserMenu() {
        console.log('User menu toggled');
    }

    handleSettingsSubmit(form) {
        console.log('Settings form submitted:', form.id);
        NotificationManager.showToast('Configuración guardada');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});