// =============================================
// CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
// =============================================

/**
 * Configuración principal del dashboard
 * Define constantes y parámetros globales
 */
const CONFIG = {
    SECTIONS: ['Dashboard', 'Projects', 'Tasks', 'Settings', 'Help'], // Secciones disponibles
    DEFAULT_SECTION: 'Dashboard', // Sección por defecto al cargar
    ANIMATION_DELAY: 50, // Retardo para animaciones (ms)
    SEARCH_MIN_LENGTH: 2, // Longitud mínima para búsquedas
    AUTO_SAVE_DELAY: 1000, // Retardo para autoguardado (ms)
    TOAST_DURATION: 3000, // Duración de notificaciones toast (ms)
    SUGGESTION_MIN_LENGTH: 1 // Longitud mínima para sugerencias
};

/**
 * Selectores CSS para elementos del DOM
 * Centraliza todos los selectores para fácil mantenimiento
 */
const SELECTORS = {
    errorMessages: '.error-msg',
    sections: 'main section',
    sidebarItems: '.sidebar-item',
    taskCheckboxes: '.task-checkbox',
    forms: 'form'
};

// =============================================
// UTILIDADES - Funciones helper reutilizables
// =============================================

const Utils = {
    /**
     * Debounce: Evita llamadas excesivas a funciones
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función debounceada
     */
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

    /**
     * Animación suave de números
     * @param {HTMLElement} element - Elemento donde mostrar el número
     * @param {number} targetNumber - Número objetivo
     * @param {number} duration - Duración de la animación (ms)
     */
    animateNumber(element, targetNumber, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const step = (targetNumber - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += step;
            element.textContent = Math.round(current);

            // Detener animación cuando se alcanza el objetivo
            if (Math.abs(current - targetNumber) < 1) {
                element.textContent = targetNumber;
                clearInterval(timer);
            }
        }, 16);
    },

    /**
     * Crea elementos DOM de forma simplificada
     * @param {string} tag - Tag del elemento
     * @param {string} className - Clase CSS
     * @param {string} content - Contenido HTML
     * @returns {HTMLElement} Elemento creado
     */
    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }
};

// =============================================
// GESTOR DE NOTIFICACIONES
// =============================================

class NotificationManager {
    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje a mostrar
     * @param {string} targetId - ID del contenedor de error
     */
    static showError(message, targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    /**
     * Oculta mensaje de error
     * @param {string} targetId - ID del contenedor de error
     */
    static hideError(targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    }

    /**
     * Muestra notificación toast temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación ('success' o 'error')
     */
    static showToast(message, type = 'success') {
        const toast = Utils.createElement('div', `toast toast-${type}`, `
            <div class="toast-content">
                <span>${type === 'success' ? '✅' : '⚠️'}</span>
                <p>${message}</p>
            </div>
        `);

        document.body.appendChild(toast);
        toast.style.animation = 'fadeInUp 0.6s ease-out forwards';

        // Remover toast después del tiempo configurado
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    }

    /**
     * Muestra indicador de guardado automático
     */
    static showSaveIndicator() {
        const indicator = Utils.createElement('div', 'save-indicator', '✓ Guardado automáticamente');
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }
}

// =============================================
// GESTOR DE NAVEGACIÓN
// =============================================

class NavigationManager {
    /**
     * @param {DashboardApp} dashboardApp - Instancia de la app principal
     */
    constructor(dashboardApp) {
        this.app = dashboardApp;
        this.currentSection = CONFIG.DEFAULT_SECTION;
    }

    /**
     * Activa una sección específica
     * @param {string} sectionId - ID de la sección a activar
     */
    activateSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll(SELECTORS.sections).forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });

        // Mostrar sección objetivo
        const target = document.getElementById(sectionId);
        if (target) {
            this._animateSection(target);
        }

        this._updateSidebar(sectionId);
        this.currentSection = sectionId;
    }

    /**
     * Animación de transición de sección
     * @param {HTMLElement} target - Elemento de la sección
     */
    _animateSection(target) {
        target.style.opacity = 0;
        target.style.display = 'block';
        target.classList.add('active-section');

        setTimeout(() => {
            target.style.opacity = 1;
            target.style.transition = 'opacity 0.5s ease-in-out';
        }, CONFIG.ANIMATION_DELAY);
    }

    /**
     * Actualiza estado activo en el sidebar
     * @param {string} sectionId - ID de la sección activa
     */
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

// =============================================
// GESTOR DE BÚSQUEDA
// =============================================

class SearchManager {
    /**
     * @param {NotificationManager} notificationManager - Gestor de notificaciones
     */
    constructor(notificationManager) {
        this.notifications = notificationManager;
        this.setupAdvancedSearch();
    }

    /**
     * Maneja la búsqueda de contenido
     */
    handleSearch() {
        const query = document.getElementById('searchBox').value.trim().toLowerCase();

        // Validar longitud mínima
        if (!query) {
            NotificationManager.showError('⚠️ Por favor ingrese un término de búsqueda.');
            return;
        }

        NotificationManager.hideError();
        this._clearHighlights();

        const found = this._searchInSections(query);

        // Mostrar error si no se encuentran resultados
        if (!found) {
            NotificationManager.showError('🔍 No se encontraron coincidencias.');
        }
    }

