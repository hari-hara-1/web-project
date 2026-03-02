import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ChessPage from "./chess/ChessPage";
import SudokuPage from "./sudoku/SudokuPage";
import ReversiPage from "./reversi/ReversiPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chess" element={<ChessPage />} />
        <Route path="/sudoku" element={<SudokuPage />} />
        <Route path="/reversi" element={<ReversiPage />} />
      </Routes>
    </div>
  );
}

export default App;