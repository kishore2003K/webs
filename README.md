# GreenAcres Realty — Plots & Homes

Marketing website for a plot and house selling organisation. Static site — no build step.

## Sections

- Hero with plot / home / commercial search
- Company overview and legal due-diligence checklist
- Filterable and sortable property listings
- Services, buying process, customer reviews, FAQ
- Callback enquiry form with client-side validation

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup for all sections |
| `styles.css` | Design tokens, layout, responsive breakpoints, animations |
| `script.js` | Sliders, filters, form validation, scroll motion |

## Notes

- Property photos are hotlinked from Unsplash — replace with your own assets before launch.
- The enquiry form is front-end only. Wire it to your backend or a form service (Formspree, Web3Forms) before going live.
- RERA number, office address and phone numbers are placeholders.
