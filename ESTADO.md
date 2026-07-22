# ESTADO — CajaBella
Última actualización: 2026-07-22 | 🎉 App publicada y funcionando en https://ctaboadaa.github.io/CajaBella/

## Qué es esta app (3 líneas máximo)
Herramienta interna (NO se vende) para que el personal de un salón de belleza registre cada servicio prestado (fecha, tipo, monto en soles, cliente opcional) y la dueña vea un dashboard con lo facturado. Sin monetización ni versión multi-negocio: un solo salón, uso privado.

## Promesa central
"Esta app ayuda a la dueña de un salón de belleza a saber cuánto factura cada día y qué servicios se piden más, sin pagar ninguna suscripción ni depender de cuadernos/Excel sueltos, registrando cada servicio en el momento desde el celular."

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Vite + React + TypeScript + Tailwind v4 — decidido 2026-07-14 (herramienta interna sin SEO → Vite, no Next.js)
- Hosting: GitHub Pages (gratis), despliegue automático vía GitHub Actions (`.github/workflows/deploy.yml`) — publicada y verificada en https://ctaboadaa.github.io/CajaBella/
- Backend/BFF: Google Apps Script (`backend/Code.gs`), desplegado como Web App — evita exponer credenciales en el frontend estático
- Base de datos: Google Sheets del usuario, con pestañas `Usuarios`, `Servicios`, `TiposDeServicio`, `Sesiones` (creadas por la función `setup()`)
- Sin multi-tenant / sin RLS: un solo negocio, todo usuario autenticado ve todos los datos del salón
- Idioma UI: español, mono-idioma
- Nombre app: CajaBella (provisional, el usuario puede pedir cambiarlo)

## Método de autenticación (definido Sesión 1)
- Cuenta individual por persona (usuario + contraseña), NO Google OAuth ni passkeys (no aplica a este alcance)
- Contraseñas: hash SHA-256 + salt por usuario (`Utilities.computeDigest`), nunca en texto plano
- Sesión: token aleatorio guardado en la pestaña `Sesiones` con expiración de 45 días (`SESION_HORAS_VALIDEZ`), enviado en el body/querystring (NUNCA en header `Authorization`, para evitar preflight CORS que Apps Script no maneja bien)
- Roles: `admin` (gestiona usuarios y tipos de servicio) y `empleado` (solo registra servicios)
- Usuario admin sembrado por `setup()`: usuario `admin` / contraseña `cambiar123` — DEBE cambiarse (endpoint `cambiarPassword` ya existe en el backend)

## Modelo de datos (Sesión 1)
- `Usuarios`: id, nombre, usuario, passwordHash, salt, rol, activo, creadoEn
- `Servicios`: id, fecha, tipoServicioId, monto, clienteNombre, clienteTelefono, usuarioId, creadoEn
- `TiposDeServicio`: id, nombre, activo (soft-delete, nunca se borra para no romper histórico)
- `Sesiones`: token, usuarioId, creadoEn, expiraEn

## Dirección de Arte (Sesión 1 — NO cambiar sin justificación)
- Arquetipo: cercano + cuidado personal, cálido pero profesional (no lujo alta gama)
- Fondo base: #FBF5F2 (blanco cálido) | Superficie elevada: #F5E9E3
- Texto: #322022 (principal) / #7A5C60 (secundario)
- Acento primario: #B5495B (berry/terracota — SOLO en CTA y dato clave)
- Secundario funcional: #A9825A (dorado — insignias/highlights puntuales)
- Tipografía: Display "Young Serif" (cambiada desde Instrument Serif el 2026-07-20 a pedido del usuario — se sentía menos "cercana/cálida") | Cuerpo "Work Sans"
- Radio de bordes: 20px cards (`--radius-card`), 14px controles (`--radius-control`)
- Personalidad: cercana · confiable · sin vueltas

