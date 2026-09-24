# Analítica

## Configuración

**Configuración → Analítica y píxeles** (solo super-admin):

| Campo | Ejemplo |
|---|---|
| Google Tag Manager | `GTM-XXXXXXX` |
| Google Analytics 4 | `G-XXXXXXXXXX` |
| Google Ads (conversiones) | `AW-123456789` + etiqueta de conversión |
| Meta Pixel | número de 15–16 dígitos |

Si un campo queda vacío se usa la variable de entorno (`GOOGLE_TAG_MANAGER_ID`, `GA4_MEASUREMENT_ID`, `META_PIXEL_ID`). Los IDs se validan antes de insertarse en la página. Los scripts se cargan después de que la página es interactiva (no afectan Core Web Vitals) y **solo en producción** (`ANALYTICS_IN_DEV=true` para probar en local).

> En el sitio actual (pircas.com.ar) hay instalados un Meta Pixel `1320462883175772` y una etiqueta de Google Ads `AW-18177383886` (conversión `AW-18177383886/fMkqCP39hrQcEM6709tD`). Confirmar con el cliente y cargarlos en el panel antes de lanzar para no cortar el historial de campañas.

### ¿GTM o directo?

- **Con GTM**: el sitio solo envía eventos al `dataLayer`; GA4, Ads y Pixel se configuran dentro de GTM. Recomendado si hay alguien que administra GTM.
- **Sin GTM**: el sitio envía directo a GA4 (`gtag`), Google Ads (conversión en envíos de formularios) y Meta Pixel (`fbq`).

Nunca ambos a la vez para la misma herramienta (se contarían doble): si cargás GTM, no cargues GA4/Pixel en el panel, configuralos en GTM.

## Eventos

Todos pasan por una única función, `track()` (`src/lib/analytics/track.ts`).

| Evento | Cuándo | Parámetros | Meta Pixel |
|---|---|---|---|
| `page_view` | Cada navegación (incluye navegación interna) | `page_path`, `page_location`, `page_title` | `PageView` |
| `product_view` | Ficha de producto o línea | `product`/`line`, `category` | `ViewContent` |
| `project_view` | Ficha de proyecto | `project`, `location` | `ViewContent` |
| `quote_start` | Primera elección en el cotizador | `need` | `quote_start` (custom) |
| `quote_step` | Cambio de paso | `step`, `step_name` | custom |
| `quote_submit` | Cotización enviada | `items`, `value`, `currency` | `Lead` (+ conversión Ads) |
| `contact_submit` | Consulta enviada | `project_type` | `Contact` (+ conversión Ads) |
| `whatsapp_click` | Cualquier botón de WhatsApp | `location` (header, floating, mobile_bar, product, quote_cart…), `cta` | `Contact` |
| `phone_click` | Enlaces `tel:` | `location` | `Contact` |
| `advisor_complete` | Resultado del asesor | `recommended_line`, respuestas | custom |

### Configuración sugerida en GTM

- Activadores de tipo **Evento personalizado** con los nombres de la tabla.
- Etiqueta **GA4 Event** con el mismo nombre de evento y las variables de capa de datos correspondientes.
- Marcar `quote_submit` y `contact_submit` como **conversiones clave** en GA4.
- `page_view`: en la etiqueta de configuración de GA4 desactivar "enviar page_view automáticamente" y usar el evento `page_view` del dataLayer (el sitio es una SPA después de la primera carga).

## UTM y atribución

Al llegar al sitio se guardan en la sesión del navegador (`sessionStorage`, primer toque de la sesión):
`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, página de llegada y referente.

Cada consulta y cotización guarda esos datos (pestaña **Origen** de la consulta) y se incluyen en el CSV exportado. Ejemplo de enlace para campañas:

```
https://pircas.com.ar/mamparas?utm_source=facebook&utm_medium=paid&utm_campaign=mamparas-primavera
```

## Privacidad

No se guardan IPs en las consultas. La IP solo se usa en memoria para el límite de envíos y se envía a Cloudflare para validar Turnstile. Si se agregan cookies de marketing para visitantes de la UE, sumar un banner de consentimiento (Consent Mode v2 en GTM).
