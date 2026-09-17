# Guía: Formulario de Seguridad de Datos - Google Play Console
## App: UnPaso

---

## 1. ¿Qué datos recopila tu app?

### Información de la cuenta
| Tipo de dato | ¿Se recopila? | ¿Se comparte con terceros? | Propósito |
|-------------|---------------|---------------------------|-----------|
| Dirección de correo electrónico | ✅ Sí | ❌ No | Creación de cuenta, inicio de sesión |
| Contraseña | ✅ Sí | ❌ No | Autenticación (hasheada, no legible) |
| Nombre | ❌ No | ❌ No | — |
| Foto de perfil | ❌ No | ❌ No | — |

### Contenido del usuario
| Tipo de dato | ¿Se recopila? | ¿Se comparte con terceros? | Propósito |
|-------------|---------------|---------------------------|-----------|
| Títulos de tareas | ✅ Sí | ✅ Sí (Google Gemini) | Funcionalidad de la app + Generación de IA |
| Pasos de tareas | ✅ Sí | ❌ No | Funcionalidad de la app |
| Estado de completado | ✅ Sí | ❌ No | Seguimiento de progreso |
| Timestamps | ✅ Sí | ❌ No | Historial de tareas |

### Datos de actividad de la app
| Tipo de dato | ¿Se recopila? | ¿Se comparte con terceros? | Propósito |
|-------------|---------------|---------------------------|-----------|
| Pomodoros completados | ✅ Sí | ❌ No | Estadísticas de productividad |
| Tareas completadas | ✅ Sí | ❌ No | Estadísticas de productividad |
| Minutos de concentración | ✅ Sí | ❌ No | Estadísticas de productividad |
| Racha de días | ✅ Sí | ❌ No | Gamificación |

### Configuración de la app
| Tipo de dato | ¿Se recopila? | ¿Se comparte con terceros? | Propósito |
|-------------|---------------|---------------------------|-----------|
| Minutos de trabajo | ✅ Sí | ❌ No | Configuración del temporizador |
| Minutos de descanso | ✅ Sí | ❌ No | Configuración del temporizador |

---

## 2. Propósitos de recopilación de datos

Selecciona en Google Play Console:

- [x] **Funcionalidad de la app** — Tareas, pasos, temporizador, estadísticas
- [x] **Gestión de cuenta** — Email, contraseña, autenticación
- [x] **Contenido generado por IA** — Generación de pasos con Google Gemini

NO seleccionar:
- [ ] Analíticas
- [ ] Publicidad
- [ ] Marketing
- [ ] Personalización
- [ ] Prevención de fraudes

---

## 3. ¿Compartes datos con terceros?

**Respuesta: SÍ**

### Terceros con los que se comparten datos:

| Tercer proveedor | Propósito | Datos compartidos | Política de privacidad |
|-----------------|-----------|-------------------|----------------------|
| **Google Firebase** | Autenticación, base de datos en la nube | Email, contraseña (hasheada), tareas, estadísticas, configuración | https://firebase.google.com/support/privacy |
| **Google Gemini AI** | Generación de pasos de tareas con IA | Títulos de tareas (transitoriamente) | https://policies.google.com/privacy |

**¿Se venden datos?** NO
**¿Se usan datos para publicidad?** NO
**¿Se usan datos para rastreo?** NO

---

## 4. Seguridad de los datos

- [x] **Los datos se transmiten de forma encriptada** — Sí, Firebase y Gemini usan HTTPS/TLS
- [x] **Los datos se almacenan de forma encriptada** — Sí, Firebase/Google Cloud encriptación en reposo
- [x] **Puedes solicitar eliminación de datos** — Sí, desde la app

---

## 5. Eliminación de cuenta y datos

- [x] **Ofreces una forma de que los usuarios eliminen su cuenta** — SÍ
- [x] **Hay un proceso claro dentro de la app** — SÍ (botón "Eliminar Cuenta" en el footer)
- [x] **Hay un enlace web para eliminar la cuenta** — SÍ (disponible en la app)
- [x] **La eliminación es permanente** — SÍ, todos los datos se eliminan de Firestore y Firebase Auth

### Proceso de eliminación:
1. Usuario toca "Eliminar Cuenta" en el footer
2. Se muestra modal con advertencia
3. Usuario escribe "ELIMINAR" para confirmar
4. Se eliminan: tareas, estadísticas, configuración, cuenta de autenticación
5. La acción es irreversible

---

## 6. Uso de Inteligencia Artificial

- [x] **La app genera contenido con IA** — SÍ (Google Gemini)
- [x] **Los usuarios pueden reportar contenido de IA** — SÍ (botón "Reportar" en footer)
- [x] **El reporte se puede hacer desde la app** — SÍ (modal ReportAIModal)

### Datos enviados a la IA:
- Solo el título de la tarea (texto que ingresa el usuario)
- Los datos NO se almacenan permanentemente en los servidores de Google

---

## 7. Permisos de Android

Declarar en Google Play Console:

| Permiso | Uso |
|---------|-----|
| `android.permission.VIBRATE` | Vibración al completar Pomodoro |

---

## 8. URLs para Google Play Console

| Campo | URL |
|-------|-----|
| **Política de Privacidad** | https://1paso.netlify.app/legal/privacy.html |
| **Términos de Uso** | https://1paso.netlify.app/legal/terms.html |

---

## 9. Checklist completo

### En la app:
- [x] Política de Privacidad accesible desde el footer
- [x] Eliminación de cuenta funcional
- [x] Botón de reporte de contenido IA
- [x] Disclosure de uso de IA en el footer
- [x] Permisos declarados

### En Google Play Console:
- [ ] Completar formulario de Seguridad de Datos
- [ ] Subir Política de Privacidad
- [ ] Declarar permisos
- [ ] Completar sección de IA

---

## Notas importantes

1. **No incluir Google Analytics** — La app no inicializa analytics explícitamente
2. **No incluir publicidad** — La app no tiene ads
3. **No incluir rastreo** — La app no rastrea usuarios para publicidad
4. **Firebase Analytics** — Es una dependencia transitiva pero NO está inicializada explícitamente. Si Google preguntas, indica que no se usa para recopilar datos analíticos
