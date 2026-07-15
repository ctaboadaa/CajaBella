# ESTADO — CajaBella
Última actualización: 2026-07-14 | 🎉 App publicada y funcionando en https://ctaboadaa.github.io/CajaBella/

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
- Sesión: token aleatorio guardado en la pestaña `Sesiones` con expiración de 12 horas, enviado en el body/querystring (NUNCA en header `Authorization`, para evitar preflight CORS que Apps Script no maneja bien)
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
- Tipografía: Display "Instrument Serif" | Cuerpo "Work Sans"
- Radio de bordes: 20px cards (`--radius-card`), 14px controles (`--radius-control`)
- Personalidad: cercana · confiable · sin vueltas

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
