import { Chess } from "chess.js";
import { useState } from "react";
import pieceMap from "./pieceMap";
import "./chess.css";

const game = new Chess();

function ChessPage() {
  const [board, setBoard] = useState(game.board());
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  function showSnackbar(message) {
  setSnackbar(message);

  setTimeout(() => {
    setSnackbar(null);
  }, 2000);
}
  function getKingSquare() {
    if (!game.inCheck()) return null;

    const boardState = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];

        if (piece && piece.type === "k" && piece.color === game.turn()) {
          return String.fromCharCode(97 + c) + (8 - r);
        }
      }
    }

    return null;
  }
  function handleSquareClick(row, col) {
    const square = String.fromCharCode(97 + col) + (8 - row);
    const piece = game.get(square);

    if (selected) {
      const selectedPiece = game.get(selected);

      // If clicking another piece of the same color → change selection
      if (piece && piece.color === selectedPiece.color) {
        const legalMoves = game.moves({
          square: square,
          verbose: true,
        });

        setSelected(square);
        setMoves(legalMoves.map((m) => m.to));
        return;
      }

      // Try to make move
 try {
  const move = game.move({
    from: selected,
    to: square,
    promotion: "q",
  });

  if (move) {
    setBoard(game.board());
  }
} catch (err) {
  showSnackbar("Invalid move");
}

      setSelected(null);
      setMoves([]);
      return;
    }

    if (!piece) return;

    const legalMoves = game.moves({
      square: square,
      verbose: true,
    });

    setSelected(square);
    setMoves(legalMoves.map((m) => m.to));
  }
function handleDropPiece(from, to) {
  try {
    const move = game.move({
      from: from,
      to: to,
      promotion: "q",
    });

    if (move) {
      setLastMove({ from, to });
      setBoard(game.board());
    }
  } catch (err) {
    showSnackbar("Invalid move");
  }

  setSelected(null);
  setMoves([]);
}
  const kingInCheck = getKingSquare();

return (
  <>
    <div className="chess-container">

      {/* LEFT SIDE */}
      <div className="board-area">

        {/* Captured by black */}
        <div className="captured white-captured">
          White pieces captured by black
        </div>

        {/* Board + controls */}
        <div className="board-row">

          {/* BOARD */}
          <div className="board">
            {board.flat().map((square, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;

              const sq = String.fromCharCode(97 + col) + (8 - row);
              const isDark = (row + col) % 2 === 1;

              return (
                <div
                  key={sq}
                  className={`square ${isDark ? "dark" : "light"} 
                  ${moves.includes(sq) ? "highlight" : ""} 
                  ${kingInCheck === sq ? "check" : ""}`}
                  onClick={() => handleSquareClick(row, col)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    const from = e.dataTransfer.getData("square");
                    handleDropPiece(from, sq);
                  }}
                  onDragEnd={() => {
                    setSelected(null);
                    setMoves([]);
                  }}
                >
                  {square && (
                    <img
                      src={pieceMap[square.color + square.type]}
                      className="piece"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("square", sq);
                        e.dataTransfer.effectAllowed = "move";

                        const legalMoves = game.moves({
                          square: sq,
                          verbose: true,
                        });

                        setSelected(sq);
                        setMoves(legalMoves.map((m) => m.to));
                      }}
                      alt=""
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* BOARD CONTROLS */}
          <div className="board-controls">
            <button className="resign-btn">Resign</button>

            <div className="turn-indicator">
              {game.turn() === "w" ? "White to move" : "Black to move"}
            </div>

            <button className="draw-btn">Offer Draw</button>
          </div>

        </div>

        {/* Captured by white */}
        <div className="captured black-captured">
          Black pieces captured by white
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="game-panel">

        <div className="game-title">
          Chess Game
        </div>

        {/* PGN PANEL */}
        <div className="pgn-panel">
          <h3>Live PGN</h3>
          <pre>{game.pgn()}</pre>
        </div>

        {/* NEW GAME BUTTON */}
        <button
          className="new-game-btn"
          onClick={() => window.location.reload()}
        >
          New Game
        </button>

      </div>

    </div>

    {/* SNACKBAR */}
    {snackbar && (
      <div className="snackbar">
        {snackbar}
      </div>
    )}
  </>
);
}

export default ChessPage;
