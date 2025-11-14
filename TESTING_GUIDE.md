# Guía de Pruebas - Módulo de Administración de Categorías

## 📋 Objetivo

Esta guía proporciona un checklist completo para verificar que todos los endpoints del backend estén funcionando correctamente y que la integración con el frontend sea exitosa.

---

## 🚀 Preparación

### 1. Variables de Entorno
Verificar que estén configuradas:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TOKEN=your_admin_token_here
```

### 2. Iniciar el Servidor
```bash
npm run dev
```

### 3. Abrir el Módulo
Navegar a: `http://localhost:3000/dashboard/admin/categorias`

---

## ✅ Checklist de Pruebas

### FASE 1: Categorías

#### 1.1 Listar Categorías
- [ ] Al abrir el módulo, se carga el tab "Categorías" por defecto
- [ ] Se muestra una tabla con todas las categorías existentes
- [ ] Las columnas incluyen: Código, Nombre, Descripción, Orden, Estado, Acciones
- [ ] Los badges de estado muestran "Activa" (verde) o "Inactiva" (gris)
- [ ] Los códigos se muestran en formato monospace

**Endpoint verificado:** ✅ `GET /api/categories`

---

#### 1.2 Crear Categoría
**Pasos:**
1. Click en botón "Nueva Categoría"
2. Se abre modal "Nueva Categoría"
3. Llenar formulario:
   - Código: `TEST_CAT`
   - Nombre: `Categoría de Prueba`
   - Descripción: `Esta es una categoría de prueba`
   - Orden: `99`
4. Click en "Crear Categoría"

**Verificar:**
- [ ] Modal se cierra automáticamente
- [ ] Aparece notificación "Categoría creada exitosamente"
- [ ] La nueva categoría aparece en la tabla
- [ ] Los datos se muestran correctamente

**Endpoint verificado:** ✅ `POST /api/categories`

---

#### 1.3 Editar Categoría
**Pasos:**
1. Click en "Editar" en la categoría recién creada
2. Modal se abre con datos pre-cargados
3. Modificar:
   - Nombre: `Categoría de Prueba Modificada`
   - Descripción: `Descripción actualizada`
4. Click en "Guardar Cambios"

**Verificar:**
- [ ] Modal se cierra
- [ ] Notificación muestra "Categoría actualizada"
- [ ] Notificación indica productos afectados: "X productos afectados"
- [ ] Los cambios se reflejan en la tabla
- [ ] El código NO puede modificarse (campo deshabilitado)

**Endpoint verificado:** 🆕 `PUT /api/categories/{id}`

---

#### 1.4 Activar/Desactivar Categoría
**Pasos:**
1. Click en "Desactivar" en una categoría activa
2. Confirmar acción

**Verificar:**
- [ ] Notificación "Categoría desactivada exitosamente"
- [ ] Badge cambia a "Inactiva" (gris)
- [ ] El botón cambia a "Activar"
3. Click en "Activar"

**Verificar:**
- [ ] Badge vuelve a "Activa" (verde)
- [ ] Notificación de éxito

**Endpoint verificado:** 🆕 `PATCH /api/categories/{id}/toggle-status`

---

#### 1.5 Eliminar Categoría
**Pasos:**
1. Click en "Eliminar" en la categoría de prueba
2. Aparece confirmación: "¿Está seguro...?"
3. Confirmar eliminación

**Verificar:**
- [ ] Notificación de éxito
- [ ] Indica productos afectados si los hay
- [ ] La categoría desaparece de la tabla
- [ ] Si hay productos activos, debe mostrar error

**Endpoint verificado:** 🆕 `DELETE /api/categories/{id}`

---

#### 1.6 Contar Productos Afectados (Indirecto)
Este endpoint se usa internamente al editar/eliminar.

**Verificar:**
- [ ] Al editar, la notificación muestra "X productos afectados"
- [ ] Al eliminar, muestra el conteo correcto
- [ ] Si hay 0 productos, no muestra el mensaje

**Endpoint verificado:** 🆕 `GET /api/categories/{id}/products-count`

---

