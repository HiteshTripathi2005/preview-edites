import ElementInspector from "./ElementInspector";
import React, { useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'inspector_saved_changes';

const App = () => {
  useEffect(() => {
    try {
      const storedChanges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

      for (const elementId in storedChanges) {
        const element = document.getElementById(elementId);
        if (element) {
          const changes = storedChanges[elementId];
          for (const property in changes) {
            const value = changes[property];
            
            if (property === 'textContent') {
              element.textContent = value;
            } else if (value === 'default') {
              // Skip default values - let the element keep its original styles
              continue;
            } else {
              // Check if the value is a Tailwind class or inline style
              if (value && (value.startsWith('text-') || value.startsWith('bg-') || value.startsWith('p-'))) {
                // It's a Tailwind class, add it to the element
                element.classList.add(value);
              } else {
                // It's an inline style value
                element.style[property] = value;
              }
            }
          }
        }
      }
      console.log("Loaded and applied saved changes from localStorage.");
    } catch (e) {
      console.error("Error loading or applying saved changes from localStorage:", e);
    }
  }, []);

  return (
    <div className="p-4" id="main-app-container">
      <h1 className="text-3xl font-bold text-blue-500" id="main-title">
        Hello World from React
      </h1>
      <p className="mt-2 text-gray-700" id="main-description">
        This React app has a built-in element inspector. Click the 🔍 button to start editing elements!
      </p>
      
      <div className="mt-6" id="buttons-container">
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" id="button-1">
          Button 1
        </button>
        <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded" id="button-2">
          Button 2
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg" id="demo-component-container">
        <h3 className="text-lg font-medium text-gray-800" id="demo-component-title">Demo Component</h3>
        <p className="text-gray-600 mt-2" id="demo-component-text">
          This text can be edited with the element inspector.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4" id="cards-container">
        <div className="bg-white p-4 rounded-lg shadow" id="card-1">
          <h4 className="font-semibold text-gray-800" id="card-1-title">Card Title 1</h4>
          <p className="text-gray-600 mt-2" id="card-1-text">Sample editable text.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" id="card-2">
          <h4 className="font-semibold text-gray-800" id="card-2-title">Card Title 2</h4>
          <p className="text-gray-600 mt-2" id="card-2-text">Another editable content.</p>
        </div>
      </div>

      {/* Element Inspector Component */}
      <ElementInspector />
    </div>
  );
};

export default App;
