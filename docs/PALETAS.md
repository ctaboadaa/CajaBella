# Paletas de marca — para cuando clones CajaBella a otro negocio

Cada negocio nuevo es una copia independiente de este proyecto (su propio Google Sheet, su propio Apps Script, su propio link). Por eso no hay un selector de colores dentro de la app — alcanza con elegir una de estas 5 paletas ya armadas y pegarla en `src/index.css` antes de publicar esa copia. Cada una ya incluye su versión clara Y oscura (el modo oscuro de la app las usa automáticamente).

## Cómo aplicar una paleta

1. Abre `src/index.css`.
2. Reemplaza el bloque `@import "@fontsource/young-serif";` por el import de fuente que indica la paleta elegida (hay que instalarla: `npm install @fontsource/<nombre>`, y desinstalar la que ya no se usa: `npm uninstall @fontsource/young-serif`).
3. Reemplaza los valores dentro de `@theme { ... }` (los que empiezan con `--color-` y `--font-display`) por el bloque "Claro" de la paleta elegida.
4. Reemplaza los valores dentro de `html.dark { ... }` por el bloque "Oscuro" de la misma paleta.
5. Corre `npx tsc --noEmit && npm run build` para confirmar que compila, y mira la app renderizada antes de publicar.
6. Actualiza también el ícono de la app (`public/icons/`, `public/favicon.svg`) para que combine con el nuevo acento — mismo patrón (fondo de color sólido + una chispa/símbolo simple en el color de fondo de la app).

---

## 1. Terracota Cálida (la que ya usa CajaBella)
**Para:** salón de belleza cercano, de barrio, trato personal — el default actual.
**Personalidad:** cercana · confiable · sin vueltas
**Tipografía:** Display "Young Serif" · Cuerpo "Work Sans"

```css
/* Claro */
--color-bg: #fbf5f2;
--color-surface: #ffffff;
--color-surface-elevated: #f5e9e3;
--color-surface-sunken: #f0e3dc;
--color-ink: #322022;
--color-ink-soft: #7a5c60;
--color-ink-faint: #a3898c;
--color-accent: #b5495b;
--color-accent-soft: #f2dde1;
--color-accent-strong: #8f3547;
--color-gold: #a9825a;
--color-gold-soft: #f0e6d8;
--color-line: #e8d9d1;
```
```css
/* Oscuro */
--color-bg: #211a19;
--color-surface: #2a201f;
--color-surface-elevated: #332726;
--color-surface-sunken: #1a1312;
--color-ink: #f5ece8;
--color-ink-soft: #c9b7b2;
--color-ink-faint: #8a746f;
--color-accent: #e0748a;
--color-accent-soft: #4a2830;
--color-accent-strong: #ef94a5;
--color-gold: #d4b483;
--color-gold-soft: #3d3226;
--color-line: #40312e;
```

---

## 2. Salvia Spa
**Para:** spa, masajes, bienestar, yoga, centros de relajación.
**Personalidad:** serena · natural · reconfortante
**Tipografía:** Display "Newsreader" · Cuerpo "Work Sans"

```css
/* Claro */
--color-bg: #f6f5f0;
--color-surface: #ffffff;
--color-surface-elevated: #ededE3;
--color-surface-sunken: #e4e4d6;
--color-ink: #2b322c;
--color-ink-soft: #5f6b5f;
--color-ink-faint: #93998f;
--color-accent: #5c7a63;
--color-accent-soft: #dee7de;
--color-accent-strong: #465f4b;
--color-gold: #b08d57;
--color-gold-soft: #eee3d0;
--color-line: #dce0d5;
```
```css
/* Oscuro */
--color-bg: #1b211c;
--color-surface: #232a24;
--color-surface-elevated: #2b332c;
--color-surface-sunken: #161b17;
--color-ink: #edf0ea;
--color-ink-soft: #b9c4b7;
--color-ink-faint: #7c8a79;
--color-accent: #7fa087;
--color-accent-soft: #2c3b2e;
--color-accent-strong: #9dbfa3;
--color-gold: #d4b483;
--color-gold-soft: #3d3226;
--color-line: #333d34;
```

---

## 3. Lavanda Lujo
**Para:** salón premium, spa de uñas de alta gama, servicios exclusivos.
**Personalidad:** elegante · exclusiva · delicada
**Tipografía:** Display "Libre Caslon Display" · Cuerpo "Work Sans"

