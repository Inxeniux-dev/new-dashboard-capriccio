# 📝 Cómo Crear Nuevas Categorías, Subcategorías y Presentaciones

## 🎯 Resumen Rápido

**Solo Administradores** pueden crear nuevas opciones de categorías, subcategorías y presentaciones. Logística solo puede seleccionar de las opciones existentes.

---

## 👨‍💼 Para Administradores

### Paso 1: Abre el formulario de edición

1. Ve a `/dashboard/admin/productos`
2. Busca el producto que deseas editar
3. Click en el botón **✏️ Editar** o **➕ Agregar** (si no tiene metadatos)

### Paso 2: Selecciona "Crear nueva opción"

Cuando veas los dropdowns de **Categoría**, **Subcategoría** o **Presentación**:

```
┌─────────────────────────────────────────┐
│ Categoría * (puedes crear nuevas opciones)│
├─────────────────────────────────────────┤
│ [Seleccionar...]                    ▼   │
│ Chocolates                               │
│ Postres                                  │
│ Bebidas                                  │
│ Dulces                                   │
│ ➕ Crear nueva opción...                 │ ← Selecciona esto
└─────────────────────────────────────────┘

💡 Si no encuentras la opción, selecciona
   "Crear nueva opción..." al final de la lista
```

### Paso 3: Escribe la nueva opción

El dropdown se convertirá en un campo de texto:

```
┌─────────────────────────────────────────┐
│ Categoría *                              │
├─────────────────────────────────────────┤
│ [Escribe el nombre...] [✓ Crear] [✕]   │
└─────────────────────────────────────────┘

ℹ️ Presiona Enter para confirmar o Esc para cancelar
```

### Paso 4: Confirma la nueva opción

Puedes confirmar de 3 formas:
- ✅ Presionando **Enter**
- ✅ Clickeando el botón **"✓ Crear"**
- ❌ Presionando **Esc** o el botón **"✕"** para cancelar

### Paso 5: La nueva opción queda guardada

Una vez confirmada:
- La nueva opción se guarda automáticamente
- Queda seleccionada en el formulario actual
- **Estará disponible para TODOS los productos** en el futuro

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Crear una nueva categoría

**Situación:** Capriccio lanza una nueva línea de productos de "Panadería"

1. Edita cualquier producto de panadería
2. En el campo "Categoría", ve hasta el final del dropdown
3. Selecciona **"➕ Crear nueva opción..."**
4. Escribe: `Panadería`
5. Presiona **Enter** o click en **"✓ Crear"**
6. ¡Listo! Ahora "Panadería" aparecerá en todos los dropdowns de categoría

### Ejemplo 2: Crear una nueva presentación

**Situación:** Un producto viene en formato "six pack"

1. Edita el producto
2. En el campo "Presentación", ve al final del dropdown
3. Selecciona **"➕ Crear nueva opción..."**
4. Escribe: `six pack`
5. Presiona **Enter**
6. La presentación "six pack" ya está disponible para todos

### Ejemplo 3: Crear una subcategoría específica

**Situación:** Quieres clasificar chocolates más específicamente

1. Edita un producto de chocolate
2. Selecciona categoría "Chocolates"
3. En "Subcategoría", selecciona **"➕ Crear nueva opción..."**
4. Escribe: `Chocolate blanco con frutos rojos`
5. Confirma
6. La subcategoría queda guardada

---

## 🚫 Restricciones para Logística

Los usuarios de **Logística NO pueden crear nuevas opciones**. Solo pueden:
- ✅ Seleccionar de las opciones existentes
- ✅ Editar categoría, subcategoría y presentación de productos
- ❌ **NO** pueden crear nuevas opciones (el botón no aparece)

**¿Por qué?** Para mantener consistencia en el catálogo. Solo administradores pueden expandir las opciones disponibles.

Si un usuario de logística necesita una nueva opción, debe:
1. Solicitar al administrador que la cree
2. El administrador crea la nueva opción
3. Logística puede usarla inmediatamente después

---

## 💡 Buenas Prácticas

### ✅ Haz esto:

1. **Usa nombres consistentes**: "Chocolate oscuro" no "chocolate oscuro" o "CHOCOLATE OSCURO"
2. **Revisa opciones existentes primero**: Evita duplicados como "Barra" y "barra"
3. **Sé específico pero no excesivo**: "Chocolate oscuro" es mejor que "Chocolate oscuro 70% cacao ecuatoriano orgánico"
4. **Usa singular o plural consistentemente**: "Chocolate" o "Chocolates", pero no mezcles

### ❌ Evita esto:

1. **Crear duplicados**: Revisa bien antes de crear
2. **Usar abreviaturas confusas**: "Choc" en lugar de "Chocolate"
3. **Incluir números de SKU**: Las opciones deben ser genéricas
4. **Crear opciones demasiado específicas**: Usa subcategorías para detalles

---

## 🔄 Cómo se sincronizan las nuevas opciones

### Guardado automático

Cuando creas una nueva opción:
1. Se guarda inmediatamente en el producto actual
2. El backend la registra en la lista de opciones disponibles
3. Aparece automáticamente en el dropdown la próxima vez que alguien edite cualquier producto
4. **No necesitas refrescar la página**

### Persistencia

Las opciones creadas:
- ✅ Se mantienen después de cerrar el navegador
- ✅ Están disponibles para todos los usuarios inmediatamente
- ✅ Sobreviven sincronizaciones con iPOS
- ✅ Se comparten entre todas las sucursales

---

## 🆘 Solución de Problemas

### Problema: No veo la opción "Crear nueva opción..."

**Solución:**
- Verifica que eres **Administrador** (logística no tiene esta opción)
- Asegúrate de estar en el formulario de edición
- Ve hasta el **final** del dropdown

### Problema: La nueva opción no aparece después de crearla

**Solución:**
- Refresca la página (F5)
- Si persiste, reporta el problema al equipo técnico

### Problema: Creé una opción con error tipográfico

**Solución:**
- Actualmente no hay forma de editar/eliminar opciones desde la UI
- Contacta al equipo técnico para corregirlo directamente en la base de datos
- En el futuro: habrá una página de administración de opciones

---

## 🔮 Próximas Mejoras

Funcionalidades planeadas:
- [ ] Página de administración de opciones (editar/eliminar)
- [ ] Fusionar opciones duplicadas automáticamente
- [ ] Sugerencias inteligentes basadas en IA
- [ ] Historial de cambios en opciones
- [ ] Importar/exportar catálogo de opciones

---

## 📞 Soporte

¿Tienes dudas o problemas?
- Consulta la documentación completa: `docs/PRODUCTO_METADATOS_README.md`
- Reporta issues en GitHub
- Contacta al equipo de desarrollo

---

**Última actualización:** 2025-11-07
