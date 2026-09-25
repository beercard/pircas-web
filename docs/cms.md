# Guía del panel

Panel: **`/admin`** (hoy `https://pircas-web.vercel.app/admin`). Está pensado como Tiendanube o Shopify: un menú con tareas, un inicio que muestra qué hay que atender y fichas simples para cargar productos y trabajos.

## El panel de un vistazo

Menú lateral (en celular se abre con ☰):

| Sección | Qué hay |
|---|---|
| **Inicio** | Saludo, consultas pendientes, accesos a lo más frecuente, actividad de los últimos 30 días, guía **"Dejá tu sitio listo"** y (super administrador) el estado de seguridad. |
| **Consultas** | Contactos, cotizaciones y consultas de obra. El número terracota indica las nuevas. |
| **Productos** | Productos, Líneas y Categorías. |
| **Trabajos** | Trabajos realizados (portfolio) y sus categorías. |
| **Páginas del sitio** | Página de inicio, otras páginas (Nosotros, Contacto, Mamparas, Para tu casa, Obras y profesionales…) y listados. |
| **Fotos y archivos** | Biblioteca de fotos y PDFs. |
| **Configuración** | Datos del negocio, formularios y cotizador, asesor virtual, analítica y usuarios. |

Abajo del menú: **Ver el sitio**, tu usuario (datos de la cuenta) y **cerrar sesión**.

**No están en el panel** (se gestionan por código, ver al final): SEO, redirecciones, menú del sitio y pie de página.

## Roles

| Rol | Puede |
|---|---|
| **Super administrador** | Todo: usuarios y roles, analítica, destinatarios de emails, borrar consultas y todo lo del editor. |
| **Editor** | Productos, líneas, trabajos, páginas, fotos, datos del negocio, asesor, cotizador y consultas (ver, cambiar estado, notas, exportar). |

## Conceptos básicos

- **Borrador y publicado**: los cambios se guardan solos como borrador. El sitio muestra solo lo **publicado**: botón **Publicar cambios**.
- **Vista previa**: el ícono del ojo muestra el borrador tal cual se verá (mobile / tablet / desktop), sin publicarlo.
- **Versiones**: pestaña **Versiones** de cada ficha → comparar y **restaurar** una versión anterior.
- **Orden**: en listas (fotos, beneficios, secciones de una página) arrastrá desde el ícono ⋮⋮. En los listados de productos y trabajos usá el campo **Orden** (menor = primero).
- **Actualización del sitio**: al publicar, el sitio se actualiza en la próxima visita. No hace falta pedir nada.

## Fotos

- **Subir varias a la vez**: en **Fotos y archivos → Subida en lotes**, o arrastrando las fotos desde la computadora a cualquier campo de fotos.
- **Galerías** (productos, líneas, trabajos, sección Galería): se eligen o suben **varias fotos de una vez** y se ordenan arrastrando.
- **Texto alternativo**: opcional. Si queda vacío se completa solo con el nombre del archivo (conviene nombrar los archivos con lo que muestran: `ventana-corrediza-living.jpg`).
- **Epígrafe**: se escribe en la propia foto (Fotos y archivos → abrir la foto) y se muestra en todas las galerías donde aparece.
- **Punto focal**: al abrir una foto, marcá lo importante para que los recortes en celular no lo corten.
- Los campos de foto solo muestran imágenes (los PDF quedan para las fichas técnicas). Las fotos grandes se reducen solas y se generan versiones optimizadas para cada dispositivo.
- En **Inicio → Dejá tu sitio listo** se cuentan las fotos de ejemplo que falta reemplazar (el botón **Resolver** filtra la biblioteca).

## Crear un producto

**Productos → Crear**. Arriba lo esencial:
1. **Nombre** y **descripción corta** (tarjetas, listados y buscadores).
2. **Fotos**: la **foto principal** (la de las tarjetas) y **más fotos** para la galería.
3. A la derecha: **categoría**, **línea** (si corresponde), **destacado** (aparece en la home), dirección web (se genera sola) y orden.

