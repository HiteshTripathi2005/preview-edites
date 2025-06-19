import React from 'react'

const Demo = () => {
  return (
    <div id="div-1" data-component="Demo" data-file="src/components/Demo.jsx">
        <h1 id="h1-2" data-component="Demo" data-file="src/components/Demo.jsx">Demo Component</h1>
        <p id="p-3" data-component="Demo" data-file="src/components/Demo.jsx">This is a simple demo component to showcase React functionality.</p>
        <button id="button-4" data-component="Demo" data-file="src/components/Demo.jsx" onClick={() => alert('Button clicked!')}>Click Me</button>
        <p id="p-5" data-component="Demo" data-file="src/components/Demo.jsx">Feel free to modify this component as needed.</p>
        <p id="p-6" data-component="Demo" data-file="src/components/Demo.jsx">Enjoy coding!</p>
    </div>
  )
}

export default Demo