# Dashboard Capriccio CRM - Sistema Completo

Sistema de gestión integrado con backend API para Capriccio Homemade Goods.

## 🎉 Estado Actual - Enero 2025

✅ **Backend Integrado** - Todos los endpoints críticos implementados
✅ **Autenticación Real** - Login con JWT tokens
✅ **3 Roles de Usuario** - Admin, Logística, Empleado
✅ **CRUD Completo** - Usuarios, Sucursales, Órdenes
✅ **Chat Multi-plataforma** - WhatsApp, Instagram, Messenger

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api-meta-service.vercel.app
NEXT_PUBLIC_API_TOKEN=tu-token-aqui
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Login

El sistema ahora usa autenticación real del backend. Usa tus credenciales reales:

```
Email: tu-email@ejemplo.com
Password: tu-contraseña
```

Los roles disponibles son:
- **super_usuario / administrador** - Acceso completo
- **logistica** - Gestión de órdenes y conversaciones
- **empleado** - Órdenes de su sucursal

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/              # 👨‍💼 Dashboard Administrador
│   │   ├── logistics/          # 🚚 Dashboard Logística
│   │   │   ├── conversations/  # Chat multi-plataforma
│   │   │   └── orders/         # Asignación de órdenes
│   │   └── employee/           # 👷 Dashboard Empleado
│   └── page.tsx                # 🔐 Login
├── components/
│   ├── Chat/                   # Componentes de chat
│   └── Sidebar.tsx             # Navegación dinámica
├── contexts/
│   └── AuthContext.tsx         # Sistema de autenticación
├── lib/
│   └── api-client.ts           # Cliente API completo
└── types/
    └── api.ts                  # Tipos TypeScript
```

## 🎯 Funcionalidades por Rol

### 👨‍💼 Administrador
- ✅ Dashboard con estadísticas globales
- ✅ Vista de todas las sucursales y métricas
- ✅ Gestión de órdenes (todos los estados)
- 🔧 Gestión de usuarios (API lista, UI pendiente)
- 🔧 Gestión de sucursales (API lista, UI pendiente)

### 🚚 Logística
- ✅ Dashboard con órdenes pendientes
- ✅ Chat multi-plataforma (WhatsApp, Instagram, Messenger)
- ✅ Asignación de órdenes a sucursales
- ✅ Confirmación de fechas de entrega
- ✅ Vista de conversaciones recientes

### 👷 Empleado
- ✅ Dashboard con órdenes de su sucursal
- ✅ Iniciar trabajo en órdenes asignadas
- ✅ Actualizar estado de órdenes
- ✅ Ver historial de órdenes completadas

## 🔗 API Endpoints Integrados

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Sucursales
- `GET /api/branches` - Listar sucursales
- `POST /api/branches` - Crear sucursal
- `PUT /api/branches/{id}` - Actualizar sucursal
- `DELETE /api/branches/{id}` - Eliminar sucursal

### Órdenes
- `GET /api/orders` - Listar órdenes
- `GET /api/orders/branch/{branchId}` - Órdenes por sucursal
- `POST /api/orders/create` - Crear orden
- `PUT /api/orders/{id}/status` - Actualizar estado
- `PUT /api/orders/{id}/assign-branch` - Asignar a sucursal

### Conversaciones
- `GET /api/conversations` - Listar conversaciones
- `GET /api/conversations/{platform}/{contactId}` - Detalle
- `POST /api/messages/send` - Enviar mensaje
- `POST /api/messages/mark-read` - Marcar como leído

### Dashboard
- `GET /api/dashboard/admin` - Estadísticas admin
- `GET /api/dashboard/logistics` - Estadísticas logística
- `GET /api/dashboard/employee` - Estadísticas empleado

Ver documentación completa en: https://api-meta-service.vercel.app/api/docs/

## 🛠️ Tecnologías

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: v19 con Client/Server Components
- **TypeScript**: Tipado completo
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **API**: Cliente personalizado con fetch

## 📚 Documentación Adicional

- [IMPLEMENTACION.md](IMPLEMENTACION.md) - Documentación detallada del sistema
- [ENDPOINTS_ACTUALIZADOS.md](ENDPOINTS_ACTUALIZADOS.md) - Endpoints implementados
- [ENDPOINTS_FALTANTES.md](ENDPOINTS_FALTANTES.md) - Historial de endpoints (ahora implementados)

## 🔧 Comandos Disponibles

```bash
# Desarrollo con Turbopack
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint
```

## 🎨 Próximos Pasos Sugeridos

### Interfaces Administrativas
1. **Gestión de Usuarios** - CRUD completo con interfaz
2. **Gestión de Sucursales** - CRUD completo con interfaz
3. **Vista Avanzada de Órdenes** - Filtros y búsqueda mejorada

### Mejoras Funcionales
1. **WebSockets** - Actualizaciones en tiempo real
2. **Notificaciones** - Sistema de alertas
3. **Reportes** - Gráficas y análisis
4. **Exportar Datos** - CSV, PDF, Excel

### UX/UI
1. **Loading Skeletons** - Mejor feedback visual
2. **Toast Notifications** - Mensajes de éxito/error
3. **Validación de Formularios** - Zod o Yup
4. **Temas** - Dark mode

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Protección de rutas por rol
- ✅ Token en headers Authorization
- ✅ Logout seguro con limpieza de tokens

## 📞 Soporte

Para problemas o consultas sobre el sistema:
- Revisa la [documentación](IMPLEMENTACION.md)
- Verifica el [estado de los endpoints](ENDPOINTS_ACTUALIZADOS.md)
- Consulta la [API docs](https://api-meta-service.vercel.app/api/docs/)

---

**Última actualización**: Enero 2025
**Estado**: ✅ Producción Ready con Backend Integrado
