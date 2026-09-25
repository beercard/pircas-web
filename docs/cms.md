# Guía del panel (CMS)

Panel: **`https://pircas.com.ar/admin`**. Todo lo que se ve en el sitio se edita acá, sin tocar código.

## Roles

| Rol | Puede |
|---|---|
| **Super administrador** | Todo: usuarios y roles, analítica, destinatarios de emails, borrar consultas, más todo lo del editor. |
| **Editor** | Productos, líneas, categorías, proyectos, páginas, home, imágenes, SEO, redirecciones, menú, footer, datos del negocio, asesor, cotizador, consultas (ver, cambiar estado, notas, exportar). |

Usuarios: **Sistema → Usuarios** (solo super-admin). Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.

## Conceptos básicos

- **Borrador y publicado**: los cambios se guardan como borrador automáticamente. El sitio muestra solo lo **publicado**. Botón **Publicar** para que se vea.
- **Vista previa**: botón **Vista previa** (o el panel de vista en vivo con tamaños Mobile / Tablet / Desktop) muestra el borrador tal cual se verá, sin publicarlo.
- **Versiones**: pestaña **Versiones** de cada documento → comparar y **restaurar** una versión anterior.
- **Orden**: en listas (galerías, beneficios, secciones de la home) arrastrá las filas desde el ícono ⋮⋮. En listados (productos, líneas, proyectos) usá el campo **Orden** (menor = primero).
- **Actualización del sitio**: al publicar, el sitio se actualiza en la próxima visita. No hace falta pedir un deploy.

## Crear un producto

1. **Catálogo → Productos → Crear nuevo**.
2. **Información principal**: nombre, categoría, línea (si corresponde), descripción corta (tarjetas y Google), descripción completa, *Pensado para* (ej. "Duchas lineales y bañeras"), **datos destacados** (hasta 3, ej. "65 mm" · "Parantes") y **configuraciones** (chips: "2 hojas", "Con mosquitero"…).
3. **Imágenes**: imagen principal + galería (arrastrar para ordenar). Cada imagen necesita **texto alternativo** (qué se ve en la foto).
4. **Características**: beneficios, "Dónde funciona mejor", aplicaciones e imagen de aplicación.
5. **Información técnica**: filas *Característica → Valor*. El campo **Grupo** arma los paneles desplegables ("Características técnicas", "Materiales", "Medidas y fabricación"). El panel "Entrega e instalación" es común a todos y se edita en **Configuración → Datos del negocio → Info común de productos**.
6. **Cotizador** (opcional): *Ofrecer en el cotizador* y cómo se calcula el precio (según la línea, o precio propio por m² como las mamparas), multiplicador (ej. puertas 1.3) y si pide "lado 2".
7. **SEO**: título y descripción para Google (con vista previa). Si se dejan vacíos se usan nombre y descripción corta.
8. **Destacado** (lateral) para que aparezca en la home. **Publicar**.

> Imágenes: subí JPG/PNG/WebP de buena calidad (idealmente ≥ 1920 px de ancho para portadas). El sistema reduce las muy grandes y genera versiones optimizadas; elegí el **punto focal** para que el recorte en mobile no corte lo importante.

## Líneas (Herrero Económica, Reforzada, Modena)

**Catálogo → Líneas**. Cada línea tiene su página `/lineas/<slug>` con: hero (etiqueta, nombre, frase), introducción + datos, beneficios clave, información técnica, aplicaciones, galería, preguntas frecuentes y "otras líneas". También:
- **Destacar etiqueta en terracota** para la recomendada ("Más elegida").
- **Puntos para la tarjeta** (3) que se ven en la home.
- **Cotizador**: precio de referencia por m² y opciones de vidrio con su multiplicador (Float 1 · Laminado 1.25 · DVH 1.45).
- **Información técnica → Ficha técnica descargable (PDF)**: aparece como "Descargar ficha técnica" en la página de la línea y en Obras y profesionales. (Medios acepta PDF.)

## Proyectos

**Proyectos → Proyectos**: título, categorías (filtros del portfolio), ubicación, año, cantidad de aberturas, frase principal, descripción, portada, galería, línea principal, **productos utilizados** (se enlazan solos) y **Qué llevó** (datos técnicos grandes). Categorías del filtro en **Proyectos → Categorías de proyectos**.

Para mostrar **antecedentes de obra** en *Obras y profesionales*, asigná a esos proyectos la categoría **Obras**. Mientras ningún proyecto la tenga, esa sección no se muestra.

## Dos ambientes: "Para tu casa" y "Obras y profesionales"

El sitio se orienta a dos públicos:
- **Para tu casa** (`/para-tu-casa`): quien construye o reforma. Productos, líneas, medición e instalación, asesor, ejemplos, preguntas frecuentes.
- **Obras y profesionales** (`/obras-y-profesionales`): arquitectos, constructoras y desarrolladores. Interlocutor responsable, cómo cotizamos y coordinamos entregas, líneas, **documentación técnica**, antecedentes y un **formulario de obra** (empresa, rol, obra y ubicación, etapa, cantidad de aberturas, entrega estimada y enlace a planos).

Son páginas normales (**Contenido → Páginas**): se editan con bloques. En la home, el bloque **Para quién (casas / obras)** muestra las dos tarjetas. Conviene completar en *Obras y profesionales* el nombre y contacto del responsable (bloque "Un solo responsable…").

## Home y páginas (bloques)

**Contenido → Home** y **Contenido → Páginas** se arman con **secciones (bloques)**:

