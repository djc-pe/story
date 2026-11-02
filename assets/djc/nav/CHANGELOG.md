# Changelog de nav

Barra de navegación de DJC. Cada versión mayor vive en su carpeta (`1/`, `2/`...):
dentro de una mayor, los cambios son compatibles y llegan solos a todas las
páginas que la cargan. Cada cambio sube `VERSION` en `script.js`.

## [1.0.0] - 2026-11-02

### Cambiado
- Sale de `res/nav/` a `assets/djc/nav/1/`.
- Los iconos de `data.json` son relativos a la carpeta del componente.
- `VERSION` va como `?v=` en `data.json`, `nav.css` y los iconos.
- La búsqueda lleva a `https://search.djc.pe/?q={query}`; `{hash}` es opcional
  en `urlTemplate`.

### Arreglado
- El logo móvil (`logo-mobile.png`) daba 404.
- `revealPage` estaba definida dos veces y no cancelaba el temporizador del gate.
