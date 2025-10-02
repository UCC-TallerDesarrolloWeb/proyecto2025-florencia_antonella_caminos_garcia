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

/**
 * Datos para mostrar la galería de imagenes
 * Define constantes para trabajar en la clase definida para el sistema de likes
 */
const GALLERYDATA = [
    { id: 1, src: "https://picsum.photos/300/400", alt: "Paisaje natural", likes: 120, comments: 45 },
    { id: 2, src: "https://picsum.photos/300/350", alt: "Arquitectura moderna", likes: 89, comments: 12 },
    { id: 3, src: "https://picsum.photos/300/380", alt: "Retrato artístico", likes: 210, comments: 34 },
    { id: 4, src: "https://picsum.photos/300/360", alt: "Comida gourmet", likes: 156, comments: 28 },
    { id: 5, src: "https://picsum.photos/300/390", alt: "Viajes y aventura", likes: 98, comments: 17 },
    { id: 6, src: "https://picsum.photos/300/370", alt: "Arte abstracto", likes: 187, comments: 41 },
    { id: 7, src: "https://picsum.photos/300/410", alt: "Moda urbana", likes: 63, comments: 8 },
    { id: 8, src: "https://picsum.photos/300/420", alt: "Naturaleza muerta", likes: 224, comments: 59 },
    { id: 9, src: "https://picsum.photos/300/430", alt: "Tecnología", likes: 77, comments: 15 },
    { id: 10, src: "https://picsum.photos/300/440", alt: "Deportes", likes: 300, comments: 90 }
];

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

        // Disparar evento personalizado para notificar el cambio de sección
        window.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { sectionId }
        }));
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
// SISTEMA DE LIKES Y MUESTRA DE IMAGENES
// =============================================

class EnhancedLikeSystem {
    constructor(dashboardApp) {
        this.dashboardApp = dashboardApp;
        this.storageKey = 'enhanced-kliv-likes';
        this.likesData = this.loadLikesData();
        this.currentFilter = 'all';
    }

    // Inicializa el sistema
    init() {
        this.renderGallery();
        this.setupEventListeners();
        this.updateGalleryStats();
        this.markPopularContent();
        return this;
    }

