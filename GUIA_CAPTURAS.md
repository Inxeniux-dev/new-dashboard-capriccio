# Guía de Capturas de Pantalla - Manual de Usuario

## Instrucciones Generales

Este documento te indica exactamente qué capturas debes tomar y dónde colocarlas en el manual.

### Formato de las Capturas

- **Formato recomendado**: PNG
- **Resolución**: 1920x1080 (Full HD) o superior
- **Nombres de archivo**: Usa nombres descriptivos, ejemplo: `login-screen.png`, `dashboard-logistica.png`

### Ubicación de las Imágenes

Crea una carpeta en el proyecto:
```
/docs/images/manual/
```

Dentro de esta carpeta, organiza por secciones:
```
/docs/images/manual/
  /login/
  /logistica/
  /empleado/
  /general/
```

### Cómo Insertar las Imágenes

En el archivo `MANUAL_DE_USUARIO.md`, reemplaza cada marcador `[📸 CAPTURA: ...]` con:

```markdown
![Descripción de la imagen](./docs/images/manual/seccion/nombre-archivo.png)
```

---

## Checklist de Capturas Necesarias

### 🔐 SECCIÓN: Acceso al Sistema

#### 1. Pantalla de Login
**Archivo**: `login/login-screen.png`
**Qué capturar**:
- Pantalla completa del formulario de login
- Campos de email y contraseña visibles
- Botón "Iniciar Sesión"
- Link de "¿Olvidaste tu contraseña?"

**Ubicación en manual**: Línea ~30 después de "### Inicio de Sesión"

---

## 👨‍💼 SECCIÓN: Manual de Logística

### 2. Dashboard Principal Logística
**Archivo**: `logistica/dashboard-principal.png`
**Qué capturar**:
- Dashboard completo con todas las estadísticas
- Sidebar visible a la izquierda
- Las 4 tarjetas de estadísticas principales

**Ubicación en manual**: Línea ~56 después de "Al iniciar sesión..."

---

### 3. Página de Órdenes
**Archivo**: `logistica/ordenes-lista.png`
**Qué capturar**:
- Vista completa de la página de órdenes
- Lista de órdenes con filtros visibles
- Al menos 3-4 órdenes en pantalla

**Ubicación en manual**: Línea ~72 después de "**Funcionalidades:**"

---

### 4. Orden con Pago Pendiente
**Archivo**: `logistica/orden-pago-pendiente.png`
**Qué capturar**:
- Tarjeta de orden mostrando:
  - Badge amarillo "Pago pendiente"
  - Botón "Marcar como Pagado"
- Zoom a una sola orden para que se vea claro

**Ubicación en manual**: Línea ~80 después de "Antes de asignar..."

---

### 5. Modal de Confirmación de Pago
**Archivo**: `logistica/modal-confirmar-pago.png`
**Qué capturar**:
- Modal completo del componente PaymentStatusModal
- Los 4 botones de métodos de pago visibles
- Información de la orden en el header

**Ubicación en manual**: Línea ~92 después de "2. **Confirmar Pago:**"

---

### 6. Botón Asignar en Orden
**Archivo**: `logistica/boton-asignar-orden.png`
**Qué capturar**:
- Tarjeta de orden con badge verde "Pagado"
- Botón "Asignar" destacado
- Información completa de la orden

**Ubicación en manual**: Línea ~102 después de "**Método 1:**"

---

### 7. Modal de Detalles de Orden
**Archivo**: `logistica/modal-detalles-orden.png`
**Qué capturar**:
- Modal completo abierto
- Información del cliente visible
- Al menos 1-2 productos mostrados
- Scroll para mostrar que hay más contenido

**Ubicación en manual**: Línea ~114 después de "Haz clic en el botón..."

---

### 8. Productos en Detalle de Orden
**Archivo**: `logistica/productos-detalle.png`
**Qué capturar**:
- Sección de productos dentro del modal
- Al menos 2 productos con imágenes
- Precios y cantidades visibles

