// imagenes/api/tasks.js

let mockTasks = [
    { id: 1, title: "Tarea 1", completed: false },
    { id: 2, title: "Tarea 2", completed: true },
    { id: 3, title: "Tarea 3", completed: false },
];

// GET: Obtener todas las tareas
export function fetchTasks() {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...mockTasks]), 500);
    });
}

// POST: Agregar nueva tarea
export function addTask(task) {
    return new Promise((resolve) => {
        const newTask = { id: mockTasks.length + 1, ...task };
        mockTasks.push(newTask);
        setTimeout(() => resolve(newTask), 300);
    });
}

// PATCH: Marcar tarea como completada
export function toggleTask(id) {
    return new Promise((resolve, reject) => {
        const task = mockTasks.find((t) => t.id === id);
        if (!task) return reject("Tarea no encontrada");
        task.completed = !task.completed;
        setTimeout(() => resolve(task), 300);
    });
}

// DELETE: Eliminar tarea
export function deleteTask(id) {
    return new Promise((resolve, reject) => {
        const index = mockTasks.findIndex((t) => t.id === id);
        if (index === -1) return reject("Tarea no encontrada");
        const deleted = mockTasks.splice(index, 1);
        setTimeout(() => resolve(deleted[0]), 300);
    });
}
