# React Element Inspector Demo

A simple demonstration of a visual element inspector built into a React application, similar to browser developer tools.

## Project Structure

```
├── client/          # Nuxt 3 app (displays the React app in iframe)
├── react-dev/       # React app with built-in element inspector
└── .vscode/         # VS Code tasks for easy development
```

## Features

- **🔍 Element Inspector**: Click-to-select and edit elements visually
- **Real-time Editing**: Change text, colors, font sizes, and padding
- **Visual Feedback**: Hover highlights and selection outlines
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+I` to toggle inspector
  - `Escape` to exit inspection mode
- **Reset Functionality**: Restore elements to original state

## How to Run

1. **Start both applications:**

   ```bash
   # Option 1: Use VS Code task (Ctrl+Shift+P → "Run Task" → "Start Visual Editor Demo")

   # Option 2: Start manually
   # Terminal 1 - React app
   cd react-dev
   npm run dev

   # Terminal 2 - Nuxt app
   cd client
   npm run dev
   ```

2. **Open in browser:**
   - Nuxt app: http://localhost:3000 (shows React app in iframe)
   - React app: http://localhost:5173 (direct access)

## How to Use Element Inspector

1. Look for the blue 🔍 button in the top-right corner of the React app
2. Click it to open the inspector panel
3. Click "Inspect Element" to enter inspection mode
4. Click on any element (text, buttons, divs) to select it
5. Use the inspector panel to:
   - Edit text content
   - Change text and background colors
   - Adjust font size and padding
   - Reset to original styles

## Key Files

- `react-dev/src/App.jsx` - Main React component
- `react-dev/src/ElementInspector.jsx` - Element inspector component
- `react-dev/src/ElementInspector.css` - Inspector styles
- `client/app.vue` - Nuxt app displaying the React iframe

## Notes

- All changes are preview-only and don't modify source code
- Perfect for design iteration and prototyping
- Inspector works within the React app context (no cross-frame issues)