## Ajustes post-lanzamiento (a pedido del usuario, tras probar en Safari/iPhone)
- Sesión: extendida de 12h a 45 días
- Dashboard: la card principal ya NO es "total histórico" — ahora es "Total del mes" (`totalMes`), calculado sobre el mes del día que se está viendo con las flechas ← → (mismo parámetro `fecha` que ya existía). Campo del backend renombrado de `totalAcumulado` a `totalMes` + nuevo campo `mes`.
- Resumen: además de las flechas ← →, ahora se puede tocar "Hoy"/la fecha para abrir el calendario nativo y saltar directo a cualquier día (mismo patrón de input invisible que el campo de fecha de Registrar).
- Campo de fecha de "Registrar servicio": rediseñado para que NUNCA se muestre el control nativo (que en iOS Safari se desbordaba de su caja pese a los intentos de arreglarlo con CSS) — ahora se ve texto propio ("15 de julio de 2026" + ícono de calendario) con el input real invisible encima solo para abrir el picker. Mismo patrón aplicado al selector de fecha de Resumen.
- 🐛 Corregido bug real (no solo de Safari) en `Toggle.tsx`: el círculo del interruptor no tenía una posición `left` explícita, así que el navegador la resolvía a 24px en vez de 0 — en estado activado el círculo se salía ~18px del track hacia la derecha, en TODOS los navegadores (PC, iOS, Android). Se corrigió con `left-1` explícito + `translateX(0 / 20px)`. Verificado con medición exacta de píxeles: el círculo ahora queda dentro del track con el mismo margen (4px) en ambos estados.

## Feature: Historial (editar/borrar servicios registrados) — a pedido del usuario
- Nueva pantalla `/historial` (agregada a la navegación inferior, 4to ítem) con su propio selector de fecha (mismo componente `SelectorDeFecha` extraído y reusado en Resumen) — lista los servicios de un día, con total y cantidad arriba.
- Cada servicio se puede **editar** (fecha, tipo, monto, cliente/teléfono, en un formulario inline) o **borrar** (con confirmación explícita "¿Borrar? No se puede deshacer").
- Regla de permisos: solo quien registró el servicio, o un admin, puede editarlo/borrarlo (verificado en el backend, no solo escondido en la UI).
- Desde Resumen hay un botón "Ver detalle de este día" que lleva directo al Historial de esa fecha.
- Backend: `actualizarServicio` y `eliminarServicio` (acciones nuevas en `Code.gs`) + `listarServicios_` ahora incluye `tipoNombre` y `usuarioNombre` resueltos server-side (antes solo mandaba los IDs).
- Verificado end-to-end contra el Sheet real: creé un servicio de prueba, lo edité, lo borré, y confirmé por API que los registros reales del usuario (Margoth Coope, etc.) no se tocaron.

## Feature: Exportar a Excel/CSV — a pedido del usuario
- Botón "Exportar a Excel/CSV" en Historial, con selector de rango de fechas (Desde/Hasta, mismo componente `CampoFecha` reusable). Por defecto: desde el 1 del mes que se está viendo hasta hoy.
- Genera un CSV (Fecha, Tipo de servicio, Monto (S/), Cliente, Teléfono, Registrado por) ordenado cronológicamente, con BOM UTF-8 (para que Excel muestre bien los acentos) y descarga directa — no necesitó cambios de backend, reusa el endpoint `servicios` que ya existía.
- Verificado: contenido del CSV inspeccionado directamente (capturando el Blob) contra datos reales — encabezados y filas correctos.

## Feature: tendencia semanal, ranking por empleado y precio sugerido — a pedido del usuario
- **Tendencia**: card en Resumen con tabs "7 días" / "6 meses" (`components/Tendencia.tsx`, reemplazó a `TendenciaSemana.tsx`), barras con el período actual resaltado en acento, calculada del lado del cliente reusando el endpoint `servicios` (sin cambios de backend). Verificado con datos reales en ambas vistas.
- **Ranking por empleado**: card nueva en Resumen (**solo visible para admin**, y solo si hay 2+ personas con servicios ese mes) con el total facturado por cada quien. Backend: `dashboard_` ahora también devuelve `porEmpleado`.
- **Precio sugerido por tipo**: en Ajustes, cada tipo de servicio puede tener un precio sugerido (ícono de lápiz para editarlo). En "Registrar servicio", el monto se autocompleta con ese precio al elegir el tipo (solo si el campo estaba vacío — nunca pisa un monto ya escrito a mano).
- Backend: nueva columna `montoSugerido` en la hoja `TiposDeServicio`, agregada automáticamente la próxima vez que se corra `setup()` (migración segura, no toca datos existentes) vía `agregarColumnaSiFalta_`.
- ⚠️ Mientras el usuario no redespliegue `Code.gs`, el ranking por empleado simplemente no aparece (protegido con `?? []`, no rompe la pantalla) y el precio sugerido no se guarda todavía.

## Revisión de seguridad — 2026-07-20
Siguiendo `27-REVISION-SEGURIDAD.md` (`npm audit`, grep de defaults inseguros, revisión manual de las 5 checklists — semgrep no estaba disponible en este entorno, se compensó con revisión manual más exhaustiva).

