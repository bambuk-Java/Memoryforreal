import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // State-Hooks für verschiedene Spielparameter
  const [clickedImages, setClickedImages] = useState([]); // Verfolgt, welche Bilder geklickt wurden
  const [turnedCards, setTurnedCards] = useState([]); // Verfolgt, welche Karten umgedreht wurden
  const [clickBlocked, setClickBlocked] = useState(false); // Blockiert Klicks, wenn das Spiel gerade im Gange ist
  const [tries, setTries] = useState(0); // Zählt die Anzahl der Versuche
  const [resetKey, setResetKey] = useState(0); // Ein Key, der sich ändert, um das Spiel zurückzusetzen
  
  // Array mit den Bildpfaden für die Spielkarten
  const imagePath = [
    "1.jpg",
    "wolves/2.jpg",
    "wolves/3.jpg",
    "wolves/4.jpg",
    "wolves/5.jpg",
    "wolves/6.png",
    "wolves/8.jpg",
    "wolves/11.avif"
  ];

  // State-Hook, um anzuzeigen, ob ein Bild durch einen grauen Überzug bedeckt ist
  const [showGrayOverlay, setShowGrayOverlay] = useState(Array(imagePath.length).fill(false));

  // Initialisiert das Array clickedImages mit 'true' für alle Bilder (bedeckt)
  const initializeClickedImages = () => {
    const grid = document.querySelector(".Cards");
    const numberOfImages = grid.children.length;
    setClickedImages(new Array(numberOfImages).fill(true));
  };
  
  // Funktion zum Mischen der Karten
  const shuffleCards = () => {
    const grid = document.querySelector(".Cards");
    const items = Array.from(grid.children);
    
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]; // Swap items[i] and items[j]
    }
  
    // Reinsert shuffled items into the grid
    grid.innerHTML = ''; // Clear the grid
    items.forEach(item => grid.appendChild(item)); // Append shuffled items back to the grid
  };
  

  useEffect(() => {
    shuffleCards(); // Beim Start und bei jedem Reset die Karten mischen
  }, [resetKey]);

  // Startet das Spiel, setzt alle Parameter zurück und mischt die Karten
  const startGame = () => {
    setResetKey(prevKey => prevKey + 1);
    shuffleCards(); // Shuffle the cards
    setShowGrayOverlay(Array(imagePath.length).fill(false));
    initializeClickedImages();
    setClickBlocked(false);
    setTries(0);
  };

  // Umschaltet den Zustand des geklickten Bildes (gedeckt/entdeckt)
  const toggle = (index) => {
    setClickedImages(prevState => {
      const newClickedImages = [...prevState];
      newClickedImages[index] = !newClickedImages[index];
      return newClickedImages;
    });
    lockOpenImage(index);
  };

  // Behandelt den Fall, wenn zwei umgedrehte Karten übereinstimmen
  const handleMatch = (largerImage, smallerImage) => {
    const largerImageElement = document.getElementById(`image-${largerImage}`);
    const smallerImageElement = document.getElementById(`image-${smallerImage}`);
    // Lösche die passenden Karten nach einer kurzen Verzögerung
    setTimeout(() => {
      if (largerImageElement) {
        largerImageElement.parentElement.innerHTML = "";
      }

      if (smallerImageElement) {
        smallerImageElement.parentElement.innerHTML = "";
      }
    }, 500);
    // Aktiviere den grauen Überzug für das kleinere Bild
    grayOverlay(smallerImageElement);
  };

  // Sperrt das geöffnete Bild
  const lockOpenImage = (index) => {
    if (clickedImages.filter(image => !image).length === 1) {
      setClickedImages(prevState => {
        if (prevState[index] === true) {
          const newClickedImages = [...prevState];
          newClickedImages[index] = false;
          return newClickedImages;
        }
        return prevState; // Wenn der Wert bereits false ist, geben Sie den aktuellen Zustand zurück, um eine unendliche Schleife zu vermeiden
      });
    }
  };

  // Behandelt das Umdrehen der Karten und überprüft auf Übereinstimmung
  const handleTurn = () => {
    const openedImages = clickedImages
      .map((image, index) => ({ value: image, index: index }))
      .filter(obj => obj.value === false);
    
    if (openedImages.length === 1) {
      lockOpenImage(openedImages[0].index);
    }
  
    if (openedImages.length === 2) {
      setClickBlocked(true);
      handleTries();
      const image1 = openedImages[0].index;
      const image2 = openedImages[1].index;
      const largerImage = image1 > image2 ? image1 : image2;
      const smallerImage = image1 < image2 ? image1 : image2;
  
      if (largerImage - 8 === smallerImage) {
        console.log("match!!");
        handleMatch(largerImage, smallerImage);
      } else {
        console.log("no match");
      }
  
      setTimeout(() => {
        setClickedImages(prevState => {
          const newClickedImages = [...prevState];
          newClickedImages[largerImage] = true;
          newClickedImages[smallerImage] = true;
          return newClickedImages;
        });
        setClickBlocked(false);
      }, 500);
    }
  };

  // Erhöht die Anzahl der Versuche
  const handleTries = () => {
    setTries(prevState => prevState + 1);
  };

  // Aktiviert den grauen Überzug für das kleinere Bild
  const grayOverlay = (smallerImage) => {
    const index = Number(smallerImage.id.split("-")[1]);
    setShowGrayOverlay(prevState => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  // Debugging-Funktion zum Anzeigen des aktuellen Zustands des clickedImages-Arrays
  const showArray = () => {
    console.log("clickedImages", clickedImages);
    const openedImages = clickedImages
      .map((image, index) => ({ value: image, index: index }))
      .filter(obj => obj.value === false);
    console.log("opened Images", openedImages);
  };

  // Der Effekt wird ausgeführt, wenn sich der Zustand des clickedImages-Arrays ändert
  useEffect(() => {
    // Überprüft, ob noch Bilder umgedreht werden müssen
    const remainingImages = clickedImages.filter(image => image === false);
    if (remainingImages.length > 0) {
      handleTurn();
    }
  }, [clickedImages]);

  return (
    <div className="UI">
      <div className="foundCards">
        {/* Anzeige der umgedrehten Karten */}
        {imagePath.map((image, index) => (
          <div key={index} className={`solverContainer ${showGrayOverlay[index] ? "grayOverlay" : ""}`}>
            <img
              src={image}
              className="solverContainerContainer"
              alt="image"
            />
          </div>
        ))}
        {/* Anzeige der Anzahl der Versuche */}
        <h1 className="text">Versuche:{tries}</h1>
        {/* Button zum Starten des Spiels */}
        <button id="start" onClick={startGame}>Starte das Spiel!</button>
      </div>

      <div className="App" key={resetKey}>
        <div className="Cards">
          {/* Rendert die Vorderseite der Karten */}
          {imagePath.map((image, index) => (
            <div key={index} className="image-container"
              onClick={() => {
                if (!clickBlocked) {
                  toggle(index);
                  setTurnedCards([...turnedCards, index]);
                  handleTurn();
                }
              }}
            >
              <img
                id={`image-${index}`}
                src={image}
                className={`${clickedImages[index] ? "covered" : ""} images`}
                alt="image"
              />
            </div>
          ))}
          {/* Rendert die Rückseite der Karten */}
          {imagePath.map((image, index) => (
          <div key={index + imagePath.length} className="image-container"
            onClick={() => {
              if (!clickBlocked) {
                toggle(index + imagePath.length); // Anpassung des Index für die Rückseite der Karten
                setTurnedCards([...turnedCards, index + imagePath.length]);
                handleTurn();
              }
            }}
          >
            <img
              id={`image-${index + imagePath.length}`}
              src={image}
              className={`${clickedImages[index + imagePath.length] ? "covered" : ""} images`}
              alt="image"
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default App;