    // Carga datos de likes desde localStorage
    loadLikesData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Inicializar con datos por defecto
            const defaultData = {};
            GALLERYDATA.forEach(item => {
                defaultData[item.id] = {
                    liked: false,
                    likes: item.likes,
                    timestamp: Date.now()
                };
            });
            return defaultData;
        }
    }

    // Guarda datos de likes en localStorage
    saveLikesData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.likesData));
    }

    // Renderiza la galería completa
    renderGallery() {
        const grid = document.getElementById('dashboard-grid');
        if (!grid) {
            console.warn('Elemento #dashboard-grid no encontrado');
            return;
        }

        grid.innerHTML = '';

        GALLERYDATA.forEach(item => {
            const imageData = this.likesData[item.id] || { liked: false, likes: item.likes };
            const isLiked = imageData.liked;
            const likeCount = imageData.likes;

            const card = document.createElement('article');
            card.className = 'image-card';
            card.dataset.imageId = item.id;

            // Determinar si debe mostrarse según el filtro actual
            if (this.currentFilter === 'popular' && likeCount < 100) {
                card.style.display = 'none';
            } else if (this.currentFilter === 'liked' && !isLiked) {
                card.style.display = 'none';
            } else {
                card.style.display = 'block';
            }

            card.innerHTML = `
                <div class="image-container">
                    <img src="${item.src}" alt="${item.alt}" loading="lazy">
                    <div class="image-overlay">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" aria-label="Me gusta">
                            <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                        </button>
                    </div>
                    ${likeCount > 150 ? '<div class="popular-badge">🔥 Popular</div>' : ''}
                    <div class="double-click-hint">Doble click para like</div>
                    <div class="particles-container" id="particles-${item.id}"></div>
                </div>
                <footer class="image-stats">
                    <span class="like-count">
                        <span class="like-icon-mini">${isLiked ? '❤️' : '🤍'}</span>
                        <span class="like-count-number">${likeCount}</span> me gusta
                    </span>
                    <span class="comment-count">
                        <span>💬</span> ${item.comments} comentarios
                    </span>
                </footer>
            `;

            grid.appendChild(card);
        });
    }

    // Configura todos los event listeners
    setupEventListeners() {
        // Delegación de eventos para los botones de like
        document.addEventListener('click', (e) => {
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                this.handleLikeClick(likeBtn);
            }

            // Filtros de galería
            const filterBtn = e.target.closest('.filter-btn');
            if (filterBtn) {
                this.handleFilterClick(filterBtn);
            }
        });

        // Doble click en imágenes para like rápido
        document.addEventListener('dblclick', (e) => {
            const imageCard = e.target.closest('.image-card');
            if (imageCard && !e.target.closest('.like-btn')) {
                const likeBtn = imageCard.querySelector('.like-btn');
                if (likeBtn) {
                    this.handleLikeClick(likeBtn);
                    this.createParticles(imageCard);
                }
            }
        });
    }

    // Maneja el clic en el botón de like
    handleLikeClick(likeBtn) {
        const imageCard = likeBtn.closest('.image-card');
        const imageId = parseInt(imageCard.dataset.imageId);
        const likeIcon = likeBtn.querySelector('.like-icon');
        const likeCountElement = imageCard.querySelector('.like-count-number');
        const likeCountMini = imageCard.querySelector('.like-icon-mini');

        if (!imageId) return;

        const currentLikes = parseInt(likeCountElement.textContent) || 0;
        const isCurrentlyLiked = likeBtn.classList.contains('liked');

        if (isCurrentlyLiked) {
            this.unlikeImage(imageId, likeBtn, likeIcon, likeCountElement, likeCountMini, currentLikes);
        } else {
            this.likeImage(imageId, likeBtn, likeIcon, likeCountElement, likeCountMini, currentLikes);
            this.createParticles(imageCard);
        }

        this.updateGalleryStats();
        this.markPopularContent();
    }

    // Da like a una imagen
    likeImage(imageId, likeBtn, likeIcon, likeCountElement, likeCountMini, currentLikes) {
        // Actualizar UI
        likeBtn.classList.add('liked');
        likeIcon.textContent = '❤️';
        likeIcon.classList.add('like-animation');

        const newLikes = currentLikes + 1;
        likeCountElement.textContent = newLikes;

        if (likeCountMini) {
            likeCountMini.textContent = '❤️';
        }

        // Actualizar datos
        this.likesData[imageId] = {
            liked: true,
            likes: newLikes,
            timestamp: Date.now()
        };

        this.saveLikesData();
        this.showLikeNotification(true);

        // Remover animación después de completarse
        setTimeout(() => {
            likeIcon.classList.remove('like-animation');
        }, 500);
    }

    // Quita like a una imagen
    unlikeImage(imageId, likeBtn, likeIcon, likeCountElement, likeCountMini, currentLikes) {
        // Actualizar UI
        likeBtn.classList.remove('liked');
        likeIcon.textContent = '🤍';

        const newLikes = Math.max(0, currentLikes - 1);
        likeCountElement.textContent = newLikes;

        if (likeCountMini) {
            likeCountMini.textContent = '🤍';
        }

        // Actualizar datos
        this.likesData[imageId] = {
            liked: false,
            likes: newLikes,
            timestamp: Date.now()
        };

        this.saveLikesData();
        this.showLikeNotification(false);
    }

    // Crea efecto de partículas al dar like
    createParticles(imageCard) {
        const particlesContainer = imageCard.querySelector('.particles-container');
        if (!particlesContainer) return;

        // Limpiar partículas anteriores
        particlesContainer.innerHTML = '';

        // Crear nuevas partículas
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Posición inicial (centro del botón de like)
            const likeBtn = imageCard.querySelector('.like-btn');
            const btnRect = likeBtn.getBoundingClientRect();
            const containerRect = particlesContainer.getBoundingClientRect();

            const startX = btnRect.left - containerRect.left + btnRect.width / 2;
            const startY = btnRect.top - containerRect.top + btnRect.height / 2;

            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;

            // Dirección aleatoria
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const targetX = startX + Math.cos(angle) * distance;
            const targetY = startY + Math.sin(angle) * distance;

            particlesContainer.appendChild(particle);

            // Animación
            setTimeout(() => {
                particle.style.transition = 'all 0.8s ease-out';
                particle.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px)`;
                particle.style.opacity = '0.8';

                setTimeout(() => {
                    particle.style.opacity = '0';
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 800);
                }, 400);
            }, 10);
        }
    }

    // Maneja el clic en los filtros
    handleFilterClick(filterBtn) {
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        filterBtn.classList.add('active');

        // Aplicar filtro
        this.currentFilter = filterBtn.dataset.filter;
        this.renderGallery();
    }

    // Muestra notificación de like/unlike
    showLikeNotification(liked) {
        const message = liked ?
            '¡Te gusta esta imagen! ❤️' :
            'Ya no te gusta esta imagen';

        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showToast(message, liked ? 'success' : 'info');
        } else {
            // Notificación visual temporal como fallback
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${liked ? '#2ecc71' : '#95a5a6'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 2000);
        }
    }

    // Actualiza las estadísticas de la galería
    updateGalleryStats() {
        const totalImages = GALLERYDATA.length;
        const totalLikes = Object.values(this.likesData)
            .reduce((sum, data) => sum + (data.likes || 0), 0);

        const likedImages = Object.values(this.likesData)
            .filter(data => data.liked).length;

        const statsElement = document.getElementById('gallery-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <strong>${totalImages}</strong> imágenes • 
                <strong>${totalLikes}</strong> me gusta • 
                <strong>${likedImages}</strong> te gustan
            `;
        }
    }

    // Marca el contenido popular
    markPopularContent() {
        document.querySelectorAll('.image-card').forEach(card => {
            const imageId = parseInt(card.dataset.imageId);
            const likeCountElement = card.querySelector('.like-count-number');

            if (imageId && likeCountElement) {
                const likeCount = parseInt(likeCountElement.textContent) || 0;
                const popularBadge = card.querySelector('.popular-badge');

                if (likeCount >= 150) {
                    if (!popularBadge) {
                        const badge = document.createElement('div');
                        badge.className = 'popular-badge';
                        badge.textContent = '🔥 Popular';
                        card.querySelector('.image-container').appendChild(badge);
                    }
                } else if (popularBadge) {
                    popularBadge.remove();
                }
            }
        });
    }

    // Obtiene estadísticas detalladas
    getStats() {
        const totalLikes = Object.values(this.likesData)
            .reduce((sum, data) => sum + (data.likes || 0), 0);

        const likedImages = Object.values(this.likesData)
            .filter(data => data.liked).length;

        const popularImages = Object.values(this.likesData)
            .filter(data => data.likes >= 100).length;

        return {
            totalImages: GALLERYDATA.length,
            totalLikes,
            likedImages,
            popularImages
        };
    }
}

