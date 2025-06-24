import React, { useState, useEffect } from "react";


const App = () => {
  // Simple data for demo
  const [data, setData] = useState([]);
  const cards = [
  {
    id: 1,
    title: 'Card One',
    description: 'This is the first card.',
    imageUrl: 'https://t4.ftcdn.net/jpg/04/39/89/01/360_F_439890152_sYbPxa1ANTSKcZuUsKzRAf9O7bJ1Tx5B.jpg'
  },
  {
    id: 2,
    title: 'Card Two',
    description: 'This is the second card.',
    imageUrl: 'https://wallpapercat.com/w/full/0/f/3/5815630-3840x2160-desktop-hd-4k-wallpaper-image.jpg'
  },
  {
    id: 3,
    title: 'Card Three',
    description: 'This is the third card.',
    imageUrl: 'https://img.freepik.com/free-photo/misurina-sunset_181624-34793.jpg?semt=ais_hybrid&w=740'
  }];


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
    <>
    <div id="div-ipj7y" data-component="App" data-file="src/App.jsx">
      <h1 id="h1-2oxei" data-component="App" data-file="src/App.jsx">hello</h1>
    </div>
    <div id="div-tqj0j" data-component="App" data-file="src/App.jsx" data-dynamic="true">
      {
        cards.map((card, index) =>
        <div key={card.id} className="card" id={`card-${card.id}`} data-component="Card" data-file="src/App.jsx">
            <img id={"cards-img-9d0x-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="cards-img-9d0x-static" data-array="cards" data-array-index={index} data-dynamic="true" src={card.imageUrl} alt={card.title} className="card-image" />
            <h2 id={"cards-h2-chj5-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="cards-h2-chj5-static" data-array="cards" data-array-index={index} data-dynamic="true" className="card-title">{card.title}</h2>
            <p id={"cards-p-2zjz-" + index + ""} data-component="App" data-file="src/App.jsx" data-static-id="cards-p-2zjz-static" data-array="cards" data-array-index={index} data-dynamic="true" className="card-description">{card.description}</p>
          </div>
        )}
    </div>
    </>);



};

export default App;