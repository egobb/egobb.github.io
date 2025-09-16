# PR: Añadir blog con Jekyll + Minimal Mistakes

Este PR añade una sección **/blog** integrada en GitHub Pages usando el tema **Minimal Mistakes** (via `remote_theme`).

## Qué incluye
- Config Jekyll en el repo ( `_config.yml`, `Gemfile` ).
- Página índice del blog en `blog/index.md` (layout `home` del tema).
- Un post de ejemplo en `_posts/`.
- Estilos base (`assets/css/main.scss`) y **skin** personalizado (`_sass/minimal-mistakes/skins/_custom.scss`) con acentos ajustables.
- Navegación básica en `_data/navigation.yml` (puedes integrarlo con tu header actual).

## Pasos para activar
1. **Habilita GitHub Pages** en Settings → Pages (Source: `GitHub Actions` o `Deploy from a branch`).  
   - Si ya usas Pages, no cambia nada; Jekyll generará el sitio.
2. (Opcional) Instala Ruby localmente y prueba en tu máquina:
   ```bash
   bundle install
   bundle exec jekyll serve
   # abre http://127.0.0.1:4000
   ```
3. Ajusta en `_sass/minimal-mistakes/skins/_custom.scss` el color primario y tipografías para que coincidan con tu web.
4. Edita `blog/index.md` y el post de ejemplo para empezar a publicar.

## URLs
- Blog index: `/blog/`
- Posts: `/blog/<slug>/`

> Si tu sitio actual no usa Jekyll aún, no pasa nada: Jekyll copiará tal cual tus HTML/CSS/JS existentes y generará la sección `/blog` con el tema.