// =============================================
// GESTOR DE GALERÍA PERSONAL
// =============================================

class GalleryManager {
    /**
     * @param {DashboardApp} dashboardApp - Instancia de la app principal
     */
    constructor(dashboardApp) {
        this.dashboardApp = dashboardApp;
        this.storageKey = 'personal-gallery-data';
        this.galleryData = this.loadGalleryData();
        this.currentFilter = 'all';
        this.uploadQueue = [];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // Inicializar elementos del DOM
        this.elements = {
            gallerySection: document.getElementById('Gallery'),
            personalGallery: document.getElementById('personal-gallery'),
            personalGrid: document.querySelector('.personal-grid'),
            uploadArea: document.getElementById('upload-area'),
            uploadTrigger: document.getElementById('upload-trigger'),
            fileUpload: document.getElementById('file-upload'),
            uploadPreview: document.getElementById('upload-preview'),
            previewGrid: document.getElementById('preview-grid'),
            confirmUpload: document.getElementById('confirm-upload'),
            cancelUpload: document.getElementById('cancel-upload'),
            clearGallery: document.getElementById('clear-gallery'),
            totalPhotos: document.getElementById('total-photos'),
            totalSize: document.getElementById('total-size'),
            favoriteCount: document.getElementById('favorite-count'),
            filterButtons: document.querySelectorAll('.gallery-controls .filter-btn')
        };
    }

    /**
     * INICIALIZACIÓN - Configura la galería al cargar la aplicación
     */
    init() {
        this.setupEventListeners();
        this.renderGallery();
        this.updateGalleryStats();
        console.log('GalleryManager inicializado correctamente');
        return this;
    }