**Ubicación en manual**: Línea ~128 después de "- **Productos Solicitados:**"

---

### 9. Vista Completa del Módulo de Asignaciones
**Archivo**: `logistica/asignaciones-vista-completa.png`
**Qué capturar**:
- Pantalla completa del módulo
- Columna izquierda con órdenes sin asignar
- Al menos 2-3 tarjetas de sucursales a la derecha
- Estadísticas superiores visibles

**Ubicación en manual**: Línea ~150 después de "**Ubicación:**"

---

### 10. Estadísticas Superiores Asignaciones
**Archivo**: `logistica/asignaciones-estadisticas.png`
**Qué capturar**:
- Solo las 4 tarjetas de estadísticas en la parte superior
- "Sin Asignar", "En Proceso", "Completadas Hoy", "Sucursales Activas"

**Ubicación en manual**: Línea ~158 después de "**Estadísticas Superiores:**"

---

### 11. Columna de Órdenes Sin Asignar
**Archivo**: `logistica/ordenes-sin-asignar.png`
**Qué capturar**:
- Panel izquierdo con header "Órdenes Sin Asignar"
- Al menos 3 órdenes visibles
- Información completa de cada orden

**Ubicación en manual**: Línea ~167 después de "En el lado izquierdo..."

---

### 12. Orden con Pago Pendiente (Asignaciones)
**Archivo**: `logistica/asignaciones-pago-pendiente.png`
**Qué capturar**:
- Orden en la columna de sin asignar
- Badge amarillo "Pago pendiente"
- Botón "Marcar como Pagado" visible
- Zoom a la orden específica

**Ubicación en manual**: Línea ~183 después de "Si la orden muestra..."

---

### 13. Drag and Drop en Acción
**Archivo**: `logistica/drag-drop-accion.png`
**Qué capturar**:
- Orden siendo arrastrada (cursor visible)
- Tarjeta de sucursal con borde punteado
- Efecto visual de "arrastrando"

**Ubicación en manual**: Línea ~196 después de "**Paso 2:**"

---

### 14. Modal de Confirmación con Fecha
**Archivo**: `logistica/modal-confirmar-fecha.png`
**Qué capturar**:
- Modal completo de confirmación
- Información de orden, pago y sucursal
- Campo de fecha con asterisco rojo
- Botones "Cancelar" y "Confirmar"

**Ubicación en manual**: Línea ~207 después de "Automáticamente se abrirá..."

---

### 15. Orden en Columna de Sucursal
**Archivo**: `logistica/orden-asignada-sucursal.png`
**Qué capturar**:
- Tarjeta de sucursal con al menos 1 orden asignada
- Badge de estado visible
- Botones de acción (Ver, En Proceso, etc.)

**Ubicación en manual**: Línea ~227 después de "**Paso 4:**"

---

### 16. Tarjeta de Sucursal con Órdenes
**Archivo**: `logistica/tarjeta-sucursal.png`
**Qué capturar**:
- Una tarjeta completa de sucursal
- Header con nombre y contador
- Estadísticas (Total, Productos)
- 2-3 órdenes asignadas visibles

**Ubicación en manual**: Línea ~235 después de "En cada tarjeta..."

---

### 17. Botones de Acción en Orden
**Archivo**: `logistica/botones-accion-orden.png`
**Qué capturar**:
- Zoom a una orden asignada
- Los 4 botones de acción claramente visibles
- Íconos y labels legibles

**Ubicación en manual**: Línea ~247 después de "**Acciones sobre Órdenes:**"

---

### 18. Vista del Calendario Mensual
**Archivo**: `logistica/calendario-mensual.png`
**Qué capturar**:
- Calendario completo del mes
- Varios días con entregas resaltados
- Día actual marcado
- Filtro de sucursales en la parte superior

