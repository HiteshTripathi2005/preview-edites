# ESLint Plugin: Inspector IDs Auto-Fix

This custom ESLint plugin automatically adds IDs and data attributes to JSX elements for the Element Inspector functionality.

## 🚀 Features

- **Automatic ID Generation**: Generates unique IDs for all JSX elements
- **Component Tracking**: Adds data-component and data-file attributes
- **Array Context Detection**: Automatically detects map functions and adds array context
- **Auto-Fix on Save**: Works with VS Code's auto-fix on save feature
- **Smart ID Patterns**: Creates predictable ID patterns for array elements

## 📋 What Gets Added

### For Regular Elements:
```jsx
// Before
<div className="container">
  <h1>Title</h1>
</div>

// After auto-fix
<div id="div-1" data-component="App" data-file="src/App.jsx" className="container">
  <h1 id="h1-2" data-component="App" data-file="src/App.jsx">Title</h1>
</div>
```

### For Array Elements:
```jsx
// Before
{items.map((item, index) => (
  <div key={item.id}>
    <h3>{item.name}</h3>
    <p>{item.description}</p>
  </div>
))}

// After auto-fix
{items.map((item, index) => (
  <div 
    id={`items-${item.id || index}`} 
    data-component="App" 
    data-file="src/App.jsx" 
    data-array="items" 
    data-array-index={index}
    key={item.id}
  >
    <h3 
      id={`items-${item.id || index}`} 
      data-component="App" 
      data-file="src/App.jsx" 
      data-array="items" 
      data-array-index={index}
    >
      {item.name}
    </h3>
    <p 
      id={`items-${item.id || index}`} 
      data-component="App" 
      data-file="src/App.jsx" 
      data-array="items" 
      data-array-index={index}
    >
      {item.description}
    </p>
  </div>
))}
```

## 🛠️ Usage

### Manual Linting
```bash
# Check for missing attributes
npm run lint

# Auto-fix missing attributes
npm run lint:fix
```

### Auto-Fix on Save
The VS Code settings are configured to automatically run ESLint auto-fix when you save a file.

### Command Line Usage
```bash
# Fix a specific file
npx eslint src/MyComponent.jsx --fix

# Fix all files
npx eslint src/ --fix
```

## ⚙️ Configuration

The plugin is configured in `eslint.config.js`:

```javascript
'inspector-ids/add-inspector-ids': ['error', {
  autoGenerateIds: true,        // Generate unique IDs
  addDataAttributes: true,      // Add data-component, data-file, etc.
  skipElements: ['Fragment', 'React.Fragment']  // Skip these elements
}]
```

### Options:
- **autoGenerateIds** (boolean): Whether to generate IDs automatically
- **addDataAttributes** (boolean): Whether to add data attributes
- **skipElements** (array): Element names to skip

## 🎯 Benefits for AI-Generated Code

1. **No Manual Work**: AI can generate clean JSX without worrying about IDs
2. **Consistent Patterns**: All elements get predictable, parseable IDs
3. **Array Support**: Automatically handles dynamic content from arrays
4. **Component Tracking**: Know exactly which component and file contains each element
5. **Developer Friendly**: Works seamlessly with existing development workflow

## 🔧 ID Patterns

- **Regular elements**: `elementType-counter` (e.g., `div-1`, `h1-2`)
- **Array elements**: `arrayName-${item.id || index}` (e.g., `tasks-1`, `users-0`)
- **Nested properties**: Can be extended with suffixes like `tasks-1-title`

## 🚨 Troubleshooting

### Plugin Not Working?
1. Check that the plugin is installed: `npm list eslint-plugin-inspector-ids`
2. Verify ESLint configuration includes the plugin
3. Make sure VS Code ESLint extension is enabled

### IDs Not Unique?
The plugin generates sequential IDs per file. If you need different patterns, you can modify the `generateElementId` function in the plugin.

### Array Detection Issues?
The plugin looks for `.map()` calls. If using other iteration methods, you may need to extend the `detectArrayContext` function.

## 🔄 Workflow Integration

1. **AI generates clean React code** → No IDs needed
2. **Developer saves file** → ESLint auto-fix adds all attributes
3. **Element Inspector works** → Full component and array context available
4. **User edits visually** → Nuxt app shows exactly what was changed

This creates a seamless workflow where AI focuses on functionality and the tooling handles inspector integration automatically!