    /**
     * CARGA DE DATOS - Carga los datos de la galería desde localStorage
     * @returns {Array} Datos de la galería
     */
    loadGalleryData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error al cargar datos de galería:', error);
        }

        // Datos por defecto (las 6 imágenes existentes en el HTML)
        return [
            {
                id: 1,
                src: '../Imagenes/1_Ropa.jpeg',
                name: 'Prenda de Ropa',
                size: 450000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            },
            {
                id: 2,
                src: '../Imagenes/2_Codigo.jpeg',
                name: 'Ejemplo de Código',
                size: 380000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            },
            {
                id: 3,
                src: '../Imagenes/3_Naturaleza.jpeg',
                name: 'Paisaje Natural',
                size: 520000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            },
            {
                id: 4,
                src: '../Imagenes/4_Libros.jpeg',
                name: 'Libro Recomendado',
                size: 410000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            },
            {
                id: 5,
                src: '../Imagenes/5_Comida.jpeg',
                name: 'Recetas',
                size: 490000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            },
            {
                id: 6,
                src: '../Imagenes/6_Decoracion.jpeg',
                name: 'Ideas de Decoración',
                size: 470000,
                date: '15/01/2024',
                favorite: false,
                uploadDate: new Date('2024-01-15').getTime()
            }
        ];
    }

    /**
     * GUARDADO DE DATOS - Guarda los datos de la galería en localStorage
     */
    saveGalleryData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.galleryData));
        } catch (error) {
            console.error('Error al guardar datos de galería:', error);
            NotificationManager.showToast('Error al guardar los cambios', 'error');
        }
    }

    /**
     * CONFIGURACIÓN DE EVENTOS - Configura todos los event listeners de la galería
     */
    setupEventListeners() {
        // Eventos de subida de archivos
        if (this.elements.uploadTrigger) {
            this.elements.uploadTrigger.addEventListener('click', () => this.elements.fileUpload?.click());
        }

        if (this.elements.fileUpload) {
            this.elements.fileUpload.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Eventos de drag and drop
        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Eventos de confirmación de subida
        if (this.elements.confirmUpload) {
            this.elements.confirmUpload.addEventListener('click', () => this.confirmUpload());
        }

        if (this.elements.cancelUpload) {
            this.elements.cancelUpload.addEventListener('click', () => this.cancelUpload());
        }

        // Evento de limpiar galería
        if (this.elements.clearGallery) {
            this.elements.clearGallery.addEventListener('click', () => this.clearGallery());
        }

        // Eventos de filtros
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e.target));
        });

        // Delegación de eventos para favoritos y eliminación
        document.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.photo-action-btn.favorite');
            const deleteBtn = e.target.closest('.photo-action-btn.delete');

            if (favoriteBtn) {
                const photoId = parseInt(favoriteBtn.dataset.photoId);
                this.toggleFavorite(photoId);
            }

            if (deleteBtn) {
                const photoId = parseInt(deleteBtn.dataset.photoId);
                this.deletePhoto(photoId);
            }
        });

        // Doble click en imágenes para favorito rápido
        document.addEventListener('dblclick', (e) => {
            const photoContainer = e.target.closest('.personal-photo');
            if (photoContainer) {
                const photoId = parseInt(photoContainer.dataset.photoId);
                this.toggleFavorite(photoId);
            }
        });
    }

    /**
     * RENDERIZADO DE GALERÍA - Renderiza todas las imágenes en la galería
     */
    renderGallery() {
        if (!this.elements.personalGrid) {
            console.warn('Elemento .personal-grid no encontrado');
            return;
        }

        // Limpiar grid existente
        this.elements.personalGrid.innerHTML = '';

        // Filtrar imágenes según el filtro actual
        const filteredPhotos = this.galleryData.filter(photo => {
            switch (this.currentFilter) {
                case 'recent':
                    // Fotos de los últimos 7 días
                    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                    return photo.uploadDate > oneWeekAgo;
                case 'favorites':
                    return photo.favorite;
                default:
                    return true; // 'all'
            }
        });

        // Renderizar cada foto
        filteredPhotos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            this.elements.personalGrid.appendChild(photoElement);
        });

        // Actualizar estadísticas
        this.updateGalleryStats();
    }

    /**
     * CREACIÓN DE ELEMENTOS - Crea el elemento DOM para una foto
     * @param {Object} photo - Datos de la foto
     * @returns {HTMLElement} Elemento de la foto
     */
    createPhotoElement(photo) {
        const photoElement = document.createElement('div');
        photoElement.className = `personal-photo ${photo.favorite ? 'favorite' : ''}`;
        photoElement.dataset.photoId = photo.id;

        const sizeFormatted = this.formatFileSize(photo.size);
        const favoriteClass = photo.favorite ? 'liked' : '';
        const favoriteIcon = photo.favorite ? 'fas fa-heart' : 'far fa-heart';

        photoElement.innerHTML = `
            <div class="photo-container">
                <img src="${photo.src}" alt="${photo.name}" loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-actions">
                        <button class="photo-action-btn favorite ${favoriteClass}" data-photo-id="${photo.id}">
                            <i class="${favoriteIcon}"></i>
                        </button>
                        <button class="photo-action-btn delete" data-photo-id="${photo.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="photo-info">
                <div class="photo-name">${photo.name}</div>
                <div class="photo-meta">
                    <span class="photo-size">${sizeFormatted}</span>
                    <span class="photo-date">${photo.date}</span>
                </div>
            </div>
        `;

        return photoElement;
    }

    /**
     * MANEJO DE SELECCIÓN DE ARCHIVOS - Procesa archivos seleccionados
     * @param {Event} event - Evento de selección de archivos
     */
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    /**
     * MANEJO DE DRAG OVER - Efecto visual al arrastrar archivos
     * @param {Event} event - Evento drag over
     */
    handleDragOver(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.add('drag-over');
    }

    /**
     * MANEJO DE DRAG LEAVE - Remueve efecto visual al salir del área
     * @param {Event} event - Evento drag leave
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');
    }

    /**
     * MANEJO DE DROP - Procesa archivos soltados en el área
     * @param {Event} event - Evento drop
     */
    handleDrop(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');

        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    /**
     * PROCESAMIENTO DE ARCHIVOS - Valida y procesa archivos para subir
     * @param {Array} files - Array de archivos a procesar
     */
    processFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));

        if (validFiles.length === 0) {
            NotificationManager.showToast('No hay archivos válidos para subir', 'error');
            return;
        }

        this.uploadQueue = validFiles;
        this.showUploadPreview(validFiles);
    }

    /**
     * VALIDACIÓN DE ARCHIVOS - Verifica que un archivo sea válido
     * @param {File} file - Archivo a validar
     * @returns {boolean} True si el archivo es válido
     */
    validateFile(file) {
        // Verificar tipo de archivo
        if (!this.supportedFormats.includes(file.type)) {
            NotificationManager.showToast(`Formato no soportado: ${file.name}`, 'error');
            return false;
        }

        // Verificar tamaño
        if (file.size > this.maxFileSize) {
            NotificationManager.showToast(`Archivo demasiado grande: ${file.name} (máx. 5MB)`, 'error');
            return false;
        }

        return true;
    }

    /**
     * PREVISUALIZACIÓN DE SUBIDA - Muestra vista previa de archivos a subir
     * @param {Array} files - Archivos para previsualizar
     */
    showUploadPreview(files) {
        if (!this.elements.uploadPreview || !this.elements.previewGrid) return;

        // Mostrar área de previsualización
        this.elements.uploadPreview.style.display = 'block';
        this.elements.previewGrid.innerHTML = '';

        // Crear previsualizaciones
        files.forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="preview-remove" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                this.elements.previewGrid.appendChild(previewItem);

                // Evento para remover previsualización
                previewItem.querySelector('.preview-remove').addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.removeFromUploadQueue(index);
                });
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * ELIMINACIÓN DE COLA DE SUBIDA - Remueve archivo de la cola de subida
     * @param {number} index - Índice del archivo a remover
     */
    removeFromUploadQueue(index) {
        this.uploadQueue.splice(index, 1);

        // Si no quedan archivos, ocultar previsualización
        if (this.uploadQueue.length === 0) {
            this.cancelUpload();
            return;
        }

        // Volver a mostrar previsualización con archivos restantes
        this.showUploadPreview(this.uploadQueue);
    }

    /**
     * CONFIRMACIÓN DE SUBIDA - Confirma y procesa la subida de archivos
     */
    confirmUpload() {
        if (this.uploadQueue.length === 0) {
            NotificationManager.showToast('No hay archivos para subir', 'error');
            return;
        }

        let processedCount = 0;

        this.uploadQueue.forEach(file => {
            this.processFileUpload(file)
                .then(photoData => {
                    this.galleryData.push(photoData);
                    processedCount++;

                    if (processedCount === this.uploadQueue.length) {
                        this.finalizeUpload();
                    }
                })
                .catch(error => {
                    console.error('Error subiendo archivo:', error);
                    processedCount++;

                    if (processedCount === this.uploadQueue.length) {
                        this.finalizeUpload();
                    }
                });
        });

        NotificationManager.showToast(`Subiendo ${this.uploadQueue.length} archivos...`, 'success');
    }

    /**
     * PROCESAMIENTO DE SUBIDA DE ARCHIVO - Procesa un archivo individual
     * @param {File} file - Archivo a procesar
     * @returns {Promise} Promesa con los datos de la foto
     */
    processFileUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const photoData = {
                    id: Date.now() + Math.random(), // ID único
                    src: e.target.result,
                    name: this.sanitizeFileName(file.name),
                    size: file.size,
                    date: new Date().toLocaleDateString('es-ES'),
                    favorite: false,
                    uploadDate: Date.now()
                };

                resolve(photoData);
            };

            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * SANEAMIENTO DE NOMBRE DE ARCHIVO - Limpia el nombre del archivo
     * @param {string} fileName - Nombre original del archivo
     * @returns {string} Nombre saneado
     */
    sanitizeFileName(fileName) {
        // Remover extensión y caracteres especiales
        return fileName
            .replace(/\.[^/.]+$/, "") // Remover extensión
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "") // Remover caracteres especiales
            .replace(/\s+/g, " ") // Normalizar espacios
            .trim() || 'Imagen sin nombre'; // Nombre por defecto
    }

    /**
     * FINALIZACIÓN DE SUBIDA - Completa el proceso de subida
     */
    finalizeUpload() {
        this.saveGalleryData();
        this.renderGallery();
        this.cancelUpload();
        NotificationManager.showToast('Imágenes subidas correctamente', 'success');
    }

    /**
     * CANCELACIÓN DE SUBIDA - Cancela la subida en curso
     */
    cancelUpload() {
        this.uploadQueue = [];

        if (this.elements.uploadPreview) {
            this.elements.uploadPreview.style.display = 'none';
        }

        if (this.elements.fileUpload) {
            this.elements.fileUpload.value = '';
        }
    }

    /**
     * MANEJO DE FAVORITOS - Alterna estado de favorito de una foto
     * @param {number} photoId - ID de la foto
     */
    toggleFavorite(photoId) {
        const photo = this.galleryData.find(p => p.id === photoId);
        if (!photo) return;

        photo.favorite = !photo.favorite;
        this.saveGalleryData();
        this.renderGallery();

        // Efecto visual
        const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (photoElement) {
            const favoriteBtn = photoElement.querySelector('.favorite');
            if (favoriteBtn) {
                favoriteBtn.classList.toggle('liked', photo.favorite);

                // Animación de like
                if (photo.favorite) {
                    favoriteBtn.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        favoriteBtn.style.transform = 'scale(1)';
                    }, 300);
                }
            }
        }

        NotificationManager.showToast(
            photo.favorite ? 'Agregado a favoritos ❤️' : 'Removido de favoritos',
            photo.favorite ? 'success' : 'info'
        );
    }

    /**
     * ELIMINACIÓN DE FOTO - Elimina una foto de la galería
     * @param {number} photoId - ID de la foto a eliminar
     */
    deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        const photoIndex = this.galleryData.findIndex(p => p.id === photoId);
        if (photoIndex === -1) return;

        this.galleryData.splice(photoIndex, 1);
        this.saveGalleryData();
        this.renderGallery();

        NotificationManager.showToast('Foto eliminada correctamente', 'success');
    }

    /**
     * LIMPIEZA DE GALERÍA - Elimina todas las fotos de la galería
     */
    clearGallery() {
        if (this.galleryData.length === 0) {
            NotificationManager.showToast('La galería ya está vacía', 'info');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar todas las fotos? Esta acción no se puede deshacer.')) {
            return;
        }

        this.galleryData = [];
        this.saveGalleryData();
        this.renderGallery();

        NotificationManager.showToast('Galería limpiada correctamente', 'success');
    }

    /**
     * MANEJO DE FILTROS - Aplica filtros a la galería
     * @param {HTMLElement} filterBtn - Botón de filtro clickeado
     */
    handleFilterClick(filterBtn) {
        // Actualizar botones activos
        this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');

        // Aplicar filtro
        this.currentFilter = filterBtn.dataset.filter;
        this.renderGallery();
    }

    /**
     * ACTUALIZACIÓN DE ESTADÍSTICAS - Actualiza las estadísticas de la galería
     */
    updateGalleryStats() {
        if (!this.elements.totalPhotos || !this.elements.totalSize || !this.elements.favoriteCount) return;

        const totalPhotos = this.galleryData.length;
        const totalSize = this.galleryData.reduce((sum, photo) => sum + photo.size, 0);
        const favoriteCount = this.galleryData.filter(photo => photo.favorite).length;

        this.elements.totalPhotos.textContent = totalPhotos;
        this.elements.totalSize.textContent = this.formatFileSize(totalSize);
        this.elements.favoriteCount.textContent = favoriteCount;
    }

    /**
     * FORMATEO DE TAMAÑO DE ARCHIVO - Convierte bytes a formato legible
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * OBTENCIÓN DE ESTADÍSTICAS - Retorna estadísticas detalladas de la galería
     * @returns {Object} Estadísticas de la galería
     */
    getStats() {
        const totalSize = this.galleryData.reduce((sum, photo) => sum + photo.size, 0);
        const favoriteCount = this.galleryData.filter(photo => photo.favorite).length;
        const recentCount = this.galleryData.filter(photo => {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            return photo.uploadDate > oneWeekAgo;
        }).length;

        return {
            totalPhotos: this.galleryData.length,
            totalSize: totalSize,
            favoriteCount: favoriteCount,
            recentCount: recentCount,
            formattedSize: this.formatFileSize(totalSize)
        };
    }

    /**
     * EXPORTACIÓN DE DATOS - Exporta los datos de la galería para backup
     * @returns {string} Datos en formato JSON
     */
    exportData() {
        return JSON.stringify(this.galleryData, null, 2);
    }

    /**
     * IMPORTACIÓN DE DATOS - Importa datos de galería desde JSON
     * @param {string} jsonData - Datos en formato JSON
     * @returns {boolean} True si la importación fue exitosa
     */
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);

            // Validar estructura básica
            if (!Array.isArray(importedData)) {
                throw new Error('Formato de datos inválido');
            }

            this.galleryData = importedData;
            this.saveGalleryData();
            this.renderGallery();

            NotificationManager.showToast('Datos importados correctamente', 'success');
            return true;
        } catch (error) {
            console.error('Error importando datos:', error);
            NotificationManager.showToast('Error importando datos', 'error');
            return false;
        }
    }
}

