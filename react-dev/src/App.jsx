import React from 'react';
import ElementInspector from './ElementInspector';

const App = () => {
  // Simple data for demo
  const items = [
    'First item',
    'Second item', 
    'Third item'
  ];

  return (
    <div id="div-1" data-component="App" data-file="src/App.jsx" className="p-8 bg-gray-100 min-h-screen">
      <h1 id="h1-2" data-component="App" data-file="src/App.jsx" className="text-3xl font-bold text-blue-600 mb-4">
        Auto-ID Demo
      </h1>
      <p id="p-3" data-component="App" data-file="src/App.jsx" className="text-gray-700 mb-8">
        Save this file to see automatic ID generation! 🆔
      </p>
      
      {/* Simple elements */}
      <div id="div-4" data-component="App" data-file="src/App.jsx" className="mb-8">
        <h2 id="h2-5" data-component="App" data-file="src/App.jsx" className="text-xl font-semibold mb-4">Static Elements</h2>
        <button id="button-6" data-component="App" data-file="src/App.jsx" className="bg-blue-500 text-white px-4 py-2 rounded mr-4">
          Button 1
        </button>
        <button id="button-7" data-component="App" data-file="src/App.jsx" className="bg-green-500 text-white px-4 py-2 rounded">
          Button 2
        </button>
      </div>

      {/* Array example */}
      <div id="div-8" data-component="App" data-file="src/App.jsx" className="mb-8">
        <h2 id="h2-9" data-component="App" data-file="src/App.jsx" className="text-xl font-semibold mb-4">Array Elements</h2>
        {items.map((item, index) => (
          <div id={`items-${item.id || index}`} data-component="App" data-file="src/App.jsx" data-array="items" data-array-index={index} key={index} className="p-4 mb-2 rounded bg-blue-100">
            <span id={`items-${item.id || index}`} data-component="App" data-file="src/App.jsx" data-array="items" data-array-index={index} className="font-semibold">{item}</span>
          </div>
        ))}
      </div>

      {/* Element Inspector */}
      <ElementInspector />
    </div>
  );
};

export default App;