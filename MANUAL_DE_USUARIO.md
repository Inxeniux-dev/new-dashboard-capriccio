# Manual de Usuario - Dashboard Capriccio CRM

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Manual para Usuarios de Logística](#manual-para-usuarios-de-logística)
4. [Manual para Empleados](#manual-para-empleados)
5. [Preguntas Frecuentes](#preguntas-frecuentes)
6. [Soporte Técnico](#soporte-técnico)

---

## Introducción

Bienvenido al Dashboard de Capriccio CRM, un sistema integral para la gestión de órdenes, conversaciones con clientes y operaciones de logística.

Este manual está diseñado para ayudarte a aprovechar al máximo las funcionalidades del sistema según tu rol.

### Tipos de Usuario

- **Logística**: Personal encargado de gestionar órdenes, asignaciones a sucursales y conversaciones con clientes.
- **Empleado**: Personal de sucursal que ejecuta las órdenes asignadas y gestiona entregas.

---

## Acceso al Sistema

### Inicio de Sesión

**[📸 CAPTURA: Pantalla de login con campos de email y contraseña]**

1. Accede a la URL del sistema: `https://tu-dashboard.capriccio.com`
2. Ingresa tu correo electrónico corporativo
3. Ingresa tu contraseña
4. Haz clic en **"Iniciar Sesión"**

### Recuperación de Contraseña

Si olvidaste tu contraseña:
1. Haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu correo electrónico
3. Revisa tu bandeja de entrada
4. Sigue las instrucciones del correo

---

# Manual para Usuarios de Logística

## 1. Dashboard Principal

Al iniciar sesión, verás el dashboard principal con información resumida.

**[📸 CAPTURA: Dashboard principal de logística mostrando las estadísticas]**

### Elementos del Dashboard:

1. **Órdenes Pendientes**: Número total de órdenes sin asignar
2. **Conversaciones Activas**: Chats activos con clientes
3. **Entregas Hoy**: Órdenes programadas para entrega hoy
4. **Accesos Rápidos**: Botones para acciones frecuentes

---

## 2. Gestión de Órdenes

### 2.1 Ver Todas las Órdenes

**[📸 CAPTURA: Página de órdenes con lista de órdenes pendientes]**

**Ubicación:** Sidebar → Logística → Órdenes

**Funcionalidades:**
- Ver lista completa de órdenes
- Filtrar por estado (Sin asignar / Asignadas)
- Ver detalles de cada orden
- Asignar órdenes a sucursales

### 2.2 Verificar Estado de Pago

**[📸 CAPTURA: Tarjeta de orden mostrando advertencia de pago pendiente]**

Antes de asignar una orden, debes verificar que esté pagada:

1. **Indicador de Pago Pendiente**:
   - Badge amarillo con texto "Pago pendiente"
   - Botón **"Marcar como Pagado"**

2. **Confirmar Pago:**
   - Haz clic en **"Marcar como Pagado"**
   - Selecciona el método de pago:
     - 💵 Efectivo
     - 💳 Transferencia
     - 💳 Tarjeta
     - 📄 Otro

**[📸 CAPTURA: Modal de confirmación de pago con opciones]**

3. Haz clic en **"Confirmar Pago"**
4. El sistema actualizará el estado y mostrará el badge verde **"Pagado"**

### 2.3 Asignar Orden a Sucursal

**Método 1: Desde la Lista de Órdenes**

**[📸 CAPTURA: Botón "Asignar" en tarjeta de orden]**

1. Busca la orden que deseas asignar
2. Verifica que esté pagada (badge verde)
3. Haz clic en **"Asignar"**
4. Selecciona la sucursal del dropdown
5. Selecciona la fecha de entrega
6. Haz clic en **"Confirmar Asignación"**

**Método 2: Desde el Módulo de Asignaciones** (Recomendado)

Ver sección [3. Gestión de Asignaciones](#3-gestión-de-asignaciones-drag--drop)

### 2.4 Ver Detalles de Orden

**[📸 CAPTURA: Modal de detalles de orden con información completa]**

Haz clic en el botón **👁️ Ver Detalle** para ver:

- **Información del Cliente:**
  - Nombre completo
  - Teléfono de contacto
  - Email (si disponible)
  - Dirección de entrega completa
  - Plataforma de origen (WhatsApp, Instagram, etc.)

- **Productos Solicitados:**
  - Imagen del producto
  - Nombre y descripción
  - Marca y SKU
  - Cantidad
  - Precio unitario y total

**[📸 CAPTURA: Sección de productos dentro del modal de detalles]**

- **Resumen Financiero:**
  - Subtotal
  - IVA (16%)
  - Total a pagar
  - Método de pago utilizado

- **Información de la Orden:**
  - Estado actual
  - Fecha de creación
  - Fecha de entrega programada
  - Notas especiales

---

## 3. Gestión de Asignaciones (Drag & Drop)

**[📸 CAPTURA: Vista completa del módulo de asignaciones con columnas]**

**Ubicación:** Sidebar → Logística → Asignaciones

Este es el módulo principal para asignar órdenes a sucursales de manera visual e intuitiva.

### 3.1 Interfaz del Módulo

**[📸 CAPTURA: Vista de las estadísticas superiores]**

**Estadísticas Superiores:**
- 📦 **Sin Asignar**: Órdenes que necesitan asignación
- 🚚 **En Proceso**: Órdenes actualmente en preparación
- ✅ **Completadas Hoy**: Entregas completadas hoy
- 🏢 **Sucursales Activas**: Sucursales con órdenes asignadas

### 3.2 Columna de Órdenes Sin Asignar

**[📸 CAPTURA: Columna izquierda con órdenes sin asignar]**

En el lado izquierdo verás todas las órdenes que aún no han sido asignadas a ninguna sucursal.

**Información de cada orden:**
- Número de orden
- Nombre del cliente
- Total a pagar
- Cantidad de productos
- Fecha de creación
- Estado de pago (badge verde si pagada, amarillo si pendiente)

### 3.3 Asignar Orden con Drag & Drop

**Paso 1: Verificar Pago**

Si la orden muestra **"Pago pendiente"**:

**[📸 CAPTURA: Orden con indicador de pago pendiente y botón]**

1. Haz clic en **"Marcar como Pagado"**
2. Aparecerá el modal de confirmación de pago
3. Selecciona el método de pago
4. Confirma

**Paso 2: Arrastrar la Orden**

**[📸 CAPTURA: Orden siendo arrastrada hacia una sucursal]**

1. Haz clic y mantén presionado sobre una orden pagada
2. Arrastra la orden hacia la tarjeta de la sucursal deseada
3. Verás un borde punteado en las sucursales indicando dónde puedes soltar
4. Suelta la orden sobre la sucursal

**Paso 3: Confirmar Fecha de Entrega**

**[📸 CAPTURA: Modal de confirmación con fecha de entrega]**

Automáticamente se abrirá un modal donde debes:

1. **Revisar la información:**
   - Número de orden y cliente
   - Badge de pago confirmado (verde)
   - Sucursal seleccionada

2. **Seleccionar fecha de entrega:** ⚠️ **OBLIGATORIO**
   - Campo marcado con asterisco rojo (*)
   - Selector de fecha (no permite fechas pasadas)
   - Texto de ayuda: "Selecciona la fecha en que se entregará la orden"

3. **Confirmar:**
   - Haz clic en **"Confirmar"** para asignar
   - Haz clic en **"Cancelar"** si te equivocaste

**Paso 4: Verificar Asignación**

**[📸 CAPTURA: Orden apareciendo en la columna de la sucursal]**

La orden ahora aparecerá en la tarjeta de la sucursal seleccionada con:
- Badge de estado "Asignada"
- Información del cliente
- Total de la orden
- Botones de acción

### 3.4 Gestionar Órdenes Asignadas

**[📸 CAPTURA: Tarjeta de sucursal con órdenes asignadas]**

En cada tarjeta de sucursal verás:

**Información de la Sucursal:**
- Nombre de la sucursal
- Contador de órdenes asignadas
- Total acumulado
- Total de productos

**Acciones sobre Órdenes:**

**[📸 CAPTURA: Botones de acción en una orden asignada]**

- 👁️ **Ver Detalle**: Abre el modal con información completa
- ➡️ **En Proceso**: Cambia el estado a "En Proceso" (solo si está asignada)
- ✅ **Completar**: Marca la orden como completada (solo si está en proceso)
- ❌ **Cancelar**: Cancela la orden

---

## 4. Calendario de Entregas

**[📸 CAPTURA: Vista del calendario mensual con entregas]**

**Ubicación:** Sidebar → Logística → Calendario

### 4.1 Vista del Calendario

El calendario muestra todas las entregas programadas de forma visual.

**Elementos del Calendario:**

**[📸 CAPTURA: Día del calendario con entregas]**

- **Días con entregas**: Resaltados en azul
- **Día actual**: Borde azul primario
- **Contador**: Número de entregas en cada día
- **Total del día**: Suma de las órdenes

### 4.2 Filtrar por Sucursal

**[📸 CAPTURA: Dropdown de filtro de sucursales]**

1. En la parte superior, usa el dropdown **"Filtrar por sucursal"**
2. Selecciona una sucursal específica o **"Todas las sucursales"**
3. El calendario se actualizará automáticamente

### 4.3 Ver Entregas de un Día

**[📸 CAPTURA: Panel lateral con lista de entregas del día seleccionado]**

1. Haz clic en cualquier día del calendario
2. En el panel derecho verás:
   - Fecha seleccionada
   - Lista de todas las órdenes para ese día
   - Información de cada entrega:
     - Número de orden
     - Cliente
     - Sucursal asignada
     - Dirección de entrega
     - Hora (si disponible)
     - Cantidad de productos
     - Estado actual

3. Haz clic en **"Ver Detalle"** para más información

### 4.4 Estadísticas del Mes

**[📸 CAPTURA: Tarjetas de estadísticas debajo del calendario]**

En la parte inferior verás 4 tarjetas con métricas:

1. 📦 **Total del Mes**: Entregas programadas
2. 📅 **Esta Semana**: Entregas de la semana actual
3. 🕐 **Hoy**: Entregas pendientes hoy
4. 💰 **Valor Total**: Suma de todas las entregas

---

## 5. Conversaciones con Clientes

**[📸 CAPTURA: Vista del módulo de conversaciones]**

**Ubicación:** Sidebar → Logística → Conversaciones

### 5.1 Lista de Conversaciones

**[📸 CAPTURA: Lista de conversaciones en el panel izquierdo]**

**Panel Izquierdo:**
- Lista de todas las conversaciones activas
- Información de cada conversación:
  - Foto de perfil (si disponible)
  - Nombre del contacto
  - Última mensaje recibido
  - Hora del último mensaje
  - Contador de mensajes no leídos
  - Plataforma (WhatsApp, Instagram, etc.)

### 5.2 Filtrar Conversaciones

**[📸 CAPTURA: Filtros de plataforma]**

Usa los filtros superiores para ver conversaciones de:
- 📱 WhatsApp
- 💬 Messenger
- 📷 Instagram
- 👥 Facebook
- 🔍 Búsqueda por nombre o teléfono

### 5.3 Ventana de Chat

**[📸 CAPTURA: Ventana de chat con conversación activa]**

Al seleccionar una conversación:

**Header del Chat:**
- Nombre del cliente
- Teléfono
- Plataforma de origen
- Estado de la conversación

**Mensajes:**
- **Del cliente**: Alineados a la izquierda, fondo blanco/gris
- **Tuyos**: Alineados a la derecha, fondo azul
- **De IA**: Identificados con badge "IA"

**[📸 CAPTURA: Diferentes tipos de mensajes en el chat]**

### 5.4 Enviar Mensajes

**[📸 CAPTURA: Campo de texto para enviar mensaje]**

1. Escribe tu mensaje en el campo inferior
2. Usa los botones para:
   - 📎 Adjuntar archivo
   - 🖼️ Enviar imagen
3. Presiona **Enter** o haz clic en **Enviar**

### 5.5 Modo IA vs Manual

**[📸 CAPTURA: Toggle de IA/Manual en el header del chat]**

Puedes alternar entre dos modos:

**Modo IA** (Toggle activado):
- El asistente de IA responde automáticamente
- Respuestas inteligentes basadas en el contexto
- Indicador verde: "IA Activa"

**Modo Manual** (Toggle desactivado):
- Tú respondes directamente
- La IA no interviene
- Indicador gris: "Manual"

Para cambiar de modo, haz clic en el toggle en el header.

---

## 6. Estadísticas de Logística

**[📸 CAPTURA: Dashboard de estadísticas]**

**Ubicación:** Sidebar → Logística → Estadísticas

### Métricas Disponibles:

**[📸 CAPTURA: Gráficas de rendimiento]**

- 📊 Órdenes por estado
- 📈 Tendencias de ventas
- ⏱️ Tiempos de entrega promedio
- 🏢 Rendimiento por sucursal
- 👥 Performance del equipo

---

# Manual para Empleados

## 1. Dashboard del Empleado

**[📸 CAPTURA: Dashboard principal del empleado]**

Al iniciar sesión como empleado, verás tu dashboard personalizado.

### 1.1 Información Destacada

**[📸 CAPTURA: Header con información de sucursal]**

**Header Principal:**
- Saludo personalizado según la hora del día
- Tu nombre completo
- **Tu Sucursal** (destacado con icono de tienda)
- Número de tareas pendientes
- Tu calificación actual (⭐)

### 1.2 Estadísticas Rápidas

**[📸 CAPTURA: Tarjetas de estadísticas del empleado]**

Cuatro tarjetas muestran:

1. 🎯 **Tareas Completadas**: 145 (+15%)
2. ⏰ **Puntualidad**: 92% (+5%)
3. ⚡ **Puntos**: 1,250 (Nivel 5)
4. 🏆 **Logros**: 12 de 25

### 1.3 Sistema de Tareas

**[📸 CAPTURA: Lista de tareas pendientes]**

**Filtros de Tareas:**
- ⏳ Pendientes
- 🔄 En Progreso
- ✅ Completadas

**Prioridades:**
- 🔴 Alta (rojo)
- 🟡 Media (amarillo)
- 🟢 Baja (verde)

**[📸 CAPTURA: Tarjeta de tarea individual]**

**Información de cada tarea:**
- Título de la tarea
- Descripción
- Prioridad
- Fecha límite
- Orden relacionada (si aplica)

**Acciones:**
- 👁️ Ver Detalle
- ▶️ Iniciar (si está pendiente)
- ✅ Completar (si está en progreso)

---

## 2. Mis Órdenes

**[📸 CAPTURA: Página de mis órdenes]**

**Ubicación:** Sidebar → Mis Órdenes

Aquí verás todas las órdenes asignadas a tu sucursal.

### 2.1 Filtros Disponibles

**[📸 CAPTURA: Dropdown de filtro de estados]**

Puedes filtrar por:
- 📋 Todas
- 🆕 Asignadas (nuevas)
- 🔄 En Proceso
- ✅ Completadas

### 2.2 Información de cada Orden

**[📸 CAPTURA: Tarjeta de orden con todos los datos]**

Cada tarjeta muestra:
- Número de orden
- Nombre del cliente
- Teléfono de contacto
- Fecha de entrega
- Dirección de entrega (resumida)
- Total a pagar
- Estado actual

### 2.3 Acciones sobre Órdenes

**[📸 CAPTURA: Botones de acción en tarjeta de orden]**

- 👁️ **Ver Detalle**: Información completa de la orden
- ▶️ **Iniciar**: Cambiar estado a "En Proceso" (solo en asignadas)
- ✅ **Completar**: Marcar como completada (solo en proceso)

---

## 3. Órdenes Pendientes

**[📸 CAPTURA: Vista de órdenes pendientes]**

**Ubicación:** Sidebar → Pendientes

Vista enfocada en las órdenes que requieren tu atención.

### 3.1 Estadísticas

**[📸 CAPTURA: Tarjetas de estadísticas de pendientes]**

- 🟠 **Pendientes**: Órdenes recién asignadas
- 🔵 **En Proceso**: Órdenes que ya iniciaste

### 3.2 Gestión de Estados

**[📸 CAPTURA: Orden con botón "Iniciar"]**

**Para Órdenes Asignadas:**
1. Localiza la orden
2. Haz clic en **"Iniciar"**
3. El estado cambia a "En Proceso"
4. Aparece en la sección de órdenes en proceso

**[📸 CAPTURA: Orden con botón "Completar"]**

**Para Órdenes en Proceso:**
1. Una vez que termines de preparar la orden
2. Haz clic en **"Completar"**
3. La orden se mueve a completadas
4. Se actualiza en tus estadísticas

---

## 4. Órdenes Completadas

**[📸 CAPTURA: Vista de historial de completadas]**

**Ubicación:** Sidebar → Completadas

### 4.1 Vista de Historial

**[📸 CAPTURA: Tabla de órdenes completadas]**

Tabla completa mostrando:
- Número de orden (con ✅ verde)
- Cliente y teléfono
- Fecha de completado
- Total facturado
- Botón "Ver" para detalles

### 4.2 Estadísticas de Completadas

**[📸 CAPTURA: Tarjetas de estadísticas superiores]**

- ✅ **Total Completadas**: Este mes
- 📅 **Completadas Hoy**: Las de hoy
- 💰 **Total Facturado**: Suma de todas

---

## 5. Chat con Clientes

**[📸 CAPTURA: Acceso al chat desde menú de empleado]**

**Ubicación:** Sidebar → Chat con Clientes

Al hacer clic, serás redirigido al módulo de conversaciones (mismo que logística).

**Funcionalidad:** Igual que la sección de [Conversaciones](#5-conversaciones-con-clientes) del manual de logística.

---

## 6. Notificaciones

**[📸 CAPTURA: Página de notificaciones]**

**Ubicación:** Sidebar → Notificaciones

### 6.1 Tipos de Notificaciones

**[📸 CAPTURA: Lista de notificaciones con diferentes tipos]**

**Iconos y Colores:**
- ✅ Verde: Éxito (orden completada, logro desbloqueado)
- ⚠️ Naranja: Advertencia (orden urgente, fecha límite cerca)
- ℹ️ Azul: Información (nueva orden asignada, cambio de horario)

### 6.2 Gestión de Notificaciones

**[📸 CAPTURA: Notificación no leída con badge "Nuevo"]**

- **No leídas**: Borde azul a la izquierda, badge "Nuevo"
- **Leídas**: Sin borde especial

**Acciones:**
- **Marcar todas como leídas**: Botón en la parte superior

---

## 7. Mi Sucursal

**[📸 CAPTURA: Página de información de sucursal]**

**Ubicación:** Sidebar → Mi Sucursal

### 7.1 Información de Contacto

**[📸 CAPTURA: Sección de datos de contacto]**

Verás toda la información de tu lugar de trabajo:

**Datos Disponibles:**
- 📍 **Dirección Completa**
  - Calle y número
  - Ciudad y Estado
  - Código postal (si disponible)

- 📞 **Teléfono**: Número de contacto de la sucursal

- 👤 **Gerente**: Nombre del gerente de la sucursal

### 7.2 Horarios de Atención

**[📸 CAPTURA: Tabla de horarios]**

Tabla con los horarios de operación:
- Lunes - Viernes: 9:00 AM - 6:00 PM
- Sábado: 9:00 AM - 2:00 PM
- Domingo: Cerrado

### 7.3 Estadísticas de la Sucursal

**[📸 CAPTURA: Tarjetas de estadísticas de sucursal]**

Métricas de tu sucursal:

1. 📦 **Órdenes del Mes**: 156 (+12%)
2. 💰 **Ventas Totales**: $45,280 (+8%)
3. 👥 **Equipo**: 8 empleados activos
4. ⏱️ **Tiempo Promedio**: 2.5h por orden

---

## 8. Mis Métricas

**[📸 CAPTURA: Dashboard de métricas personales]**

**Ubicación:** Sidebar → Mis Métricas

### 8.1 Tu Calificación General

**[📸 CAPTURA: Header con calificación grande]**

En la parte superior:
- ⭐ Calificación actual (ej: 4.8)
- Título: "Mis Métricas"
- Subtítulo: "Seguimiento de tu rendimiento"

### 8.2 Métricas Clave

**[📸 CAPTURA: Tarjetas de métricas]**

Cuatro tarjetas principales:

1. 🎯 **Tareas Completadas**: 145 (+15% vs mes anterior)
2. ⏰ **Puntualidad**: 92% (+5%)
3. ⚡ **Puntos Acumulados**: 1,250 (Nivel 5 - Experto)
4. 🏆 **Logros Desbloqueados**: 12 de 25 totales

### 8.3 Progreso Mensual

**[📸 CAPTURA: Barras de progreso]**

Gráficos de barra mostrando:

- 📋 **Órdenes Completadas**: 85%
- ✅ **Calidad del Servicio**: 92%
- ⚡ **Velocidad de Respuesta**: 78%
- 😊 **Satisfacción del Cliente**: 88%

### 8.4 Logros Recientes

**[📸 CAPTURA: Tarjetas de logros con emojis]**

Últimos logros desbloqueados:

1. ⭐ **Estrella del Mes**
   - Mejor rendimiento de Enero
   - Hace 1 semana

2. 🎯 **100 Órdenes**
   - Completaste 100 órdenes
   - Hace 2 semanas

3. ⚡ **Velocidad Relámpago**
   - 10 órdenes en un día
   - Hace 3 semanas

---

## Preguntas Frecuentes

### Para Logística

**P: ¿Puedo asignar una orden que no está pagada?**
R: No. El sistema te pedirá primero confirmar el pago antes de permitir la asignación.

**P: ¿Cómo cancelo una asignación?**
R: Ve al módulo de Asignaciones, encuentra la orden en la sucursal y haz clic en el botón de cancelar (❌). La orden volverá a la columna de sin asignar.

**P: ¿Puedo cambiar la fecha de entrega después de asignar?**
R: Actualmente necesitas cancelar la asignación y volver a asignar con la nueva fecha. En futuras versiones habrá una opción de edición directa.

**P: ¿Cómo desactivo la IA en una conversación?**
R: En el header del chat, haz clic en el toggle "IA/Manual". Cuando está en gris (Manual), la IA no responderá automáticamente.

**P: ¿Puedo ver órdenes de todas las sucursales?**
R: Sí, como usuario de logística tienes acceso a órdenes de todas las sucursales.

### Para Empleados

**P: ¿Por qué no veo todas las órdenes?**
R: Como empleado, solo ves las órdenes asignadas a tu sucursal. Esto es para mantener la organización y privacidad.

**P: ¿Cómo gano más puntos?**
R: Completa órdenes a tiempo, mantén buena calificación, responde rápido y desbloquea logros.

**P: ¿Qué pasa si completo una orden por error?**
R: Contacta inmediatamente a tu supervisor o al equipo de logística para que puedan revertir el estado.

**P: ¿Puedo ver el historial completo de mi rendimiento?**
R: Sí, ve a "Mis Métricas" en el sidebar para ver estadísticas detalladas y tu progreso histórico.

**P: ¿Las notificaciones son en tiempo real?**
R: Actualmente las notificaciones se actualizan al refrescar la página. En futuras versiones habrá notificaciones push en tiempo real.

---

## Soporte Técnico

### Contacto

Si tienes problemas técnicos o dudas:

**Email**: soporte@capriccio.com
**Teléfono**: +52 33 XXXX XXXX
**Horario**: Lunes a Viernes, 9:00 AM - 6:00 PM

### Reportar un Error

Si encuentras un error en el sistema:

1. Toma una captura de pantalla
2. Anota los pasos que seguiste
3. Describe qué esperabas que pasara
4. Envía la información a soporte@capriccio.com

### Sugerencias y Mejoras

Tus comentarios son valiosos. Si tienes ideas para mejorar el sistema:

- Envía tus sugerencias a: ideas@capriccio.com
- Incluye una descripción detallada
- Si es posible, adjunta mockups o ejemplos

---

## Glosario

- **Orden**: Pedido realizado por un cliente
- **Asignación**: Proceso de vincular una orden con una sucursal
- **Estado**: Situación actual de una orden (pendiente, asignada, en proceso, completada, cancelada)
- **Sucursal**: Punto de venta o centro de distribución
- **IA**: Inteligencia Artificial, asistente automático para responder clientes
- **Badge**: Etiqueta visual que indica un estado o categoría
- **Modal**: Ventana emergente que requiere una acción del usuario
- **Drag & Drop**: Arrastrar y soltar con el mouse

---

## Actualizaciones del Manual

**Versión**: 1.0.0
**Fecha**: 27 de Octubre, 2025
**Última Actualización**: 27 de Octubre, 2025

Este manual se actualiza periódicamente con nuevas funcionalidades y mejoras del sistema.

---

**© 2025 Capriccio Homemade Goods. Todos los derechos reservados.**