**Threat model corto:** lo más valioso es la lista de servicios/montos (ingresos del salón) y las cuentas del personal. El riesgo más realista no es un atacante externo sofisticado, sino: (a) alguien adivinando la contraseña de un usuario por fuerza bruta, (b) un empleado viendo/editando datos de otra persona, (c) un nombre de cliente con caracteres raros rompiendo el CSV al abrirlo en Excel.

**Corregido:**
- 🔒 **Inyección de fórmulas en el CSV**: si un nombre de cliente empezaba con `= + - @`, Excel podía intentar interpretarlo como fórmula al abrir el archivo exportado. Se neutraliza anteponiendo una comilla (`lib/csv.ts`).
- 🔒 **`listarUsuarios_` sin restricción**: cualquier empleado autenticado podía pedir la lista completa de usuarios (nombres y logins de todo el personal), no solo el admin. Ahora requiere admin (`requireAdmin_`).
- 🔒 **Sin límite de intentos de login**: no había nada que impidiera probar contraseñas repetidamente. Se agregó un límite de 8 intentos fallidos por usuario cada 15 minutos (`CacheService`), y de paso se pareja el tiempo de respuesta entre "usuario no existe" y "contraseña incorrecta" (antes el primero respondía más rápido, lo cual podía revelar qué usuarios existen).

**Verificado sin hallazgos:** `npm audit` en 0 vulnerabilidades · sin secretos filtrados en git (`.env` solo tiene la URL pública del Apps Script, no es secreta) · sin `dangerouslySetInnerHTML`/`eval` · permisos de editar/borrar servicios ya verificados en el servidor (no solo escondidos en la pantalla) · errores fail-secure (deniegan por defecto si falta token/permiso).

**Aceptado como limitación conocida (no corregido):** las contraseñas se guardan con SHA-256 + sal de una sola pasada (Apps Script no tiene bcrypt/Argon2 nativo). Subirle un factor de trabajo (miles de iteraciones) habría invalidado TODAS las contraseñas ya guardadas (admin y Nataly Pinedo quedarían bloqueadas), así que no se tocó sin tu aprobación explícita. Mitigante real: la hoja de cálculo solo es accesible desde tu propia cuenta de Google — para que alguien vea esos hashes, primero tendría que entrar a tu Google Drive, momento en el cual ya tendría problemas mayores. Si más adelante quieres subir esto de nivel, se puede migrar en un paso aparte (cada quien re-loguea una vez).

**Verificado end-to-end contra el backend real (2026-07-20):** probé el límite de intentos con un usuario inventado — los primeros 8 intentos dieron "Usuario o contraseña incorrectos", el 9no dio el mensaje de bloqueo, exactamente como se diseñó. Probé también que un empleado (cuenta de prueba creada y luego desactivada) recibe "Solo un administrador puede hacer esto" al intentar ver la lista de personal. Ambas correcciones confirmadas funcionando.

