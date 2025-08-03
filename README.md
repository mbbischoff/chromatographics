# chromatographics

A collection of gay poems by mb bischoff, built with Astro.

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

To add a new poem, edit `src/data/poems.ts` and add a new poem object with:

- `id`: Unique identifier
- `title`: Poem title
- `titleColor`: Color for the title (hex code)
- `backgroundColor`: Background color (hex code)
- `textColor`: Text color (hex code)
- `content`: The poem content (can include HTML tags like `<em>`)

The site will automatically render all poems with their specified colors.
