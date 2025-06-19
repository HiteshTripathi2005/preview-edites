import React from 'react'

const Hello = () => {
  return (
    <div id="div-1" data-component="Hello" data-file="src/components/Hello.jsx">
        <h1 id="h1-2" data-component="Hello" data-file="src/components/Hello.jsx">Hello, World!</h1>
        <p id="p-3" data-component="Hello" data-file="src/components/Hello.jsx">This is a simple React component that displays a greeting message.</p>
        <button id="button-4" data-component="Hello" data-file="src/components/Hello.jsx" onClick={() => alert('Hello!')}>Greet Me</button>
        <p id="p-5" data-component="Hello" data-file="src/components/Hello.jsx">Feel free to customize this component as you like.</p>
        <p id="p-6" data-component="Hello" data-file="src/components/Hello.jsx">Happy coding!</p>
    </div>
  )
}

export default Hello