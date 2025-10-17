// noinspection JSVoidFunctionReturnValueUsed

/**
 * =====================
 * Clase DashboardApp - Versión Mejorada y Corregida
 * =====================
 */
class DashboardApp {

    /**
     * Constructor principal
     * Inicializa propiedades y configura la aplicación
     */
    constructor() {
        // Agregar las nuevas secciones al array
        this.sections = ['Dashboard', 'Project', 'Gallery', 'Tasks', 'Settings', 'Help', 'Privacy', 'Terms', 'About'];
        this.currentSection = 'Dashboard';
        this.navigationHistory = ['Dashboard'];
        this.likesData = this.loadLikesData();
        this.isInitialized = false;

        this.init();
    }

    /**
     * Inicialización de la aplicación
     * Configura todos los componentes necesarios
     */
    init() {
        if (this.isInitialized) {
            console.warn('Dashboard ya está inicializado');
            return;
        }

        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    /**
     * Configuración inicial de la aplicación
     * Limpia errores, oculta secciones y activa la sección por defecto
     */
    initializeApp() {
        console.log('🚀 Inicializando Kliv Dashboard...');

        // Ocultar todos los mensajes de error y éxito
        this.hideAllErrors();
        this.hideAllSuccessMessages();

        // Ocultar todas las secciones excepto Dashboard
        this.hideAllSections();

        // Configurar eventos
        this.setupAllEvents();
        this.setupLikesSystem();
        this.setupEnhancedNavigation();

        // Activar sección por defecto
        this.activateSection('Dashboard');

        this.isInitialized = true;
        console.log("✅ Kliv Dashboard Initialized, nice to see you again!");

        // Debug opcional
        this.debugSections();
    }

    /**
     * Oculta todos los mensajes de error
     */
    hideAllErrors() {
        document.querySelectorAll('.error-msg').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Oculta todos los mensajes de éxito
     */
    hideAllSuccessMessages() {
        document.querySelectorAll('.success-msg').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Oculta todas las secciones
     */
    hideAllSections() {
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });
    }

    /**
     * Configuración de todos los eventos
     * Orquesta la inicialización de todos los sistemas de eventos
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
     * Configuración del sistema de likes
     * Inicializa el contador y los eventos de interacción
     */
    setupLikesSystem() {
        this.updateAllLikesCounters();
        this.setupLikesEvents();
    }

    /**
     * Configuración de navegación mejorada
     * Añade breadcrumbs y controles de navegación
     */
    setupEnhancedNavigation() {
        this.createBreadcrumbs();
        this.setupNavigationControls();
    }

    /**
     * Configura eventos de teclado para navegación
     * Flechas izquierda/derecha para cambiar secciones
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Solo procesar si no estamos en un campo de entrada
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Manejar Escape en campos de búsqueda
                if (e.key === 'Escape' && e.target.id === 'searchBox') {
                    e.target.value = '';
                    this.removeAllHighlights();
                    this.restoreNormalView();
                    this.hideError('search-error');
                }
                return;
            }

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

            // Escape para limpiar búsqueda
            if (e.key === 'Escape') {
                const searchBox = document.getElementById('searchBox');
                if (searchBox) {
                    searchBox.value = '';
                    this.removeAllHighlights();
                    this.restoreNormalView();
                    this.hideError('search-error');
                }
            }
        });
    }

    /**
     * Configura eventos del header
     * Búsqueda y menú de usuario
     */
    setupHeaderEvents() {
        const searchButton = document.getElementById('searchButton');
        const searchBox = document.getElementById('searchBox');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');

        /* ---------- Búsqueda ---------- */
        if (searchButton && searchBox) {
            searchButton.addEventListener('click', () => this.handleSearch());
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
            searchBox.addEventListener('input', (e) => {
                if (e.target.value.length > 2) this.handleSearch();
            });
        }

        /* ---------- Menú usuario ---------- */
        if (userAvatar && userName) {
            userAvatar.addEventListener('click', () => this.toggleUserMenu());
            userName.addEventListener('click', () => this.toggleUserMenu());
        }

        /* ---------- Logout ---------- */
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            const userInfo = document.getElementById('user-info');

            if (userMenu && userMenu.style.display === 'block' &&
                !userInfo.contains(e.target)) {
                userMenu.style.display = 'none';
            }
        });
    }

    /**
     * Maneja el cierre de sesión
     */
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.showToast('Cerrando sesión...', 'success');
            setTimeout(() => {
                // Aquí iría la lógica real de logout
                window.location.href = '../HTML/Login.html';
            }, 1500);
        }
    }

    /**
     * Configura eventos del sidebar
     */
    setupSidebarEvents() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const sectionId = item.id.replace('menu-', '');
                if (sectionId) {
                    // Mapeo exacto de sidebar a secciones
                    const sectionMap = {
                        'dashboard': 'Dashboard',
                        'projects': 'Project',
                        'gallery': 'Gallery',
                        'tasks': 'Tasks',
                        'settings': 'Settings',
                        'help': 'Help',
                        'privacy': 'Privacy',
                        'terms': 'Terms',
                        'about': 'About'
                    };

                    const sectionName = sectionMap[sectionId];
                    if (sectionName) {
                        this.activateSection(sectionName);
                    } else {
                        console.warn(`No se encontró mapeo para: ${sectionId}`);
                    }
                }
            });
        });
    }

    /**
     * Configura controles de navegación mejorada
     */
    setupNavigationControls() {
        // Los controles ya están en el HTML, solo configuramos eventos
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateToPrevious());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateToNext());
        }
    }

    /**
     * Navega a la sección anterior en el historial
     */
    navigateToPrevious() {
        if (this.navigationHistory.length > 1) {
            this.navigationHistory.pop(); // Remover actual
            const previousSection = this.navigationHistory[this.navigationHistory.length - 1];
            this.activateSection(previousSection);
        }
    }

    /**
     * Navega a la siguiente sección en orden
     */
    navigateToNext() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % this.sections.length;
        this.activateSection(this.sections[nextIndex]);
    }

    /**
     * Crea breadcrumbs para navegación contextual
     */
    createBreadcrumbs() {
        // Los breadcrumbs ya están en el HTML, solo configuramos eventos
        const breadcrumbLink = document.querySelector('.breadcrumb-link');
        if (breadcrumbLink) {
            breadcrumbLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateSection('Dashboard');
            });
        }
    }

    /**
     * Actualiza los breadcrumbs según la sección actual
     */
    updateBreadcrumbs(sectionName) {
        const currentCrumb = document.getElementById('current-breadcrumb');
        if (currentCrumb) {
            currentCrumb.textContent = this.getSectionDisplayName(sectionName);
        }
    }

    /**
     * Obtiene el nombre para mostrar de una sección
     */
    getSectionDisplayName(sectionId) {
        const names = {
            'Dashboard': 'Dashboard',
            'Project': 'Proyectos',
            'Gallery': 'Galería',
            'Tasks': 'Tareas',
            'Settings': 'Configuración',
            'Help': 'Ayuda',
            'Privacy': 'Privacidad',
            'Terms': 'Términos',
            'About': 'Acerca de'
        };
        return names[sectionId] || sectionId;
    }

    /**
     * Método para exportar datos (usado en la sección Privacy)
     */
    exportData() {
        this.showToast('Preparando exportación de datos...', 'success');
        // Simular exportación
        setTimeout(() => {
            this.showToast('Datos exportados correctamente', 'success');
        }, 2000);
    }

    /**
     * Configura eventos del dashboard
     */
    setupDashboardEvents() {
        const openEditorBtn = document.getElementById('open-editor');
        const refreshBtn = document.getElementById('refresh-dashboard');
        const filterBtn = document.getElementById('filter-dashboard');

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => {
                this.hideError('editor-error');
                openEditorBtn.textContent = 'Cargando editor...';
                openEditorBtn.disabled = true;

                setTimeout(() => {
                    if (Math.random() > 0.3) {
                        this.showSuccessMessage('editor-success');
                        setTimeout(() => {
                            window.location.href = '../HTML/Dashboard_Editor.html';
                        }, 1000);
                    } else {
                        this.showError('⚠️ No se pudo abrir el editor, revise la conexión.', 'editor-error');
                    }
                    openEditorBtn.textContent = 'Ir al Dashboard Editor';
                    openEditorBtn.disabled = false;
                }, 1500);
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showToast('Función de filtro próximamente', 'info');
            });
        }
    }

    /**
     * Refresca el dashboard
     */
    refreshDashboard() {
        this.showToast('Actualizando dashboard...', 'info');
        // Simular actualización
        setTimeout(() => {
            this.updateAllLikesCounters();
            this.showToast('Dashboard actualizado', 'success');
        }, 1000);
    }

    /**
     * Configura eventos del sistema de likes
     */
    setupLikesEvents() {
        // Likes para imágenes del dashboard
        document.querySelectorAll('.dashboard-card').forEach((article) => {
            const likeBtn = article.querySelector('.like-btn');
            const itemId = article.getAttribute('data-item-id');

            if (likeBtn && itemId) {
                likeBtn.addEventListener('click', () => {
                    this.toggleLike(itemId);
                });
            }
        });

        // Likes para imágenes de la galería
        document.querySelectorAll('.gallery-item').forEach((figure) => {
            const likeBtn = figure.querySelector('.like-btn');
            const itemId = figure.getAttribute('data-item-id');

            if (likeBtn && itemId) {
                likeBtn.addEventListener('click', () => {
                    this.toggleLike(itemId);
                });
            }
        });

        // Eventos para otros botones interactivos
        this.setupInteractiveButtons();
    }

    /**
     * Configura botones interactivos adicionales
     */
    setupInteractiveButtons() {
        // Botones de comentarios
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Función de comentarios próximamente', 'info');
            });
        });

        // Botones de descarga
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Descargando imagen...', 'info');
                // Simular descarga
                setTimeout(() => {
                    this.showToast('Imagen descargada correctamente', 'success');
                }, 1500);
            });
        });

        // Botones de compartir
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Función de compartir próximamente', 'info');
            });
        });
    }

    /**
     * Alterna el estado de like de un elemento
     */
    toggleLike(itemId) {
        // Inicializar si no existe
        if (!this.likesData[itemId]) {
            this.likesData[itemId] = {
                likes: parseInt(document.querySelector(`[data-item-id="${itemId}"] .like-count`)?.textContent || 0),
                liked: false
            };
        }

        // Alternar estado
        this.likesData[itemId].liked = !this.likesData[itemId].liked;
        this.likesData[itemId].likes += this.likesData[itemId].liked ? 1 : -1;

        // Actualizar UI
        this.updateLikeCounter(itemId);

        // Guardar cambios
        this.saveLikesData();

        // Mostrar feedback
        const action = this.likesData[itemId].liked ? 'liked' : 'unliked';
        this.showToast(`Has ${action === 'liked' ? 'dado like' : 'quitado el like'}`, 'success');
    }

    /**
     * Actualiza el contador de likes para un elemento específico
     */
    updateLikeCounter(itemId) {
        const likeData = this.likesData[itemId];
        if (!likeData) return;

        // Buscar y actualizar todos los contadores para este elemento
        document.querySelectorAll(`[data-item-id="${itemId}"] .like-count`).forEach(counter => {
            counter.textContent = likeData.likes;
            // Actualizar texto si es necesario
            if (counter.classList.contains('like-count')) {
                counter.textContent = likeData.likes;
            } else {
                counter.textContent = `${likeData.likes} likes`;
            }
        });

        // Actualizar estado del botón
        document.querySelectorAll(`[data-item-id="${itemId}"] .like-btn`).forEach(btn => {
            btn.classList.toggle('liked', likeData.liked);
            btn.innerHTML = likeData.liked ? '❤️' : '🤍';

            // Añadir animación
            btn.style.animation = 'none';
            setTimeout(() => {
                btn.style.animation = 'likePulse 0.6s ease';
            }, 10);
        });
    }

    /**
     * Actualiza todos los contadores de likes en la página
     */
    updateAllLikesCounters() {
        Object.keys(this.likesData).forEach(itemId => {
            this.updateLikeCounter(itemId);
        });
    }

    /**
     * Carga los datos de likes desde localStorage
     */
    loadLikesData() {
        try {
            return JSON.parse(localStorage.getItem('dashboardLikes')) || {};
        } catch (error) {
            console.error('Error loading likes data:', error);
            return {};
        }
    }

    /**
     * Guarda los datos de likes en localStorage
     */
    saveLikesData() {
        try {
            localStorage.setItem('dashboardLikes', JSON.stringify(this.likesData));
        } catch (error) {
            console.error('Error saving likes data:', error);
        }
    }

    /**
     * Configura eventos de proyectos
     */
    setupProjectsEvents() {
        const projectForm = document.getElementById('add-project-content');
        const clearBtn = document.getElementById('clear-form');
        const previewBtn = document.getElementById('preview-content');
        const newProjectBtn = document.getElementById('new-project');
        const exportProjectsBtn = document.getElementById('export-projects');

        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProjectFormSubmit(e);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearProjectForm();
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewProjectContent();
            });
        }

        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                this.showToast('Creando nuevo proyecto...', 'info');
            });
        }

        if (exportProjectsBtn) {
            exportProjectsBtn.addEventListener('click', () => {
                this.exportProjects();
            });
        }

        // Eventos para tarjetas de proyecto
        this.setupProjectCardsEvents();
    }

    /**
     * Configura eventos para las tarjetas de proyecto
     */
    setupProjectCardsEvents() {
        document.querySelectorAll('.edit-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.target.closest('.project-card');
                this.editProjectCard();
            });
        });

        document.querySelectorAll('.delete-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.project-card');
                this.deleteProjectCard(card);
            });
        });
    }

    /**
     * Edita una tarjeta de proyecto
     */
    editProjectCard() {
        this.showToast('Editando tarjeta de proyecto...', 'info');
    }

    /**
     * Elimina una tarjeta de proyecto
     */
    deleteProjectCard(card) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(100px)';
            setTimeout(() => {
                card.remove();
                this.showToast('Tarjeta eliminada correctamente', 'success');
            }, 300);
        }
    }

    /**
     * Exporta proyectos
     */
    exportProjects() {
        this.showToast('Exportando proyectos...', 'info');
        setTimeout(() => {
            this.showToast('Proyectos exportados correctamente', 'success');
        }, 2000);
    }

    /**
     * Maneja envío de formulario de proyecto
     */
    /**
     * Maneja envío de formulario de proyecto - VERSIÓN MEJORADA
     */
    /**
     * Maneja envío de formulario de proyecto - VERSIÓN MEJORADA
     */
    handleProjectFormSubmit(event) {
        event.preventDefault();

        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (!contentInput || !targetCardSelect) {
            this.showError('Error: No se encontraron los campos del formulario');
            return;
        }

        const content = contentInput.value.trim();
        const targetCard = targetCardSelect.value;

        // Validaciones directas
        if (!content) {
            this.showError('⚠️ El contenido del proyecto no puede estar vacío.');
            return;
        }

        if (!targetCard) {
            this.showError('⚠️ Debe seleccionar una tarjeta destino.');
            return;
        }

        this.hideError();

        const projectData = {
            content: content,
            targetCard: targetCard,
            timestamp: new Date().toISOString()
        };

        console.log('Guardando proyecto:', projectData);

        this.saveProject(projectData)
            .then((savedProject) => {
                this.showSuccessMessage('form-success');
                this.clearProjectForm();
                this.showToast('Contenido agregado al proyecto correctamente', 'success');
                console.log('Proyecto guardado exitosamente:', savedProject);
            })
            .catch(error => {
                console.error('Error al guardar el proyecto:', error);
                this.showError(error.message || 'Error al guardar el proyecto. Intenta nuevamente.');
            });
    }

    /**
     * Muestra vista previa del contenido del proyecto
     */
    previewProjectContent() {
        const contentInput = document.getElementById('project-content-text');
        if (!contentInput) return;

        const content = contentInput.value.trim();
        if (!content) {
            this.showError('⚠️ No hay contenido para previsualizar.');
            return;
        }

        this.hideError();
        alert(`🔍 Vista previa:\n${content}`);
    }

    /**
     * Limpia el formulario de proyecto
     */
    clearProjectForm() {
        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (contentInput) contentInput.value = '';
        if (targetCardSelect) targetCardSelect.selectedIndex = 0;

        this.hideError();
        this.hideSuccessMessage('form-success');
    }

    /**
     * Configura eventos de tareas
     */
    setupTasksEvents() {
        // Checkboxes de tareas
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.toggle('task-completed', checkbox.checked);
                    this.updateTaskStatistics();
                }
            });
        });

        // Botones de acciones de tareas
        const removeCompletedBtn = document.getElementById('remove-completed-tasks');
        const markAllBtn = document.getElementById('mark-all-tasks');
        const filterTasksBtn = document.getElementById('filter-tasks');
        const exportTasksBtn = document.getElementById('export-tasks');

        if (removeCompletedBtn) {
            removeCompletedBtn.addEventListener('click', () => {
                this.removeCompletedTasks();
            });
        }

        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                this.markAllTasksComplete();
            });
        }

        if (filterTasksBtn) {
            filterTasksBtn.addEventListener('click', () => {
                this.showToast('Filtrando tareas...', 'info');
            });
        }

        if (exportTasksBtn) {
            exportTasksBtn.addEventListener('click', () => {
                this.exportTasks();
            });
        }

        // Eventos para acciones individuales de tareas
        this.setupTaskActionsEvents();
    }

    /**
     * Configura eventos para acciones individuales de tareas
     */
    setupTaskActionsEvents() {
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = e.target.closest('tr');
                this.editTaskInline(row);
            });
        });

        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = e.target.closest('tr');
                this.deleteTask(row);
            });
        });
    }

    /**
     * Elimina una tarea
     */
    deleteTask(row) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            row.style.opacity = '0';
            row.style.transform = 'translateX(100px)';
            setTimeout(() => {
                row.remove();
                this.updateTaskStatistics();
                this.showToast('Tarea eliminada correctamente', 'success');
            }, 300);
        }
    }

    /**
     * Marca todas las tareas como completadas
     */
    markAllTasksComplete() {
        const checkboxes = document.querySelectorAll('.task-checkbox:not(:checked)');
        if (checkboxes.length === 0) {
            this.showToast('Todas las tareas ya están completadas', 'info');
            return;
        }

        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const row = checkbox.closest('tr');
            if (row) row.classList.add('task-completed');
        });

        this.updateTaskStatistics();
        this.showToast(`Se marcaron ${checkboxes.length} tareas como completadas`, 'success');
    }

    /**
     * Exporta tareas
     */
    exportTasks() {
        this.showToast('Exportando tareas...', 'info');
        setTimeout(() => {
            this.showToast('Tareas exportadas correctamente', 'success');
        }, 2000);
    }

    /**
     * Configura eventos de configuración
     */
    setupSettingsEvents() {
        document.querySelectorAll('.settings-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.hideError();
                this.handleSettingsSubmit(form);
            });
        });

        // Validación de contraseñas
        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (passwordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('input', () => {
                this.validatePasswords();
            });
        }
    }

    /**
     * Valida que las contraseñas coincidan
     */
    validatePasswords() {
        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (!passwordField || !confirmPasswordField) return;

        if (passwordField.value !== confirmPasswordField.value) {
            confirmPasswordField.style.borderColor = 'var(#e74c3c)';
            this.showError('⚠️ Las contraseñas no coinciden', 'settings-error');
        } else {
            confirmPasswordField.style.borderColor = 'var(#2ecc71)';
            this.hideError('settings-error');
        }
    }

    /**
     * Configura eventos de ayuda
     */
    setupHelpEvents() {
        const contactSupportBtn = document.getElementById('contact-support');
        const viewTutorialsBtn = document.getElementById('view-tutorials');

        if (contactSupportBtn) {
            contactSupportBtn.addEventListener('click', () => {
                this.contactSupport();
            });
        }

        if (viewTutorialsBtn) {
            viewTutorialsBtn.addEventListener('click', () => {
                this.viewTutorials();
            });
        }

        // Tracking de secciones de ayuda expandidas
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
     * Contacta con soporte
     */
    contactSupport() {
        this.showToast('Redirigiendo a soporte...', 'info');
        // Simular redirección
        setTimeout(() => {
            window.location.href = 'mailto:soporte@kliv.com';
        }, 1000);
    }

    /**
     * Visualiza tutoriales
     */
    viewTutorials() {
        this.showToast('Cargando tutoriales...', 'info');
        // Aquí iría la lógica para mostrar tutoriales
    }

    /**
     * Configura eventos globales
     */
    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchBox = document.getElementById('searchBox');
                if (searchBox) searchBox.focus();
            }

            if (e.key === 'Escape') {
                const searchBox = document.getElementById('searchBox');
                if (searchBox) searchBox.value = '';
                document.querySelectorAll('.search-highlight').forEach(el => {
                    el.classList.remove('search-highlight');
                });
                this.hideError('search-error');
            }
        });
    }

    /**
     * Activa una sección específica
     */
    activateSection(sectionId) {
        // Validar que la sección existe
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.error(`❌ No se puede encontrar la sección: ${sectionId}`);
            this.showError(`No se pudo cargar la sección: ${sectionId}`);
            return false;
        }

        // Ocultar todas las secciones
        this.hideAllSections();

        // Mostrar sección objetivo
        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');

        // Animación de entrada
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
            targetSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        });

        // Actualizar estado
        this.currentSection = sectionId;

        // Actualizar historial (evitar duplicados consecutivos)
        if (this.navigationHistory[this.navigationHistory.length - 1] !== sectionId) {
            this.navigationHistory.push(sectionId);
            // Limitar historial a 10 elementos
            if (this.navigationHistory.length > 10) {
                this.navigationHistory.shift();
            }
        }

        // Actualizar UI
        this.updateSidebarActiveState(sectionId);
        this.updateBreadcrumbs(sectionId);
        this.updateNavigationControls();

        // Scroll al inicio de la sección
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        console.log(`✅ Sección activada: ${sectionId}`);
        return true;
    }

    /**
     * Actualiza el estado activo del sidebar
     */
    updateSidebarActiveState(sectionId) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });

        const menuItemId = `menu-${sectionId.toLowerCase()}`;
        const menuItem = document.getElementById(menuItemId);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }

    /**
     * Actualiza el estado de los controles de navegación
     */
    updateNavigationControls() {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.disabled = this.navigationHistory.length <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    /**
     * Maneja la funcionalidad de búsqueda
     */
    handleSearch() {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;

        const query = searchBox.value.trim().toLowerCase();

        if (!query) {
            this.showError('⚠️ Por favor ingrese un término de búsqueda.', 'search-error');
            // Restaurar vista normal si la búsqueda está vacía
            this.restoreNormalView();
            return;
        }

        if (query.length < 2) {
            this.showError('⚠️ Ingrese al menos 2 caracteres para buscar.', 'search-error');
            return;
        }

        this.hideError('search-error');

        // Remover resaltados previos
        this.removeAllHighlights();

        let found = false;
        let matchCount = 0;

        // Buscar en todas las secciones visibles
        document.querySelectorAll('.main-section').forEach(section => {
            const sectionContent = section.textContent.toLowerCase();
            if (sectionContent.includes(query)) {
                section.style.display = 'block';
                found = true;

                // Resaltar términos encontrados
                const matches = this.highlightText(section, query);
                matchCount += matches;
            } else {
                // Ocultar secciones sin resultados
                if (section.id !== this.currentSection) {
                    section.style.display = 'none';
                }
            }
        });

        if (!found) {
            this.showError('🔍 No se encontraron coincidencias para: "' + query + '"', 'search-error');
            this.restoreNormalView();
        } else {
            this.showToast(`Se encontraron ${matchCount} coincidencia(s) para: "${query}"`, 'success');
        }
    }

    /**
     * Remueve todos los resaltados de búsqueda
     */
    removeAllHighlights() {
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                // Reemplazar el highlight con solo el texto
                const text = document.createTextNode(highlight.textContent);
                parent.replaceChild(text, highlight);
                // Normalizar el nodo padre para unir nodos de texto adyacentes
                parent.normalize();
            }
        });
    }

    /**
     * Restaura la vista normal después de una búsqueda
     */
    restoreNormalView() {
        // Mostrar todas las secciones principales
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'block';
        });

        // Asegurar que la sección actual esté visible
        const currentSection = document.getElementById(this.currentSection);
        if (currentSection) {
            currentSection.style.display = 'block';
        }
    }

    /**
     * Resalta texto en un elemento
     */
    highlightText(element, query) {
        // Validar parámetros
        if (!element || !query) {
            console.warn('highlightText: Parámetros inválidos', { element, query });
            return;
        }

        try {
            // Crear TreeWalker con la sintaxis correcta (máximo 3 parámetros)
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Aceptar todos los nodos de texto que contengan la query
                        return node.textContent.toLowerCase().includes(query) ?
                            NodeFilter.FILTER_ACCEPT :
                            NodeFilter.FILTER_REJECT;
                    }
                }
            );

            let node;
            const nodes = [];

            // Recopilar nodos que coincidan con la búsqueda
            while ((node = walker.nextNode())) {
                if (node.textContent.toLowerCase().includes(query)) {
                    nodes.push(node);
                }
            }

            // Resaltar cada nodo encontrado
            nodes.forEach(node => {
                this.highlightNode(node, query);
            });

        } catch (error) {
            console.error('Error en highlightText:', error);
            // Fallback: resaltado simple si TreeWalker falla
            this.simpleTextHighlight(element, query);
        }
    }

    /**
     * Resalta un nodo de texto específico
     */
    highlightNode(textNode, query) {
        const parent = textNode.parentNode;
        if (!parent || parent.classList.contains('search-highlight')) {
            return; // Evitar múltiples resaltados
        }

        const text = textNode.textContent;
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const queryIndex = lowerText.indexOf(lowerQuery);

        if (queryIndex === -1) return;

        // Crear elementos para el texto antes, el resaltado y el texto después
        const beforeText = text.substring(0, queryIndex);
        const highlightedText = text.substring(queryIndex, queryIndex + query.length);
        const afterText = text.substring(queryIndex + query.length);

        // Crear span para el texto resaltado
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'search-highlight';
        highlightSpan.style.cssText = `
        background-color: yellow;
        color: black;
        padding: 2px 1px;
        border-radius: 3px;
        font-weight: bold;
    `;
        highlightSpan.textContent = highlightedText;

        // Reemplazar el nodo de texto original con los nuevos elementos
        const fragment = document.createDocumentFragment();

        if (beforeText) {
            fragment.appendChild(document.createTextNode(beforeText));
        }

        fragment.appendChild(highlightSpan);

        if (afterText) {
            fragment.appendChild(document.createTextNode(afterText));
        }

        parent.replaceChild(fragment, textNode);
    }

    /**
     * Método alternativo simple para resaltar texto (fallback)
     */
    simpleTextHighlight(element, query) {
        const html = element.innerHTML;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        element.innerHTML = html.replace(regex, '<span class="search-highlight" style="background-color: yellow; color: black; padding: 2px 1px; border-radius: 3px; font-weight: bold;">$1</span>');
    }

    /**
     * Escapa caracteres especiales para regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    /**
     * Alterna menú de usuario
     */
    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            const isVisible = userMenu.style.display === 'block';
            userMenu.style.display = isVisible ? 'none' : 'block';

            // Animación
            if (!isVisible) {
                userMenu.style.opacity = '0';
                userMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    userMenu.style.transition = 'all 0.3s ease';
                    userMenu.style.opacity = '1';
                    userMenu.style.transform = 'translateY(0)';
                }, 10);
            }
        }
    }

    /**
     * Maneja envío de formularios de configuración - VERSIÓN CORREGIDA
     */
    handleSettingsSubmit(form) {
        console.log('Settings form submitted:', form.id);

        this.saveSettings()
            .then(() => {
                this.showSuccessMessage('settings-success');
                this.showToast('Configuración guardada correctamente', 'success');
            })
            .catch((error) => {
                console.error('Error en configuración:', error);
                this.showError(error.message || 'Error al guardar la configuración');
            });
    }

    /**
     * Muestra notificación toast
     */
    showToast(message, type = 'success') {
        // Crear contenedor de toasts si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${this.getToastIcon(type)}</span>
                <p>${message}</p>
            </div>
        `;
        toastContainer.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-eliminación
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Obtiene el icono para el toast
     */
    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️',
            'warning': '⚠️'
        };
        return icons[type] || '💡';
    }
    /**
     * Actualiza estadísticas de tareas
     */
    updateTaskStatistics() {
        const totalTasks = document.querySelectorAll('.task-checkbox').length;
        if (totalTasks === 0) return;

        const completedTasks = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);

        // Actualizar contadores
        const totalTasksElement = document.getElementById('total-tasks');
        const completedTasksElement = document.getElementById('completed-tasks');
        const pendingTasksElement = document.getElementById('pending-tasks');

        if (totalTasksElement) this.animateNumber(totalTasksElement, totalTasks);
        if (completedTasksElement) this.animateNumber(completedTasksElement, completedTasks);
        if (pendingTasksElement) this.animateNumber(pendingTasksElement, totalTasks - completedTasks);

        // Actualizar progress bar
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = percentage;
        }

        // Mostrar notificación cuando se completen todas las tareas
        if (percentage === 100 && totalTasks > 0) {
            this.showToast('¡Todas las tareas completadas! 🎉', 'success');
        }
    }

    /**
     * Elimina tareas completadas
     */
    removeCompletedTasks() {
        const completedTasks = document.querySelectorAll('.task-checkbox:checked');
        const removed = completedTasks.length;

        if (removed === 0) {
            this.showToast('No hay tareas completadas para eliminar', 'info');
            return 0;
        }

        completedTasks.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(100px)';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
        });

        this.updateTaskStatistics();

        setTimeout(() => {
            this.showToast(`${removed} tarea(s) eliminada(s) correctamente`, 'success');
        }, 500);

        return removed;
    }

    /**
     * Permite edición inline de tareas
     */
    editTaskInline(row) {
        const taskText = row.querySelector('.task-text');
        if (!taskText) return;

        const currentText = taskText.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-edit-input';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.border = '2px solid var(#5CA7DB)';
        input.style.borderRadius = '4px';

        taskText.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                taskText.textContent = newText;
                this.showToast('Tarea actualizada correctamente', 'success');
            }
            input.replaceWith(taskText);
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    /**
     * Animación numérica suave
     */
    animateNumber(element, targetNumber) {
        if (!element) return;

        const start = parseInt(element.textContent) || 0;
        const duration = 800;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function para animación más suave
            const easeOut = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + (targetNumber - start) * easeOut);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetNumber;
            }
        };

        requestAnimationFrame(updateNumber);
    }

    /**
     * Muestra mensaje de error
     */
    showError(message, targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';

            // Autoocultar después de 5 segundos
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        } else {
            // Fallback: usar toast
            this.showToast(message, 'error');
        }
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccessMessage(targetId) {
        const successElement = document.getElementById(targetId);
        if (successElement) {
            successElement.style.display = 'block';

            // Autoocultar después de 3 segundos
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Oculto mensaje de éxito
     */
    hideSuccessMessage(targetId) {
        const successElement = document.getElementById(targetId);
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    /**
     * Oculto mensaje de error
     */
    hideError(targetId = 'errorMessage') {
        const errorElement = document.getElementById(targetId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Guarda proyecto en localStorage
     */
    saveProject(projectData) {
        return new Promise((resolve, reject) => {
            // Validaciones iniciales
            if (!projectData) {
                reject(new Error('Datos del proyecto no proporcionados.'));
                return;
            }

            if (!projectData.content || !projectData.content.trim()) {
                reject(new Error('El contenido del proyecto no puede estar vacío.'));
                return;
            }

            if (!projectData.targetCard) {
                reject(new Error('Debe seleccionar una tarjeta destino.'));
                return;
            }

            // Solo try-catch para operaciones de localStorage
            try {
                const existingProjects = JSON.parse(localStorage.getItem('Project')) || [];
                const newProject = {
                    id: Date.now(),
                    ...projectData,
                    createdAt: new Date().toISOString(),
                    status: 'active'
                };

                existingProjects.push(newProject);
                localStorage.setItem('Project', JSON.stringify(existingProjects));

                console.log('Proyecto guardado:', newProject);
                resolve(newProject);

            } catch (error) {
                console.error('Error en operación localStorage:', error);
                reject(new Error('No se pudo guardar el proyecto en el almacenamiento local.'));
            }
        });
    }

    /**
     * Método de debug para verificar secciones
     */
    debugSections() {
        console.log('📋 Secciones configuradas:', this.sections);
        let allSectionsExist = true;

        this.sections.forEach(section => {
            const exists = !!document.getElementById(section);
            console.log(`   ${section}: ${exists ? '✅ Existe' : '❌ No existe'}`);
            if (!exists) allSectionsExist = false;
        });

        if (!allSectionsExist) {
            console.warn('⚠️ Algunas secciones no se encontraron en el DOM');
        }

        return allSectionsExist;
    }

    /**
     * Guarda configuración de usuario - USANDO EL PATRÓN
     */
    saveSettings = () => {
        return new Promise((resolve, reject) => {
            // ========== VALIDACIONES ==========
            const userSettings = {
                username: document.getElementById('user-name')?.value.trim() || '',
                email: document.getElementById('user-email')?.value.trim() || '',
                savedAt: new Date().toISOString()
            };

            if (!userSettings.username) {
                reject(new Error('Por favor completa el nombre de usuario.'));
                return;
            }

            if (!userSettings.email) {
                reject(new Error('Por favor completa el correo electrónico.'));
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userSettings.email)) {
                reject(new Error('Por favor ingresa un correo electrónico válido.'));
                return;
            }

            // ========== OPERACIÓN PRINCIPAL ==========
            try {
                // Guardar configuraciones
                localStorage.setItem('userSettings', JSON.stringify(userSettings));

                const appSettings = {
                    theme: document.getElementById('theme')?.value || 'light',
                    language: document.getElementById('lang')?.value || 'es',
                    notifications: document.getElementById('notif')?.checked || false
                };

                localStorage.setItem('appSettings', JSON.stringify(appSettings));

                console.log('Configuraciones guardadas:', { userSettings, appSettings });
                resolve({ userSettings, appSettings });

            } catch (error) {
                console.error('Error en operación localStorage:', error);
                reject(new Error('No se pudieron guardar las configuraciones.'));
            }
        });
    };
}

// Inicialización mejorada
function initializeDashboard() {
    try {
        console.log('🎉 Iniciando Kliv Dashboard...');
        window.dashboardApp = new DashboardApp();

        // Verificación adicional después de la inicialización
        setTimeout(() => {
            if (window.dashboardApp && window.dashboardApp.isInitialized) {
                console.log('✅ Dashboard inicializado correctamente');
            } else {
                console.error('❌ Falló la inicialización del Dashboard');
            }
        }, 1000);

    } catch (error) {
        console.error('💥 Error crítico al inicializar Dashboard:', error);

        // Mostrar error al usuario
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorMessage.innerHTML = `
            <h3>❌ Error al cargar la aplicación</h3>
            <p>No se pudo inicializar el Dashboard. Por favor, recarga la página.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Recargar Página</button>
        `;
        document.body.appendChild(errorMessage);
    }
}

// Múltiples métodos de inicialización para mayor robustez
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Exportar para uso global
window.initializeDashboard = initializeDashboard;
window.DashboardApp = DashboardApp;