    /**
     * Limpia resaltados anteriores
     */
    _clearHighlights() {
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
    }

    /**
     * Busca texto en todas las secciones
     * @param {string} query - Término de búsqueda
     * @returns {boolean} True si se encontraron resultados
     */
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

    /**
     * Resalta coincidencias en una sección
     * @param {HTMLElement} section - Sección donde buscar
     * @param {string} query - Término a resaltar
     */
    _highlightMatches(section, query) {
        section.querySelectorAll('*').forEach(el => {
            if (el.textContent.toLowerCase().includes(query)) {
                el.classList.add('search-highlight');
            }
        });
    }

    /**
     * Configura búsqueda con sugerencias
     */
    setupAdvancedSearch() {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;

        const suggestionsHTML = '<div id="search-suggestions" class="search-suggestions"></div>';
        searchBox.parentNode.insertAdjacentHTML('afterend', suggestionsHTML);

        // Búsqueda con debounce para mejor performance
        searchBox.addEventListener('input', Utils.debounce((e) => {
            if (e.target.value.length > CONFIG.SUGGESTION_MIN_LENGTH) {
                this.showSearchSuggestions(e.target.value);
            }
        }, 300));
    }

    /**
     * Muestra sugerencias de búsqueda
     * @param {string} query - Término de búsqueda
     */
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

// =============================================
// GESTOR DE TAREAS
// =============================================

class TaskManager {
    /**
     * Actualiza estadísticas de tareas
     */
    updateStatistics() {
        const total = document.querySelectorAll(SELECTORS.taskCheckboxes).length;
        const completed = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completed / total) * 100);

        this._updateProgressBar(percentage);
        this._updateCounter(completed);

        // Notificación cuando todas las tareas están completadas
        if (percentage === 100) {
            NotificationManager.showToast('¡Todas las tareas completadas! 🎉', 'success');
        }
    }

    /**
     * Actualiza barra de progreso
     * @param {number} percentage - Porcentaje de completitud
     */
    _updateProgressBar(percentage) {
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = percentage;
        }
    }

    /**
     * Actualiza contador de tareas con animación
     * @param {number} completed - Número de tareas completadas
     */
    _updateCounter(completed) {
        const counter = document.querySelector('.task-counter');
        if (counter) {
            Utils.animateNumber(counter, completed);
        }
    }

    /**
     * Elimina tareas completadas
     */
    removeCompletedTasks() {
        document.querySelectorAll('.task-checkbox:checked').forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                row.remove();
            }
        });
        this.updateStatistics();
    }

    /**
     * Permite edición inline de tareas
     * @param {HTMLElement} row - Fila de la tabla a editar
     */
    editTaskInline(row) {
        const cell = row.querySelector('td:nth-child(2)');
        if (cell) {
            const originalText = cell.textContent;
            const input = Utils.createElement('input', 'form-control', '');
            input.value = originalText;

            cell.innerHTML = '';
            cell.appendChild(input);
            input.focus();

            // Guardar cambios al perder foco
            input.addEventListener('blur', () => {
                cell.textContent = input.value || originalText;
            });

            // Guardar cambios con Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        }
    }
}

// =============================================
// APLICACIÓN PRINCIPAL - DASHBOARD APP
// =============================================

class DashboardApp {
    constructor() {
        this.sections = CONFIG.SECTIONS;
        this.navigationManager = new NavigationManager(this);
        this.searchManager = new SearchManager();
        this.taskManager = new TaskManager();
        this.eventHandlers = new Map();

        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.initializeApp();
        this.setupAllEvents();
        this.setupEnhancements();
        console.log("Kliv Dashboard Initialized, nice to see you again!");
    }

    /**
     * Configuración inicial de la aplicación
     */
    initializeApp() {
        // Ocultar mensajes de error
        document.querySelectorAll(SELECTORS.errorMessages)
            .forEach(el => el.style.display = 'none');

        // Ocultar todas las secciones
        document.querySelectorAll(SELECTORS.sections)
            .forEach(section => section.style.display = 'none');

        // Activar sección por defecto
        this.navigationManager.activateSection(CONFIG.DEFAULT_SECTION);
    }

    /**
     * Configura todos los event listeners
     */
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

    /**
     * Configura mejoras y funcionalidades adicionales
     */
    setupEnhancements() {
        this.setupThemeToggle();
        this.setupAutoSave();
        this.setupCharacterCounters();
        this.setupDragAndDrop();
        this.setupLikes(); // Sistema de me gusta
    }

    /**
     * Navegación por teclado
     */
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

