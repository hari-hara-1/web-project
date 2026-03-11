import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [flash, setFlash] = useState(false);

  const handleClick = (path) => {
    setFlash(true);

    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <div className={`home-wrapper ${flash ? "flash" : ""}`}>
      <div className="light-glow"></div>

      <h1 className="title">Interactive Multi - Game Platform</h1>

      <div className="games-container">
        <div
          className="game-card sudoku"
          onClick={() => handleClick("/sudoku")}
        >
          <span>Sudoku</span>
        </div>

        <div
          className="game-card chess center"
          onClick={() => handleClick("/chess")}
        >
          <span>Chess</span>
        </div>

        <div
          className="game-card reversi"
          onClick={() => handleClick("/reversi")}
        >
          <span>Reversi</span>
        </div>
      </div>

      <div className="footer-text">Web Programming Project</div>
    </div>
  );
}

export default HomePage;