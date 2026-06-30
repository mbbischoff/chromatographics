# AGENTS.md

Guidance for working in this Astro poetry site.

## Commands

- `npm run dev` - Start the local dev server at `http://localhost:4321`
- `npm run build` - Build the production site
- `npm run preview` - Preview the production build
- `npx astro check` - Run Astro and TypeScript checks

## Project Notes

- Poems live in `src/content/poems/` as Markdown files with frontmatter.
- Static pages live in `src/content/pages/`.
- Content schemas are defined in `src/content/config.ts`.
- The homepage lists poems in reverse chronological order.
- Individual poem pages are generated from `src/pages/[id].astro`.
- Styling is split between `src/styles/` and component-level styles.

## Adding Poems

Create a Markdown file in `src/content/poems/` with the required frontmatter:

- `id`
- `title`
- `written`
- `published`

Optional poem fields include `color`, `backgroundColor`, `textColor`, `felt`, `publications`, and `preformatted`.