Plegado, para cuando haga falta:
- **Descripción y detalles**: descripción completa, *Pensado para*, datos destacados (hasta 3) y configuraciones ("2 hojas", "Con mosquitero"…).
- **Beneficios y usos**: beneficios, dónde funciona mejor, aplicaciones y foto de aplicación.
- **Ficha técnica**: filas *Característica → Valor*; el campo **Grupo** arma los paneles desplegables. "Entrega e instalación" es común a todos y se edita en Datos del negocio.
- **Cotizador online**: ofrecerlo en el cotizador y cómo se calcula el precio (según la línea o precio propio por m², multiplicador, "lado 2").

**Publicar cambios**.

## Líneas

**Productos → Líneas**: nombre, frase corta, descripción, fotos (principal, aplicaciones y galería); a la derecha la **etiqueta** ("Más elegida") y si se destaca en terracota. Plegado: presentación, beneficios y preguntas frecuentes, **ficha técnica** (con **PDF descargable**, que aparece en la página de la línea y en Obras y profesionales) y **cotizador** (precio por m² y vidrios con su multiplicador: Float 1 · Laminado 1.25 · DVH 1.45).

## Trabajos

**Trabajos → Trabajos realizados → Crear**: título, resumen, **foto de portada** y **fotos de la obra**; a la derecha categorías, ubicación, año y cantidad de aberturas. Plegado: la historia de la obra (frase principal y descripción) y productos/datos técnicos (línea, productos usados, "Qué llevó").

Para mostrar **antecedentes** en *Obras y profesionales*, asigná la categoría **Obras**. Mientras ningún trabajo la tenga, esa sección no se muestra.

## Dos ambientes: "Para tu casa" y "Obras y profesionales"

- **Para tu casa** (`/para-tu-casa`): quien construye o reforma. Productos, líneas, medición e instalación, asesor, ejemplos, preguntas frecuentes.
- **Obras y profesionales** (`/obras-y-profesionales`): arquitectos, constructoras y desarrolladores. Interlocutor responsable, cómo cotizamos y coordinamos entregas, líneas, **documentación técnica**, antecedentes y un **formulario de obra** (empresa, rol, obra y ubicación, etapa, cantidad de aberturas, entrega estimada y enlace a planos).

Son páginas normales (**Páginas del sitio → Otras páginas**). En la home, la sección **Para quién** muestra las dos tarjetas. Conviene completar en *Obras y profesionales* el nombre y contacto del responsable.

## Páginas y secciones

**Páginas del sitio → Página de inicio / Otras páginas** se arman con **secciones**. Cada sección se ve en la lista con su título; se abre para editarla y se arrastra para reordenarla.

| Sección | Para qué |
|---|---|
| Hero | Portada: foto a pantalla completa, editorial o solo texto. Botones y "compromisos". |
| Frase de marca | "Medimos. Fabricamos. Colocamos." o frase + texto. |
| Texto + imagen | Foto a media pantalla o contenida, con etiquetas, puntos, datos y botones. |
| Beneficios | Grilla con formas de marca o íconos. |
| Líneas de producto · Categorías · Grilla de productos | Catálogo. |
| Pasos / pilares | Línea de tiempo, pilares o lista numerada. |
| Asesor virtual · Cotizador · Contacto | Herramientas (opciones en Configuración). El Contacto tiene la opción **Formulario: Obras y profesionales**. |
| Para quién (casas / obras) | Tarjetas de los dos públicos. |
| Documentación técnica | Líneas con su ficha y PDF, más archivos sueltos. |
| Llamado a la acción · Grilla de trabajos · Galería · Preguntas frecuentes · Texto · Video · Espaciador | Contenido libre. |

Cada sección tiene **Ajustes de la sección** (plegado): ocultarla sin borrarla, fondo, espaciado, ancla y ocultarla en mobile / tablet / desktop. Una sección oculta se marca **Oculta** en la lista.

