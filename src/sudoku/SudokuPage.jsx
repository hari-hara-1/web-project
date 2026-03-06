import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SudokuPage.css";

function SudokuPage() {
  const navigate = useNavigate();

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
  const [showCompletionSplash, setShowCompletionSplash] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  const cloneBoard = (sourceBoard) => sourceBoard.map((row) => [...row]);
  const cloneNotes = (sourceNotes) => sourceNotes.map((row) => row.map((cell) => [...cell]));

  const saveTileMoveSnapshot = () => {
    setMoveHistory((prev) => [
      ...prev,
      {
        board: cloneBoard(board),
        notes: cloneNotes(notes),
        score,
        message,
        selectedCell,
      },
    ]);
  };

  const isRowComplete = (rowIndex) => {
    if (!board || board.length === 0) return false;
    return board[rowIndex].every((cell) => cell !== "");
  };

  const isColComplete = (colIndex) => {
    if (!board || board.length === 0) return false;
    return board.every((row) => row[colIndex] !== "");
  };

  const isDigitComplete = (digit) => {
    if (!board || board.length === 0) return false;
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === digit) count += 1;
      }
    }
    return count === 9;
  };

  const loadPuzzle = async (level = difficulty) => {
    try {
      const response = await fetch(
        `https://sudoku-api.vercel.app/api/dosuku?difficulty=${level.toLowerCase()}`
      );

      const data = await response.json();
      const grid = data.newboard.grids[0];

      const formattedBoard = grid.value.map((row) =>
        row.map((num) => (num === 0 ? "" : num.toString()))
      );

      const formattedSolution = grid.solution.map((row) =>
        row.map((num) => num.toString())
      );

      setBoard(formattedBoard);
      setInitialBoard(formattedBoard.map((row) => [...row]));
      setSolution(formattedSolution);

      setNotes(Array(9).fill(null).map(() => Array(9).fill([])));
      setScore(0);
      setSeconds(0);
      setMessage("");
      setSelectedCell(null);
      setShowCompletionSplash(false);
      setMoveHistory([]);
    } catch (err) {
      console.error("Error loading Sudoku:", err);
    }
  };

  useEffect(() => {
    document.body.classList.add("sudoku-body");
    return () => {
      document.body.classList.remove("sudoku-body");
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, isPaused]);

  useEffect(() => {
    if (!gameStarted || !solution.length || showCompletionSplash) return;

    const allCellsFilled =
      board.length === 9 && board.every((row) => row.every((cell) => cell !== ""));
    if (!allCellsFilled) return;

    const solved = board.every((row, r) =>
      row.every((cell, c) => cell === solution[r][c])
    );

    if (solved) {
      setIsPaused(true);
      setSelectedCell(null);
      setMessage("All 81 tiles entered. Sudoku complete!");
      setShowCompletionSplash(true);
    }
  }, [board, solution, gameStarted, showCompletionSplash]);

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

    if (isDigitComplete(num) && board[r][c] !== num) {
      setMessage("Digit complete");
      return;
    }

    if (notesMode) {
      const updatedNotes = cloneNotes(notes);
      const currentNotes = notes[r][c];
      const newNotes = currentNotes.includes(num)
        ? currentNotes.filter((n) => n !== num)
        : [...currentNotes, num].sort();

      updatedNotes[r][c] = newNotes;
      setNotes(updatedNotes);
    } else {
      if (solution[r][c] === num) {
        saveTileMoveSnapshot();
        const newBoard = cloneBoard(board);
        newBoard[r][c] = num;
        setBoard(newBoard);

        const updatedNotes = cloneNotes(notes);
        updatedNotes[r][c] = [];
        setNotes(updatedNotes);

        const multiplier =
          difficulty === "Hard" ? 20 : difficulty === "Medium" ? 15 : 10;

        setScore((prev) => prev + multiplier);
        setMessage(`✔ Correct +${multiplier}`);
        setSelectedCell(null);
      } else {
        setScore((prev) => prev - 5);
        setMessage("❌ Wrong −5");
      }
    }
  };

  const isBoxComplete = (rowIndex, colIndex) => {
    if (!board || board.length === 0) return false;

    const boxRowStart = Math.floor(rowIndex / 3) * 3;
    const boxColStart = Math.floor(colIndex / 3) * 3;

    const boxCells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        boxCells.push(board[boxRowStart + r][boxColStart + c]);
      }
    }

    return boxCells.every((cell) => cell !== "");
  };

  const handleErase = () => {
    if (!selectedCell || isPaused) return;
    const { r, c } = selectedCell;

    if (initialBoard[r][c] === "") {
      if (board[r][c] === "" && (!notes[r][c] || notes[r][c].length === 0))
        return;

      saveTileMoveSnapshot();

      const newBoard = cloneBoard(board);
      newBoard[r][c] = "";
      setBoard(newBoard);

      const updatedNotes = cloneNotes(notes);
      updatedNotes[r][c] = [];
      setNotes(updatedNotes);
    }
  };

  const handleUndo = () => {
    if (!gameStarted || moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];

    setBoard(cloneBoard(lastMove.board));
    setNotes(cloneNotes(lastMove.notes));
    setScore(lastMove.score);
    setMessage("↩ Last tile cleared");
    setSelectedCell(lastMove.selectedCell);
    setShowCompletionSplash(false);

    setMoveHistory((prev) => prev.slice(0, -1));
  };

  const startGame = async () => {
    if (!difficulty) {
      setMessage("⚠️ Please select a difficulty first!");
      return;
    }

    await loadPuzzle(difficulty);

    setGameStarted(true);
    setIsPaused(false);
    setMessage("");
    setShowCompletionSplash(false);
  };

  const togglePause = () => {
    if (!gameStarted) return;
    setIsPaused(!isPaused);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-page">
        <button className="home-nav-btn" onClick={goHome}>
          Home
        </button>

        <h1>🌿 Sudoku</h1>

        {showCompletionSplash && (
          <div className="completion-splash">
            <div className="completion-card">
              <p className="completion-title">Sudoku Done!</p>
              <p className="completion-text">All grid entries are complete.</p>
              <p className="completion-score">Final Score: {score}</p>
              <p className="completion-time">Time: {formatTime()}</p>
              <button
                className="completion-btn"
                onClick={() => loadPuzzle(difficulty)}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {!gameStarted && (
          <div className="start-section difficulty-container">
            <p className="select-label">CHOOSE YOUR CHALLENGE</p>

            <div className="difficulty-pad">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  className={`diff-btn ${
                    difficulty === level ? "selected" : ""
                  }`}
                  onClick={() => setDifficulty(level)}
                >
                  {level}
                </button>
              ))}
            </div>

            <button id="startBtn" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        <div className="stats-bar">
          <div>
            Score: <span>{score}</span>
          </div>
          <div>
            Time: <span>{formatTime()}</span>
          </div>
        </div>

        <div className="controls">
          <div className="control-item">
            <button
              id="pauseBtn"
              className={isPaused ? "play" : "pause"}
              onClick={togglePause}
            ></button>
            <span>{isPaused ? "Play" : "Pause"}</span>
          </div>

          <div className="control-item">
            <button
              id="notesBtn"
              className={notesMode ? "active-note" : ""}
              onClick={() => setNotesMode(!notesMode)}
            >
              ✎
            </button>
            <span>Notes</span>
          </div>

          <div className="control-item">
            <button id="eraseBtn" onClick={handleErase}>
              ✖
            </button>
            <span>Erase</span>
          </div>

          <div className="control-item">
            <button id="undoBtn" onClick={handleUndo}>
              ↶
            </button>
            <span>Undo</span>
          </div>

          <div className="control-item">
            <button
              id="resetBtn"
              onClick={() => loadPuzzle(difficulty)}
            >
              ⟳
            </button>
            <span>Reset</span>
          </div>
        </div>

        <p id="message">{message}</p>

        {gameStarted && (
          <div id="board">
            {board.length > 0 &&
              board.map((row, r) =>
                row.map((cell, c) => {
                  const isInitial =
                    initialBoard[r] && initialBoard[r][c] !== "";
                  const isUserFilled = !isInitial && cell !== "";
                  const isSelected =
                    selectedCell?.r === r && selectedCell?.c === c;
                  const rowFinished = isRowComplete(r);
                  const colFinished = isColComplete(c);
                  const boxFinished = isBoxComplete(r, c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`tile 
                      ${isInitial ? "tile-start" : ""} 
                      ${isUserFilled ? "tile-user" : ""}
                      ${isSelected ? "tile-selected" : ""}
                      ${rowFinished ? "row-complete" : ""}
                      ${colFinished ? "col-complete" : ""}
                      ${boxFinished ? "box-complete" : ""}
                      ${
                        (r + 1) % 3 === 0 && r !== 8
                          ? "horizontal-line"
                          : ""
                      }
                      ${
                        (c + 1) % 3 === 0 && c !== 8
                          ? "vertical-line"
                          : ""
                      }`}
                      onClick={() => handleCellClick(r, c)}
                    >
                      {!isPaused ? (
                        cell !== "" ? (
                          cell
                        ) : (
                          <div className="tile-note-container">
                            {notes[r] && notes[r][c]
                              ? notes[r][c].join("")
                              : ""}
                          </div>
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })
              )}
          </div>
        )}

        <div id="digits">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className={`number ${
                isDigitComplete(num.toString())
                  ? "digit-complete"
                  : ""
              }`}
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SudokuPage;