// =============================================
// APLICACIÓN PRINCIPAL - DASHBOARD
// =============================================

class DashboardApp {
    constructor() {
        this.sections = CONFIG.SECTIONS;
        this.navigationManager = new NavigationManager(this);
        this.searchManager = new SearchManager(NotificationManager);
        this.taskManager = new TaskManager();
        this.likeSystem = new EnhancedLikeSystem(this);
        this.galleryManager = new GalleryManager(this); // Corregido: minúscula
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
        this.setupLikes();
        this.galleryManager.init(); // Inicializar galleryManager
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
                window.location.href = '../HTML/Task_Mannager.html'; 
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
     * Sistema de Likes
     */
    setupLikes() {
        // Inicializar el sistema de likes
        this.likeSystem.init();

        // Agregar controles de galería si no existen
        this.addGalleryControls();
    }

    /**
     * Agrega controles de galería al dashboard
     */
    addGalleryControls() {
        const dashboardSection = document.getElementById('Dashboard');
        if (!dashboardSection) return;

        // Verificar si los controles ya existen
        if (!document.querySelector('.gallery-controls')) {
            const controlsHTML = `
                <div class="gallery-controls">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Todas</button>
                        <button class="filter-btn" data-filter="popular">Populares</button>
                        <button class="filter-btn" data-filter="liked">Me gustan</button>
                    </div>
                    <div class="stats-display" id="gallery-stats">
                        <strong>${GALLERYDATA.length}</strong> imágenes • 
                        <strong>0</strong> me gusta • 
                        <strong>0</strong> te gustan
                    </div>
                </div>
            `;

            const dashboardGrid = dashboardSection.querySelector('#dashboard-grid');
            if (dashboardGrid) {
                dashboardGrid.insertAdjacentHTML('beforebegin', controlsHTML);
            }
        }
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