### FASE 2: Subcategorías

#### 2.1 Cambiar a Tab de Subcategorías
- [ ] Click en tab "Subcategorías"
- [ ] Se muestra tabla con columnas: Categoría, Código, Nombre, Orden, Acciones
- [ ] Las subcategorías muestran su categoría padre

**Endpoint verificado:** ✅ `GET /api/categories/hierarchy` (indirecto)

---

#### 2.2 Crear Subcategoría
**Pasos:**
1. Click en "Nueva Subcategoría"
2. Llenar formulario:
   - Categoría Padre: Seleccionar una existente
   - Código: `TEST_SUB`
   - Nombre: `Subcategoría de Prueba`
   - Orden: `99`
3. Click en "Crear Subcategoría"

**Verificar:**
- [ ] Modal se cierra
- [ ] Notificación de éxito
- [ ] Nueva subcategoría aparece en tabla
- [ ] Muestra la categoría padre correcta

**Endpoint verificado:** 🆕 `POST /api/categories/{categoryId}/subcategories`

---

#### 2.3 Editar Subcategoría
**Pasos:**
1. Click en "Editar" en la subcategoría de prueba
2. Modificar nombre y/o categoría padre
3. Guardar

**Verificar:**
- [ ] Notificación con productos afectados
- [ ] Cambios reflejados en tabla
- [ ] Código no modificable

**Endpoint verificado:** 🆕 `PUT /api/categories/subcategories/{id}`

---

#### 2.4 Eliminar Subcategoría
**Pasos:**
1. Click en "Eliminar"
2. Confirmar

**Verificar:**
- [ ] Notificación con productos afectados
- [ ] Subcategoría eliminada de tabla

**Endpoint verificado:** 🆕 `DELETE /api/categories/subcategories/{id}`

---

#### 2.5 Toggle Status (si implementado)
**Verificar:**
- [ ] Botón de activar/desactivar funciona
- [ ] Notificación apropiada

**Endpoint verificado:** 🆕 `PATCH /api/categories/subcategories/{id}/toggle-status`

---

### FASE 3: Presentaciones

#### 3.1 Cambiar a Tab de Presentaciones
- [ ] Click en tab "Presentaciones"
- [ ] Tabla muestra: Código, Nombre, Tamaño, Default, Estado, Acciones
- [ ] Presentaciones default muestran estrella ⭐

**Endpoint verificado:** 🆕 `GET /api/categories/presentations`

---

#### 3.2 Crear Presentación
**Pasos:**
1. Click en "Nueva Presentación"
2. Llenar:
   - Código: `TEST_PRES`
   - Nombre: `Presentación de Prueba`
   - Tamaño: `500g`
   - Default: No marcar
3. Crear

**Verificar:**
- [ ] Notificación de éxito
- [ ] Nueva presentación en tabla
- [ ] Tamaño se muestra correctamente
- [ ] No tiene estrella (no es default)

**Endpoint verificado:** 🆕 `POST /api/categories/presentations`

---

#### 3.3 Editar Presentación
**Pasos:**
1. Editar la presentación de prueba
2. Cambiar nombre y tamaño
3. Guardar

**Verificar:**
- [ ] Notificación con productos afectados
- [ ] Cambios en tabla

**Endpoint verificado:** 🆕 `PUT /api/categories/presentations/{id}`

---

#### 3.4 Marcar como Default
**Pasos:**
1. Click en "Marcar Default" en la presentación de prueba

**Verificar:**
- [ ] Notificación de éxito
- [ ] Aparece estrella ⭐ en la presentación
- [ ] Otras presentaciones pierden la estrella (solo una puede ser default)

**Endpoint verificado:** 🆕 `PATCH /api/categories/presentations/{id}/set-default`

---

#### 3.5 Activar/Desactivar
**Verificar:**
- [ ] Toggle de status funciona
- [ ] Badge cambia correctamente

**Endpoint verificado:** 🆕 `PATCH /api/categories/presentations/{id}/toggle-status`

---

#### 3.6 Eliminar Presentación
**Pasos:**
1. Eliminar presentación de prueba
2. Confirmar

