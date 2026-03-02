import { useState, useEffect, useCallback } from 'react';
import { BOARD_SIZE, EMPTY, BLACK, WHITE, DIRECTIONS } from './constants';
import './ReversiPage.css';

function ReversiPage() {
  // Initialize the board with the standard Reversi starting position
  const initializeBoard = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // Place the initial 4 discs in the center
    const center = BOARD_SIZE / 2;
    board[center - 1][center - 1] = WHITE;
    board[center - 1][center] = BLACK;
    board[center][center - 1] = BLACK;
    board[center][center] = WHITE;
    
    return board;
  };

  const [board, setBoard] = useState(initializeBoard);
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [validMoves, setValidMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Check if a position is on the board
  const isOnBoard = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

  // Get discs that would be flipped if a disc is placed at (row, col)
  const getFlippableDiscs = useCallback((boardState, row, col, player) => {
    if (boardState[row][col] !== EMPTY) return [];

    const opponent = player === BLACK ? WHITE : BLACK;
    const flippable = [];

    for (const [dr, dc] of DIRECTIONS) {
      let r = row + dr;
      let c = col + dc;
      const potentialFlips = [];

      // Move in the direction as long as we see opponent discs
      while (isOnBoard(r, c) && boardState[r][c] === opponent) {
        potentialFlips.push([r, c]);
        r += dr;
        c += dc;
      }

      // If we ended on a cell with our own disc and flipped at least one opponent disc
      if (isOnBoard(r, c) && boardState[r][c] === player && potentialFlips.length > 0) {
        flippable.push(...potentialFlips);
      }
    }

    return flippable;
  }, []);

  // Calculate all valid moves for a player
  const calculateValidMoves = useCallback((boardState, player) => {
    const moves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const flippable = getFlippableDiscs(boardState, row, col, player);
        if (flippable.length > 0) {
          moves.push({ row, col, flippable });
        }
      }
    }
    
    return moves;
  }, [getFlippableDiscs]);

  // Calculate scores for both players
  const calculateScores = useCallback((boardState) => {
    let blackScore = 0;
    let whiteScore = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] === BLACK) blackScore++;
        else if (boardState[row][col] === WHITE) whiteScore++;
      }
    }

    return { blackScore, whiteScore };
  }, []);

  // Update valid moves when board or current player changes
  useEffect(() => {
    const moves = calculateValidMoves(board, currentPlayer);
    setValidMoves(moves);

    // Check if game is over
    if (moves.length === 0) {
      // Check if the other player has valid moves
      const opponent = currentPlayer === BLACK ? WHITE : BLACK;
      const opponentMoves = calculateValidMoves(board, opponent);
      
      if (opponentMoves.length === 0) {
        // Game is over - no one can move
        const scores = calculateScores(board);
        if (scores.blackScore > scores.whiteScore) {
          setWinner('Black');
        } else if (scores.whiteScore > scores.blackScore) {
          setWinner('White');
        } else {
          setWinner('Draw');
        }
        setGameOver(true);
      } else {
        // Pass turn to opponent
        setCurrentPlayer(opponent);
      }
    }
  }, [board, currentPlayer, calculateValidMoves, calculateScores]);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameOver) return;

    const move = validMoves.find(m => m.row === row && m.col === col);
    if (!move) return;

    // Create new board with the placed disc
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;

    // Flip the captured discs
    for (const [flipRow, flipCol] of move.flippable) {
      newBoard[flipRow][flipCol] = currentPlayer;
    }

    setBoard(newBoard);
    
    // Switch to opponent
    const opponent = currentPlayer === BLACK ? WHITE : BLACK;
    setCurrentPlayer(opponent);
  };

  // Check if a cell is a valid move
  const isValidMove = (row, col) => {
    return validMoves.some(m => m.row === row && m.col === col);
  };

  // Restart the game
  const restartGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer(BLACK);
    setGameOver(false);
    setWinner(null);
  };

  const { blackScore, whiteScore } = calculateScores(board);

  const getStatusText = () => {
    if (gameOver) {
      if (winner === 'Draw') return "It's a Draw!";
      return `${winner} Wins!`;
    }
    return currentPlayer === BLACK ? 'Black to move' : 'White to move';
  };

  return (
    <div className="app">
      <header className="app-header">
        <a href="/" className="home-btn">← Home</a>
        <div className="title">
          <h1>◉ Reversi</h1>
          <p className="subtitle">Flip the game in your favor</p>
        </div>
      </header>

      <main className="game">
        <div className="carrom-frame">
          <div className="board-container">
            <div className="board">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== EMPTY && (
                      <div className={`cell-disc ${cell === BLACK ? 'black' : 'white'}`}></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="info">
            <div className="score-panel">
              <div className="score-item black-score">
                <span className="score-disc black"></span>
                <span>{blackScore}</span>
              </div>
              <div className="score-divider">:</div>
              <div className="score-item white-score">
                <span className="score-disc white"></span>
                <span>{whiteScore}</span>
              </div>
            </div>
            <p id="status">{getStatusText()}</p>
          </div>
        </div>

        {gameOver && (
          <div className="overlay">
            <div className="popup">
              <h2>{winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}</h2>
              <button onClick={restartGame}>Play Again</button>
            </div>
          </div>
        )}

        {!gameOver && (
          <button onClick={restartGame} style={{ marginTop: '10px' }} className="button1">
            New Game
          </button>
        )}
      </main>
    </div>
  );
}

export default ReversiPage;

