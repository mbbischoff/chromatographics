# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the development server (http://localhost:4321)
- `npm run build` - Build the site for production
- `npm run preview` - Preview the production build locally

### TypeScript Checking
- `npx astro check` - Run TypeScript checking for Astro components

## Architecture

This is an Astro-based poetry website that displays a collection of poems with custom color theming.

### Content Structure
The site uses Astro's content collections to manage poems and pages:
- **Poems** (`src/content/poems/`): Markdown files with frontmatter containing metadata like title, colors, dates, and publication info
- **Pages** (`src/content/pages/`): Static pages like the about page
- **Schema** (`src/content/config.ts`): Defines the structure and validation for content collections

### Routing
- `/` - Homepage displaying all poems in reverse chronological order
- `/[id]` - Individual poem permalinks using dynamic routes
- `/about` - About page
- `/rss.xml` - RSS feed of poems

### Key Components
- **Poem.astro**: Renders individual poems with dynamic color theming. Has two modes:
  - List view (on homepage) - clickable cards
  - Permalink view - includes metadata table
- **Layout.astro**: Main layout wrapper for all pages
- The poem component automatically calculates background and text colors based on the title color using HSL luminance adjustments

### Styling
- Custom "Lacrima" font family loaded from `/public/fonts/`
- CSS reset and main styles in `src/styles/`
- Inline styles for dynamic color theming per poem
- Poem cards have hover effects with shadow and transform animations

### Content Management
To add new poems:
1. Create a markdown file in `src/content/poems/`
2. Include required frontmatter: `id`, `title`, `written`, `published`
3. Optional: `color` (with hex, name, link), `backgroundColor`, `textColor`, `felt`, `publications`, `preformatted`
4. The poem will automatically appear on the homepage and get its own permalink