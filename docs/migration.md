# Migración desde el sitio actual (pircas.com.ar)

## Relevamiento

El sitio actual (relevado el 23/09/2026) es **una sola página** (`https://pircas.com.ar/`). No tiene sitemap (`/sitemap.xml`, `/sitemap_index.xml` y `/wp-sitemap.xml` devuelven 404) ni otras URLs internas: las secciones son anclas dentro de la misma página.

| Sección actual | Ancla |
|---|---|
| Líneas | `/#lineas` |
| Cómo trabajamos | `/#proceso` |
| Asesor | `/#asesor` |
| Mamparas | `/#mamparas` |
| Cotizador de mamparas | `/#cotizador-mampara` |
| Galería | `/#galeria` |
| Presupuesto / contacto | `/#contacto` |

## Mapa de URLs

| URL actual | URL nueva | Acción |
|---|---|---|
| `/` | `/` | Se mantiene (misma URL, nuevo contenido) |
| `/#lineas` | `/lineas` | Ver nota sobre anclas |
| `/#proceso` | `/#proceso` en la home (sección "Así trabajamos") | Ver nota |
| `/#asesor` | `/#asesor` en la home | Ver nota |
| `/#mamparas` | `/mamparas` | Ver nota |
| `/#cotizador-mampara` | `/cotizador?producto=mampara-frontal` | Ver nota |
| `/#galeria` | `/proyectos` | Ver nota |
| `/#contacto` | `/contacto` | Ver nota |

**Nota sobre anclas:** el navegador nunca envía la parte `#…` al servidor, así que no se pueden redirigir con 301. No afecta al SEO (Google indexa solo `/`). Para no romper enlaces viejos compartidos (WhatsApp, Instagram, campañas), las secciones de la home nueva pueden conservar esas anclas: en cada bloque, **Ajustes de la sección → Ancla** (`proceso`, `asesor`, `lineas`, `mamparas`, `galeria`, `contacto`).

No se inventan otras URLs viejas. Si Google Search Console muestra URLs indexadas distintas de `/` (por ejemplo, de una versión anterior del sitio), cargarlas en **SEO → Redirecciones** con tipo 301 hacia la página nueva equivalente.

## Pasos recomendados

1. Antes del cambio: verificar el dominio en **Google Search Console** y exportar "Páginas" y "Rendimiento → Páginas" para confirmar que no haya otras URLs con tráfico.
2. Cargar los IDs de Meta Pixel y Google Ads existentes (ver [analytics.md](analytics.md)) para no perder el historial de campañas.
3. Publicar el sitio nuevo en el mismo dominio.
4. En Search Console: enviar `https://pircas.com.ar/sitemap.xml` y revisar la cobertura durante las primeras semanas.
5. Revisar los enlaces de la bio de Instagram, perfil de Google Business y campañas activas, y actualizarlos a las URLs nuevas (`/cotizador`, `/mamparas`, etc.).
6. Mantener el envío de presupuestos de mamparas: el cotizador anterior enviaba emails con EmailJS desde el navegador. El nuevo guarda cada pedido en el panel (Consultas) y envía los emails desde el servidor.
