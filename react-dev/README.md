# React Auto-ID Inspector

A React project with automatic ID and data attribute generation for visual element inspection.

## How it works

1. **Auto-ID Generation**: When you save any `.jsx` or `.tsx` file, unique IDs and inspector data attributes are automatically added to all JSX elements.
2. **Array Context**: Elements rendered in arrays get special `data-array` and `data-array-index` attributes for better tracking.
3. **Visual Inspector**: The ElementInspector component allows you to click and inspect any element.

## Getting Started

```bash
npm install
npm run dev
```

## Commands

- `npm run dev` - Start development server with auto-ID generation
- `npm run add-ids` - Manually add IDs to all JSX files

## Features

- Automatic ID generation on file save
- Array context tracking
- Minimal setup with Vite + React
- ESLint plugin for ID generation
