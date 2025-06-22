import React, { useState, useEffect } from "react";
import ElementInspector from "./ElementInspector";

const App = () => {
  // Simple data for demo
  const [data, setData] = useState([]);
  const items = ["First item", "Second item", "Third item"];

  const name = "John Doe";
  const getData = async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div id="div-1" data-component="App" data-file="src/App.jsx">
      <div id="div-1" data-component="App" data-file="src/App.jsx">
        <h1 id="h1-2" data-component="App" data-file="src/App.jsx">
          hello world
        </h1>
      </div>
      <div
        id="div-3"
        data-component="App"
        data-file="src/App.jsx"
        data-dynamic="true"
      >
        {name}
      </div>
      <div
        id="div-4"
        data-component="App"
        data-file="src/App.jsx"
        data-dynamic="true"
      >
        {items.map((item, index) => (
          <div
            id={"items-div-" + index + ""}
            data-component="App"
            data-file="src/App.jsx"
            data-array="items"
            data-array-index={index}
            data-dynamic="true"
            key={index}
          >
            <h1
              id={"items-h1-" + index + ""}
              data-component="App"
              data-file="src/App.jsx"
              data-array="items"
              data-array-index={index}
              data-dynamic="true"
            >
              {item}
            </h1>
          </div>
        ))}
      </div>
      <div
        id="div-1"
        data-component="App"
        data-file="src/App.jsx"
        data-dynamic="true"
      >
        {data.map((item, index) => (
          <div
            id={"data-div-" + index + ""}
            data-component="App"
            data-file="src/App.jsx"
            data-array="data"
            data-array-index={index}
            data-dynamic="true"
            key={index}
          >
            <h1
              id={"data-h1-" + index + ""}
              data-component="App"
              data-file="src/App.jsx"
              data-array="data"
              data-array-index={index}
              data-dynamic="true"
            >
              {item.title}
            </h1>
          </div>
        ))}
      </div>
      <ElementInspector />
    </div>
  );
};

export default App;
