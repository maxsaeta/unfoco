# UnPaso 🎯

**Una app que convierte la parálisis por sobrecarga en acción inmediata.**

## El Problema

Personas con TDAH se enfrentan diariamente a:
- Listas interminables de tareas
- Incertidumbre por dónde empezar
- Procrastinación por sobrecarga cognitiva
- Culpabilidad al final del día

## Nuestra Solución

**UnPaso** muestra UNA sola tarea a la vez. Sin listas abrumadoras, sin notificaciones constantes, sin distracciones.

### Características Principales

| Feature | Descripción |
|---------|-------------|
| 🎯 **Enfoque Único** | Solo ves UNA tarea en pantalla |
| ⏱️ **Timer Pomodoro** | 25 min trabajo / 5 min descanso |
| ✂️ **Desglose Automático** | Tarea grande → micro-pasos de 5 min |
| 📊 **Progreso Visual** | Checklist de tareas completadas |

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Firestore, Auth, Analytics)
- **Diseño**: Figma
- **Estado**: React Hooks + Context

## Estructura del Proyecto

```
unfoco/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── TaskCard.tsx
│   │   ├── Timer.tsx
│   │   └── ActionButton.tsx
│   ├── screens/         # Pantallas de la app
│   │   └── HomeScreen.tsx
│   ├── hooks/           # Custom hooks
│   │   └── useTimer.ts
│   ├── utils/           # Utilidades
│   └── constants/       # Constantes y theme
│       └── theme.ts
├── assets/              # Iconos e imágenes
├── design/              # Prototipos y diseños
│   └── mobile-preview.html
├── App.tsx              # Entry point
└── package.json
```

## Getting Started

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## Modelo de Negocio

### Tier 1: Gratis
- 3 tareas activas
- Timer Pomodoro básico
- Estadísticas 7 días

### Tier 2: Premium ($4.99/mes)
- Tareas ilimitadas
- Desglose automático
- Todos los sonidos
- Estadísticas completas

## Roadmap

- [ ] MVP: Core features (8 semanas)
- [ ] Fase 2: Gamificación y sonidos
- [ ] Fase 3: Widgets Android
- [ ] Fase 4: Monetización

## License

MIT