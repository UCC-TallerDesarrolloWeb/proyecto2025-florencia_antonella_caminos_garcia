/**
 * =====================
 * Clase Dashboard
 * =====================
 */
class DashboardApp {

    /**
     * No recibe parámetros explícitos.
     * this.sections es una propiedad interna que el propio constructor inicializa; no es un parámetro que le llegue desde fuera.
     * Llama a this.init() sin argumentos.
     */
    constructor() {
        this.sections = ['Dashboard', 'Project', 'Tasks', 'Settings', 'Help'];

        this.init();
    }

    /**
     * Sin parámetros formales.
     * Internamente invoca:
     * – this.initializeApp()
     * – this.setupAllEvents()
     * – console.log(…) con un string literal; no es un parámetro variable.
     */
    init() {
        this.initializeApp();
        this.setupAllEvents();
        console.log("Kliv Dashboard Initialized, nice to see you again!");
    }

    /**
     * Sin parámetros.
     * document.querySelectorAll('.error-msg')
     * – Selector string fijo '.error-msg'.
     * – Retorna un NodeList que se recorre con forEach.
     * – El callback de forEach recibe cada nodo del DOM
     *
     * document.querySelectorAll('main section')
     * – Selector string fijo 'main section'.
     * – Mismo patrón: callback con section
     * .
     * this.activateSection('Dashboard')
     * – Llama a otra función pasando un string literal.
     */

    initializeApp() {
        document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
        document.querySelectorAll('main section').forEach(section => section.style.display = 'none');

        this.activateSection('Dashboard');
    }

    /**
     * Sin parámetros.
     * Es un “orquestador” que simplemente invoca a otros métodos sin pasarles nada.
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
     * Sin parámetros.
     *
     * document.addEventListener('keydown', (e) => { … })
     * – Primer argumento: string fijo 'keydown'.
     * – Segundo argumento: callback cuyo único parámetro formal es e (el objeto KeyboardEvent que el navegador inyecta).
     *
     * Contenido del callback:
     * – this.sections.findIndex(id => { … })
     * – findIndex recibe un callback cuyo primer parámetro formal es id (cada elemento del array this.sections).
     * – document.getElementById(id)
     * – getElementById recibe un string (id).
     * – section && section.classList.contains('active-section')
     * – contains recibe un string fijo 'active-section'.
     * – const nextSection = this.sections[(currentIndex + 1) % this.sections.length]
     * – currentIndex es un número devuelto por findIndex.
     * – El operador % garantiza que el índice “rota” dentro de los límites del array.
     *
     * – const prevSection = this.sections[(currentIndex - 1 + this.sections.length) % this.sections.length]
     * – Idem, pero desplazando hacia atrás.
     *
     * – this.activateSection(nextSection / prevSection)
     * – Se pasa un string ó
     */
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

    /**
     * Configura todos los eventos del header (barra superior):
     * - Búsqueda: clic en botón, Enter o escritura (>2 chars)
     * - Menú de usuario: clic en avatar o nombre
     * Delega la lógica a handleSearch() y toggleUserMenu()
     */
    setupHeaderEvents() {
        const searchButton = document.getElementById('searchButton');
        const searchBox = document.getElementById('searchBox');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        /* ---------- Búsqueda ---------- */
        if (searchButton && searchBox) {
            // Clic en el icono lupa
            searchButton.addEventListener('click', () => this.handleSearch());

            // Enter dentro del input
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });

            // Búsqueda en caliente tras 3º carácter
            searchBox.addEventListener('input', (e) => {
                if (e.target.value.length > 2) this.handleSearch();
            });
        }

        /* ---------- Menú usuario ---------- */
        if (userAvatar && userName) {
            userAvatar.addEventListener('click', () => this.toggleUserMenu());
            userName.addEventListener('click', () => this.toggleUserMenu());
        }
    }

    /**
     * Asigna comportamiento a cada opción del sidebar:
     * - Quita la clase 'active' de todos los items
     * - Se la pone al item clicado
     * - Extrae el ID de la sección a mostrar (transformando 'menu-xxx' → 'Xxx')
     * - Llama a activateSection() para renderizar la vista correspondiente
     */
    setupSidebarEvents() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Reset visual
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Navegación interna
                const sectionId = item.id.replace('menu-', '');   // 'dashboard' | 'analytics'...
                if (sectionId) {
                    const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                    this.activateSection(sectionName);
                }
            });
        });
    }

    /**
     * Gestiona el botón “Ir al Dashboard Editor”:
     * - Oculta los mensajes de error previos
     * - Pone el botón en estado “Cargando…” y lo deshabilita
     * - Simula una llamada asíncrona (1,5 s) con posibilidad de fallo (30 %)
     * - Redirige a Dashboard_Editor.html
     * - Si falla muestra error y restaura el botón
     */
    setupDashboardEvents() {
        const openEditorBtn = document.getElementById('open-editor');

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => {
                this.hideError('errorMessage');          // Limpia errores anteriores

                openEditorBtn.textContent = 'Cargando editor...';
                openEditorBtn.disabled = true;

                setTimeout(() => {
                    // 70 % éxito | 30 % fallo simulado
                    if (Math.random() > 0.3) {
                        window.location.href = '../HTML/Dashboard_Editor.html';
                    } else {
                        this.showError('⚠️ No se pudo abrir el editor, revise la conexión.', 'errorMessage');
                    }

                    // Restaura estado del botón
                    openEditorBtn.textContent = 'Ir al Dashboard Editor';
                    openEditorBtn.disabled = false;
                }, 1500);
            });
        }
    }

    /**
     * Configura los eventos relacionados con proyectos:
     *
     * Formulario de proyecto: Válida que el contenido no esté vacío antes de enviar
     * Botón Limpiar: Borra el contenido del formulario y restablece selecciones
     * Botón Vista Previa: Muestra una alerta con el contenido del proyecto si existe
     * Maneja errores con showError() & hideError()
     */
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

    /**
     * Gestiona eventos de tareas:
     *
     * Checkboxes: Alterna clase CSS para tareas completadas y actualiza estadísticas.
     * Botón Añadir Tarea: Redirige a la sección de tareas
     * Botón Eliminar: Elimina tareas completadas
     * Doble clic: Permite edición inline de tareas
     */
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

    /**
     * Configura eventos de ajustes:
     *
     * Formularios: Previene envío por defecto y maneja el submit
     * Validación de contraseñas: Comprueba coincidencia entre campos de contraseña
     * Cambia estilos visuales según validación
     */
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

    /**
     * Maneja eventos de la sección de ayuda:
     *
     * Registra en consola cuando se expanden secciones de ayuda
     * Detecta el evento 'toggle' en elementos <details>
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
     * Configura eventos globales:
     *
     * Ctrl+F: Enfoca el campo de búsqueda
     * Escape: Limpia búsqueda y resaltados
     */
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

    /**
     * Activa/desactiva secciones:
     *
     * Oculta todas las secciones excepto el objetivo
     * Aplica animaciones de transición
     * Actualiza clases CSS para el menú lateral
     * @param sectionId
     */

    activateSection(sectionId) {
        // Validar que la sección existe
        if (!this.sections.includes(sectionId)) {
            console.warn(`Sección "${sectionId}" no encontrada`);
            return;
        }

        // Ocultar todas las secciones
        document.querySelectorAll('main section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });

        const target = document.getElementById(sectionId);
        if (!target) {
            console.error(`Elemento con ID "${sectionId}" no encontrado en el DOM`);
            return;
        }

        // Mostrar la sección con animación
        target.style.display = 'block';
        target.classList.add('active-section');

        // Animación de entrada mejorada
        target.style.opacity = '0';
        target.style.transition = 'opacity 0.3s ease-in-out';

        requestAnimationFrame(() => {
            target.style.opacity = '1';
        });

        // Actualizar menú lateral
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });

        const menuItem = document.getElementById(`menu-${sectionId.toLowerCase()}`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }

    /**
     * Maneja la funcionalidad de búsqueda:
     *
     * Resalta términos coincidentes
     * Filtra secciones mostrando solo las relevantes
     * Muestra mensajes de error si no hay resultados
     */
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


    /**
     * Efecto de animación numérica:
     *
     * Interpola valores suavemente durante 1 segundo
     * Usado para el contador de tareas completadas
     * @param element
     * @param targetNumber
     */
    animateNumber(element, targetNumber) {
        if (!element) return;

        const start = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function para animación más suave
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (targetNumber - start) * easeOut;

            element.textContent = Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetNumber;
            }
        };

        requestAnimationFrame(updateNumber);
    }


    /**
     * Muestra/oculta los mensajes de error:
     *
     * Controla visualización y contenido
     * Permite especificar contenedor objetivo
     * @param message
     * @param targetId
     */
    showError(message, targetId = 'errorMessage') {
        const errorContainer = document.getElementById(targetId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            const isVisible = userMenu.style.display === 'block';
            userMenu.style.display = isVisible ? 'none' : 'block';
        }
    }

    handleProjectFormSubmit(event) {
        event.preventDefault();

        // Ocultar errores previos
        this.hideError();

        const nombre = document.getElementById('projectName').value.trim();
        const descripcion  = document.getElementById('projectDescription').value.trim();

        if (!nombre || !descripcion) {
            this.showError("Todos los campos son obligatorios.");
            return;
        }

        // Crear objeto del proyecto
        const projectData = {
            name: nombre,
            description: descripcion
        };


        console.log('Guardando proyecto:', projectData);

        // Guardar proyecto
        this.saveProject(projectData)
            .then(() => {
                // Mostrar éxito y limpiar formulario
                this.showSuccess();
                this.clearForm();
            })
            .catch(error => {
                // El error ya se maneja en saveProject
                console.error('Error en el flujo del formulario:', error);
            });
    }

    /**
     * Elimina las tareas realizadas
     * @returns {number}
     */
    removeCompletedTasks() {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter(task => {
            const {completed} = task;
            return !completed;
        });
        const removed = before - this.tasks.length;
        console.log(`Tareas Completadas Eliminadas: ${removed}`);
        return removed;
    }

    editTaskInline(row) {
        const taskText = row.querySelector('.task-text');
        if (!taskText) return;

        const currentText = taskText.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-edit-input';

        taskText.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                taskText.textContent = newText;
                this.showToast('Tarea actualizada', 'success');
            }
            input.replaceWith(taskText);
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    handleSettingsSubmit(form) {
        console.log('Settings form submitted:', form);
        this.saveSettings();
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

    saveSettings = () => {
        /**
         * Función para mostrar notificaciones al usuario
         * @param {string} message - Mensaje a mostrar
         * @param {string} type - Tipo de notificación (ej.: 'success', 'error')
         */
        const showNotification = (message, type) => {
            // Implementación básica usando alert().
            // En una aplicación real aquí iría el código para mostrar notificaciones en la UI
            this.showToast(message, type);
        };

        try {
            // Obtener y validar configuración de usuario
            const userSettings = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                preferences: document.getElementById('preferences').value.trim(),
                savedAt: console.date().toISOString()
            };

            if (!userSettings.username) {
                console.error('Por favor completa el nombre de usuario.');
            }
            if (!userSettings.email) {
                console.error('Por favor completa el correo electrónico.');
            }

            if (typeof userSettings.username !== 'string' || userSettings.username.trim() === '') {
                console.error('El nombre de usuario es obligatorio.');
            }
            if (typeof userSettings.email !== 'string' || userSettings.email.trim() === '') {
                console.error('El correo electrónico es obligatorio.');
            }

            // Validar formato de email básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userSettings.email)) {
                new Error('Por favor ingresa un correo electrónico válido.');
            }

            localStorage.setItem('userSettings', JSON.stringify(userSettings));
            console.log('User settings saved:', userSettings);

            // Obtener y validar configuración de aplicación
            const appSettings = {
                theme: document.getElementById('theme').value || '',
                language: document.getElementById('language').value || '',
                notifications: document.getElementById('notifications').checked
            };

            if (!appSettings.theme || !appSettings.language) {
                new Error('Por favor selecciona tema y lenguaje.');
            }

            localStorage.setItem('appSettings', JSON.stringify(appSettings));
            console.log('App settings saved:', appSettings);

            showNotification('Configuración guardada exitosamente', 'success');

        } catch (error) {
            console.error('Error al guardar configuración:', error);
            showNotification(error.message, 'error');
        }
    };

    /**
     * Actualiza estadísticas de tareas:
     *
     * Calcula porcentaje de completado
     * Anima la barra de progreso
     * Muestra notificación cuando todas están completadas
     */
    updateTaskStatistics() {
        const totalTasks = document.querySelectorAll('.task-checkbox').length;
        if (totalTasks === 0) return;

        const completedTasks = document.querySelectorAll('.task-checkbox:checked').length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);

        // Actualizar progress bar
        const progressBar = document.querySelector('progress');
        if (progressBar) {
            progressBar.value = percentage;
            this.animateNumber(document.querySelector('.task-counter'), completedTasks);
        }

        // Mostrar toast cuando se completen todas las tareas
        if (percentage === 100 && totalTasks > 0) {
            this.showToast('¡Todas las tareas completadas! 🎉', 'success');
        }
    }

    /**
     * Ocultar el mensaje de error
     */
    hideError() {
        const errorElement = document.getElementsByClassName('.error-msg');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = 'none';
        }

        const errorFields = document.querySelectorAll('.error-field');
        errorFields.forEach(field => {
            field.classList.remove('error-field');
        });
    }

    saveProject(projectData) {
        try {
            // Opción 1: Guardar en localStorage (para persistencia local)
            const existingProjects = JSON.parse(localStorage.getItem('Project')) || [];
            const newProject = {
                id: Date.now(), // ID único basado en timestamp
                ...projectData,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            existingProjects.push(newProject);
            localStorage.setItem('Project', JSON.stringify(existingProjects));

            // Opción 2: Enviar a una API (descomenta si usas backend)
            /*
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error('Error al guardar el proyecto');
            }

            return await response.json();
            */

            console.log('Proyecto guardado:', newProject);
            return newProject;

        } catch (error) {
            console.error('Error guardando proyecto:', error);
            this.showError('No se pudo guardar el proyecto. Intenta nuevamente.');
            throw error;
        }
    }

    clearForm() {
        // Limpiar los campos del formulario
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';

        this.hideError();
    }

    showSuccess() {
        // Mostrar mensaje de éxito
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.textContent = '¡Proyecto creado exitosamente!';
            successElement.style.display = 'block';

            // Ocultar automáticamente después de 5 segundos
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        } else {
            // Fallback: usar alert si no hay elemento en la UI
            alert('¡Proyecto creado exitosamente!');
        }

        // Opcional: Añadir clases de éxito visual
        const form = document.getElementById('add-project-content');
        if (form) {
            form.classList.add('success');
            setTimeout(() => form.classList.remove('success'), 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.dashboardApp = new DashboardApp();
    } catch (error) {
        console.error('Error al inicializar Dashboard:', error);
    }
});
