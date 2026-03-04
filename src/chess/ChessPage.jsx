import { Chess } from "chess.js";
import { useState, useEffect } from "react";
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
  const [gameOver, setGameOver] = useState(null);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [drawOffer, setDrawOffer] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  // Check for game over conditions
  useEffect(() => {
    if (game.isGameOver()) {
      let message = "";
      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        message = `Checkmate! ${winner} wins!`;
      } else if (game.isStalemate()) {
        message = "Stalemate! It's a draw!";
      } else if (game.isThreefoldRepetition()) {
        message = "Threefold repetition! It's a draw!";
      } else if (game.isInsufficientMaterial()) {
        message = "Insufficient material! It's a draw!";
      } else if (game.isDraw()) {
        message = "It's a draw!";
      }
      setGameOver(true);
      setGameOverMessage(message);
      setShowGameOverPopup(true);
    } else {
      setGameOver(false);
      setGameOverMessage("");
      setShowGameOverPopup(false);
    }
  }, [board]);

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
    if (gameOver || isDraw) return;

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

      // Check if there's a capture before making the move
      const capturedPiece = game.get(square);
      
      // Try to make move
      try {
        const move = game.move({
          from: selected,
          to: square,
          promotion: "q",
        });

        if (move) {
          // Track captured pieces
          if (capturedPiece) {
            if (move.color === 'w') {
              setCapturedByWhite(prev => [...prev, capturedPiece]);
            } else {
              setCapturedByBlack(prev => [...prev, capturedPiece]);
            }
          }
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
    if (gameOver || isDraw) return;

    // Check if there's a capture before making the move
    const capturedPiece = game.get(to);

    try {
      const move = game.move({
        from: from,
        to: to,
        promotion: "q",
      });

      if (move) {
        // Track captured pieces
        if (capturedPiece) {
          if (move.color === 'w') {
            setCapturedByWhite(prev => [...prev, capturedPiece]);
          } else {
            setCapturedByBlack(prev => [...prev, capturedPiece]);
          }
        }
        setLastMove({ from, to });
        setBoard(game.board());
      }
    } catch (err) {
      showSnackbar("Invalid move");
    }

    setSelected(null);
    setMoves([]);
  }

  function handleResign() {
    setShowResignConfirm(true);
  }

  function confirmResign() {
    const winner = game.turn() === "w" ? "Black" : "White";
    setGameOver(true);
    setGameOverMessage(`${winner} wins! (Resignation)`);
    setShowResignConfirm(false);
    setShowGameOverPopup(true);
  }

  function cancelResign() {
    setShowResignConfirm(false);
  }

  function handleOfferDraw() {
    const offerer = game.turn() === "w" ? "White" : "Black";
    setDrawOffer(offerer);
  }

  function acceptDraw() {
    setIsDraw(true);
    setDrawOffer(null);
    setGameOver(true);
    setGameOverMessage("Draw agreed!");
    setShowGameOverPopup(true);
  }

  function declineDraw() {
    setDrawOffer(null);
    showSnackbar("Draw declined. Game continues.");
  }

  function getTurnIndicator() {
    if (gameOver || isDraw) {
      if (isDraw) return "Draw";
      if (gameOverMessage.includes("Black wins") || gameOverMessage.includes("White wins")) {
        if (gameOverMessage.includes("Black wins")) return "Black won";
        if (gameOverMessage.includes("White wins")) return "White won";
      }
      return "Game Over";
    }
    return game.turn() === "w" ? "White to move" : "Black to move";
  }

  const kingInCheck = getKingSquare();

  return (
    <>
      <div className="chess-container">

        {/* HEADER - Centered at top */}
        <div className="game-title">
          Chess Game
        </div>

        {/* LEFT SIDE */}
        <div className="board-area">

          {/* Captured by black */}
          <div className="captured white-captured">
            {capturedByWhite.length === 0 ? (
              "White pieces captured by black"
            ) : (
              capturedByWhite.map((piece, i) => (
                <img
                  key={i}
                  src={pieceMap[piece.color + piece.type]}
                  className="captured-piece"
                  alt=""
                />
              ))
            )}
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
                        draggable={!gameOver && !isDraw}
                        onDragStart={(e) => {
                          if (gameOver || isDraw) return;
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
              <button 
                className="resign-btn" 
                onClick={handleResign}
                disabled={gameOver || isDraw}
              >
                Resign
              </button>

              <div className={`turn-indicator ${gameOver || isDraw ? "game-over" : ""}`}>
                {getTurnIndicator()}
              </div>

              <button 
                className="draw-btn" 
                onClick={handleOfferDraw}
                disabled={gameOver || isDraw}
              >
                Offer Draw
              </button>
            </div>

          </div>

          {/* Captured by white */}
          <div className="captured black-captured">
            {capturedByBlack.length === 0 ? (
              "Black pieces captured by white"
            ) : (
              capturedByBlack.map((piece, i) => (
                <img
                  key={i}
                  src={pieceMap[piece.color + piece.type]}
                  className="captured-piece"
                  alt=""
                />
              ))
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="game-panel">

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

      {/* GAME OVER POPUP */}
      {showGameOverPopup && (
        <div className="modal-overlay">
          <div className="modal-content game-over-modal">
            <h2>{gameOverMessage}</h2>
            <button 
              className="modal-btn"
              onClick={() => setShowGameOverPopup(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* RESIGN CONFIRMATION POPUP */}
      {showResignConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2>Confirm Resignation</h2>
            <p>Are you sure you want to resign?</p>
            <div className="modal-buttons">
              <button 
                className="modal-btn confirm"
                onClick={confirmResign}
              >
                Yes
              </button>
              <button 
                className="modal-btn cancel"
                onClick={cancelResign}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAW OFFER POPUP */}
      {drawOffer && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2>Draw Offer</h2>
            <p>{drawOffer} offers a draw. Do you accept?</p>
            <div className="modal-buttons">
              <button 
                className="modal-btn confirm"
                onClick={acceptDraw}
              >
                Yes
              </button>
              <button 
                className="modal-btn cancel"
                onClick={declineDraw}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChessPage;

