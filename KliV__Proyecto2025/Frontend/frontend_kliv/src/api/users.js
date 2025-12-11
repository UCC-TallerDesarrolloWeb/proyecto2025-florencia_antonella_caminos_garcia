// imagenes/api/users.js
// noinspection GrazieInspection

/**
 * Mock de usuarios para la aplicación.
 * Funciona como un backend simulado.
 */

let mockUsers = [
    { id: 1, name: "Admin", email: "admin@kliv.com", password: "123456" },
    { id: 2, name: "Usuario", email: "user@kliv.com", password: "abcdef" },
];

/**
 * Obtener todos los usuarios (sin passwords)
 */
export function fetchAllUsers() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockUsers.map(({ password, ...user }) => user));
        }, 400);
    });
}

/**
 * Obtener un usuario por email y password (login)
 */
export function loginUser({ email, password }) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(
                (u) => u.email === email && u.password === password
            );
            if (user) {
                // Retornar sin password
                const { password, ...userData } = user;
                resolve(userData);
            } else {
                reject("Email o contraseña incorrectos");
            }
        }, 500);
    });
}

/**
 * Registrar un nuevo usuario
 */
export function registerUser({ name, email, password }) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const exists = mockUsers.some((u) => u.email === email);
            if (exists) return reject("El usuario ya existe");

            const newUser = {
                id: mockUsers.length + 1,
                name,
                email,
                password,
            };

            mockUsers.push(newUser);

            const { password: pwd, ...userData } = newUser;
            resolve(userData);
        }, 500);
    });
}

/**
 * Actualizar usuario por id
 */
export function updateUser(id, updates) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex((u) => u.id === id);
            if (userIndex === -1) return reject("Usuario no encontrado");

            mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };

            const { password, ...userData } = mockUsers[userIndex];
            resolve(userData);
        }, 400);
    });
}

/**
 * Eliminar usuario por id
 */
export function deleteUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockUsers.findIndex((u) => u.id === id);
            if (index === -1) return reject("Usuario no encontrado");

            const deletedUser = mockUsers.splice(index, 1)[0];
            const { password, ...userData } = deletedUser;
            resolve(userData);
        }, 400);
    });
}
