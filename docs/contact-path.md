# Contact path and public CV policy

This document records the contact decision for portfolio-roadmap issue #16. The goal is to keep professional contact easy to find without turning the site into a recruitment funnel.

## Contact hierarchy

The portfolio keeps contact as a utility, not a primary homepage action.

- **Homepage:** do not add a contact CTA to the hero. Projects remains the primary action, followed by engineering writing and GitHub. Contact is still available from the main navigation and footer on the homepage.
- **About:** keep the existing inline `Contact:` row immediately after the opening biography. LinkedIn and Email are the direct contact options; GitHub remains alongside them as useful professional context.
- **Site-wide navigation:** keep the neutral `Contact` label and existing public email address. Do not add recruiter-specific wording, availability badges, urgency, salary/job-search language, phone numbers, addresses, or other personal identifiers.

This deliberately avoids adding another homepage CTA after the editorial hierarchy established by portfolio-roadmap #38 and #5.

## Public CV decision

**Do not publish or link a downloadable CV by default.**

A static CV would duplicate information maintained elsewhere and can become stale without being obvious to readers. The portfolio should remain complete and understandable without one.

If a public CV is introduced later, it must have an explicit maintenance owner and update rule before the link is published. The repository owner is responsible for keeping it current, reviewing it after any material career/profile change, and removing the link immediately if freshness can no longer be guaranteed.

## Current contact endpoints

- Email: `mailto:egobernagarcia@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/enriquegoberna/`
- GitHub: `https://github.com/egobb`

The email address was already public in site configuration before this decision. No additional personal data is introduced.

## Validation contract

The existing Playwright visual-review suite is the executable validation source for this path:

- `tests/visual/navigation.spec.ts` verifies that Contact remains discoverable on desktop and mobile navigation and that the contact path is keyboard reachable.
- `tests/visual/about.spec.ts` verifies the exact LinkedIn, GitHub, and Email destinations on the About page.
- `tests/visual/navigation.spec.ts` also protects the homepage hero from gaining a contact CTA that would compete with Projects/Writing.

Any future change to contact placement should preserve the neutral wording, the homepage hierarchy, mobile behavior, keyboard accessibility, and the privacy constraints above.