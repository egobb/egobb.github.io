# Portfolio visual system

This document defines the visual primitives for `enriquegoberna.com`. The system extends Hugo Narrow instead of editing the theme submodule.

## Principles

- Editorial and technical rather than template-led.
- Calm, high-contrast surfaces with minimal decoration.
- One blue accent in both light and dark modes.
- A 1152 px shell for navigation and portfolio surfaces.
- A 736 px reading column for long-form content.
- An 8 px spacing rhythm.
- Visible keyboard focus and links that do not rely on colour alone.
- No hover-only behaviour, scale-on-hover decoration, gradients, or stock imagery as evidence.

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--portfolio-shell` | `72rem` / 1152 px | Global page shell |
| `--portfolio-reading` | `46rem` / 736 px | Articles and long-form copy |
| `--portfolio-space-1` | `0.5rem` / 8 px | Tight spacing |
| `--portfolio-space-2` | `1rem` / 16 px | Default component gap |
| `--portfolio-space-3` | `1.5rem` / 24 px | Card section gap |
| `--portfolio-space-4` | `2rem` / 32 px | Component padding |
| `--portfolio-space-5` | `3rem` / 48 px | Section separation |
| `--portfolio-space-6` | `4rem` / 64 px | Major section separation |
| `--portfolio-radius-sm` | `0.5rem` | Controls |
| `--portfolio-radius-md` | `0.75rem` | Cards |
| `--portfolio-radius-lg` | `1rem` | Hero surfaces |

### Canonical palette

Light mode uses `#F8FAFC` as the page background, `#172033` as the primary text colour, and `#2457D6` as the single accent. Dark mode uses `#0B1220`, `#E8EEF6`, and `#7FA4FF`.

The stylesheet overrides Narrow's palette variables for every `data-theme` value. This deliberately neutralises stale palette choices stored by older visits while preserving Light/Dark/System mode.

WCAG contrast checks:

| Pair | Contrast |
|---|---:|
| Light foreground / background | 15.55:1 |
| Light muted text / background | 5.55:1 |
| Light accent / background | 5.89:1 |
| White / light accent button | 6.16:1 |
| Dark foreground / background | 16.04:1 |
| Dark muted text / background | 8.82:1 |
| Dark accent / background | 7.72:1 |
| Dark button text / accent | 7.83:1 |

## Theme integration

Narrow loads `assets/css/custom/*.css` after its compiled stylesheet. Portfolio-specific rules live in:

`assets/css/custom/portfolio.css`

Do not edit `themes/hugo-narrow` for portfolio styling. Prefer existing semantic hooks such as `.author-section`, `.post-list`, `.post-meta`, `.prose`, and `.nav-link`.

The palette switcher is disabled in `hugo.yaml`; Light/Dark/System remains enabled.

## Reusable primitives

### Hero

Use `.portfolio-hero` with optional `.portfolio-hero__eyebrow`, `.portfolio-hero__title`, `.portfolio-hero__lede`, and `.portfolio-actions`.

```html
<section class="portfolio-hero">
  <p class="portfolio-hero__eyebrow">Senior backend engineering</p>
  <h1 class="portfolio-hero__title">...</h1>
  <p class="portfolio-hero__lede">...</p>
  <div class="portfolio-actions">...</div>
</section>
```

### CTAs

Use `.portfolio-cta` plus one variant:

- `.portfolio-cta--primary` for the single dominant action.
- `.portfolio-cta--secondary` for supporting actions.

Keep one primary CTA per visual block and no more than two secondary actions.

### Project cards

Use `.portfolio-project-grid` around `.portfolio-project-card` elements. A card should contain:

1. `.portfolio-project-card__title`
2. `.portfolio-project-card__proposition`
3. `.portfolio-project-card__signals` with two or three proof-oriented signals
4. `.portfolio-project-card__stack`
5. `.portfolio-project-card__links`

Keep card descriptions as concise prose. Do not turn cards into long résumé-style bullet lists.

### Evidence summary

Use `.portfolio-evidence-summary` for a small group of concrete proof points near the top of a case study. Each item uses:

- `.portfolio-evidence-summary__item`
- `.portfolio-evidence-summary__label`
- `.portfolio-evidence-summary__value`

Three items fit on desktop; the layout collapses to one column on mobile.

## Long-form content

Articles and About content use the 736 px reading column. Heading decoration inherited from Narrow is removed so hierarchy comes from type, spacing, and weight. Inline links are underlined. Blockquotes use a simple border and muted surface instead of oversized quote decoration.

Use `.portfolio-wide-media` only when a diagram genuinely needs the wider shell.

## Interaction and accessibility

- `:focus-visible` receives a 3 px accent outline with offset.
- Existing scale/translate hover effects are neutralised on navigation, home links, post cards, metadata links, and dock controls.
- `prefers-reduced-motion: reduce` removes non-essential transitions and animation.
- The bottom dock uses `scroll` mode instead of the persistent `float` trigger.
- Light and dark palette pairs above meet WCAG AA for normal text.

## Visual QA matrix

Before deployment, render and review all of the following at desktop and mobile widths in both light and dark modes:

- Homepage
- Projects
- One project case study
- One long article
- About

Check hierarchy, whitespace, 736 px reading width, keyboard focus, overflow, card consistency, diagram legibility, and absence of the palette switcher. Store screenshots outside the repository if they may contain browser/account metadata.
