# ALESE CORP - Portal Empresarial

Sistema de login empresarial para ALESE CORP desarrollado con React, TypeScript, Tailwind CSS y shadcn/ui.

## Características

- ✨ Diseño moderno y profesional
- 🎨 Sistema de diseño corporativo con colores de ALESE
- 📱 Completamente responsive
- 🔐 Validación de formularios
- 🎭 Animaciones suaves
- 🌙 Soporte para modo oscuro
- ⚡ Alto rendimiento con Vite
- 🔧 TypeScript para mayor seguridad

## Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI reutilizables
- **Lucide React** - Iconos modernos
- **Sonner** - Notificaciones elegantes
- **Vite** - Herramienta de desarrollo rápida

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Construir para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base de shadcn/ui
│   └── LoginForm.tsx    # Componente principal de login
├── pages/
│   ├── Index.tsx        # Página principal
│   └── NotFound.tsx     # Página 404
├── hooks/
│   └── use-toast.ts     # Hook para notificaciones
├── lib/
│   └── utils.ts         # Utilidades
├── App.tsx              # Componente raíz
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## Colores Corporativos

El sistema de diseño está basado en los colores oficiales de ALESE CORP:

- **Primary**: `hsl(212 72% 35%)` - Azul corporativo
- **Primary Hover**: `hsl(212 72% 30%)` - Azul corporativo oscuro
- **Primary Light**: `hsl(212 72% 88%)` - Azul corporativo claro

## Licencia

© 2024 ALESE CORP - Todos los derechos reservados
