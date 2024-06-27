let currentPlayer = 1;
let selectedPiece = null;
let board = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

const gameBoard = document.getElementById("game-board");
const statusDisplay = document.getElementById("status");
const quitButton = document.getElementById("quit");

const pieceSymbols = {
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  p: "♟",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
  P: "♙",
};

function createBoard() {
  gameBoard.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      if ((i + j) % 2 === 0) {
        cell.classList.add("light");
      } else {
        cell.classList.add("dark");
      }
      if (board[i][j]) {
        cell.textContent = pieceSymbols[board[i][j]];
      }
      cell.addEventListener("click", handleClick);
      gameBoard.appendChild(cell);
    }
  }
}

function handleClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (selectedPiece) {
    if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
      selectedPiece = null;
      currentPlayer = 3 - currentPlayer;
      statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
      clearHighlights();
    } else {
      alert("Invalid move");
    }
  } else {
    if (board[row][col] && isCurrentPlayerPiece(board[row][col])) {
      selectedPiece = { row, col };
      highlightSelectedPiece(row, col);
      highlightValidMoves(row, col);
    }
  }
}

function isValidMove(startRow, startCol, endRow, endCol) {
  const piece = board[startRow][startCol].toLowerCase();
  const dx = endCol - startCol;
  const dy = endRow - startRow;

  // Mandatory capture rule
  if (board[endRow][endCol] && isCurrentPlayerPiece(board[endRow][endCol])) {
    return false;
  }

  // Pawn moves
  if (piece === "p") {
    if (currentPlayer === 1) {
      if (dx === 0 && dy === -1 && !board[endRow][endCol]) {
        return true;
      }
      if (
        startRow === 6 &&
        dx === 0 &&
        dy === -2 &&
        !board[endRow][endCol] &&
        !board[endRow + 1][endCol]
      ) {
        return true;
      }
      if (
        Math.abs(dx) === 1 &&
        dy === -1 &&
        board[endRow][endCol] &&
        !isCurrentPlayerPiece(board[endRow][endCol])
      ) {
        return true;
      }
    } else {
      if (dx === 0 && dy === 1 && !board[endRow][endCol]) {
        return true;
      }
      if (
        startRow === 1 &&
        dx === 0 &&
        dy === 2 &&
        !board[endRow][endCol] &&
        !board[endRow - 1][endCol]
      ) {
        return true;
      }
      if (
        Math.abs(dx) === 1 &&
        dy === 1 &&
        board[endRow][endCol] &&
        !isCurrentPlayerPiece(board[endRow][endCol])
      ) {
        return true;
      }
    }
  }

  // Other piece moves (excluding king and castling)
  switch (piece) {
    case "r": // Rook
      if (dx === 0 || dy === 0) {
        if (clearPath(startRow, startCol, endRow, endCol)) {
          return true;
        }
      }
      break;
    case "n": // Knight
      if (
        (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2)
      ) {
        return true;
      }
      break;
    case "b": // Bishop
      if (Math.abs(dx) === Math.abs(dy)) {
        if (clearPath(startRow, startCol, endRow, endCol)) {
          return true;
        }
      }
      break;
    case "q": // Queen
      if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
        if (clearPath(startRow, startCol, endRow, endCol)) {
          return true;
        }
      }
      break;
    case "k": // King (excluding castling)
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        return true;
      }
      break;
  }
  return false;
}

function clearPath(startRow, startCol, endRow, endCol) {
  const dx = Math.sign(endCol - startCol);
  const dy = Math.sign(endRow - startRow);
  let x = startCol + dx;
  let y = startRow + dy;
  while (x !== endCol || y !== endRow) {
    if (board[y][x]) {
      return false;
    }
    x += dx;
    y += dy;
  }
  return true;
}

function movePiece(startRow, startCol, endRow, endCol) {
  const movingPiece = board[startRow][startCol];
  board[endRow][endCol] = movingPiece;
  board[startRow][startCol] = null;

  // Handle pawn promotion (to any piece including the king)
  if (
    (movingPiece === "P" && endRow === 0) ||
    (movingPiece === "p" && endRow === 7)
  ) {
    const promotionChoice = prompt("Promote to (Q/R/B/N/K):", "Q");
    if (
      promotionChoice &&
      ["Q", "R", "B", "N", "K"].includes(promotionChoice.toUpperCase())
    ) {
      board[endRow][endCol] = promotionChoice.toUpperCase();
    }
  }

  createBoard();
  checkWinCondition();
}

function isCurrentPlayerPiece(piece) {
  return (
    (currentPlayer === 1 && piece === piece.toUpperCase()) ||
    (currentPlayer === 2 && piece === piece.toLowerCase())
  );
}

function highlightSelectedPiece(row, col) {
  clearHighlights();
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  cell.classList.add("selected");
}

function highlightValidMoves(row, col) {
  clearHighlights();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (isValidMove(row, col, i, j)) {
        const cell = document.querySelector(
          `.cell[data-row="${i}"][data-col="${j}"]`
        );
        cell.classList.add("valid-move");
      }
    }
  }
}

function clearHighlights() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected", "valid-move");
  });
}

function checkWinCondition() {
  let player1Pieces = 0;
  let player2Pieces = 0;

  // Count remaining pieces
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j]) {
        if (isCurrentPlayerPiece(board[i][j])) {
          player1Pieces++;
        } else {
          player2Pieces++;
        }
      }
    }
  }

  // Win condition: Losing all pieces
  if (player1Pieces === 0) {
    alert("Player 2 Wins!");
    resetGame();
  } else if (player2Pieces === 0) {
    alert("Player 1 Wins!");
    resetGame();
  }

  // Win condition: No legal moves (not implemented in current version)
}

quitButton.addEventListener("click", () => {
  alert(`Player ${3 - currentPlayer} Wins!`);
  resetGame();
});

function resetGame() {
  board = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  currentPlayer = 1;
  statusDisplay.textContent = "Player 1's Turn";
  createBoard();
}

createBoard();