**Ubicación en manual**: Línea ~259 después de "**Ubicación:**"

---

### 19. Día del Calendario con Entregas
**Archivo**: `logistica/calendario-dia-entregas.png`
**Qué capturar**:
- Zoom a un día específico del calendario
- Contador de entregas visible
- Total del día mostrado

**Ubicación en manual**: Línea ~268 después de "**Elementos del Calendario:**"

---

### 20. Dropdown de Filtro de Sucursales
**Archivo**: `logistica/calendario-filtro.png`
**Qué capturar**:
- Dropdown de filtro expandido
- Lista de sucursales visible
- Opción "Todas las sucursales" seleccionada

**Ubicación en manual**: Línea ~279 después de "1. En la parte superior..."

---

### 21. Panel con Entregas del Día
**Archivo**: `logistica/calendario-entregas-dia.png`
**Qué capturar**:
- Panel derecho con lista de entregas
- Fecha seleccionada en el header
- Al menos 2-3 entregas visibles con toda su información

**Ubicación en manual**: Línea ~287 después de "1. Haz clic en cualquier día..."

---

### 22. Estadísticas del Mes
**Archivo**: `logistica/calendario-estadisticas.png`
**Qué capturar**:
- Las 4 tarjetas de estadísticas en la parte inferior
- Todas las métricas visibles

**Ubicación en manual**: Línea ~306 después de "En la parte inferior..."

---

### 23. Módulo de Conversaciones
**Archivo**: `logistica/conversaciones-vista.png`
**Qué capturar**:
- Vista completa del módulo
- Lista de conversaciones a la izquierda
- Ventana de chat a la derecha (puede estar vacía o con mensaje de selección)

**Ubicación en manual**: Línea ~317 después de "**Ubicación:**"

---

### 24. Lista de Conversaciones
**Archivo**: `logistica/conversaciones-lista.png`
**Qué capturar**:
- Panel izquierdo con varias conversaciones
- Diferentes plataformas visibles (WhatsApp, Instagram, etc.)
- Contadores de mensajes no leídos
- Últimos mensajes visibles

**Ubicación en manual**: Línea ~323 después de "**Panel Izquierdo:**"

---

### 25. Filtros de Plataforma
**Archivo**: `logistica/conversaciones-filtros.png`
**Qué capturar**:
- Barra de filtros en la parte superior
- Íconos de todas las plataformas
- Campo de búsqueda

**Ubicación en manual**: Línea ~335 después de "Usa los filtros..."

---

### 26. Ventana de Chat Activa
**Archivo**: `logistica/chat-conversacion.png`
**Qué capturar**:
- Ventana de chat con conversación activa
- Header con información del cliente
- Varios mensajes (del cliente y respuestas)
- Campo de entrada de texto en la parte inferior

**Ubicación en manual**: Línea ~346 después de "Al seleccionar una conversación:"

---

### 27. Tipos de Mensajes en Chat
**Archivo**: `logistica/chat-tipos-mensajes.png`
**Qué capturar**:
- Mensaje del cliente (izquierda)
- Mensaje de agente (derecha)
- Mensaje de IA con badge identificador
- Diferentes estilos visuales claros

**Ubicación en manual**: Línea ~362 después de "**Mensajes:**"

---

### 28. Campo para Enviar Mensaje
**Archivo**: `logistica/chat-enviar-mensaje.png`
**Qué capturar**:
- Campo de texto en la parte inferior
- Botones de adjuntar e imagen
- Botón de enviar

**Ubicación en manual**: Línea ~368 después de "1. Escribe tu mensaje..."

---

### 29. Toggle IA/Manual
**Archivo**: `logistica/chat-toggle-ia.png`
**Qué capturar**:
- Header del chat
- Toggle de IA/Manual claramente visible
- Estados: uno activado (verde) y hacer otra captura con desactivado (gris)
- Sugerencia: Toma 2 capturas, una en cada estado

