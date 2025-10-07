# Capriccio Homemade Goods - CRM Web Application

## Descripción del Proyecto

Sistema CRM desarrollado para **Capriccio Homemade Goods**, una chocolatería artesanal que gestiona pedidos a través de redes sociales (Instagram, WhatsApp, Messenger).

---

## Stack Tecnológico

- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript

---

## Propuesta de Diseño UI/UX

### 1. Login Page

#### Características Visuales
- Diseño minimalista y elegante
- Fondo con gradiente suave en tonos chocolate (browns/creams)
- Card centrado con glassmorphism effect
- Logo de Capriccio prominente en la parte superior

#### Elementos
```
┌─────────────────────────────────────┐
│         [Logo Capriccio]            │
│                                     │
│    ┌─────────────────────────┐    │
│    │                         │    │
│    │  Email:                 │    │
│    │  [________________]     │    │
│    │                         │    │
│    │  Contraseña:            │    │
│    │  [________________]     │    │
│    │                         │    │
│    │  ☐ Recordarme          │    │
│    │                         │    │
│    │    [Iniciar Sesión]     │    │
│    │                         │    │
│    │  ¿Olvidaste tu          │    │
│    │   contraseña?           │    │
│    │                         │    │
│    └─────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### Colores Sugeridos
- **Primario:** `#6B4423` (chocolate oscuro)
- **Secundario:** `#D4A574` (caramelo)
- **Acento:** `#E8D5C4` (crema)
- **Fondo:** `#FAF7F5` (blanco cálido)

---

### 2. Sidebar Navigation

#### Layout
- Sidebar colapsable (responsive)
- Ancho: 280px (expandido) / 64px (colapsado)
- Posición fija a la izquierda
- Iconos con lucide-react

#### Estructura de Navegación

```
┌──────────────────────┐
│  [Logo Mini/Full]    │
│                      │
├──────────────────────┤
│                      │
│  🏠 Dashboard        │
│  📦 Pedidos          │
│  👥 Clientes         │
│  📱 Redes Sociales   │
│    • Instagram       │
│    • WhatsApp        │
│    • Messenger       │
│  📊 Reportes         │
│  ⚙️  Configuración   │
│                      │
├──────────────────────┤
│                      │
│  [Usuario]           │
│  Cerrar Sesión       │
│                      │
└──────────────────────┘
```

#### Estados Interactivos
- Hover: Fondo suave con color primario
- Activo: Borde izquierdo accentuado + fondo destacado
- Transiciones suaves (300ms)

---

### 3. Dashboard Principal

#### Header
```
┌─────────────────────────────────────────────────────────┐
│  Bienvenido, [Nombre]            🔔 [3]  👤 [Usuario]  │
└─────────────────────────────────────────────────────────┘
```

#### Métricas Principales (Cards)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Pedidos  │ │ Ingresos │ │ Clientes │ │ Mensajes │ │
│  │  Hoy     │ │   Mes    │ │  Nuevos  │ │Pendientes│ │
│  │          │ │          │ │          │ │          │ │
│  │   15     │ │ $45,320  │ │    8     │ │   23     │ │
│  │  +12%    │ │  +8.5%   │ │  +4.2%   │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Secciones Principales

**A. Gráfica de Ventas**
- Chart.js o Recharts
- Vista semanal/mensual/anual
- Línea de tendencia

**B. Pedidos Recientes**
- Tabla con últimos 10 pedidos
- Estados: Pendiente, En Proceso, Completado, Entregado
- Filtros por red social de origen

**C. Actividad de Redes Sociales**
- Feed unificado de mensajes
- Indicadores por plataforma (Instagram/WhatsApp/Messenger)
- Quick actions: Responder, Crear pedido

---

## Guía de Componentes Tailwind

### Card Component
```css
className="bg-white rounded-xl shadow-md hover:shadow-lg 
transition-shadow p-6 border border-gray-100"
```

### Button Primary
```css
className="bg-[#6B4423] hover:bg-[#5A3819] text-white 
font-medium py-2 px-6 rounded-lg transition-colors"
```

### Input Field
```css
className="w-full px-4 py-2 border border-gray-300 
rounded-lg focus:ring-2 focus:ring-[#6B4423] 
focus:border-transparent outline-none"
```

### Badge (Estado de Pedido)
```css
// Pendiente
className="bg-yellow-100 text-yellow-800 px-3 py-1 
rounded-full text-sm font-medium"

// Completado
className="bg-green-100 text-green-800 px-3 py-1 
rounded-full text-sm font-medium"
```

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px - Sidebar oculto (hamburger menu)
- **Tablet:** 640px - 1024px - Sidebar colapsado por defecto
- **Desktop:** > 1024px - Sidebar expandido

### Mobile-First Approach
```css
/* Mobile */
className="p-4"

/* Tablet */
className="md:p-6"

/* Desktop */
className="lg:p-8"
```

---

## Flujo de Usuario

1. **Login** → Validación de credenciales
2. **Dashboard** → Vista general de métricas
3. **Gestión de Pedidos** → CRUD completo
4. **Integración Social** → Recepción automática de mensajes
5. **Reportes** → Análisis de ventas y desempeño

---

## Próximos Pasos

1. ✅ Definir estructura de carpetas Next.js
2. ✅ Crear sistema de diseño con Tailwind
3. ⏳ Implementar componentes base (Login, Sidebar, Dashboard)
4. ⏳ Integración con APIs de redes sociales
5. ⏳ Sistema de autenticación (NextAuth.js)
6. ⏳ Base de datos (Supabase/Firebase)

---

## Notas de Diseño

- Mantener consistencia visual con la identidad de marca de chocolatería artesanal
- Priorizar usabilidad sobre elementos decorativos
- Asegurar accesibilidad (contraste WCAG AA)
- Optimizar para carga rápida (Core Web Vitals)

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0