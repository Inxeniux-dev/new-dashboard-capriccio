# 📅 Solicitud de Implementación - Endpoint de Reportes con Fechas Personalizadas

## Estado: 🔴 URGENTE

**Fecha:** 2024-11-02
**Solicitado por:** Frontend Team
**Para:** Backend Team

---

## Problema Actual

El frontend tiene implementada la funcionalidad de **período personalizado** en la sección de Reportes Ejecutivos, pero el backend no tiene el endpoint correspondiente para manejar rangos de fechas personalizadas.

### Error que ocurre:
```
ApiError: Error en la petición
La ruta /api/reports/presets/custom no existe en este servidor
```

---

## Endpoint Requerido

### 1. Reporte con Fechas Personalizadas

```http
GET /api/reports/presets/custom
```

#### Parámetros Query:

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `startDate` | string | ✅ Sí | Fecha de inicio (formato YYYY-MM-DD) | `2024-10-01` |
| `endDate` | string | ✅ Sí | Fecha de fin (formato YYYY-MM-DD) | `2024-10-31` |
| `platform` | string | ⚪ Opcional | Filtrar por plataforma específica | `whatsapp`, `instagram`, `messenger` |
| `includeAIAnalysis` | boolean | ⚪ Opcional | Incluir análisis de IA | `true` o `false` (default: `false`) |

#### Ejemplo de llamada:
```http
GET /api/reports/presets/custom?startDate=2024-10-01&endDate=2024-10-31&includeAIAnalysis=true
```

#### Respuesta esperada:
```json
{
  "success": true,
  "report": {
    "period": {
      "startDate": "2024-10-01",
      "endDate": "2024-10-31",
      "preset": "custom"
    },
    "metrics": {
      "totalRevenue": 45320.00,
      "totalOrders": 156,
      "completedOrders": 142,
      "newContacts": 89,
      "totalMessages": 1234,
      "messagesPerContact": 13.86,
      "conversionRate": "56.7",
      "paymentRate": "91.0",
      "averageOrderValue": 290.51,
      "topPlatform": "whatsapp"
    },
    "orders": {
      "total": 156,
      "byStatus": {
        "pending": 8,
        "in_progress": 6,
        "completed": 142,
        "cancelled": 0
      }
    },
    "conversations": {
      "total": 89,
      "totalMessages": 1234,
      "byPlatform": {
        "whatsapp": 756,
        "instagram": 312,
        "messenger": 166
      }
    },
    "aiAnalysis": {
      "summary": "Durante el período personalizado del 1 al 31 de octubre...",
      "keyInsights": [
        "Incremento del 23% en ventas respecto al período anterior",
        "WhatsApp continúa siendo el canal principal con 61% de las conversaciones",
        "La tasa de conversión mejoró significativamente"
      ],
      "recommendations": [
        "Mantener el enfoque en WhatsApp como canal principal",
        "Considerar promociones especiales para Instagram",
        "Optimizar los tiempos de respuesta en Messenger"
      ],
      "trends": [
        "Crecimiento sostenido en nuevos contactos",
        "Mayor engagement en las tardes",
        "Preferencia por pagos digitales"
      ]
    }
  }
}
```

---

## Implementación Sugerida

### Backend (Node.js/Express ejemplo):

```javascript
// Ruta: /api/reports/presets/custom
router.get('/api/reports/presets/custom', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      platform,
      includeAIAnalysis = false
    } = req.query;

    // Validar fechas requeridas
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate y endDate son requeridos"
      });
    }

    // Validar formato de fechas (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido. Use YYYY-MM-DD"
      });
    }

    // Validar que startDate <= endDate
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "La fecha de inicio no puede ser posterior a la fecha de fin"
      });
    }

    // Obtener métricas para el rango de fechas
    const metrics = await getMetricsForDateRange(startDate, endDate, platform);

    // Obtener estadísticas de órdenes
    const orderStats = await getOrderStatsForDateRange(startDate, endDate, platform);

    // Obtener estadísticas de conversaciones
    const conversationStats = await getConversationStatsForDateRange(startDate, endDate, platform);

    // Generar análisis de IA si se solicita
    let aiAnalysis = null;
    if (includeAIAnalysis === 'true' || includeAIAnalysis === true) {
      aiAnalysis = await generateAIAnalysisForCustomPeriod(
        metrics,
        orderStats,
        conversationStats,
        startDate,
        endDate
      );
    }

    // Construir respuesta
    const response = {
      success: true,
      report: {
        period: {
          startDate,
          endDate,
          preset: "custom"
        },
        metrics,
        orders: orderStats,
        conversations: conversationStats,
        ...(aiAnalysis && { aiAnalysis })
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({
      success: false,
      message: "Error al generar el reporte personalizado"
    });
  }
});
```

---

## Validaciones Importantes

1. **Fechas requeridas**: `startDate` y `endDate` deben ser proporcionadas siempre
2. **Formato de fecha**: Debe ser `YYYY-MM-DD`
3. **Rango válido**: `startDate` debe ser menor o igual a `endDate`
4. **Límite de rango**: Considerar limitar a máximo 1 año para evitar sobrecarga
5. **Fecha futura**: No permitir fechas posteriores a la fecha actual

---

## Casos de Prueba

### Caso 1: Solicitud válida
```http
GET /api/reports/presets/custom?startDate=2024-10-01&endDate=2024-10-31
```
**Resultado esperado:** Retorna reporte con métricas del período

### Caso 2: Con análisis de IA
```http
GET /api/reports/presets/custom?startDate=2024-10-01&endDate=2024-10-31&includeAIAnalysis=true
```
**Resultado esperado:** Retorna reporte con métricas y análisis de IA

### Caso 3: Con filtro de plataforma
```http
GET /api/reports/presets/custom?startDate=2024-10-01&endDate=2024-10-31&platform=whatsapp
```
**Resultado esperado:** Retorna reporte solo con datos de WhatsApp

### Caso 4: Fechas faltantes
```http
GET /api/reports/presets/custom?startDate=2024-10-01
```
**Resultado esperado:** Error 400 - "endDate es requerido"

### Caso 5: Rango inválido
```http
GET /api/reports/presets/custom?startDate=2024-10-31&endDate=2024-10-01
```
**Resultado esperado:** Error 400 - "La fecha de inicio no puede ser posterior a la fecha de fin"

---

## Notas Adicionales

- El endpoint debe seguir la misma estructura de respuesta que los otros presets (`today`, `this-week`, `this-month`, etc.)
- Reutilizar la lógica existente de cálculo de métricas, solo cambiando el filtro de fechas
- Si ya existe lógica para generar reportes por fecha, puede reutilizarse
- El análisis de IA debe mencionar que es un "período personalizado" en lugar de usar nombres de presets

---

## Prioridad: 🔴 ALTA

Este endpoint es necesario para que la funcionalidad de fechas personalizadas funcione correctamente en el frontend que ya está implementado.

---

## Contacto

Si tienen dudas sobre la implementación o necesitan más detalles, por favor contactar al equipo de frontend.

**Frontend ya implementado y esperando este endpoint** ✅