document.addEventListener("DOMContentLoaded", (e) => {
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target.matches("#addChart")) {
            console.log("Agregar gráfico");
        }
        else if (target.matches("#addTable")) {
            console.log("Agregar tabla");
        }
        else if (target.matches("#addText")) {
            console.log("Agregar texto");
        }
        else if (target.matches("#changeColors")) {
            console.log("Cambiar colores");
        }
        else if (target.matches("#addFilter")) {
            console.log("Agregar filtro");
        }
        else if (target.matches("#saveDashboard")) {
            console.log("Guardar dashboard");
        }
        else if (target.matches("#loadDashboard")) {
            console.log("Cargar dashboard");
        }
        else if (target.matches("#previewMode")) {
            console.log("Vista previa");
        }
        else if (target.matches(".project-btn")) {
            console.log("Proyecto:", target.dataset.project);
        } else if (target.matches(".card-btn")) {
            console.log("Acción en tarjeta:", target.textContent.trim());
        }
    });

    document.addEventListener("change", (e) => {
        const target = e.target;

        if (target.matches("input[type='checkbox']")) {
            console.log("Checkbox cambiado:", target.name, target.value, target.checked);
        }

        else if (target.matches("select")) {
            console.log("Select cambiado:", target.name, target.value);
        }

        else if (target.matches("input[type='date']")) {
            console.log("Fecha cambiada:", target.name, target.value);
        }
    });

    document.addEventListener("dragstart", (e) => {
        if (e.target.matches(".widget[draggable='true']")) {
            console.log("Drag start widget:", e.target.querySelector("h3")?.textContent);
        }
    });

    document.addEventListener("dragover", (e) => {
        if (e.target.matches("#widgets-container")) {
            e.preventDefault(); // necesario para permitir drop
        }
    });

    document.addEventListener("drop", (e) => {
        if (e.target.matches("#widgets-container")) {
            e.preventDefault();
            console.log("Widget soltado en contenedor");
        }
    });

    const canvas = document.getElementById("dashboardCanvas");
    if (canvas) {
        canvas.addEventListener("click", (e) => {
            console.log("Canvas click:", e.offsetX, e.offsetY);
        });
        canvas.addEventListener("mousemove", (e) => {
            console.log("Canvas mousemove:", e.offsetX, e.offsetY);
        });
    }
});
