# chromatographics

A collection of gay poems by mb bischoff, built with Astro.

## Features

- **Color-coded poems**: Each poem has configurable colors for title, background, and text
- **Tagging system**: Poems can be tagged and filtered by themes
- **Responsive design**: Works on desktop and mobile devices
- **Dark mode support**: Automatically adapts to user's color scheme preference

## Development

This site has been converted from a static HTML site to an Astro project while maintaining the original design. Each poem now has configurable colors for:

- Title color
- Background color  
- Text color

### Project Structure

```
src/
├── components/
│   └── Poem.astro          # Poem component with color props
├── data/
│   └── poems.ts            # Poem data with color configurations
├── layouts/
│   └── Layout.astro        # Main layout component
├── pages/
│   └── index.astro         # Home page
└── styles/
    ├── reset.css           # CSS reset
    └── style.css           # Main styles

public/
├── fonts/                  # Custom fonts
├── reset.css               # Served CSS files
└── style.css
```

### Running the Site

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Poems

To add a new poem, create a new Markdown file in `src/content/poems/` with the following frontmatter:

```yaml
---
id: "poem-id"
title: "Poem Title"
color:
  hex: "#FF0000"
  name: "Color Name"
  link: "https://color-reference.com"
felt: 2025-01-01
written: 2025-01-01
published: 2025-01-01
tags: ["tag1", "tag2", "tag3"]
---
```

The poem content goes below the frontmatter. You can use HTML tags for formatting.

### Tagging System

Poems can be tagged with themes and topics. Tags are displayed on individual poem pages and can be used to filter poems:

- Visit `/tags` to see all available tags
- Click on any tag to see all poems with that tag
- Tags are also displayed on the main page for quick navigation
