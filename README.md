
# Enrique Goberna — Minimalist Dark Portfolio (EN default + ES toggle)

Static minimalist site (dark-only) ready for **GitHub Pages**. 
- **Default language**: English.
- **Language toggle**: ES ↔ EN (button in header).
- **Light mode**: removed (dark-only by design).

## ▶️ Publish on GitHub Pages

1. Create a repository, e.g., `enrique-goberna-portfolio`.
2. Push these files to `main`.
3. In **Settings → Pages**, select:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (root)
4. Open the Pages URL.

> Alternatively, move files to `/docs` and select `main /docs` in Pages.

## 📁 Structure
```
.
├── assets/
│   └── Enrique_Goberna_CV.pdf   # "Download CV" button
├── index.html                    # main page (EN default, ES toggle)
├── styles.css                    # dark theme
└── README.md
```

## 🛠 Customize
- Edit text directly in `index.html`.
- Replace `assets/Enrique_Goberna_CV.pdf` with your latest CV.
- Add sections duplicating `.section` or `.item` blocks.