Páginas protegidas (no se pueden borrar ni cambiar su dirección): **nosotros, contacto, cotizador, mamparas**. Sí se puede editar su contenido.

## Datos del negocio

**Configuración → Datos del negocio**: nombre, logos, teléfono, **WhatsApp** (número único para todo el sitio, mensaje predefinido, botón flotante y barra en celular), dirección y enlace a Google Maps, horarios, zona de cobertura y redes.

## Asesor virtual

**Configuración → Asesor virtual**: preguntas, respuestas y **puntos por línea** de cada respuesta. Gana la línea con más puntos; en empate, la "línea de desempate". Ejemplo: "¿Qué priorizás? → Precio" suma 5 a Económica y 2 a Reforzada.

## Cotizador y formularios

**Configuración → Formularios y cotizador**: opciones del paso 1, tipos de proyecto, texto de "medición en obra", **precio estimado** (mostrar/ocultar, superficie mínima, redondeo, medidas mín./máx. y aclaración), mensajes, destinatarios de avisos (super administrador) y email de confirmación al cliente. Los precios por m² se editan en cada **línea** y en los productos con precio propio; el servidor siempre recalcula el precio.

## Consultas

**Consultas**: nombre, tipo (contacto / cotización / obra), contacto, producto, origen, estado y fecha, con filtros y búsqueda. Cada consulta muestra todo lo que envió la persona (aberturas con medidas y estimado, datos de la obra, página de llegada y campaña). Cambiá el **Estado** (Nueva → Contactada → Calificada → Presupuestada → Ganada/Perdida), sumá **Notas internas** y usá **Exportar CSV** (respeta los filtros; abre en Excel).

## Seguridad

- **Contraseñas fuertes**: mínimo 10 caracteres, con letras y números; no se aceptan contraseñas obvias ni que contengan el email. Se aplica al crear usuarios, al cambiarla y al restablecerla.
- **Bloqueos**: 5 intentos fallidos bloquean la cuenta 15 minutos; además hay un límite de intentos por dirección IP.
- **Sesiones**: vencen a las 8 horas; *cerrar sesión* las invalida en el servidor. La cookie es segura (HttpOnly, solo HTTPS en producción) y el token no viaja en las respuestas.
- **Último acceso** de cada usuario visible en Usuarios y en el Inicio (super administrador).
- El panel no se indexa en buscadores ni se guarda en cachés compartidas, y el avatar no usa servicios externos (Gravatar).
- Solo un super administrador crea usuarios y asigna roles.

## Gestionado por código (developers)

- **SEO**: los campos `meta` (título, descripción, imagen, canonical, noindex) de productos, líneas, categorías, trabajos, páginas y home siguen en la base pero están ocultos en el panel; si están vacíos, el sitio genera título y descripción desde el contenido. `SEO general` (global `seo-defaults`) y el SEO de los listados también están ocultos. Se editan con scripts/seed (API local de Payload).
- **Redirecciones** (colección `redirects`): ocultas en el panel; se crean por script. El proxy las aplica (301/302) en hasta 1 minuto.
- **Menú y pie de página** (globals `header` y `footer`): ocultos en el panel; su contenido está en `src/seed/content.ts` / `src/seed/audiences.ts`.
- **Entrar al panel en desarrollo sin contraseña**: definir `PAYLOAD_DEV_AUTOLOGIN_EMAIL` con el email de un usuario local (nunca se activa en producción).

## Agregar un idioma (developers)

Los campos de texto ya son traducibles. Agregar en `payload.config.ts`:

```ts
localization: { locales: [{ code: 'es', label: 'Español' }, { code: 'en', label: 'English' }], defaultLocale: 'es', fallback: true },
```

Luego `pnpm migrate:create add-localization`, revisar la migración (mueve los textos a tablas `_locales`) y adaptar las rutas del frontend (`/en/...`).