**Ubicación en manual**: Línea ~378 después de "Puedes alternar..."

---

### 30. Dashboard de Estadísticas
**Archivo**: `logistica/estadisticas-dashboard.png`
**Qué capturar**:
- Vista completa del dashboard de estadísticas
- Gráficas visibles
- Métricas principales

**Ubicación en manual**: Línea ~396 después de "**Ubicación:**"

---

### 31. Gráficas de Rendimiento
**Archivo**: `logistica/estadisticas-graficas.png`
**Qué capturar**:
- Gráficas de rendimiento detalladas
- Leyendas visibles
- Datos representativos

**Ubicación en manual**: Línea ~400 después de "### Métricas Disponibles:"

---

## 👨‍🔧 SECCIÓN: Manual de Empleados

### 32. Dashboard Principal Empleado
**Archivo**: `empleado/dashboard-principal.png`
**Qué capturar**:
- Dashboard completo del empleado
- Header con saludo y sucursal destacada
- Tarjetas de estadísticas
- Lista de tareas visible

**Ubicación en manual**: Línea ~416 después de "Al iniciar sesión como empleado..."

---

### 33. Header con Información de Sucursal
**Archivo**: `empleado/header-sucursal.png`
**Qué capturar**:
- Zoom al header principal
- Saludo personalizado
- Badge de sucursal bien visible
- Calificación (estrellas)

**Ubicación en manual**: Línea ~423 después de "**Header Principal:**"

---

### 34. Tarjetas de Estadísticas Empleado
**Archivo**: `empleado/estadisticas-cards.png`
**Qué capturar**:
- Las 4 tarjetas principales
- Íconos y números grandes
- Porcentajes de cambio visibles

**Ubicación en manual**: Línea ~435 después de "Cuatro tarjetas muestran:"

---

### 35. Lista de Tareas
**Archivo**: `empleado/tareas-lista.png`
**Qué capturar**:
- Sección de tareas del dashboard
- Filtros de estado visibles
- Al menos 2-3 tareas con diferentes prioridades
- Código de colores claro

**Ubicación en manual**: Línea ~447 después de "**Filtros de Tareas:**"

---

### 36. Tarjeta de Tarea Individual
**Archivo**: `empleado/tarea-individual.png`
**Qué capturar**:
- Zoom a una tarjeta de tarea
- Toda la información visible:
  - Título
  - Descripción
  - Prioridad
  - Fecha límite
  - Botones de acción

**Ubicación en manual**: Línea ~459 después de "**Información de cada tarea:**"

---

### 37. Página de Mis Órdenes
**Archivo**: `empleado/mis-ordenes.png`
**Qué capturar**:
- Vista completa de la página
- Grid de órdenes
- Filtro de estados en la parte superior

**Ubicación en manual**: Línea ~477 después de "Aquí verás todas las órdenes..."

---

### 38. Dropdown de Filtro Estados
**Archivo**: `empleado/filtro-estados.png`
**Qué capturar**:
- Dropdown expandido
- Opciones: Todas, Asignadas, En Proceso, Completadas

**Ubicación en manual**: Línea ~483 después de "Puedes filtrar por:"

---

### 39. Tarjeta de Orden con Datos
**Archivo**: `empleado/orden-tarjeta.png`
**Qué capturar**:
- Tarjeta individual de orden
- Toda la información visible
- Botones de acción en la parte inferior

**Ubicación en manual**: Línea ~493 después de "Cada tarjeta muestra:"

---

### 40. Botones de Acción en Orden Empleado
**Archivo**: `empleado/orden-botones-accion.png`
**Qué capturar**:
- Parte inferior de la tarjeta de orden
- Los 3 botones: Ver Detalle, Iniciar, Completar
- Uno en cada estado si es posible

**Ubicación en manual**: Línea ~506 después de "### 2.3 Acciones sobre Órdenes"

