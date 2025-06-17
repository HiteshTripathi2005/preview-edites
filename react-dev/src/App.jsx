import ElementInspector from "./ElementInspector";

const App = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-500">
        Hello World from React
      </h1>
      <p className="mt-2 text-gray-700">
        This React app has a built-in element inspector. Click the 🔍 button to start editing elements!
      </p>
      
      <div className="mt-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Button 1
        </button>
        <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded">
          Button 2
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Demo Component</h3>
        <p className="text-gray-600 mt-2">
          This text can be edited with the element inspector.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800">Card Title 1</h4>
          <p className="text-gray-600 mt-2">Sample editable text.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800">Card Title 2</h4>
          <p className="text-gray-600 mt-2">Another editable content.</p>
        </div>
      </div>

      {/* Element Inspector Component */}
      <ElementInspector />
    </div>
  );
};

export default App;
