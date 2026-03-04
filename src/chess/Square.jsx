import pieceMap from "./pieceMap";

function Square({ piece, isDark, highlight, onClick, onDropPiece, square }) {
  const squareColor = isDark ? "dark" : "light";

  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", square);
  }

  function handleDrop(e) {
    const from = e.dataTransfer.getData("text/plain");
    onDropPiece(from, square);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  return (
    <div
      className={`square ${squareColor} ${highlight ? "highlight" : ""}`}
      onClick={onClick}
      onDragOver={allowDrop}
      onDrop={handleDrop}
    >
      {piece && (
        <img
          src={pieceMap[piece.color + piece.type]}
          className="piece"
          draggable
          onDragStart={handleDragStart}
          alt=""
        />
      )}{" "}
    </div>
  );
}

export default Square;
