# Sistema de Notificaciones Toast con Sonner

Se ha implementado Sonner para manejar notificaciones toast en toda la aplicación.

## ✅ Implementación Completada

### 1. Instalación
```bash
npm install sonner
```

### 2. Configuración en Layout
El componente `<Toaster />` está configurado en el layout principal:

```tsx
// src/app/layout.tsx
import { Toaster } from "sonner";

<Toaster position="top-right" richColors closeButton />
```

### 3. Uso en AuthContext

#### Login Exitoso
```tsx
toast.success("¡Bienvenido!", {
  description: `Iniciaste sesión como ${response.user.full_name}`,
});
```

#### Errores de Login
```tsx
// Credenciales incorrectas (401)
toast.error("Credenciales incorrectas", {
  description: "El email o la contraseña no son válidos.",
});

// Error del servidor (500)
toast.error("Error del servidor", {
  description: "Hubo un problema con el servidor. Intenta de nuevo más tarde.",
});

// Sin conexión
toast.error("Sin conexión", {
  description: "No se pudo conectar con el servidor. Verifica tu conexión.",
});
```

#### Logout
```tsx
toast.success("Sesión cerrada", {
  description: "Has cerrado sesión exitosamente.",
});
```

## 🎨 Tipos de Toast Disponibles

### Success (Verde)
```tsx
import { toast } from "sonner";

toast.success("Operación exitosa", {
  description: "Descripción opcional",
});
```

### Error (Rojo)
```tsx
toast.error("Algo salió mal", {
  description: "Detalle del error",
});
```

### Info (Azul)
```tsx
toast.info("Información", {
  description: "Mensaje informativo",
});
```

### Warning (Amarillo)
```tsx
toast.warning("Advertencia", {
  description: "Mensaje de advertencia",
});
```

### Loading
```tsx
const loadingToast = toast.loading("Cargando...");

// Cuando termine
toast.success("Completado", { id: loadingToast });
// o
toast.error("Error", { id: loadingToast });
```

### Promise
```tsx
toast.promise(
  apiCall(),
  {
    loading: "Guardando...",
    success: "Guardado correctamente",
    error: "Error al guardar",
  }
);
```

## 📋 Opciones de Configuración

```tsx
toast.success("Mensaje", {
  description: "Descripción detallada",
  duration: 5000, // milisegundos (default: 4000)
  closeButton: true, // mostrar botón cerrar
  position: "top-right", // posición del toast
  action: {
    label: "Deshacer",
    onClick: () => console.log("Deshacer"),
  },
});
```

## 🎯 Casos de Uso Comunes

### Crear Orden
```tsx
try {
  await apiClient.orders.create(orderData);
  toast.success("Orden creada", {
    description: `Orden #${orderNumber} creada exitosamente`,
  });
} catch (error) {
  toast.error("Error al crear orden", {
    description: error.message,
  });
}
```

### Asignar Orden a Sucursal
```tsx
toast.promise(
  apiClient.orders.assignToBranch(orderId, data),
  {
    loading: "Asignando orden...",
    success: "Orden asignada a la sucursal",
    error: "Error al asignar la orden",
  }
);
```

### Enviar Mensaje
```tsx
try {
  await apiClient.messages.send(messageData);
  toast.success("Mensaje enviado");
} catch (error) {
  toast.error("No se pudo enviar el mensaje", {
    description: "Verifica tu conexión e intenta de nuevo",
  });
}
```

### Actualizar Usuario
```tsx
const updateUser = async (userId: string, data: any) => {
  const loadingToast = toast.loading("Actualizando usuario...");

  try {
    await apiClient.users.update(userId, data);
    toast.success("Usuario actualizado", { id: loadingToast });
  } catch (error) {
    toast.error("Error al actualizar", { id: loadingToast });
  }
};
```

## 🎨 Personalización de Estilos

El Toaster ya está configurado con:
- `richColors` - Colores más vibrantes según el tipo
- `closeButton` - Botón de cerrar en cada toast
- `position="top-right"` - Esquina superior derecha

### Posiciones Disponibles
- `top-left`
- `top-center`
- `top-right` ✅ (actual)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## 📚 Mejores Prácticas

1. **Mensajes Claros**: Usa títulos cortos y descripciones explicativas
2. **Acciones Específicas**: Indica qué se hizo o qué salió mal
3. **No Duplicar**: Evita mostrar múltiples toasts del mismo tipo
4. **Feedback Inmediato**: Muestra el toast justo después de la acción
5. **Loading States**: Usa toasts loading para operaciones largas

## 🔗 Recursos

- [Documentación de Sonner](https://sonner.emilkowal.ski/)
- [GitHub](https://github.com/emilkowalski/sonner)

## ✅ Estado Actual

- ✅ Instalado y configurado
- ✅ Integrado en AuthContext
- ✅ Login con manejo completo de errores
- ✅ Logout con notificación
- 🔧 Pendiente: Integrar en otros módulos (órdenes, mensajes, etc.)

## 🎯 Próximos Pasos

1. Agregar toasts en acciones de órdenes
2. Agregar toasts en envío de mensajes
3. Agregar toasts en CRUD de usuarios
4. Agregar toasts en CRUD de sucursales
5. Implementar toasts de progreso para cargas largas