## Feature: modo oscuro + app instalable (PWA) — a pedido del usuario (2026-07-22)
- **Modo oscuro**: selector "Claro / Oscuro / Automático" en Ajustes (`components/SelectorApariencia.tsx` + `theme/ThemeContext.tsx`), guardado en `localStorage` (`cajabella_tema`). Paleta oscura derivada del look cálido actual (casi-negro con tinte, nunca #000 puro; acento aclarado para contraste) en `.dark { ... }` dentro de `index.css` — como todos los componentes ya usaban los tokens de color (`bg-bg`, `text-ink`, etc.) en vez de hex directos, el modo oscuro se propaga solo a toda la app sin tocar componentes. Script inline en `index.html` aplica la clase `.dark` ANTES de pintar (evita flash de claro→oscuro). Verificado: toggle funciona, persiste tras recargar, sin errores de consola, `<select>` nativo con contraste correcto en oscuro (no el bug típico de texto invisible).
- **Instalable (PWA)**: ícono propio (sparkle terracota, `public/icons/`, generado con `sharp` a partir de un SVG), `manifest.webmanifest`, meta tags de iOS (`apple-touch-icon`, `apple-mobile-web-app-*`), `theme-color` para ambos esquemas, y un service worker mínimo (`public/sw.js`) que NO cachea nada (a propósito — esta app depende de datos siempre frescos) y solo existe para cumplir el requisito técnico de "instalable". Favicon también actualizado al mismo ícono de marca (antes era el genérico de Vite).
- Sin cambios de backend — solo hace falta subir el frontend.
- ⚠️ Pendiente: preparar las paletas de color alternativas para futuras copias de la app en otros negocios (se quedó a medio camino en la sesión anterior, no se retomó todavía).

## Sesiones completadas ✅
- Sesión 1 — Backend Apps Script completo (auth, servicios, tipos, usuarios, dashboard, cambio de contraseña) + pantalla de Login con diseño aplicado + Google Sheet real desplegada por el usuario ("CajaBella_Datos") + Apps Script publicado como Web App. Login probado de punta a punta contra el backend real. — 2026-07-14
- Sesión 2 — Pantalla "Registrar servicio" + pantalla "Resumen" (dashboard) + navegación inferior. Registré un servicio real (Manicure, S/35, cliente "Rosa Pérez") y se reflejó correctamente. — 2026-07-14
  - 🐛 Corregido: Google Sheets convertía el texto de fecha en un valor de fecha interno, rompiendo "¿es hoy?" en el dashboard (`normalizarCelda_` en `Code.gs`).
- Sesión 3 — Pantalla Ajustes completa (cambiar mi contraseña, admin: gestionar tipos de servicio y personal con crear/activar-desactivar/restablecer contraseña) + pulido (touch target del interruptor a 44px, labels accesibles en cliente/teléfono, useCountUp no se congela si la pestaña está oculta) + workflow de GitHub Actions para publicar en GitHub Pages automáticamente. Verificado: `tsc` ✓ · `build` ✓ · probado contra el Sheet real. — 2026-07-14
  - 🐛 Corregido: la lista de tipos de servicio en Ajustes usaba el mismo endpoint que el formulario (solo activos) — un tipo desactivado desaparecía para siempre del panel admin. Se agregó `tiposServicioTodos` (admin-only, incluye inactivos).
  - 🐛 Corregido: el navegador cacheaba las respuestas GET de Apps Script (sin cabeceras no-cache), mostrando a veces datos viejos tras guardar. Se agregó un parámetro anti-caché (`_=timestamp`) + `cache:'no-store'` en todas las lecturas.
  - 🐛 Detectado y revertido: envolver las rutas en `AnimatePresence`/`motion` para una transición entre pantallas rompía la navegación (el hash cambiaba pero el contenido no). Se descartó esa animación en particular — cada pantalla ya tiene su propia entrada animada, que es suficiente.

## Próximas sesiones 📋
- Ninguna pendiente por ahora — el "producto mínimo enriquecido" para uso interno está completo. Sesiones futuras serían a pedido del usuario (ej. reportes por rango de fechas, exportar a Excel, editar/eliminar un servicio ya registrado).

## Problemas conocidos ⚠️
- La captura de pantalla automática (screenshot) del entorno de preview de esta sesión falló técnicamente en las 3 sesiones (timeouts). Toda la verificación se hizo con lectura de estructura/consola/red y disparo real de eventos del navegador contra el backend real — funcionalmente probado, pero nunca "mirado" con una imagen real. Si el usuario quiere confirmación visual, puede abrir la app publicada él mismo.
- Detalle menor: los números que "cuentan" en el dashboard (total acumulado, total del día) no se animan si el usuario abre la pantalla con la pestaña en segundo plano — en ese caso muestran el valor final directo sin animación (comportamiento intencional agregado en Sesión 3, no un bug).

## Pendientes del usuario (acciones que el usuario debe hacer)
- [x] Crear la Google Sheet y desplegar `backend/Code.gs` como Web App
- [x] Pegar la URL del Web App en `.env`
- [x] Publicar en GitHub Pages (listo, con GitHub Actions publicando solo en cada push)
- [ ] Cambiar la contraseña del admin (`cambiar123`) — pantalla en Ajustes → "Cambiar mi contraseña"
- [ ] Compartir el link `https://ctaboadaa.github.io/CajaBella/` con el personal del salón para que empiecen a registrar servicios

## Notas para la próxima sesión
- El usuario no es técnico — explicar todo en simple, traducir jerga la primera vez.
- Este proyecto vive en `C:\Users\charly\Documents\Projectos\Claude\CajaBella`, separado de TuChamba (`App1`). Para levantar el dev server en el Browser pane hay que usar el nombre `cajabella-dev` (config agregada a `App1/.claude/launch.json` porque el entorno de preview está atado a esa carpeta principal).
- NO aplica la parte de monetización/Hotmart/paywall del sistema — es una app de uso interno, no se vende.
