# enriquegoberna.com · `egobb.github.io`

Source code of my personal website and blog, built with **Hugo** and the **Narrow** theme.  
Deployed with **GitHub Pages** under the custom domain [enriquegoberna.com](https://enriquegoberna.com).

---

## Features

- **Blog** with lists by *Posts*, *Categories*, *Tags*, and *Archives*.
- **Search overlay** (with keyboard shortcuts).
- **Light/Dark/System mode** + multiple **color palettes** (Default, Claude, Bumblebee, Emerald, Nord, Sunset, Abyss, Dracula, Amethyst, Slate, Twitter).
- **About** and **Contact** pages, plus **RSS feed**.
- Built with **Hugo** + **Narrow**, deployed on **GitHub Pages**.

---

## Tech stack

- [Hugo](https://gohugo.io/) (static site generator).
- [Narrow](https://github.com/gohugoio/hugoThemes) (Tailwind v4 based theme).
- GitHub Pages with custom domain (`CNAME`).

---

##  Repository structure

```
.
├── archetypes/         # Content archetypes
├── content/            # Blog posts and pages (e.g., posts/, about/)
├── static/             # Static assets (served as-is in /)
├── themes/             # Hugo theme (submodule)
├── .github/workflows/  # CI for build/deploy to Pages
├── CNAME               # Custom domain (enriquegoberna.com)
├── hugo.yaml           # Site configuration
└── LICENSE             # MIT
```

---

## Local development

1. **Install Hugo (extended)** following the [official guide](https://gohugo.io/getting-started/installing/).
2. Clone the repo and fetch the theme (submodule):
   ```bash
   git clone https://github.com/egobb/egobb.github.io
   cd egobb.github.io
   git submodule update --init --recursive
   ```
3. Start the development server:
   ```bash
   hugo server -D
   ```
4. Open `http://localhost:1313` in your browser.

---

## Create a new post

```bash
hugo new posts/my-post/index.md
```

- Write your content in Markdown in `content/posts/my-post/index.md`.
- Store resources (images, GIFs, etc.) in the same post folder.

---

## Appearance

- Switch **mode** (Light/Dark/System) and **palette** from the header toggle.
- Configure defaults in `hugo.yaml` according to the Narrow theme documentation.

---

## Deployment

- Published on **GitHub Pages** from this repo.
- Workflows live in `.github/workflows/` (build Hugo + deploy).
- The `CNAME` file maps the domain `enriquegoberna.com`.

---

## License

This project is licensed under **MIT** (see `LICENSE`).

---

Developed by [Enrique Goberna](https://enriquegoberna.com)