| Bloque | Para qué |
|---|---|
| Hero | Portada: foto a pantalla completa (header transparente), editorial o solo texto. Botones y "compromisos". |
| Frase de marca | "Medimos. Fabricamos. Colocamos." o frase + texto. |
| Texto + imagen | Foto a media pantalla o contenida, con etiquetas, puntos, datos y botones. |
| Beneficios / características | Grilla con formas de marca o íconos, o grilla simple con borde. |
| Líneas de producto | Tarjetas de las líneas (todas o elegidas). |
| Categorías / soluciones | Mosaicos "También hacemos". |
| Grilla de productos | Destacados, por categoría, por línea o elegidos; diseño tarjetas o grande (mamparas). |
| Pasos / pilares | Línea de tiempo, pilares o lista numerada con texto e imagen. |
| Asesor virtual | Preguntas y recomendación (se configura aparte, ver abajo). |
| Llamado a la acción | Franja terracota o recuadro. |
| Grilla de proyectos | Destacados, recientes, de una categoría o elegidos. |
| Para quién (casas / obras) | Tarjetas de los dos públicos, cada una con su página. |
| Documentación técnica | Líneas con enlace a su ficha y PDF, más archivos sueltos para descargar. |
| Galería · FAQ · Texto enriquecido · Video · Espaciador | Contenido libre. |
| Contacto · Cotizador | Formularios (sus opciones se editan en Configuración → Formularios). El bloque Contacto tiene la opción **Formulario: Obras y profesionales**. |

En cada bloque, **Ajustes de la sección**: *Ocultar esta sección* (sin borrarla), fondo, espaciado, ancla (`/pagina#ancla`) y **Ocultar en** mobile / tablet / desktop.

Páginas protegidas (no se pueden borrar ni cambiar su URL porque están enlazadas desde todo el sitio): **nosotros, contacto, cotizador, mamparas**. Se puede editar todo su contenido. En Cotizador y Contacto está activado *Ocultar la franja final*.

Listados (**Contenido → Páginas de listados**): título, bajada, SEO y secciones debajo de `/productos`, `/lineas` y `/proyectos`.

## Menú, footer y datos del negocio

- **Configuración → Menú (header)**: ítems (arrastrar para ordenar), menú desplegable grande con columnas y recuadro destacado, botón "Solicitar presupuesto", acceso a WhatsApp.
- **Configuración → Pie de página**: franja final, columnas de enlaces, copyright (`{year}` = año actual).
- **Configuración → Datos del negocio**: nombre, logos, favicon, teléfono, **WhatsApp** (número único para todo el sitio + mensaje predefinido + botón flotante/barra mobile), dirección, mapa, horarios, zona de cobertura y redes.

## Asesor virtual

**Configuración → Asesor virtual**: preguntas (en orden), respuestas y **puntos por línea** de cada respuesta. Gana la línea con más puntos; en empate, la "línea de desempate". Textos de recomendación por línea.

Ejemplo: "¿Qué priorizás? → Precio" suma 5 a Económica y 2 a Reforzada.

## Cotizador y formularios

**Configuración → Formularios y cotizador**:
- Paso 1 (¿Qué necesitás?): opciones, qué categorías ofrece cada una y producto preseleccionado.
- Tipos de proyecto (cotizador y contacto), texto de "medición en obra".
- **Precio estimado**: mostrar/ocultar precios, superficie mínima, redondeo, medidas mín./máx. y aclaración.
- Mensajes de éxito, destinatarios de avisos (super-admin) y email de confirmación al cliente.

Los precios por m² se editan en cada **línea** y en los productos con precio propio. El servidor siempre recalcula el precio: nadie puede enviar un monto falso.

## Consultas (leads)

**Consultas → Consultas**:
- Columnas: nombre, tipo (contacto / cotización / obra-profesional), email, teléfono, tipo de proyecto, producto, origen, estado, fecha. Filtros, búsqueda y orden.
- Abrí una consulta para ver todo: aberturas pedidas con medidas y estimado, medición en obra, página de llegada y campaña (UTM). Las consultas de obra tienen la pestaña **Obra** (empresa, etapa, aberturas, entrega, planos).
- Cambiá el **Estado** (Nueva → Contactada → Calificada → Presupuestada → Ganada/Perdida) y sumá **Notas internas** (firma y fecha automáticas).
- **Exportar CSV** (respeta los filtros aplicados; abre en Excel).

El inicio del panel muestra las últimas cotizaciones y consultas, contadores y accesos rápidos.

## SEO

- Cada producto, línea, categoría, proyecto, página y la home tiene pestaña **SEO**: título, descripción, imagen para compartir, URL canónica (opcional) y *ocultar de buscadores*. Incluye vista previa del resultado en Google.
- **SEO → SEO general**: nombre del sitio, formato de títulos, textos e imagen por defecto, tipo de negocio (datos estructurados).
- Sitemap (`/sitemap.xml`) y datos estructurados (Organización/Negocio local, sitio, migas de pan, producto, FAQ) se generan solos.

## Redirecciones

**SEO → Redirecciones → Crear**: *Desde* (URL vieja, ej. `/ventanas-modena`) → *Hacia* (contenido del sitio o URL) y tipo **301** (permanente, recomendado) o **302** (temporal). Se aplica en hasta 1 minuto. Si cambiás el slug de algo publicado, creá una redirección desde la URL anterior.

## Agregar un idioma (developers)

Los campos de texto ya son traducibles. Agregar en `payload.config.ts`:

```ts
localization: { locales: [{ code: 'es', label: 'Español' }, { code: 'en', label: 'English' }], defaultLocale: 'es', fallback: true },
```

Luego `pnpm migrate:create add-localization`, revisar la migración (mueve los textos a tablas `_locales`) y adaptar las rutas del frontend (`/en/...`).