---

### 41. Vista de Órdenes Pendientes
**Archivo**: `empleado/pendientes-vista.png`
**Qué capturar**:
- Página completa de pendientes
- Estadísticas superiores
- Grid de órdenes

**Ubicación en manual**: Línea ~516 después de "**Ubicación:**"

---

### 42. Estadísticas de Pendientes
**Archivo**: `empleado/pendientes-estadisticas.png`
**Qué capturar**:
- Las 2 tarjetas: Pendientes y En Proceso
- Números grandes visibles

**Ubicación en manual**: Línea ~522 después de "### 3.1 Estadísticas"

---

### 43. Orden con Botón Iniciar
**Archivo**: `empleado/orden-boton-iniciar.png`
**Qué capturar**:
- Orden con estado "Asignada"
- Botón "Iniciar" destacado

**Ubicación en manual**: Línea ~530 después de "**Para Órdenes Asignadas:**"

---

### 44. Orden con Botón Completar
**Archivo**: `empleado/orden-boton-completar.png`
**Qué capturar**:
- Orden con estado "En Proceso"
- Botón "Completar" destacado

**Ubicación en manual**: Línea ~539 después de "**Para Órdenes en Proceso:**"

---

### 45. Historial de Completadas
**Archivo**: `empleado/completadas-tabla.png`
**Qué capturar**:
- Tabla completa con órdenes completadas
- Headers de columna visibles
- Al menos 3-4 filas de datos

**Ubicación en manual**: Línea ~555 después de "Tabla completa mostrando:"

---

### 46. Estadísticas de Completadas
**Archivo**: `empleado/completadas-estadisticas.png`
**Qué capturar**:
- Las 3 tarjetas superiores
- Total Completadas, Completadas Hoy, Total Facturado

**Ubicación en manual**: Línea ~567 después de "### 4.2 Estadísticas..."

---

### 47. Acceso al Chat Empleado
**Archivo**: `empleado/chat-menu.png`
**Qué capturar**:
- Sidebar con opción "Chat con Clientes" resaltada
- Cursor sobre la opción

**Ubicación en manual**: Línea ~577 después de "**Ubicación:**"

---

### 48. Página de Notificaciones
**Archivo**: `empleado/notificaciones.png`
**Qué capturar**:
- Vista completa de notificaciones
- Header con contador de no leídas
- Botón "Marcar todas como leídas"

**Ubicación en manual**: Línea ~589 después de "**Ubicación:**"

---

### 49. Lista de Notificaciones con Tipos
**Archivo**: `empleado/notificaciones-tipos.png`
**Qué capturar**:
- Al menos 3 notificaciones
- Diferentes tipos: éxito (verde), advertencia (naranja), info (azul)
- Íconos claramente visibles

**Ubicación en manual**: Línea ~595 después de "**Iconos y Colores:**"

---

### 50. Notificación No Leída
**Archivo**: `empleado/notificacion-nueva.png`
**Qué capturar**:
- Notificación con borde azul
- Badge "Nuevo"
- Contraste con notificación leída al lado

**Ubicación en manual**: Línea ~606 después de "### 6.2 Gestión..."

---

### 51. Página de Mi Sucursal
**Archivo**: `empleado/sucursal-vista.png`
**Qué capturar**:
- Vista completa de la página
- Header con nombre de sucursal
- Todas las secciones visibles

**Ubicación en manual**: Línea ~616 después de "**Ubicación:**"

---

### 52. Datos de Contacto Sucursal
**Archivo**: `empleado/sucursal-contacto.png`
**Qué capturar**:
- Sección de información de contacto
- Todos los datos con íconos
- Dirección, teléfono, gerente

**Ubicación en manual**: Línea ~622 después de "Verás toda la información..."

---

### 53. Tabla de Horarios
**Archivo**: `empleado/sucursal-horarios.png`
**Qué capturar**:
- Tabla de horarios completa
- Todos los días de la semana
- Formato claro y legible

