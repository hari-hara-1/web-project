import { useState, useEffect } from "react";
import "./SudokuPage.css";

function SudokuPage() {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [notes, setNotes] = useState(Array(9).fill(null).map(() => Array(9).fill([])));
  
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [notesMode, setNotesMode] = useState(false);
  const [difficulty, setDifficulty] = useState(""); 

  // --- Logic Helper Functions ---

  const isRowComplete = (rowIndex) => {
    if (!board || board.length === 0) return false;
    return board[rowIndex].every((cell) => cell !== "");
  };

  const isColComplete = (colIndex) => {
    if (!board || board.length === 0) return false;
    return board.every((row) => row[colIndex] !== "");
  };

  const loadPuzzle = async () => {
    try {
      const response = await fetch("https://sudoku-api.vercel.app/api/dosuku");
      const data = await response.json();
      const grid = data.newboard.grids[0];

      const formattedBoard = grid.value.map((row) =>
        row.map((num) => (num === 0 ? "" : num.toString()))
      );

      const formattedSolution = grid.solution.map((row) =>
        row.map((num) => num.toString())
      );

      setBoard(formattedBoard);
      setInitialBoard(formattedBoard.map(row => [...row])); 
      setSolution(formattedSolution);
      setNotes(Array(9).fill(null).map(() => Array(9).fill([])));
      setScore(0);
      setSeconds(0);
      setMessage("");
      setSelectedCell(null);
    } catch (err) {
      console.error("Error loading Sudoku:", err);
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, isPaused]);

  const formatTime = () => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const handleCellClick = (r, c) => {
    if (!gameStarted || isPaused) return;
    if (initialBoard[r][c] !== "") return;
    setSelectedCell({ r, c });
  };

  const handleNumberClick = (num) => {
    if (!selectedCell || isPaused) return;
    const { r, c } = selectedCell;

    if (notesMode) {
      const currentNotes = notes[r][c];
      const newNotes = currentNotes.includes(num)
        ? currentNotes.filter((n) => n !== num)
        : [...currentNotes, num].sort();
      
      const updatedNotes = [...notes];
      updatedNotes[r][c] = newNotes;
      setNotes(updatedNotes);
    } else {
      if (solution[r][c] === num) {
        const newBoard = [...board];
        newBoard[r][c] = num;
        setBoard(newBoard);
        
        const updatedNotes = [...notes];
        updatedNotes[r][c] = [];
        setNotes(updatedNotes);

        const multiplier = difficulty === "Hard" ? 20 : difficulty === "Medium" ? 15 : 10;
        setScore((prev) => prev + multiplier);
        setMessage(`✔ Correct +${multiplier}`);
        setSelectedCell(null);
      } else {
        setScore((prev) => prev - 5);
        setMessage("❌ Wrong −5");
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || isPaused) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] === "") {
      const newBoard = [...board];
      newBoard[r][c] = "";
      setBoard(newBoard);
      const updatedNotes = [...notes];
      updatedNotes[r][c] = [];
      setNotes(updatedNotes);
    }
  };

  const startGame = () => {
    if (!difficulty) {
      setMessage("⚠️ Please select a difficulty first!");
      return;
    }
    setGameStarted(true);
    setIsPaused(false);
    setMessage("");
  };

  const togglePause = () => {
    if (!gameStarted) return;
    setIsPaused(!isPaused);
  };

  return (
    <div className="container">
      <h1>🌿 Sudoku</h1>

      {!gameStarted && (
        <div className="start-section difficulty-container">
          <p className="select-label">CHOOSE YOUR CHALLENGE</p>
          <div className="difficulty-pad">
            {["Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                className={`diff-btn ${difficulty === level ? "selected" : ""}`}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
          <button id="startBtn" onClick={startGame}>Start Game</button>
        </div>
      )}

      <div className="stats-bar">
        <div>Score: <span>{score}</span></div>
        <div>Time: <span>{formatTime()}</span></div>
      </div>

      <div className="controls">
        <div className="control-item">
          <button id="pauseBtn" className={isPaused ? "play" : "pause"} onClick={togglePause}></button>
          <span>{isPaused ? "Play" : "Pause"}</span>
        </div>
        <div className="control-item">
          <button id="notesBtn" className={notesMode ? "active-note" : ""} onClick={() => setNotesMode(!notesMode)}>✎</button>
          <span>Notes</span>
        </div>
        <div className="control-item">
          <button id="eraseBtn" onClick={handleErase}>✖</button>
          <span>Erase</span>
        </div>
        <div className="control-item">
          <button id="resetBtn" onClick={loadPuzzle}>⟳</button>
          <span>Reset</span>
        </div>
      </div>
            <p id="message">{message}</p>
      <div id="board">
        {board.length > 0 && board.map((row, r) =>
          row.map((cell, c) => {
            const isInitial = initialBoard[r] && initialBoard[r][c] !== "";
            const isUserFilled = !isInitial && cell !== "";
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const rowFinished = isRowComplete(r);
            const colFinished = isColComplete(c);

            return (
              <div
                key={`${r}-${c}`}
                className={`tile 
                  ${isInitial ? "tile-start" : ""} 
                  ${isUserFilled ? "tile-user" : ""}
                  ${rowFinished ? "row-complete" : ""} 
                  ${colFinished ? "col-complete" : ""}
                  ${(r + 1) % 3 === 0 && r !== 8 ? "horizontal-line" : ""}
                  ${(c + 1) % 3 === 0 && c !== 8 ? "vertical-line" : ""}
                `}
                style={{
                  backgroundColor: isSelected ? "#8deb23" : undefined,
                  zIndex: isSelected ? 10 : 1
                }}
                onClick={() => handleCellClick(r, c)}
              >
                {!isPaused ? (
                  cell !== "" ? cell : (
                    <div className="tile-note-container">
                      {notes[r] && notes[r][c] ? notes[r][c].join("") : ""}
                    </div>
                  )
                ) : ""}
              </div>
            );
          })
        )}
      </div>

      <div id="digits">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} className="number" onClick={() => handleNumberClick(num.toString())}>
            {num}
          </button>
        ))}
      </div>


    </div>
  );
}

export default SudokuPage;