document.addEventListener("DOMContentLoaded", () => {
    const widgetsContainer = document.getElementById("widgets-container");
    const template = document.getElementById("widget-template");

    function handleAddWidget(type) {
        const widget = template.content.cloneNode(true);
        const article = widget.querySelector("article");

        switch (type) {
            case "chart":
                article.querySelector("h3").textContent = "📊 Nuevo Gráfico";
                article.querySelector("p").textContent =
                    "Visualización de datos en formato gráfico.";
                break;
            case "table":
                article.querySelector("h3").textContent = "📋 Nueva Tabla";
                article.querySelector("p").textContent =
                    "Estructura tabular de datos importantes.";
                break;
            case "text":
                article.querySelector("h3").textContent = "📝 Nota";
                article.querySelector("p").textContent =
                    "Texto libre para observaciones o recordatorios.";
                break;
        }

        widgetsContainer.appendChild(widget);
    }

    function handleChangeColors() {
        document.body.classList.toggle("dark-mode");
    }

    function handleSave() {
        alert("📥 Dashboard guardado correctamente");
    }

    function handleLoad() {
        alert("📂 Dashboard cargado correctamente");
    }

    function handlePreviewMode() {
        document.body.classList.toggle("preview");
    }

    function handleFilter() {
        alert("🔍 Filtro aplicado");
    }

    function handleProjectSelection(project) {
        alert(`📁 Proyecto seleccionado: ${project}`);
    }

    function handleWidgetAction(action, widget) {
        switch (action) {
            case "preview":
                alert("👁️ Vista previa del widget");
                break;
            case "analyze":
                alert("🔍 Analizando datos del widget");
                break;
            case "download":
                alert("⬇️ Descargando widget");
                break;
        }
    }

    document.addEventListener("click", (e) => {
        const target = e.target;

        if (target.matches("[data-type='chart']")) handleAddWidget("chart");
        if (target.matches("[data-type='table']")) handleAddWidget("table");
        if (target.matches("[data-type='text']")) handleAddWidget("text");
        if (target.matches("[data-type='color']")) handleChangeColors();
        if (target.matches("#saveDashboard")) handleSave();
        if (target.matches("#loadDashboard")) handleLoad();
        if (target.matches("#previewMode")) handlePreviewMode();
        if (target.matches("[data-type='filter']")) handleFilter();

        if (target.matches(".project-btn")) {
            handleProjectSelection(target.dataset.project);
        }

        if (target.matches(".card-btn")) {
            const action = target.dataset.action;
            const widget = target.closest(".widget, .preview-card");
            handleWidgetAction(action, widget);
        }
    });

    document.addEventListener("change", (e) => {
        const target = e.target;
        if (target.name === "metric") {
            console.log("Métrica cambiada:", target.value, target.checked);
        }
        if (target.name === "priority") {
            console.log("Filtro de prioridad:", target.value, target.checked);
        }
        if (target.name === "colorScheme") {
            console.log("Esquema de colores:", target.value);
        }
        if (target.name === "fontSelect") {
            document.body.style.fontFamily = target.value;
        }
        if (target.name === "chartSelect") {
            console.log("Tipo de gráfica:", target.value);
        }
        if (target.type === "date") {
            console.log("Fecha seleccionada:", target.value);
        }
        if (target.name === "device") {
            console.log("Dispositivo:", target.value);
        }
        if (target.name === "region") {
            console.log("Región:", target.value);
        }
    });

    let dragged = null;

    document.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("widget")) {
            dragged = e.target;
            e.target.classList.add("dragging");
        }
    });

    document.addEventListener("dragend", (e) => {
        if (e.target.classList.contains("widget")) {
            e.target.classList.remove("dragging");
            dragged = null;
        }
    });

    document.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.target.closest(".widget")) {
            const container = widgetsContainer;
            const ref = e.target.closest(".widget");
            container.insertBefore(dragged, ref);
        }
    });

    document.addEventListener("drop", (e) => {
        e.preventDefault();
    });

    const form = document.getElementById("add-project-content");
    const targetSelect = document.getElementById("target-card");
    const contentInput = document.getElementById("new-content");
    const dashboard = document.querySelector(".dashboard");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const targetId = targetSelect.value;
        const newContent = contentInput.value.trim();
        if (targetId && newContent) {
            const card = document.getElementById(targetId);
            const list = card.querySelector("ul");
            const li = document.createElement("li");
            li.textContent = newContent;
            list.appendChild(li);
            contentInput.value = "";
        }
    });

    dashboard.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            const action = e.target.dataset.action;
            const parentCard = e.target.closest(".card");
            if (action === "clear") {
                parentCard.querySelector("ul").innerHTML = "";
            } else if (action === "remove") {
                parentCard.remove();
            }
        }
    });
});