```css
/* Claro */
--color-bg: #f8f5f7;
--color-surface: #ffffff;
--color-surface-elevated: #efe7ee;
--color-surface-sunken: #e6dbe5;
--color-ink: #2e2333;
--color-ink-soft: #6b5d71;
--color-ink-faint: #9e90a3;
--color-accent: #7a5a8c;
--color-accent-soft: #e9deed;
--color-accent-strong: #5e4470;
--color-gold: #b69564;
--color-gold-soft: #f1e6d2;
--color-line: #e4d8e2;
```
```css
/* Oscuro */
--color-bg: #1e1a21;
--color-surface: #262029;
--color-surface-elevated: #302833;
--color-surface-sunken: #171319;
--color-ink: #f2ecf3;
--color-ink-soft: #c7b9c9;
--color-ink-faint: #8b7c8e;
--color-accent: #b48bc4;
--color-accent-soft: #3c2e42;
--color-accent-strong: #c9a7d6;
--color-gold: #d9be8c;
--color-gold-soft: #3d3526;
--color-line: #3d3340;
```

---

## 4. Azul Confianza
**Para:** barbería, grooming masculino, servicios técnicos (uñas técnicas, podología).
**Personalidad:** confiable · sobria · profesional
**Tipografía:** Display "Spectral" · Cuerpo "Work Sans"

```css
/* Claro */
--color-bg: #f4f6f7;
--color-surface: #ffffff;
--color-surface-elevated: #e7ecee;
--color-surface-sunken: #dce3e6;
--color-ink: #1f2a2e;
--color-ink-soft: #526066;
--color-ink-faint: #8b989c;
--color-accent: #35606e;
--color-accent-soft: #dae6e8;
--color-accent-strong: #244650;
--color-gold: #a67c52;
--color-gold-soft: #eee0d0;
--color-line: #d6dfe1;
```
```css
/* Oscuro */
--color-bg: #171e20;
--color-surface: #1f2729;
--color-surface-elevated: #283133;
--color-surface-sunken: #101617;
--color-ink: #e9eeef;
--color-ink-soft: #b4c0c2;
--color-ink-faint: #778083;
--color-accent: #6fa3b0;
--color-accent-soft: #223a3f;
--color-accent-strong: #8fbcc7;
--color-gold: #c7a276;
--color-gold-soft: #3a3024;
--color-line: #2e3739;
```

---

## 5. Coral Vibrante
**Para:** salón juvenil/trendy — uñas, cejas, maquillaje, público más joven.
**Personalidad:** enérgica · fresca · divertida
**Tipografía:** Display "Bricolage Grotesque" · Cuerpo "Work Sans"

```css
/* Claro */
--color-bg: #fdf6f3;
--color-surface: #ffffff;
--color-surface-elevated: #fbeae3;
--color-surface-sunken: #f7ded3;
--color-ink: #3a241f;
--color-ink-soft: #825f53;
--color-ink-faint: #b4938a;
--color-accent: #e2694b;
--color-accent-soft: #fbe1d8;
--color-accent-strong: #c14f34;
--color-gold: #d9a441;
--color-gold-soft: #f6e9c9;
--color-line: #f0ddd3;
```
```css
/* Oscuro */
--color-bg: #241812;
--color-surface: #2e2019;
--color-surface-elevated: #382820;
--color-surface-sunken: #180f0a;
--color-ink: #f7eae3;
--color-ink-soft: #d3b0a3;
--color-ink-faint: #92726a;
--color-accent: #f0876a;
--color-accent-soft: #4a2a20;
--color-accent-strong: #f5a488;
--color-gold: #e0b85e;
--color-gold-soft: #3d3018;
--color-line: #452f24;
```

---

## Notas

- Los colores **semánticos** (`--color-success`, `--color-warning`, `--color-error` y sus `-soft`) se dejan igual en las 5 paletas — son de significado (verde=éxito, ámbar=aviso, rojo=error), no de marca, y cambiarlos por paleta solo generaría inconsistencia sin ganar nada.
- `--radius-card` (20px) y `--radius-control` (14px) también se mantienen iguales por defecto; se pueden ajustar si el negocio pide un estilo más anguloso o más redondeado.
- Ninguna de estas 5 tipografías está en la lista de "sobreusadas por IA" (Fraunces, Playfair, Clash, Satoshi, Space Grotesk, Geist) — cada paleta se ve genuinamente distinta a las demás, no son la misma app repintada.
- Si el negocio nuevo pide algo que no encaja en ninguna de estas 5, se puede derivar una paleta nueva siguiendo `docs/sistema/16-DIRECCION-DE-ARTE.md` (Paso 0) en vez de improvisar colores al azar.
