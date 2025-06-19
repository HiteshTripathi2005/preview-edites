# React Auto-ID Inspector Demo

A React application with automatic ID and data attribute generation for visual element inspection.

## Project Structure

```
├── client/          # Nuxt 3 app (optional - displays React app in iframe)
├── react-dev/       # React app with auto-ID system and element inspector
└── .vscode/         # VS Code tasks for easy development
```

## Features

- **🆔 Auto-ID Generation**: Automatically adds unique IDs and data attributes to JSX elements when files are saved
- **🗂️ Array Context Tracking**: Elements in arrays get special `data-array` and `data-array-index` attributes
- **🔍 Element Inspector**: Built-in click-to-select visual inspector
- **⚡ Zero Manual Work**: IDs are generated automatically via Vite plugin + ESLint rule

## Quick Start

```bash
cd react-dev
npm install
npm run dev
```

Then save any `.jsx` file to see automatic ID generation in action!

## How the Auto-ID System Works

1. **Vite Plugin**: Watches for `.jsx/.tsx` file changes
2. **ESLint Rule**: Custom rule adds IDs and data attributes
3. **Automatic**: No manual intervention needed - just save files!

## Example Output

When you save a file with this JSX:
```jsx
<div className="container">
  <h1>Hello World</h1>
  {items.map(item => <span key={item.id}>{item.name}</span>)}
</div>
```

It automatically becomes:
```jsx
<div id="div-1" data-component="App" data-file="src/App.jsx" className="container">
  <h1 id="h1-2" data-component="App" data-file="src/App.jsx">Hello World</h1>
  {items.map((item, index) => 
    <span id={`items-${item.id || index}`} data-component="App" data-file="src/App.jsx" 
          data-array="items" data-array-index={index} key={item.id}>
      {item.name}
    </span>
  )}
</div>
```

## Commands

- `npm run dev` - Start with auto-ID generation
- `npm run add-ids` - Manually add IDs to existing files

## VS Code Tasks

- **Start Visual Editor Demo** - Starts both React and Nuxt apps
- **Add Inspector IDs** - Manually run ID generation
- **Start React** - React app only
- **Start Nuxt** - Nuxt app only
