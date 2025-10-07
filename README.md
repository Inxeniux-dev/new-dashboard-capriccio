# Capriccio Homemade Goods - CRM

Sistema CRM desarrollado para **Capriccio Homemade Goods**, una chocolatería artesanal que gestiona pedidos a través de redes sociales (Instagram, WhatsApp, Messenger).

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15+ (App Router)
- **Estilos:** Tailwind CSS v4
- **Lenguaje:** TypeScript
- **Iconos:** Lucide React
- **Utilidades:** clsx

## 🎨 Características Implementadas

### ✅ Página de Login
- Diseño elegante con glassmorphism
- Gradiente en tonos chocolate según la identidad de marca
- Formulario funcional con validaciones
- Redirección automática al dashboard

### ✅ Sidebar Navigation
- Navegación colapsable y responsive
- Menús desplegables para redes sociales
- Estados hover y activo
- Adaptación móvil con overlay

### ✅ Dashboard Principal
- Cards de métricas con indicadores de cambio
- Tabla de pedidos recientes
- Panel de actividad de redes sociales
- Feed de mensajes en tiempo real
- Header con notificaciones

## 🎨 Paleta de Colores

```css
--chocolate-dark: #6B4423    /* Color primario */
--chocolate-hover: #5A3819   /* Hover states */
--caramel: #D4A574          /* Color secundario */
--cream: #E8D5C4            /* Color de acento */
--warm-white: #FAF7F5       /* Fondo cálido */
```

## 🚀 Instalación y Uso

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd new-dashboard-capriccio
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 📱 Rutas Disponibles

- `/` - Página de login
- `/dashboard` - Dashboard principal (requiere "login")

## 🎯 Funcionalidades por Implementar

- [ ] Sistema de autenticación real (NextAuth.js)
- [ ] Integración con APIs de redes sociales
- [ ] Base de datos (Supabase/Firebase)
- [ ] Gestión completa de pedidos (CRUD)
- [ ] Gestión de clientes
- [ ] Sistema de reportes
- [ ] Configuraciones de usuario

## 📖 Estructura del Proyecto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx      # Layout del dashboard
│   │   └── page.tsx        # Página principal del dashboard
│   ├── globals.css         # Estilos globales con variables CSS
│   └── page.tsx           # Página de login
└── components/
    └── Sidebar.tsx        # Componente de navegación lateral
```

## 🎨 Componentes Reutilizables

### MetricCard
Tarjeta para mostrar métricas con indicadores de cambio:
```tsx
<MetricCard
  title="Pedidos Hoy"
  value="15"
  change="+12%"
  icon={Package}
  isPositive={true}
/>
```

### Sidebar
Sistema de navegación lateral responsive con soporte para submenús.

## 📱 Diseño Responsive

- **Mobile:** < 640px - Sidebar oculto (hamburger menu)
- **Tablet:** 640px - 1024px - Sidebar colapsado por defecto
- **Desktop:** > 1024px - Sidebar expandido

## 🚀 Deploy

El proyecto está configurado para despliegue en Vercel:

```bash
npm run build
```

## 📄 Licencia

Este proyecto es privado y está desarrollado específicamente para Capriccio Homemade Goods.