**Verificar:**
- [ ] Notificación con productos afectados
- [ ] Presentación removida

**Endpoint verificado:** 🆕 `DELETE /api/categories/presentations/{id}`

---

### FASE 4: Integración con Productos

#### 4.1 Verificar Propagación de Cambios
**Pasos:**
1. Ir a módulo de productos: `/dashboard/admin/productos`
2. Editar un producto que tenga categorización
3. Verificar que los cambios hechos en categorías se reflejan

**Verificar:**
- [ ] Nombres actualizados se muestran en el selector
- [ ] Categorías desactivadas no aparecen
- [ ] Presentaciones default están preseleccionadas
- [ ] Subcategorías solo muestran las de la categoría seleccionada

---

#### 4.2 Verificar en Selector de Categorización
**Pasos:**
1. En edición de producto, abrir selector de categorías
2. Verificar selección en cascada funciona

**Verificar:**
- [ ] Selector de categoría muestra todas las activas
- [ ] Al seleccionar categoría, se cargan sus subcategorías
- [ ] Al seleccionar subcategoría, se cargan presentaciones válidas
- [ ] Presentaciones muestran tamaño: "Nombre (tamaño)"
- [ ] Presentación default tiene estrella ⭐

---

### FASE 5: Validaciones y Errores

#### 5.1 Validación de Códigos
**Probar crear con código inválido:**
- [ ] Código con espacios: "TEST CAT" → Error
- [ ] Código con minúsculas: "test_cat" → Se convierte a mayúsculas
- [ ] Código con caracteres especiales: "TEST@CAT" → Error
- [ ] Código vacío → Error
- [ ] Código duplicado → Error del backend

---

#### 5.2 Validación de Campos Requeridos
**Probar dejar campos vacíos:**
- [ ] Nombre vacío → Error "El nombre es obligatorio"
- [ ] Categoría padre vacía (subcategoría) → Error

---

#### 5.3 Eliminar con Productos Activos
**Si el backend rechaza eliminación con productos activos:**
- [ ] Intentar eliminar categoría con productos
- [ ] Debe mostrar error: "No se puede eliminar. Hay X productos..."
- [ ] La categoría NO se elimina
- [ ] Usuario puede ver el conteo

---

#### 5.4 Errores de Red
**Simular desconexión:**
- [ ] Apagar backend
- [ ] Intentar crear categoría
- [ ] Debe mostrar error claro
- [ ] Modal permanece abierto (no pierde datos)

---

### FASE 6: UI/UX

#### 6.1 Estados de Carga
- [ ] Al abrir módulo, muestra spinner de carga
- [ ] Mensaje "Cargando..." visible
- [ ] Después de cargar, tabla aparece

---

#### 6.2 Notificaciones
- [ ] Éxito: toast verde con mensaje apropiado
- [ ] Error: toast rojo con mensaje de error
- [ ] Info: toast azul para productos afectados
- [ ] Notificaciones se auto-cierran después de unos segundos

---

#### 6.3 Modales
- [ ] Modales se centran en pantalla
- [ ] Click fuera del modal lo cierra (o botón X)
- [ ] Botón "Cancelar" cierra sin guardar
- [ ] Formulario se resetea al cerrar

---

#### 6.4 Tablas
- [ ] Tablas son scrolleables horizontalmente en móvil
- [ ] Filas tienen hover effect
- [ ] Acciones están alineadas a la derecha
- [ ] Estados tienen colores apropiados

---

#### 6.5 Dark Mode
- [ ] Cambiar a dark mode
- [ ] Todos los componentes se ven bien
- [ ] Contraste apropiado
- [ ] Badges legibles
- [ ] Modales con fondo oscuro

---

#### 6.6 Responsive
**Probar en diferentes tamaños:**
- [ ] Desktop (1920x1080) → Todo visible
- [ ] Tablet (768px) → Tabla scrolleable
- [ ] Mobile (375px) → Todo accesible

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "Network Error" o "Failed to fetch"
**Posibles causas:**
- Backend no está corriendo
- URL incorrecta en `.env`
- CORS no configurado en backend