    /**
     * Eventos del header (búsqueda y usuario)
     */
    setupHeaderEvents() {
        const elements = {
            searchButton: document.getElementById('searchButton'),
            searchBox: document.getElementById('searchBox'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name')
        };

        // Configurar eventos de búsqueda
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

        // Configurar eventos de usuario
        if (elements.userAvatar && elements.userName) {
            [elements.userAvatar, elements.userName].forEach(el => {
                el.addEventListener('click', () => this.toggleUserMenu());
            });
        }
    }

    /**
     * Eventos del sidebar (navegación)
     */
    setupSidebarEvents() {
        document.querySelectorAll(SELECTORS.sidebarItems).forEach(item => {
            item.addEventListener('click', () => {
                // Remover activo de todos los items
                document.querySelectorAll(SELECTORS.sidebarItems)
                    .forEach(i => i.classList.remove('active'));
                
                // Agregar activo al item clickeado
                item.classList.add('active');

                // Activar sección correspondiente
                const sectionId = item.id.replace('menu-', '');
                if (sectionId) {
                    const formattedId = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                    this.navigationManager.activateSection(formattedId);
                }
            });
        });
    }

    /**
     * Eventos de la sección de tareas
     */
    setupTasksEvents() {
        // Eventos para checkboxes de tareas
        document.querySelectorAll(SELECTORS.taskCheckboxes).forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                row.classList.toggle('task-completed', checkbox.checked);
                this.taskManager.updateStatistics();
            });
        });

        const addTaskBtn = document.querySelector('.task-actions .btn-primary');
        const removeTaskBtn = document.querySelector('.task-actions .btn-danger');

        // Botón añadir tarea
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.navigationManager.activateSection('Tasks');
            });
        }

        // Botón eliminar tareas completadas
        if (removeTaskBtn) {
            removeTaskBtn.addEventListener('click', () => {
                this.taskManager.removeCompletedTasks();
            });
        }

        // Doble click para editar tareas
        document.querySelectorAll('#tasks-table tbody tr').forEach(row => {
            row.addEventListener('dblclick', () => {
                this.taskManager.editTaskInline(row);
            });
        });
    }

    /**
     * Sistema de autoguardado para formularios
     */
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

    /**
     * Toggle entre modo claro y oscuro
     */
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

    /**
     * Contadores de caracteres para inputs
     */
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

                // Trigger inicial para mostrar estado actual
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    /**
     * Eventos del dashboard principal
     */
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

    /**
     * Simula carga del editor (para demostración)
     */
    async simulateEditorLoad() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 ? resolve() : reject(new Error('Fallo de conexión'));
            }, 1500);
        });
    }

    /**
     * Eventos de la sección de proyectos
     */
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

    /**
     * Maneja envío de formulario de proyectos
     */
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

    /**
     * Limpia formulario de proyectos
     */
    clearProjectForm() {
        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (contentInput) contentInput.value = '';
        if (targetCardSelect) targetCardSelect.selectedIndex = 0;
        NotificationManager.hideError();
    }

    /**
     * Muestra vista previa de proyecto
     */
    previewProject() {
        const contentInput = document.getElementById('project-content-text');

        if (!contentInput.value.trim()) {
            NotificationManager.showError('⚠️ No hay contenido para previsualizar.');
            return;
        }

        alert(`🔍 Vista previa:\n${contentInput.value}`);
    }

    /**
     * Eventos de la sección de configuración
     */
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

    /**
     * Validación de contraseñas coincidentes
     */
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

    /**
     * Eventos de la sección de ayuda
     */
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

    /**
     * Eventos globales (atajos de teclado)
     */
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

    /**
     * Sistema de drag and drop para proyectos
     */
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

    /**
     * Sistema simple de "me gusta" para imágenes
     */
    setupLikes() {
        document.querySelectorAll('.like-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const figure = this.closest('figure');
                const likeCount = figure.querySelector('.like-count');
                const img = figure.querySelector('img');

                if (this.textContent === '🤍') {
                    // Dar like
                    this.textContent = '❤️';
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                    localStorage.setItem(`likes-${img.src}`, likeCount.textContent);
                    localStorage.setItem(`liked-${img.src}`, 'true');
                } else {
                    // Quitar like
                    this.textContent = '🤍';
                    likeCount.textContent = Math.max(0, parseInt(likeCount.textContent) - 1);
                    localStorage.setItem(`likes-${img.src}`, likeCount.textContent);
                    localStorage.setItem(`liked-${img.src}`, 'false');
                }
            });
        });

        // Cargar likes guardados al iniciar
        this.loadSavedLikes();
    }

    /**
     * Carga los "me gusta" guardados desde localStorage
     */
    loadSavedLikes() {
        document.querySelectorAll('figure').forEach(figure => {
            const img = figure.querySelector('img');
            const likeIcon = figure.querySelector('.like-icon');
            const likeCount = figure.querySelector('.like-count');

            const savedLikes = localStorage.getItem(`likes-${img.src}`);
            const savedLiked = localStorage.getItem(`liked-${img.src}`);

            if (savedLikes) likeCount.textContent = savedLikes;
            if (savedLiked === 'true') likeIcon.textContent = '❤️';
        });
    }

    /**
     * Muestra/oculta menú de usuario
     */
    toggleUserMenu() {
        console.log('User menu toggled');
    }

    /**
     * Maneja envío de formularios de configuración
     */
    handleSettingsSubmit(form) {
        console.log('Settings form submitted:', form.id);
        NotificationManager.showToast('Configuración guardada');
    }
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});