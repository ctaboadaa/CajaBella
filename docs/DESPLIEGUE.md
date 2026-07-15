# Guía paso a paso: conectar CajaBella a tu Google Sheet

Esto solo lo puedes hacer tú porque requiere tu cuenta de Google. Son ~10 minutos, un solo click a la vez.

## 1. Crear la Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja de cálculo nueva.
2. Ponle de nombre, por ejemplo, "CajaBella — Datos".
3. No hace falta crear pestañas ni columnas — el paso 3 las crea automáticamente.

## 2. Pegar el backend en Apps Script

1. En tu Sheet recién creada, ve al menú **Extensiones → Apps Script**. Se abre un editor de código en una pestaña nueva.
2. Verás un archivo `Code.gs` vacío (o con una función `myFunction` de ejemplo). Borra todo su contenido.
3. Abre el archivo [`backend/Code.gs`](../backend/Code.gs) de este proyecto, copia TODO su contenido, y pégalo en el editor de Apps Script.
4. Guarda con el ícono de disco (o Ctrl+S).

## 3. Crear las hojas y el usuario administrador

1. En la barra superior del editor de Apps Script, donde dice una lista desplegable de funciones, elige **setup**.
2. Presiona el botón ▶️ **Ejecutar**.
3. La primera vez te va a pedir autorización: "Revisar permisos" → elige tu cuenta → puede aparecer un aviso de "Google no verificó esta app" → click en **Avanzado** → **Ir a [nombre del proyecto] (no seguro)** → **Permitir**. Esto es normal: es TU script, en TU cuenta, solo tú lo autorizas.
4. Cuando termine, vuelve a tu Google Sheet — ya deberías ver 4 pestañas nuevas: `Usuarios`, `Servicios`, `TiposDeServicio`, `Sesiones`.
5. En la pestaña `Usuarios` vas a ver un usuario `admin` ya creado.

⚠️ **La contraseña del administrador por defecto es `cambiar123`.** Cámbiala apenas entres a la app la primera vez (opción de cambiar contraseña, disponible desde Sesión 2/3).

## 4. Publicar el backend como aplicación web

1. En el editor de Apps Script, arriba a la derecha, click en **Implementar → Nueva implementación**.
2. Click en el ícono de engranaje ⚙️ junto a "Seleccionar tipo" → elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu correo)
   - **Quién tiene acceso:** Cualquier usuario
4. Click en **Implementar**.
5. Copia la **URL de la aplicación web** que te muestra (termina en `/exec`). Esa es la dirección que conecta tu app con tu Google Sheet.

## 5. Conectar la app con esa URL

1. Abre el archivo `.env` en la raíz del proyecto CajaBella.
2. Reemplaza el valor de `VITE_API_URL` por la URL que copiaste:
   ```
   VITE_API_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
   ```
3. Guarda el archivo y avísame — reinicio el servidor y probamos el login juntos con el usuario `admin` / `cambiar123`.

## Cuando actualices el código del backend

Si en una sesión futura cambiamos `backend/Code.gs`, vas a tener que:
1. Copiar el contenido actualizado al editor de Apps Script (reemplazando todo).
2. Guardar.
3. **Implementar → Gestionar implementaciones → ✏️ (editar) → cambiar versión a "Nueva versión" → Implementar.** (Esto mantiene la misma URL, no hace falta actualizar el `.env` de nuevo.)

## Publicar la app en GitHub Pages

Esto la deja con una dirección web real (algo como `https://tu-usuario.github.io/CajaBella/`) que funciona desde cualquier celular o compu, gratis. Uso **GitHub Desktop** (una app con botones, sin nada de línea de comandos).

### 1. Instalar GitHub Desktop y crear cuenta de GitHub

1. Ve a [desktop.github.com](https://desktop.github.com) y descárgalo e instálalo.
2. Ábrelo. Si no tienes cuenta de GitHub, te ofrece crear una gratis ahí mismo (o entra a [github.com](https://github.com) a crearla antes).
3. Inicia sesión con tu cuenta de GitHub dentro de GitHub Desktop.

### 2. Subir el proyecto

1. En GitHub Desktop: **File → Add local repository**.
2. Selecciona la carpeta `C:\Users\charly\Documents\Projectos\Claude\CajaBella`.
3. Te va a avisar que esa carpeta no es un repositorio todavía y te ofrece un botón **"create a repository"** — click ahí.
4. Deja los datos por defecto y confirma la creación.
5. Ahora vas a ver todos los archivos del proyecto listados como cambios. Abajo a la izquierda, escribe un mensaje corto (ej. "Primera versión de CajaBella") y click en **Commit to main**.
6. Arriba, click en **Publish repository**. Importante: **destilda la casilla "Keep this code private"** (necesitas que sea público para que GitHub Pages gratis funcione — tranquilo, tus datos de servicios NO están en este repositorio, viven en tu Google Sheet privada; el repositorio solo tiene el código de la app).
7. Click en **Publish Repository**.

### 3. Activar GitHub Pages

1. Ve a [github.com](https://github.com), entra a tu perfil → el repositorio **CajaBella** que se acaba de crear.
2. Click en la pestaña **Settings** (del repositorio, arriba).
3. En el menú de la izquierda, click en **Pages**.
4. En "Build and deployment" → "Source", elige **GitHub Actions**.
5. Ve a la pestaña **Actions** del repositorio — vas a ver que ya está corriendo (o corrió) el proceso de publicación automáticamente (yo ya dejé configurado el archivo que hace esto, `.github/workflows/deploy.yml`). Espera a que el ícono se ponga en ✅ verde (~1-2 minutos).
6. Vuelve a **Settings → Pages** — arriba te va a mostrar el link de tu app, algo como `https://tu-usuario.github.io/CajaBella/`. Ese es el link que vas a usar (y compartir con tu personal) todos los días.

### Cuando yo haga cambios en el código a futuro

Simplemente abres GitHub Desktop, vas a ver los cambios listados, escribes un mensaje y click en **Commit to main** y después **Push origin**. GitHub Actions publica la nueva versión sola en 1-2 minutos, sin que tengas que hacer nada más.