**Solución:**
1. Verificar que backend esté en `http://localhost:4000`
2. Revisar `NEXT_PUBLIC_API_URL` en `.env`
3. Reiniciar frontend: `npm run dev`

---

### Problema: Modal no se cierra después de guardar
**Causa:** Error en el endpoint pero no se maneja

**Solución:**
1. Abrir consola del navegador (F12)
2. Ver error en Network tab
3. Verificar response del backend

---

### Problema: Cambios no se reflejan en productos
**Causa:** Backend no está actualizando productos relacionados

**Solución:**
1. Verificar que backend implemente actualización en cascada
2. Revisar que productos tengan `category_id` correcto
3. Comprobar que relación sea por ID, no por nombre

---

### Problema: Código se puede editar
**Causa:** Campo no está deshabilitado en modo edición

**Ya está arreglado en:** `CategoryForm.tsx`, `SubcategoryForm.tsx`, `PresentationForm.tsx`

---

## 📊 Resumen de Endpoints

| Endpoint | Método | Status | Probado |
|----------|--------|--------|---------|
| `/api/categories` | GET | ✅ Existía | [ ] |
| `/api/categories` | POST | ✅ Existía | [ ] |
| `/api/categories/{id}` | PUT | 🆕 Nuevo | [ ] |
| `/api/categories/{id}` | DELETE | 🆕 Nuevo | [ ] |
| `/api/categories/{id}/toggle-status` | PATCH | 🆕 Nuevo | [ ] |
| `/api/categories/{id}/products-count` | GET | 🆕 Nuevo | [ ] |
| `/api/categories/{catId}/subcategories` | POST | 🆕 Nuevo | [ ] |
| `/api/categories/subcategories/{id}` | PUT | 🆕 Nuevo | [ ] |
| `/api/categories/subcategories/{id}` | DELETE | 🆕 Nuevo | [ ] |
| `/api/categories/subcategories/{id}/toggle-status` | PATCH | 🆕 Nuevo | [ ] |
| `/api/categories/subcategories/{id}/products-count` | GET | 🆕 Nuevo | [ ] |
| `/api/categories/presentations` | GET | 🆕 Nuevo | [ ] |
| `/api/categories/presentations` | POST | 🆕 Nuevo | [ ] |
| `/api/categories/presentations/{id}` | PUT | 🆕 Nuevo | [ ] |
| `/api/categories/presentations/{id}` | DELETE | 🆕 Nuevo | [ ] |
| `/api/categories/presentations/{id}/toggle-status` | PATCH | 🆕 Nuevo | [ ] |
| `/api/categories/presentations/{id}/set-default` | PATCH | 🆕 Nuevo | [ ] |
| `/api/categories/presentations/{id}/products-count` | GET | 🆕 Nuevo | [ ] |

**Total:** 18 endpoints
**Nuevos:** 16 endpoints

---

## ✅ Criterios de Aceptación

El módulo está listo para producción cuando:

- [ ] Todos los endpoints responden correctamente
- [ ] CRUD completo funciona para categorías, subcategorías y presentaciones
- [ ] Validaciones frontend funcionan
- [ ] Validaciones backend retornan errores claros
- [ ] Notificaciones son apropiadas
- [ ] Conteo de productos afectados funciona
- [ ] UI/UX es intuitiva
- [ ] Dark mode funciona
- [ ] Responsive en todos los tamaños
- [ ] No hay errores en consola
- [ ] Cambios se propagan a productos

---

## 📝 Reporte de Pruebas

Completar después de las pruebas:

**Fecha de pruebas:** _______________
**Tester:** _______________
**Versión:** 1.0.0

**Resumen:**
- Endpoints funcionando: ___/18
- Bugs encontrados: ___
- Bugs críticos: ___
- Estado: ⬜ Aprobado | ⬜ Requiere correcciones

**Comentarios:**
```
[Agregar comentarios, bugs encontrados, sugerencias]
```

---

**Creado por:** Claude Code
**Última actualización:** 14 de Noviembre de 2025
