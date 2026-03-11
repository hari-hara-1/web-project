# Interactive Multi Game Platform

**Developers:** Hari Hara Sudhan - 24BAI1091, Nagavaibhav N - 24BAI1104, Meiyappan K - 24BAI1143

A React-based interactive platform featuring multiple classic games including Chess, Reversi (Othello), and Sudoku.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Games Included](#games-included)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** - npm is recommended

To verify Node.js is installed, open your terminal and run:
```bash
node --version
```

To verify npm is installed, run:
```bash
npm --version
```

## Installation

Follow these step-by-step instructions to set up the project:

### Step 1: Extract the ZIP File

1. Locate the downloaded ZIP file (`Team3-Interactive_Multi_Game_Platform.zip`)
2. Right-click on the ZIP file and select "Extract All..." (Windows) or double-click to extract (macOS)
3. Choose a destination folder for the extracted files
4. Navigate to the extracted folder in your terminal

**On macOS/Linux (via terminal):**
```bash
unzip Team3-Interactive_Multi_Game_Platform.zip -d destination_folder
cd destination_folder
```

**On Windows (via PowerShell):**
```powershell
Expand-Archive -Path Team3-Interactive_Multi_Game_Platform.zip -DestinationPath destination_folder
cd destination_folder
```

### Step 2: Install Dependencies

Once you're in the project directory, install all required packages:

```bash
npm install
```

This command will:
- Install React 19.2.0
- Install Vite 7.2.4
- Install chess.js for chess game logic
- Install react-router-dom for navigation
- Install all other project dependencies

The installation may take a few minutes. You'll see a progress indicator in your terminal.

### Step 3: Verify Installation

After installation completes, verify that the `node_modules` folder was created:
```bash
ls -la
```

You should see a `node_modules` directory in your project folder.

## Running the App

### Development Mode

To start the development server and run the app:

```bash
npm run dev
```

The terminal will display a URL (usually `http://localhost:5173`). Open this URL in your web browser to view the application.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run preview` | Previews the production build |

## Project Structure

```
Team3-Interactive_Multi_Game_Platform/
├── public/              # Static assets
│   └── pieces/          # Chess piece images
├── src/                 # Source code
│   ├── App.jsx          # Main application component
│   ├── chess/           # Chess game implementation
│   ├── pages/           # Page components
│   ├── reversi/         # Reversi game implementation
│   └── sudoku/          # Sudoku game implementation
├── index.html           # HTML entry point
├── package.json         # Project dependencies
└── vite.config.js       # Vite configuration
```

## Games Included

### Chess
A fully functional chess game with piece movement validation using the `chess.js` library.

### Reversi (Othello)
A classic strategy board game where players compete to have the most discs on the board.

### Sudoku
A number-placement puzzle game where players fill a 9×9 grid with digits.

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use a different port. Check the terminal output for the correct URL.

### Node Modules Issues
If you encounter issues with node_modules, try:
```bash
rm -rf node_modules
npm install
```

### Clear Cache and Rebuild
```bash
npm run build
```

---

For any additional help, please refer to the project documentation or open an issue on the project repository.