**Ubicación en manual**: Línea ~639 después de "Tabla con los horarios..."

---

### 54. Estadísticas de Sucursal
**Archivo**: `empleado/sucursal-estadisticas.png`
**Qué capturar**:
- Las 4 tarjetas de métricas
- Íconos de colores
- Números y porcentajes

**Ubicación en manual**: Línea ~648 después de "Métricas de tu sucursal:"

---

### 55. Dashboard de Métricas Personales
**Archivo**: `empleado/metricas-dashboard.png`
**Qué capturar**:
- Vista completa de la página de métricas
- Header con calificación grande
- Todas las secciones visibles

**Ubicación en manual**: Línea ~660 después de "**Ubicación:**"

---

### 56. Header con Calificación
**Archivo**: `empleado/metricas-header.png`
**Qué capturar**:
- Header de la página de métricas
- Estrella y calificación grande
- Título y subtítulo

**Ubicación en manual**: Línea ~666 después de "En la parte superior:"

---

### 57. Tarjetas de Métricas
**Archivo**: `empleado/metricas-cards.png`
**Qué capturar**:
- Las 4 tarjetas principales
- Íconos, números y porcentajes de cambio
- Colores diferentes para cada métrica

**Ubicación en manual**: Línea ~676 después de "Cuatro tarjetas principales:"

---

### 58. Barras de Progreso
**Archivo**: `empleado/metricas-progreso.png`
**Qué capturar**:
- Sección de progreso mensual
- Las 4 barras de progreso
- Porcentajes y labels claramente visibles
- Colores diferentes para cada barra

**Ubicación en manual**: Línea ~689 después de "Gráficos de barra..."

---

### 59. Tarjetas de Logros
**Archivo**: `empleado/logros-tarjetas.png`
**Qué capturar**:
- Sección de logros recientes
- Las 3 tarjetas de logros con emojis
- Títulos, descripciones y fechas

**Ubicación en manual**: Línea ~703 después de "Últimos logros..."

---

## 📝 Checklist de Revisión

Antes de dar por terminadas las capturas, verifica:

- [ ] Todas las capturas están en resolución Full HD o superior
- [ ] Las capturas están enfocadas y no borrosas
- [ ] Los textos son legibles
- [ ] Se ven los colores del tema (dark/light según corresponda)
- [ ] No hay información sensible (contraseñas, datos reales de clientes)
- [ ] Los nombres de archivo siguen la convención
- [ ] Todas las capturas están en las carpetas correctas

---

## 🎨 Recomendaciones de Captura

### Para Mejor Calidad:

1. **Usa un monitor/pantalla de buena calidad**
2. **Aumenta el zoom del navegador si es necesario** (Ctrl/Cmd + +)
3. **Desactiva extensiones del navegador** que puedan aparecer en las capturas
4. **Usa modo incógnito** para evitar extensiones
5. **Limpia notificaciones** del sistema antes de capturar

### Herramientas Recomendadas:

- **Windows**: Snipping Tool, ShareX
- **Mac**: Cmd + Shift + 4, CleanShot X
- **Linux**: Flameshot, Spectacle
- **Todas**: OBS Studio, Lightshot

### Edición Básica:

Si necesitas resaltar algo en las capturas:
- Usa **flechas rojas** para señalar elementos importantes
- Usa **cuadros rojos** para delimitar áreas específicas
- Mantén las anotaciones **mínimas y claras**

---

## 📊 Progreso de Capturas

Total de capturas necesarias: **59**

Marca cada una conforme las vayas tomando:

### Acceso al Sistema: 1/1
- [ ] 1. Login

### Logística: 31/31
- [ ] 2-32. (Ver lista arriba)

### Empleado: 27/27
- [ ] 33-59. (Ver lista arriba)

---

**Última actualización**: 27 de Octubre, 2025
