/**
 * @file Sistema de Dashboard Kliv - Versión Mejorada y Corregida
 * @description Sistema completo de gestión de dashboard con múltiples secciones interactivas
 * @version 1.0.0
 * @author Florencia Antonella Caminos Garcia
 */

/**
 * @classdesc Clase principal que gestiona todas las operaciones del dashboard Kliv
 * @class DashboardApp
 * @property {string[]} sections - Lista de secciones disponibles en el dashboard
 * @property {string} currentSection - Sección actualmente activa
 * @property {string[]} navigationHistory - Historial de navegación entre secciones
 * @property {Object} likesData - Datos de likes almacenados localmente
 * @property {boolean} isInitialized - Estado de inicialización de la aplicación
 * @property {Object} stickers - Datos de stickers e imágenes del dashboard
 */
class DashboardApp {
    /**
     * @method constructor
     * @description Constructor principal que inicializa propiedades y configura la aplicación
     * @example
     * const dashboard = new DashboardApp();
     */
    constructor() {
        /**
         * @type {string[]}
         * @description Array con todas las secciones disponibles en el dashboard
         */
        this.sections = ['Dashboard', 'Project', 'Gallery', 'Tasks', 'Settings', 'Help', 'Privacy', 'Terms', 'About'];

        /**
         * @type {string}
         * @description Sección actualmente activa en el dashboard
         */
        this.currentSection = 'Dashboard';

        /**
         * @type {string[]}
         * @description Historial de navegación para funcionalidad de retroceso
         */
        this.navigationHistory = ['Dashboard'];

        /**
         * @type {Object}
         * @description Datos de likes cargados desde localStorage
         */
        this.likesData = this.loadLikesData();

        /**
         * @type {boolean}
         * @description Bandera que indica si la aplicación ha sido inicializada
         */
        this.isInitialized = false;

        /**
         * @type {Object}
         * @description Datos de stickers e imágenes del dashboard
         */
        this.stickers = {
            default: [
                { id: 'sticker-1', type: 'emoji', content: '⭐', category: 'decorative' },
                { id: 'sticker-2', type: 'emoji', content: '🎯', category: 'goals' },
                { id: 'sticker-3', type: 'emoji', content: '🚀', category: 'progress' },
                { id: 'sticker-4', type: 'emoji', content: '💡', category: 'ideas' },
                { id: 'sticker-5', type: 'emoji', content: '📌', category: 'markers' }
            ],
            custom: []
        };

        this.init();
    }

    // ==========================
    // MÉTODOS DE INICIALIZACIÓN
    // ==========================

