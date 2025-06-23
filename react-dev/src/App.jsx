import React, { useState, useEffect } from "react";


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
      <div id="div-2" data-component="App" data-file="src/App.jsx">
        <h1 id="h1-3" data-component="App" data-file="src/App.jsx">hello</h1>
      </div>
      <div id="div-1" data-component="App" data-file="src/App.jsx" data-dynamic="true">
        {
        items.map((item, index) =>
        <div key={index} id={"items-div-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="items-div-static" data-array="items" data-array-index={index} data-dynamic="true">
              <h1 id={"items-h1-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="items-h1-static" data-array="items" data-array-index={index} data-dynamic="true">{item}</h1>
            </div>
        )
        }
      </div>
      <div id="div-1" data-component="App" data-file="src/App.jsx" data-dynamic="true">
        {
        data.map((item, index) =>
        <div key={index} id={"data-div-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="data-div-static" data-array="data" data-array-index={index} data-dynamic="true">
              <h1 id={"data-h1-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="data-h1-static" data-array="data" data-array-index={index} data-dynamic="true">{item.title}</h1>
            </div>
        )
        }
      </div>
    </div>);

};

export default App;