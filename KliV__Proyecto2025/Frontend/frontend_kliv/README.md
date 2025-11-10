# Task Manager Pro - React + Vite + Tailwind + SCSS

Este proyecto es una **aplicación de gestión de tareas** desarrollada con **React** y **Vite**, optimizada para desarrollo rápido y escalable. Incluye un panel de usuario, autenticación, gestión de temas (modo claro/oscuro) y componentes reutilizables.

---

## Características principales

- **React con Vite:** configuración mínima para HMR (Hot Module Replacement) y compilación rápida.
- **Rutas y navegación:** implementadas con `react-router-dom`, incluyendo `Home`, `Login`, `Register` y `Dashboard`.
- **Autenticación:** hooks personalizados (`useAuth`) para manejar login, logout y redirecciones automáticas.
- **Modo oscuro dinámico:** usando `ThemeContext` y clases `dark/light` en `<body>`.
- **SCSS global y modular:** con variables, mixins y base de estilos unificada (`index.scss`) para consistencia de UI.
- **TailwindCSS integrado:** con configuración extendida de colores, tipografía, sombras y bordes, compatible con SCSS.
- **Componentes reutilizables:** `Navbar`, `Cards`, `Botones` estilizados con Tailwind y SCSS.
- **Animaciones:** utilizando `Framer Motion` para transiciones suaves en componentes y páginas.
- **Responsive:** diseño adaptativo para móviles y tablets.
- **Validación de formularios:** login y registro con mensajes de error y feedback visual.
- **Configuración moderna de Vite:** 
  - Alias para carpetas (`@components`, `@pages`, `@contexts`, `@styles`, `@data`).
  - SCSS global disponible en todos los componentes.
  - Integración con PostCSS para Tailwind y autoprefixer.

---

## Estructura de carpetas
src/
├─ components/ # Componentes reutilizables (Navbar, Cards, etc.)
├─ pages/ # Páginas principales (Home, Login, Register, Dashboard)
├─ contexts/ # Contextos de React (ThemeContext, AuthContext)
├─ styles/ # SCSS global y específicos de páginas
├─ data/ # Archivos de datos o mock
├─ hooks/ # Hooks personalizados (useAuth, useTheme)
├─ App.jsx # Componente principal con rutas
├─ main.jsx # Entrada de Vite


---

## Tecnologías utilizadas

- [React 18+](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [SCSS](https://sass-lang.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router DOM](https://reactrouter.com/)
- [PostCSS & Autoprefixer](https://postcss.org/)

---

## Configuración del proyecto

1. **Instalación de dependencias:**

```bash
npm install