    /**
     * @method init
     * @description Inicialización de la aplicación - configura todos los componentes necesarios
     * @returns {void}
     */
    init = () => {
        if (this.isInitialized) {
            console.warn('Dashboard ya está inicializado');
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeApp);
        } else {
            this.initializeApp();
        }
    }

    /**
     * @method initializeApp
     * @description Configuración inicial de la aplicación, limpia los errores, oculta secciones y activa la sección por defecto
     * @returns {void}
     */
    initializeApp = () => {
        console.log('🚀 Inicializando Kliv Dashboard...');

        this.hideAllErrors();
        this.hideAllSuccessMessages();
        this.hideAllSections();
        this.setupAllEvents();
        this.setupLikesSystem();
        this.setupEnhancedNavigation();
        this.setupStickerSystem();
        this.activateSection('Dashboard');

        this.isInitialized = true;
        console.log("✅ Kliv Dashboard Initialized, nice to see you again!");
        this.debugSections();
    }

    // ==========================
    // MÉTODOS DE CONFIGURACIÓN INICIAL
    // ==========================

    /**
     * @method hideAllErrors
     * @description Oculta todos los mensajes de error en la interfaz
     * @returns {void}
     */
    hideAllErrors = () => {
        document.querySelectorAll('.error-msg').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * @method hideAllSuccessMessages
     * @description Oculta todos los mensajes de éxito en la interfaz
     * @returns {void}
     */
    hideAllSuccessMessages = () => {
        document.querySelectorAll('.success-msg').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * @method hideAllSections
     * @description Oculta todas las secciones principales del dashboard
     * @returns {void}
     */
    hideAllSections = () => {
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });
    }

    /**
     * @method setupAllEvents
     * @description Configuración de todos los eventos - orquesta la inicialización de todos los sistemas de eventos
     * @returns {void}
     */
    setupAllEvents = () => {
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
     * @setupLikesSystem
     * @description Configuración del sistema de likes - inicializa el contador y los eventos de interacción
     * @returns {void}
     */
    setupLikesSystem = () => {
        this.updateAllLikesCounters();
        this.setupLikesEvents();
    }

    /**
     * @method setupEnhancedNavigation
     * @description Configuración de navegación mejorada - añade breadcrumbs y controles de navegación
     * @returns {void}
     */
    setupEnhancedNavigation = () => {
        this.createBreadcrumbs();
        this.setupNavigationControls();
    }

    // ==========================
    // SISTEMA DE STICKERS E IMÁGENES
    // ==========================

    /**
     * @method setupStickerSystem
     * @description Configuración del sistema de stickers e imágenes
     * @returns {void}
     */
    setupStickerSystem = () => {
        this.loadCustomStickers();
        this.setupStickerEvents();
        this.setupDragAndDrop();
    }

    /**
     * @method setupStickerEvents
     * @description Configura eventos del sistema de stickers
     * @returns {void}
     */
    setupStickerEvents = () => {
        const stickerBtn = document.getElementById('sticker-gallery-btn');
        if (stickerBtn) {
            stickerBtn.addEventListener('click', this.openStickerGallery);
        }

        const uploadBtn = document.getElementById('sticker-upload');
        if (uploadBtn) {
            uploadBtn.addEventListener('change', this.handleStickerUpload);
        }
    }

    /**
     * @method setupDragAndDrop
     * @description Configura sistema de arrastrar y soltar para stickers
     * @returns {void}
     */
    setupDragAndDrop = () => {
        this.setupStickerDrag();
        this.setupCanvasDrop();
    }

    /**
     * @method setupStickerDrag
     * @description Configura el comportamiento de arrastre para stickers
     * @returns {void}
     */
    setupStickerDrag = () => {
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.sticker-item')) {
                const stickerId = e.target.closest('.sticker-item').dataset.stickerId;
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sticker',
                    id: stickerId
                }));
            }
        });
    }

    /**
     * @method setupCanvasDrop
     * @description Configura el área de drop para el canvas
     * @returns {void}
     */
    setupCanvasDrop = () => {
        const canvas = document.getElementById('dashboardCanvas');
        if (canvas) {
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvas.classList.add('drag-over');
            });

            canvas.addEventListener('drop', this.handleCanvasDrop);
        }
    }

    /**
     * @method handleCanvasDrop
     * @description Maneja el evento de soltar elementos en el canvas
     * @param {DragEvent} e - Evento de drag and drop
     * @returns {void}
     */
    handleCanvasDrop = (e) => {
        e.preventDefault();
        const canvas = e.currentTarget;
        canvas.classList.remove('drag-over');

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.type === 'sticker') {
                this.placeStickerOnCanvas(data.id, e.offsetX, e.offsetY);
            }
        } catch (error) {
            console.error('Error processing drop:', error);
        }
    }

    /**
     * @OpenStickerGallery
     * @description Abre la galería de stickers modal
     * @returns {void}
     */
    openStickerGallery = () => {
        const galleryHTML = `
            <div class="sticker-modal">
                <div class="sticker-header">
                    <h3>🎨 Galería de Stickers</h3>
                    <button class="close-btn" onclick="this.closest('.sticker-modal').remove()">×</button>
                </div>
                <div class="sticker-categories">
                    <button class="category-btn active" data-category="all">Todos</button>
                    <button class="category-btn" data-category="emojis">Emojis</button>
                    <button class="category-btn" data-category="shapes">Formas</button>
                    <button class="category-btn" data-category="custom">Personalizados</button>
                </div>
                <div class="sticker-grid">
                    ${this.generateStickerGrid()}
                </div>
                <div class="sticker-upload">
                <label for="sticker-upload-input" class="sticker-upload-label">📤 Subir Sticker</label>
                <input type="file" id="sticker-upload-input" accept="image/*">
                    
                <button onclick="document.getElementById('sticker-upload-input').click()">
                    📤 Subir Sticker
                </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', galleryHTML);
        this.setupStickerSelection();
    }

    /**
     * @method generateStickerGrid
     * @description Genera la cuadrícula de stickers para la galería
     * @returns {string} HTML de la cuadrícula de stickers
     */
    generateStickerGrid = () => {
        const allStickers = [...this.stickers.default, ...this.stickers.custom];
        return allStickers.map(sticker => `
            <div class="sticker-item" draggable="true" data-sticker-id="${sticker.id}" data-type="${sticker.type}">
                ${sticker.type === 'emoji' ?
                `<div class="sticker-emoji">${sticker.content}</div>` :
                `<img src="${sticker.content}" alt="Sticker" class="sticker-image">`
            }
            </div>
        `).join('');
    }

    /**
     * @method setupStickerSelection
     * @description Configura la selección de stickers en la galería
     * @returns {void}
     */
    setupStickerSelection = () => {
        document.querySelectorAll('.sticker-item').forEach(item => {
            item.addEventListener('click', () => {
                const stickerId = item.dataset.stickerId;
                this.selectSticker(stickerId);
            });
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterStickersByCategory(e.target.dataset.category);
            });
        });
    }

    /**
     * @method filterStickersByCategory
     * @description Filtra stickers por categoría en la galería
     * @param {string} category - Categoría por la cual filtrar
     * @returns {void}
     */
    filterStickersByCategory = (category) => {
        const allStickers = document.querySelectorAll('.sticker-item');
        allStickers.forEach(sticker => {
            if (category === 'all') {
                sticker.style.display = 'block';
            } else {
                const stickerCategory = this.getStickerCategory(sticker.dataset.stickerId);
                sticker.style.display = stickerCategory === category ? 'block' : 'none';
            }
        });
    }

    /**
     * @method getStickerCategory
     * @description Obtiene la categoría de un sticker específico
     * @param {string} stickerId - ID del sticker
     * @returns {string} Categoría del sticker
     */
    getStickerCategory = (stickerId) => {
        const allStickers = [...this.stickers.default, ...this.stickers.custom];
        const sticker = allStickers.find(s => s.id === stickerId);
        return sticker ? sticker.category : 'unknown';
    }

    /**
     * @method selectSticker
     * @description Selecciona un sticker para usar
     * @param {string} stickerId - ID del sticker seleccionado
     * @returns {void}
     */
    selectSticker = (stickerId) => {
        const sticker = this.getStickerById(stickerId);
        if (sticker) {
            this.showToast(`Sticker ${sticker.type === 'emoji' ? sticker.content : 'seleccionado'} listo para usar`, 'success');
        }
    }

    /**
     * @method placeStickerOnCanvas
     * @description Coloca un sticker en el canvas en posición específica
     * @param {string} stickerId - ID del sticker a colocar
     * @param {number} x - Posición horizontal
     * @param {number} y - Posición vertical
     * @returns {void}
     */
    placeStickerOnCanvas = (stickerId, x, y) => {
        const sticker = this.getStickerById(stickerId);
        if (!sticker) return;

        const stickerElement = document.createElement('div');
        stickerElement.className = 'canvas-sticker';
        stickerElement.dataset.stickerId = stickerId;
        stickerElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            cursor: move;
            user-select: none;
            font-size: ${sticker.type === 'emoji' ? '2rem' : 'auto'};
            z-index: 1000;
        `;

        if (sticker.type === 'emoji') {
            stickerElement.innerHTML = sticker.content;
        } else {
            stickerElement.innerHTML = `<img src="${sticker.content}" alt="Sticker">`;
        }

        this.makeDraggable(stickerElement);
        document.getElementById('dashboardCanvas').appendChild(stickerElement);
        this.showToast('Sticker agregado al canvas', 'success');
    }

    /**
     * @method makeDraggable
     * @description Hace un elemento arrastrable en el canvas
     * @param {HTMLElement} element - Elemento a hacer arrastrable
     * @returns {void}
     */
    makeDraggable = (element) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        const dragMouseDown = (e) => {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        const elementDrag = (e) => {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        };

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        element.onmousedown = dragMouseDown;
    }

    /**
     * @method handleStickerUpload
     * @description Maneja la subida de nuevos stickers personalizados
     * @param {Event} event - Evento de cambio de input file
     * @returns {void}
     */
    handleStickerUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showError('Por favor sube solo archivos de imagen');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showError('La imagen debe ser menor a 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newSticker = {
                id: `custom-${Date.now()}`,
                src: e.target.result,
                category: 'custom',
                type: 'image',
                name: file.name
            };

            this.saveCustomSticker(newSticker);
            this.showToast('Sticker personalizado agregado', 'success');
        };

        reader.readAsDataURL(file);
    }

    /**
     * @method saveCustomSticker
     * @description Guarda un sticker personalizado en localStorage
     * @param {Object} sticker - Datos del sticker a guardar
     * @returns {void}
     */
    saveCustomSticker = (sticker) => {
        const customStickers = JSON.parse(localStorage.getItem('customStickers') || '[]');
        customStickers.push(sticker);
        localStorage.setItem('customStickers', JSON.stringify(customStickers));
        this.stickers.custom.push(sticker);
    }

    /**
     * @method load CustomStickers
     * @description Carga stickers personalizados desde localStorage
     * @returns {void}
     */
    loadCustomStickers = () => {
        try {
            this.stickers.custom = JSON.parse(localStorage.getItem('customStickers') || '[]');
        } catch (error) {
            console.error('Error loading custom stickers:', error);
            this.stickers.custom = [];
        }
    }

    /**
     * @method getStickerById
     * @description Obtiene un sticker por su ID
     * @param {string} stickerId - ID del sticker a buscar
     * @returns {Object|null} Datos del sticker o null si no se encuentra
     */
    getStickerById = (stickerId) => {
        const allStickers = [...this.stickers.default, ...this.stickers.custom];
        return allStickers.find(sticker => sticker.id === stickerId) || null;
    }
    // ==========================
    // SISTEMA DE NAVEGACIÓN
    // ==========================

    /**
     * @method setupKeyboardNavigation
     * @description Configura eventos de teclado para navegación con flechas izquierda/derecha
     * @returns {void}
     */
    setupKeyboardNavigation = () => {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
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
     * @method setupHeaderEvents
     * @description Configura eventos del header - búsqueda y menú de usuario
     * @returns {void}
     */
    setupHeaderEvents = () => {
        const searchButton = document.getElementById('searchButton');
        const searchBox = document.getElementById('searchBox');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');

        if (searchButton && searchBox) {
            searchButton.addEventListener('click', this.handleSearch);
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
            searchBox.addEventListener('input', (e) => {
                if (e.target.value.length > 2) this.handleSearch();
            });
        }

        if (userAvatar && userName) {
            userAvatar.addEventListener('click', this.toggleUserMenu);
            userName.addEventListener('click', this.toggleUserMenu);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }

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
     * @method handleLogout
     * @description Maneja el proceso de cierre de sesión del usuario
     * @param {Event} e - Evento de clic
     * @returns {void}
     */
    handleLogout = (e) => {
        e.preventDefault();
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.showToast('Cerrando sesión...', 'success');
            setTimeout(() => {
                window.location.href = '../HTML/Login.html';
            }, 1500);
        }
    }

    /**
     * @method setupSidebarEvents
     * @description Configura eventos del sidebar para navegación entre secciones
     * @returns {void}
     */
    setupSidebarEvents = () => {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const sectionId = item.id.replace('menu-', '');
                if (sectionId) {
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
     * @method setupNavigationControls
     * @description Configura controles de navegación mejorada (anterior/siguiente)
     * @returns {void}
     */
    setupNavigationControls = () => {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', this.navigateToPrevious);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', this.navigateToNext);
        }
    }

    /**
     * @method navigateToPrevious
     * @description Navega a la sección anterior en el historial de navegación
     * @returns {void}
     */
    navigateToPrevious = () => {
        if (this.navigationHistory.length > 1) {
            this.navigationHistory.pop();
            const previousSection = this.navigationHistory[this.navigationHistory.length - 1];
            this.activateSection(previousSection);
        }
    }

    /**
     * @method navigateToNext
     * @description Navega a la siguiente sección en orden predefinido
     * @returns {void}
     */
    navigateToNext = () => {
        const currentIndex = this.sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % this.sections.length;
        this.activateSection(this.sections[nextIndex]);
    }

    /**
     * @method createBreadcrumbs
     * @description Crea breadcrumbs para navegación contextual
     * @returns {void}
     */
    createBreadcrumbs = () => {
        const breadcrumbLink = document.querySelector('.breadcrumb-link');
        if (breadcrumbLink) {
            breadcrumbLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateSection('Dashboard');
            });
        }
    }

    /**
     * @method updateBreadcrumbs
     * @description Actualiza los breadcrumbs según la sección actual
     * @param {string} sectionName - Nombre de la sección actual
     * @returns {void}
     */
    updateBreadcrumbs = (sectionName) => {
        const currentCrumb = document.getElementById('current-breadcrumb');
        if (currentCrumb) {
            currentCrumb.textContent = this.getSectionDisplayName(sectionName);
        }
    }

    /**
     * @method getSectionDisplayName
     * @description Obtiene el nombre para mostrar de una sección
     * @param {string} sectionId - ID de la sección
     * @returns {string} Nombre para mostrar de la sección
     */
    getSectionDisplayName = (sectionId) => {
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

    // ==========================
    // SISTEMA DE BÚSQUEDA
    // ==========================

    /**
     * @method handleSearch
     * @description Maneja la funcionalidad de búsqueda en todo el dashboard
     * @returns {void}
     */
    handleSearch = () => {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;

        const query = searchBox.value.trim().toLowerCase();

        if (!query) {
            this.showError('⚠️ Por favor ingrese un término de búsqueda.', 'search-error');
            this.restoreNormalView();
            return;
        }

        if (query.length < 2) {
            this.showError('⚠️ Ingrese al menos 2 caracteres para buscar.', 'search-error');
            return;
        }

        this.hideError('search-error');
        this.removeAllHighlights();

        let found = false;
        let matchCount = 0;

        document.querySelectorAll('.main-section').forEach(section => {
            const sectionContent = section.textContent.toLowerCase();
            if (sectionContent.includes(query)) {
                section.style.display = 'block';
                found = true;
                const matches = this.highlightText(section, query);
                matchCount += matches;
            } else {
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
     * @method removeAllHighlights
     * @description Remueve todos los resaltados de búsqueda previos
     * @returns {void}
     */
    removeAllHighlights = () => {
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                const text = document.createTextNode(highlight.textContent);
                parent.replaceChild(text, highlight);
                parent.normalize();
            }
        });
    }

    /**
     * @method restoreNormalView
     * @description Restaura la vista normal después de una búsqueda
     * @returns {void}
     */
    restoreNormalView = () => {
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'block';
        });

        const currentSection = document.getElementById(this.currentSection);
        if (currentSection) {
            currentSection.style.display = 'block';
        }
    }

    /**
     * @description Resalta texto en un elemento específico según la consulta de búsqueda
     * @param {HTMLElement} element - Elemento donde buscar y resaltar
     * @param {string} query - Término de búsqueda a resaltar
     * @returns {number} Número de coincidencias encontradas
     */
    highlightText = (element, query) => {
        if (!element || !query) {
            console.warn('highlightText: Parámetros inválidos', { element, query });
            return 0;
        }

        try {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {
                        return node.textContent.toLowerCase().includes(query) ?
                            NodeFilter.FILTER_ACCEPT :
                            NodeFilter.FILTER_REJECT;
                    }
                }
            );

            let node;
            const nodes = [];
            let totalMatches = 0;

            while ((node = walker.nextNode())) {
                if (node.textContent.toLowerCase().includes(query)) {
                    nodes.push(node);
                    totalMatches++;
                }
            }

            nodes.forEach(node => {
                this.highlightNode(node, query);
            });

            return totalMatches;

        } catch (error) {
            console.error('Error en highlightText:', error);
            this.simpleTextHighlight(element, query);
            return 1;
        }
    }

    /**
     * @method highlightNode
     * @description Resalta un nodo de texto específico con la consulta de búsqueda
     * @param {Node} textNode - Nodo de texto a resaltar
     * @param {string} query - Término de búsqueda a resaltar
     * @returns {void}
     */
    highlightNode = (textNode, query) => {
        const parent = textNode.parentNode;
        if (!parent || parent.classList.contains('search-highlight')) {
            return;
        }

        const text = textNode.textContent;
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const queryIndex = lowerText.indexOf(lowerQuery);

        if (queryIndex === -1) return;

        const beforeText = text.substring(0, queryIndex);
        const highlightedText = text.substring(queryIndex, queryIndex + query.length);
        const afterText = text.substring(queryIndex + query.length);

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
     * @method simpleTextHighLight
     * @description Método alternativo simple para resaltar texto (fallback)
     * @param {HTMLElement} element - Elemento donde buscar
     * @param {string} query - Término de búsqueda
     * @returns {void}
     */
    simpleTextHighlight = (element, query) => {
        const html = element.innerHTML;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        element.innerHTML = html.replace(regex, '<span class="search-highlight">$1</span>');
    }

    /**
     * @method escapeRegex
     * @description Escapa caracteres especiales para usar en expresiones regulares
     * @param {string} string - Cadena a escapar
     * @returns {string} Cadena escapada
     */
    escapeRegex = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==========================
    // SISTEMA DE LIKES
    // ==========================

    /**
     * @method setupLikesEvents
     * @description Configura eventos del sistema de likes para imágenes y contenido
     * @returns {void}
     */
    setupLikesEvents = () => {
        document.querySelectorAll('.dashboard-card').forEach((article) => {
            const likeBtn = article.querySelector('.like-btn');
            const itemId = article.getAttribute('data-item-id');

            if (likeBtn && itemId) {
                likeBtn.addEventListener('click', () => {
                    this.toggleLike(itemId);
                });
            }
        });

        document.querySelectorAll('.gallery-item').forEach((figure) => {
            const likeBtn = figure.querySelector('.like-btn');
            const itemId = figure.getAttribute('data-item-id');

            if (likeBtn && itemId) {
                likeBtn.addEventListener('click', () => {
                    this.toggleLike(itemId);
                });
            }
        });

        this.setupInteractiveButtons();
    }

    /**
     * @method setupInteractiveButtons
     * @description Configura botones interactivos adicionales (comentarios, descarga, compartir)
     * @returns {void}
     */
    setupInteractiveButtons = () => {
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Función de comentarios próximamente', 'info');
            });
        });

        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Descargando imagen...', 'info');
                setTimeout(() => {
                    this.showToast('Imagen descargada correctamente', 'success');
                }, 1500);
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showToast('Función de compartir próximamente', 'info');
            });
        });
    }

    /**
     * @method toggleLike
     * @description Alterna el estado de like de un elemento específico
     * @param {string} itemId - ID único del elemento a likear
     * @returns {void}
     */
    toggleLike = (itemId) => {
        if (!this.likesData[itemId]) {
            this.likesData[itemId] = {
                likes: parseInt(document.querySelector(`[data-item-id="${itemId}"] .like-count`)?.textContent || 0),
                liked: false
            };
        }

        this.likesData[itemId].liked = !this.likesData[itemId].liked;
        this.likesData[itemId].likes += this.likesData[itemId].liked ? 1 : -1;

        this.updateLikeCounter(itemId);
        this.saveLikesData();

        const action = this.likesData[itemId].liked ? 'liked' : 'unliked';
        this.showToast(`Has ${action === 'liked' ? 'dado like' : 'quitado el like'}`, 'success');
    }

    /**
     * @method updateLikeCounter
     * @description Actualiza el contador de likes para un elemento específico
     * @param {string} itemId - ID único del elemento
     * @returns {void}
     */
    updateLikeCounter = (itemId) => {
        const likeData = this.likesData[itemId];
        if (!likeData) return;

        document.querySelectorAll(`[data-item-id="${itemId}"] .like-count`).forEach(counter => {
            counter.textContent = likeData.likes;
            if (counter.classList.contains('like-count')) {
                counter.textContent = likeData.likes;
            } else {
                counter.textContent = `${likeData.likes} likes`;
            }
        });

        document.querySelectorAll(`[data-item-id="${itemId}"] .like-btn`).forEach(btn => {
            btn.classList.toggle('liked', likeData.liked);
            btn.innerHTML = likeData.liked ? '❤️' : '🤍';
            btn.style.animation = 'none';
            setTimeout(() => {
                btn.style.animation = 'likePulse 0.6s ease';
            }, 10);
        });
    }

    /**
     * @method updateAllLikesCounters
     * @description Actualiza todos los contadores de likes en la página
     * @returns {void}
     */
    updateAllLikesCounters = () => {
        Object.keys(this.likesData).forEach(itemId => {
            this.updateLikeCounter(itemId);
        });
    }

    /**
     * @method loadLikesData
     * @description Carga los datos de likes desde localStorage
     * @returns {Object} Datos de likes cargados
     */
    loadLikesData = () => {
        try {
            return JSON.parse(localStorage.getItem('dashboardLikes')) || {};
        } catch (error) {
            console.error('Error loading likes data:', error);
            return {};
        }
    }

    /**
     * @method saveLikesData
     * @description Guarda los datos de likes en localStorage
     * @returns {void}
     */
    saveLikesData = () => {
        try {
            localStorage.setItem('dashboardLikes', JSON.stringify(this.likesData));
        } catch (error) {
            console.error('Error saving likes data:', error);
        }
    }

    // ==========================
    // MÉTODOS DE UTILIDAD Y NAVEGACIÓN
    // ==========================

    /**
     * @method showToast
     * @description Muestra una notificación toast al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de toast ('success', 'error', 'info', 'warning')
     * @returns {void}
     */
    showToast = (message, type = 'success') => {
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

        setTimeout(() => toast.classList.add('show'), 10);

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
     * @method getToastIcon
     * @description Obtiene el icono apropiado para el tipo de toast
     * @param {string} type - Tipo de toast
     * @returns {string} Emoji del icono correspondiente
     */
    getToastIcon = (type) => {
        const icons = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️',
            'warning': '⚠️'
        };
        return icons[type] || '💡';
    }

    /**
     * @method debugSections
     * @description Método de debug para verificar la existencia de todas las secciones
     * @returns {boolean} True si todas las secciones existen, false en caso contrario
     */
    debugSections = () => {
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
     * @method toggleUserMenu
     * @description Alterna la visibilidad del menú de usuario
     * @returns {void}
     */
    toggleUserMenu = () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            const isVisible = userMenu.style.display === 'block';
            userMenu.style.display = isVisible ? 'none' : 'block';

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
     * @method updateSidebarActiveState
     * @description Actualiza el estado activo del sidebar según la sección actual
     * @param {string} sectionId - ID de la sección activa
     * @returns {void}
     */
    updateSidebarActiveState = (sectionId) => {
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
     * @method updateNavigationControls
     * @description Actualiza el estado de los controles de navegación (anterior/siguiente)
     * @returns {void}
     */
    updateNavigationControls = () => {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.disabled = this.navigationHistory.length <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    // ==========================
    // MÉTODOS DE LAS SECCIONES ESPECÍFICAS
    // ==========================

    /**
     * @method setupDashboardEvents
     * @description Configura eventos específicos de la sección Dashboard
     * @returns {void}
     */
    setupDashboardEvents = () => {
        const openEditorBtn = document.getElementById('open-editor');
        const refreshBtn = document.getElementById('refresh-dashboard');
        const filterBtn = document.getElementById('filter-dashboard');

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', this.handleEditorOpen);
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshDashboard);
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showToast('Función de filtro próximamente', 'info');
            });
        }
    }

    /**
     * @method handleEditorOpen
     * @description Maneja la apertura del editor de dashboard
     * @returns {void}
     */
    handleEditorOpen = () => {
        const openEditorBtn = document.getElementById('open-editor');
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
    }

    /**
     * @method refreshDashboard
     * @description Refresca el dashboard actualizando contadores y datos
     * @returns {void}
     */
    refreshDashboard = () => {
        this.showToast('Actualizando dashboard...', 'info');
        setTimeout(() => {
            this.updateAllLikesCounters();
            this.showToast('Dashboard actualizado', 'success');
        }, 1000);
    }

    // ==========================
    // MÉTODOS DE GESTIÓN DE SECCIONES
    // ==========================

    /**
     * @method activateSection
     * @description Activa una sección específica del dashboard
     * @param {string} sectionId - ID de la sección a activar
     * @returns {boolean} True si la activación fue exitosa, false en caso contrario
     */
    activateSection = (sectionId) => {
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.error(`❌ No se puede encontrar la sección: ${sectionId}`);
            this.showError(`No se pudo cargar la sección: ${sectionId}`);
            return false;
        }

        this.hideAllSections();

        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');

        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
            targetSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        });

        this.currentSection = sectionId;

        if (this.navigationHistory[this.navigationHistory.length - 1] !== sectionId) {
            this.navigationHistory.push(sectionId);
            if (this.navigationHistory.length > 10) {
                this.navigationHistory.shift();
            }
        }

        this.updateSidebarActiveState(sectionId);
        this.updateBreadcrumbs(sectionId);
        this.updateNavigationControls();

        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        console.log(`✅ Sección activada: ${sectionId}`);
        return true;
    }

    // ==========================
    // MÉTODOS DE MANEJO DE ERRORES Y MENSAJES
    // ==========================

    /**
     * @method showError
     * @description Muestra un mensaje de error al usuario
     * @param {string} message - Mensaje de error a mostrar
     * @param {string} targetId - ID del contenedor de error (opcional)
     * @returns {void}
     */
    showError = (message, targetId = 'errorMessage') => {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        } else {
            this.showToast(message, 'error');
        }
    }

    /**
     * @method showSuccessMessage
     * @description Muestra un mensaje de éxito al usuario
     * @param {string} targetId - ID del elemento de éxito
     * @returns {void}
     */
    showSuccessMessage = (targetId) => {
        const successElement = document.getElementById(targetId);
        if (successElement) {
            successElement.style.display = 'block';
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * @method hideError
     * @description Oculta un mensaje de error específico
     * @param {string} targetId - ID del elemento de error
     * @returns {void}
     */
    hideError = (targetId = 'errorMessage') => {
        const errorElement = document.getElementById(targetId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * @method setupProjectsEvents
     * @description Configura eventos de la sección de Proyectos
     * @returns {void}
     */
    setupProjectsEvents = () => {
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

        this.setupProjectCardsEvents();
    }

    /**
     * @method setupProjectCardsEvents
     * @description Configura eventos para las tarjetas de proyecto individuales
     * @returns {void}
     */
    setupProjectCardsEvents = () => {
        document.querySelectorAll('.edit-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.project-card');
                this.editProjectCard(card);
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
     * @method handleProjectFormSubmit
     * @description Maneja el envío del formulario para agregar contenido a un proyecto.
     * @param {SubmitEvent} event - Evento de envío del formulario
     * @returns {Promise<void>}
     */
    handleProjectFormSubmit = async(event) => {
        event.preventDefault();

        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (!contentInput || !targetCardSelect) {
            this.showError('Error: No se encontraron los campos del formulario');
            return;
        }

        const content = contentInput.value.trim();
        const targetCard = targetCardSelect.value;

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

        try {
            const savedProject = await this.saveProject(projectData);

            this.showSuccessMessage('form-success');
            this.clearProjectForm();
            this.showToast('Contenido agregado al proyecto correctamente', 'success');
            console.log('Proyecto guardado exitosamente:', savedProject);

        } catch (error) {
            console.error('Error al guardar el proyecto:', error);
            this.showError(error.message || 'Error al guardar el proyecto. Intenta nuevamente.');
        }
    }

    /**
     * @method previewProjectContent
     * @description Muestra vista previa del contenido del proyecto
     * @returns {void}
     */
    previewProjectContent = () => {
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
     * @method clearProjectForm
     * @description Limpia el formulario de proyecto y restablece el estado
     * @returns {void}
     */
    clearProjectForm = () => {
        const contentInput = document.getElementById('project-content-text');
        const targetCardSelect = document.getElementById('target-card');

        if (contentInput) contentInput.value = '';
        if (targetCardSelect) targetCardSelect.selectedIndex = 0;

        this.hideError();
        this.hideSuccessMessage('form-success');
    }

    /**
     * @method editProjectCard
     * @returns {void}
     */
    editProjectCard = () => {
        this.showToast('Editando tarjeta de proyecto...', 'info');
        // Aquí iría la lógica específica de edición
    }

    /**
     * @method deleteProjectCard
     * @description Elimina una tarjeta de proyecto con animación
     * @param {HTMLElement} card - Elemento de la tarjeta a eliminar
     * @returns {void}
     */
    deleteProjectCard = (card) => {
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
     * @method exportProjects
     * @description Exporta los proyectos actuales
     * @returns {void}
     */
    exportProjects = () => {
        this.showToast('Exportando proyectos...', 'info');
        setTimeout(() => {
            this.showToast('Proyectos exportados correctamente', 'success');
        }, 2000);
    }

    // ==========================
    // SISTEMA DE TAREAS
    // ==========================

    /**
     * @method setupTaskEvents
     * @description Configura eventos de la sección de Tareas
     * @returns {void}
     */
    setupTasksEvents = () => {
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

        this.setupTaskActionsEvents();
    }

    /**
     * @method setupTaskActionsEvents
     * @description Configura eventos para acciones individuales de tareas
     * @returns {void}
     */
    setupTaskActionsEvents = () => {
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
     * @method deleteTask
     * @description Elimina una tarea específica con animación
     * @param {HTMLElement} row - Fila de la tabla que contiene la tarea
     * @returns {void}
     */
    deleteTask = (row) => {
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
     * @method markAllTasksComplete
     * @description Marca todas las tareas como completadas
     * @returns {void}
     */
    markAllTasksComplete = () => {
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
     * @method removeCompletesTasks
     * @description Elimina todas las tareas marcadas como completadas
     * @returns {number} Número de tareas eliminadas
     */
    removeCompletedTasks = () => {
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
     * @method exportTasks
     * @description Exporta las tareas actuales
     * @returns {void}
     */
    exportTasks = () => {
        this.showToast('Exportando tareas...', 'info');
        setTimeout(() => {
            this.showToast('Tareas exportadas correctamente', 'success');
        }, 2000);
    }

    /**
     * @method editTaskInline
     * @description Permite edición inline de tareas en la tabla
     * @param {HTMLElement} row - Fila de la tabla que contiene la tarea
     * @returns {void}
     */
    editTaskInline = (row) => {
        const taskText = row.querySelector('.task-text');
        if (!taskText) return;

        const currentText = taskText.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-edit-input';
        input.style.cssText = `
        width: 100%;
        padding: 8px;
        border: 2px solid var(--primary-color);
        border-radius: 4px;
        font-family: inherit;
    `;

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
     * @method updateTaskStatics
     * @description Actualiza las estadísticas de tareas (completadas, pendientes, porcentaje)
     * @returns {void}
     */
    updateTaskStatistics = () => {
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
     * @method animateNumber
     * @description Animación numérica suave para contadores
     * @param {HTMLElement} element - Elemento que contiene el número
     * @param {number} targetNumber - Valor objetivo del contador
     * @returns {void}
     */
    animateNumber = (element, targetNumber) => {
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

    // ==========================
    // SISTEMA DE CONFIGURACIÓN
    // ==========================

    /**
     * @method setupSettingsEvents
     * @description Configura eventos de la sección de Configuración
     * @returns {void}
     */
    setupSettingsEvents = () => {
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

        // Configuración de tema
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        // Configuración de idioma
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Configuración de notificaciones
        const notificationToggle = document.getElementById('notifications-toggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }
    }

    /**
     * @method handleSettingsSubmit
     * @description Maneja el envío de formularios de configuración
     * @param {event} event - Evento de envío del formulario (sumbit event)
     * @returns {void}
     */
    handleSettingsSubmit = (event) => {
        event.preventDefault();

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
     * @method validatePasswords
     * @description Valida que las contraseñas coincidan en el formulario
     * @returns {void}
     */
    validatePasswords = () => {
        const passwordField = document.getElementById('user-password');
        const confirmPasswordField = document.getElementById('confirm-password');

        if (!passwordField || !confirmPasswordField) return;

        if (passwordField.value !== confirmPasswordField.value) {
            confirmPasswordField.style.borderColor = '#e74c3c';
            this.showError('⚠️ Las contraseñas no coinciden', 'settings-error');
        } else {
            confirmPasswordField.style.borderColor = '#2ecc71';
            this.hideError('settings-error');
        }
    }

    /**
     * @method changeTheme
     * @description Cambia el tema de la aplicación
     * @param {string} theme - Nombre del tema a aplicar
     * @returns {void}
     */
    changeTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboard-theme', theme);
        this.showToast(`Tema ${theme} aplicado correctamente`, 'success');
    }

    /**
     * @method changeLanguage
     * @description Cambia el idioma de la aplicación
     * @param {string} language - Código del idioma a aplicar
     * @returns {void}
     */
    changeLanguage = (language) => {
        // Aquí iría la lógica de internacionalización
        this.showToast(`Idioma cambiado a ${language}`, 'success');
        // En una implementación real, esto cargaría las traducciones correspondientes
    }

    /**
     * @method toggleNotifications
     * @description Alterna las notificaciones del sistema
     * @param {boolean} enabled - Estado de las notificaciones
     * @returns {void}
     */
    toggleNotifications = (enabled) => {
        if (enabled && 'Notification' in window) {
            (async () => {
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        this.showToast('Notificaciones activadas', 'success');
                    }
                }
            })();
        }
        this.showToast(`Notificaciones ${enabled ? 'activadas' : 'desactivadas'}`, 'info');
    }

    // ==========================
    // SISTEMA DE AYUDA
    // ==========================

    /**
     * @method setupHelpEvents
     * @description Configura eventos de la sección de Ayuda
     * @returns {void}
     */
    setupHelpEvents = () => {
        const contactSupportBtn = document.getElementById('contact-support');
        const viewTutorialsBtn = document.getElementById('view-tutorials');
        const reportBugBtn = document.getElementById('report-bug');
        const suggestFeatureBtn = document.getElementById('suggest-feature');

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

        if (reportBugBtn) {
            reportBugBtn.addEventListener('click', () => {
                this.reportBug();
            });
        }

        if (suggestFeatureBtn) {
            suggestFeatureBtn.addEventListener('click', () => {
                this.suggestFeature();
            });
        }

        // Acordeones de preguntas frecuentes
        document.querySelectorAll('#Help details').forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    const summaryText = detail.querySelector('summary').textContent;
                    console.log('❓ Sección de ayuda abierta:', summaryText);
                    // Podrías trackear qué secciones de ayuda son más populares
                }
            });
        });

        // Búsqueda en ayuda
        const helpSearch = document.getElementById('help-search');
        if (helpSearch) {
            helpSearch.addEventListener('input', (e) => {
                this.searchHelpContent(e.target.value);
            });
        }
    }

    /**
     * @method contactSupport
     * @description Inicia el proceso de contacto con soporte técnico
     * @returns {void}
     */
    contactSupport = () => {
        this.showToast('Redirigiendo a soporte...', 'info');
        setTimeout(() => {
            window.location.href = 'mailto:soporte@kliv.com?subject=Soporte Dashboard Kliv';
        }, 1000);
    }

    /**
     * @method viewTutorials
     * @description Inicia la visualización de tutoriales
     * @returns {void}
     */
    viewTutorials = () => {
        this.showToast('Cargando tutoriales...', 'info');
        // Simular carga de tutoriales
        setTimeout(() => {
            const tutorialHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h3>📚 Tutoriales Disponibles</h3>
                    <button class="close-btn" onclick="this.closest('.tutorial-modal').remove()">×</button>
                </div>
                <div class="tutorial-list">
                    <div class="tutorial-item">
                        <h4>🎯 Primeros Pasos</h4>
                        <p>Aprende a navegar por el dashboard</p>
                        <button class="tutorial-btn" onclick="window.dashboardApp.startTutorial('first-steps')">Comenzar</button>
                    </div>
                    <div class="tutorial-item">
                        <h4>📊 Gestión de Proyectos</h4>
                        <p>Cómo crear y organizar tus proyectos</p>
                        <button class="tutorial-btn" onclick="window.dashboardApp.startTutorial('projects')">Comenzar</button>
                    </div>
                    <div class="tutorial-item">
                        <h4>🎨 Personalización</h4>
                        <p>Personaliza tu espacio de trabajo</p>
                        <button class="tutorial-btn" onclick="window.dashboardApp.startTutorial('customization')">Comenzar</button>
                    </div>
                </div>
            </div>
        `;
            document.body.insertAdjacentHTML('beforeend', tutorialHTML);
        }, 1500);
    }

    /**
     * @method startTutorial
     * @description Inicia un tutorial específico
     * @param {string} tutorialId - ID del tutorial a iniciar
     * @returns {void}
     */
    startTutorial = (tutorialId) => {
        this.showToast(`Iniciando tutorial: ${tutorialId}`, 'info');
        // Aquí iría la lógica para iniciar el tutorial específico
    }

    /**
     * @method reportBug
     * @description Abre el formulario para reportar un bug
     * @returns {void}
     */
    reportBug = () => {
        const bugReportHTML = `
        <div class="bug-report-modal">
            <div class="modal-header">
                <h3>🐛 Reportar Problema</h3>
                <button class="close-btn" onclick="this.closest('.bug-report-modal').remove()">×</button>
            </div>
            <form class="bug-report-form">
                <div class="form-group">
                    <label for="bug-title">Título del problema:</label>
                    <input type="text" id="bug-title" required>
                </div>
                <div class="form-group">
                    <label for="bug-description">Descripción detallada:</label>
                    <textarea id="bug-description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="bug-steps">Pasos para reproducir:</label>
                    <textarea id="bug-steps" rows="3" required></textarea>
                </div>
                <button type="submit" class="submit-btn">Enviar Reporte</button>
            </form>
        </div>
    `;
        document.body.insertAdjacentHTML('beforeend', bugReportHTML);

        // Configurar el envío del formulario
        const form = document.querySelector('.bug-report-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitBugReport();
            });
        }
    }

    /**
     * @method submitBugReport
     * @description Envía el reporte de bug
     * @returns {void}
     */
    submitBugReport = () => {
        this.showToast('Enviando reporte de problema...', 'info');
        setTimeout(() => {
            this.showToast('Reporte enviado correctamente. Gracias por tu feedback.', 'success');
            document.querySelector('.bug-report-modal')?.remove();
        }, 2000);
    }

    /**
     * @method suggestFeature
     * @description Abre el formulario para sugerir una nueva característica
     * @returns {void}
     */
    suggestFeature = () => {
        const featureSuggestionHTML = `
        <div class="feature-suggestion-modal">
            <div class="modal-header">
                <h3>💡 Sugerir Característica</h3>
                <button class="close-btn" onclick="this.closest('.feature-suggestion-modal').remove()">×</button>
            </div>
            <form class="feature-suggestion-form">
                <div class="form-group">
                    <label for="feature-title">Nombre de la característica:</label>
                    <input type="text" id="feature-title" required>
                </div>
                <div class="form-group">
                    <label for="feature-description">Descripción:</label>
                    <textarea id="feature-description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="feature-benefit">¿Cómo te ayudaría?</label>
                    <textarea id="feature-benefit" rows="3" required></textarea>
                </div>
                <button type="submit" class="submit-btn">Enviar Sugerencia</button>
            </form>
        </div>
    `;
        document.body.insertAdjacentHTML('beforeend', featureSuggestionHTML);

        const form = document.querySelector('.feature-suggestion-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeatureSuggestion();
            });
        }
    }

    /**
     * @method submitFeatureSuggestion
     * @description Envía la sugerencia de característica
     * @returns {void}
     */
    submitFeatureSuggestion = () => {
        this.showToast('Enviando sugerencia...', 'info');
        setTimeout(() => {
            this.showToast('Sugerencia enviada correctamente. ¡Gracias por tu idea!', 'success');
            document.querySelector('.feature-suggestion-modal')?.remove();
        }, 2000);
    }

    /**
     * @method searchHelpContent
     * @description Busca contenido en la sección de ayuda
     * @param {string} query - Término de búsqueda
     * @returns {void}
     */
    searchHelpContent = (query) => {
        if (query.length < 2) {
            // Mostrar todos los elementos si la búsqueda es muy corta
            document.querySelectorAll('#Help details').forEach(detail => {
                detail.style.display = 'block';
            });
            return;
        }

        const searchTerm = query.toLowerCase();
        let foundResults = false;

        document.querySelectorAll('#Help details').forEach(detail => {
            const content = detail.textContent.toLowerCase();
            if (content.includes(searchTerm)) {
                detail.style.display = 'block';
                foundResults = true;

                // Resaltar el término buscado
                this.highlightText(detail, searchTerm);
            } else {
                detail.style.display = 'none';
            }
        });

        if (!foundResults) {
            this.showToast('No se encontraron resultados en la ayuda', 'info');
        }
    }

    // ==========================
    // EVENTOS GLOBALES
    // ==========================

    /**
     * @method setupGlobalEvents
     * @setupGlobalEvents
     * @description Configura eventos globales de la aplicación
     * @returns {void}
     */
    setupGlobalEvents = () => {
        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            // Ctrl+S para guardar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentState();
            }

            // Ctrl+F para buscar
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchBox = document.getElementById('searchBox');
                if (searchBox) searchBox.focus();
            }

            // ¿Ctrl+? Para ayuda
            if (e.ctrlKey && e.key === '?') {
                e.preventDefault();
                this.activateSection('Help');
            }

            // Escape para cerrar modales
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Prevenir acciones no deseadas
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.protected-content')) {
                e.preventDefault();
                this.showToast('Esta acción no está permitida', 'warning');
            }
        });

        // Manejar cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.autoSave();
            }
        });

        // Manejar cierre de la página
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                console.log('⚠️ Cambios sin guardar - mostrando diálogo de confirmación del navegador');
                this.showToast('Tienes cambios sin guardar', 'warning');
            }
        });

        // Responsive design - manejar cambios de tamaño
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Clic fuera de menús para cerrarlos
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });
    }

    /**
     * @method saveCurrentState
     * @description Guarda el estado actual de la aplicación
     * @returns {void}
     */
    saveCurrentState = () => {
        this.showToast('Guardando...', 'info');
        // Aquí iría la lógica para guardar el estado actual
        setTimeout(() => {
            this.showToast('Estado guardado correctamente', 'success');
            this.hasUnsavedChanges = false;
        }, 1000);
    }

    /**
     * @method closeAllModals
     * @description Cierra todos los modales abiertos
     * @returns {void}
     */
    closeAllModals = () => {
        document.querySelectorAll('.modal, .sticker-modal, .tutorial-modal, .bug-report-modal, .feature-suggestion-modal').forEach(modal => {
            modal.remove();
        });
    }

    /**
     * @method autoSave
     * @description Guardado automático cuando la página pierde visibilidad
     * @returns {void}
     */
    autoSave = () => {
        if (this.hasUnsavedChanges) {
            console.log('Auto-guardando cambios...');
            this.saveCurrentState();
        }
    }

    /**
     * @method handleResize
     * @description Maneja el redimensionado de la ventana
     * @returns {void}
     */
    handleResize = () => {
        const width = window.innerWidth;

        // Ajustar layout para móviles
        if (width < 768) {
            document.body.classList.add('mobile-view');
            this.showToast('Modo móvil activado', 'info');
        } else {
            document.body.classList.remove('mobile-view');
        }

        // Re-renderizar componentes responsivos si es necesario
        this.updateResponsiveComponents();
    }

    /**
     * @method updateResponsiveComponents
     * @description Actualiza componentes responsivos
     * @returns {void}
     */
    updateResponsiveComponents = () => {
        // Aquí iría la lógica para actualizar componentes que dependen del tamaño de pantalla
        const canvas = document.getElementById('dashboardCanvas');
        if (canvas) {
            // Ajustar tamaño del canvas si es necesario
        }
    }

    /**
     * @method handleOutsideClick
     * @description Maneja clics fuera de menús para cerrarlos
     * @param {Event} e - Evento de clic
     * @returns {void}
     */
    handleOutsideClick = (e) => {
        // Cerrar menú de usuario si se hace clic fuera
        const userMenu = document.getElementById('user-menu');
        const userInfo = document.getElementById('user-info');

        if (userMenu && userMenu.style.display === 'block' && !userInfo.contains(e.target)) {
            userMenu.style.display = 'none';
        }

        // Cerrar otros menús desplegables de manera similar
        // (implementar según sea necesario para otros menús)
    }

    /**
     * @method closest
     * @description Encuentra el elemento ancestro más cercano que coincida con el selector
     * @param {Element} element - Elemento desde el cual comenzar la búsqueda
     * @param {string} selector - Selector CSS para buscar
     * @returns {Element|null} Elemento encontrado o null si no se encuentra
     */
    closest = (element, selector) => {
        if (!element || !selector) return null;

        // Usar el método nativo closest si está disponible
        if (element.closest) {
            return element.closest(selector);
        }

        // Polyfill para navegadores antiguos
        let currentElement = element;
        while (currentElement && currentElement !== document.documentElement) {
            if (currentElement.matches(selector)) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }
    /**
     * @method saveSettings
     * @description Guarda la configuración de usuario en localStorage de forma autónoma
     * @returns {Promise<Object>} Promesa que resuelve con las configuraciones guardadas
     */
    saveSettings = () => {
        return new Promise((resolve, reject) => {
            try {
                // Recopilar datos del formulario de configuración
                const userSettings = {
                    username: document.getElementById('user-name')?.value?.trim() || 'Usuario',
                    email: document.getElementById('user-email')?.value?.trim() || '',
                    theme: document.getElementById('theme-selector')?.value || 'light',
                    language: document.getElementById('language-selector')?.value || 'es',
                    notifications: document.getElementById('notifications-toggle')?.checked || false,
                    savedAt: new Date().toISOString()
                };

                // Validaciones básicas
                if (userSettings.email && !this.isValidEmail(userSettings.email)) {
                    reject(new Error('Por favor ingresa un correo electrónico válido.'));
                    return;
                }

                // Guardar en localStorage
                localStorage.setItem('dashboardUserSettings', JSON.stringify(userSettings));

                // Aplicar cambios inmediatos
                this.applySettingsChanges(userSettings);

                console.log('✅ Configuración guardada:', userSettings);
                resolve(userSettings);

            } catch (error) {
                console.error('❌ Error al guardar configuración:', error);
                reject(new Error('No se pudieron guardar las configuraciones. Intenta nuevamente.'));
            }
        });
    }

    /**
     * @method isValidEmail
     * @description Valida formato de email de forma autónoma
     * @param {string} email - Email a validar
     * @returns {boolean} True si el email es válido
     */
    isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * @method applySettingsChanges
     * @description Aplica los cambios de configuración inmediatamente
     * @param {Object} settings - Configuraciones a aplicar
     * @returns {void}
     */
    applySettingsChanges = (settings) => {
        // Aplicar tema
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }

        // Aplicar idioma (simulación)
        if (settings.language) {
            document.documentElement.lang = settings.language;
        }

        // Mostrar notificación de cambios aplicados
        if (settings.username) {
            const userNameElement = document.getElementById('user-name-display');
            if (userNameElement) {
                userNameElement.textContent = settings.username;
            }
        }
    }

    /**
     * @method hideSuccessMessage
     * @description Oculta un mensaje de éxito específico de forma autónoma
     * @param {string} messageId - ID del elemento de mensaje de éxito
     * @returns {void}
     */
    hideSuccessMessage = (messageId) => {
        if (!messageId) {
            console.warn('No se proporcionó un ID de mensaje de éxito');
            return;
        }

        const successElement = document.getElementById(messageId);
        if (successElement) {
            // Animación de desvanecimiento
            successElement.style.transition = 'opacity 0.3s ease';
            successElement.style.opacity = '0';

            setTimeout(() => {
                successElement.style.display = 'none';
                successElement.style.opacity = '1';
            }, 300);
        } else {
            console.warn(`No se encontró el elemento de éxito con ID: ${messageId}`);
        }
    }

    /**
     * @method saveProject
     * @description Guarda un proyecto en localStorage de forma autónoma
     * @param {Object} projectData - Datos del proyecto a guardar
     * @returns {Promise<Object>} Promesa que resuelve con el proyecto guardado
     */
    saveProject = (projectData) => {
        return new Promise((resolve, reject) => {
            if (!projectData) {
                reject(new Error('No se proporcionaron datos del proyecto.'));
                return;
            }

            try {
                // Validaciones básicas
                if (!projectData.content || !projectData.content.trim()) {
                    reject(new Error('El contenido del proyecto no puede estar vacío.'));
                    return;
                }

                if (!projectData.targetCard) {
                    reject(new Error('Debe seleccionar una tarjeta destino.'));
                    return;
                }

                // Generar ID único si no existe
                const projectId = projectData.id || `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

                // Estructura completa del proyecto
                const completeProject = {
                    id: projectId,
                    content: projectData.content.trim(),
                    targetCard: projectData.targetCard,
                    title: projectData.title || `Proyecto ${new Date().toLocaleDateString()}`,
                    status: projectData.status || 'active',
                    priority: projectData.priority || 'medium',
                    createdAt: projectData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: projectData.createdBy || 'current-user'
                };

                // Obtener proyectos existentes
                const existingProjects = JSON.parse(localStorage.getItem('dashboardProjects') || '[]');

                // Evitar duplicados basados en ID
                const existingIndex = existingProjects.findIndex(p => p.id === projectId);

                if (existingIndex >= 0) {
                    // Actualizar proyecto existente
                    existingProjects[existingIndex] = {
                        ...existingProjects[existingIndex],
                        ...completeProject,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    // Agregar nuevo proyecto
                    existingProjects.push(completeProject);
                }

                // Guardar en localStorage
                localStorage.setItem('dashboardProjects', JSON.stringify(existingProjects));

                // Actualizar UI si es necesario
                this.updateProjectsDisplay();

                console.log('✅ Proyecto guardado:', completeProject);
                resolve(completeProject);

            } catch (error) {
                console.error('❌ Error al guardar proyecto:', error);
                reject(new Error('No se pudo guardar el proyecto en el almacenamiento local. Verifica la consola para más detalles.'));
            }
        });
    }

    /**
     * @method updateProjectsDisplay
     * @description Actualiza la visualización de proyectos en la UI
     * @returns {void}
     */
    updateProjectsDisplay = () => {
        // Esta función actualizaría la lista de proyectos en la UI
        // Por ahora solo es un placeholder
        console.log('🔄 Actualizando visualización de proyectos...');
    }
    exportData = () => {

    }
}

// ==========================
// INICIALIZACIÓN GLOBAL
// ==========================

/**
 * @method initializeDashboard
 * @description Inicializa la aplicación Dashboard con manejo de errores robusto
 * @returns {void}
 * @throws {Error} Si falla la inicialización del dashboard
 */
let initializeDashboard = () => {
    try {
        console.log('🎉 Iniciando Kliv Dashboard...');
        window.dashboardApp = new DashboardApp();

        setTimeout(() => {
            if (window.dashboardApp && window.dashboardApp.isInitialized) {
                console.log('✅ Dashboard inicializado correctamente');
            } else {
                console.error('❌ Falló la inicialización del Dashboard');
            }
        }, 1000);

    } catch (error) {
        console.error('💥 Error crítico al inicializar Dashboard:', error);

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
            <button onclick="location.reload()">Recargar Página</button>
        `;
        document.body.appendChild(errorMessage);
    }
};

// Múltiples métodos de inicialización para mayor robustez
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Exportar para uso global
window.initializeDashboard = initializeDashboard;
window.DashboardApp = DashboardApp;