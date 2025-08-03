
        const BOARD_SIZE = 5;
        const MINE_COUNT = 6;
        
        let board = [];
        let gameOver = false;
        let firstClick = true;
        let revealedCount = 0;
        let firstClickBombMode = false;
        
        const boardElement = document.getElementById('board');
        const messageElement = document.getElementById('message');
        const restartBtn = document.getElementById('restartBtn');
        const firstClickBombCheckbox = document.getElementById('firstClickBomb');
        
        // Initialize game
        function initGame() {
            board = [];
            gameOver = false;
            firstClick = true;
            revealedCount = 0;
            
            // Update mode
            firstClickBombMode = firstClickBombCheckbox.checked;
            
            // Create empty board
            for (let i = 0; i < BOARD_SIZE; i++) {
                board[i] = [];
                for (let j = 0; j < BOARD_SIZE; j++) {
                    board[i][j] = {
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborCount: 0
                    };
                }
            }
            
            renderBoard();
            messageElement.style.display = 'none';
        }
        
        // Place mines after first click
        function placeMines(firstClickRow, firstClickCol) {
            let minesPlaced = 0;
            
            while (minesPlaced < MINE_COUNT) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                
                // Don't place mine on first clicked cell in normal mode
                // Or force place mine on first clicked cell in first-click bomb mode
                if ((!firstClickBombMode && row === firstClickRow && col === firstClickCol) ||
                    (firstClickBombMode && minesPlaced === 0 && !(row === firstClickRow && col === firstClickCol))) {
                    continue;
                }
                
                if (!board[row][col].isMine) {
                    board[row][col].isMine = true;
                    minesPlaced++;
                }
            }
            
            // Calculate neighbor counts
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (!board[i][j].isMine) {
                        board[i][j].neighborCount = countNeighborMines(i, j);
                    }
                }
            }
            
            // In first-click bomb mode, ensure the first click is a mine
            if (firstClickBombMode) {
                board[firstClickRow][firstClickCol].isMine = true;
                // Recalculate neighbor counts
                for (let i = 0; i < BOARD_SIZE; i++) {
                    for (let j = 0; j < BOARD_SIZE; j++) {
                        if (!board[i][j].isMine) {
                            board[i][j].neighborCount = countNeighborMines(i, j);
                        }
                    }
                }
            }
        }
        
        function countNeighborMines(row, col) {
            let count = 0;
            for (let i = Math.max(0, row - 1); i <= Math.min(BOARD_SIZE - 1, row + 1); i++) {
                for (let j = Math.max(0, col - 1); j <= Math.min(BOARD_SIZE - 1, col + 1); j++) {
                    if (board[i][j].isMine) {
                        count++;
                    }
                }
            }
            return count;
        }
        
        function renderBoard() {
            boardElement.innerHTML = '';
            
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    
                    const cellData = board[i][j];
                    
                    if (cellData.isRevealed) {
                        cell.classList.add('revealed');
                        if (cellData.isMine) {
                            cell.classList.add('mine');
                            cell.textContent = '💣';
                        } else if (cellData.neighborCount > 0) {
                            cell.textContent = cellData.neighborCount;
                        }
                    } else if (cellData.isFlagged) {
                        cell.classList.add('flagged');
                        cell.textContent = '🚩';
                    }
                    
                    cell.addEventListener('click', () => handleCellClick(i, j));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        handleRightClick(i, j);
                    });
                    
                    boardElement.appendChild(cell);
                }
            }
        }
        
        function handleCellClick(row, col) {
            if (gameOver || board[row][col].isRevealed || board[row][col].isFlagged) {
                return;
            }
            
            if (firstClick) {
                firstClick = false;
                placeMines(row, col);
            }
            
            board[row][col].isRevealed = true;
            revealedCount++;
            
            if (board[row][col].isMine) {
                // Game over - reveal all mines
                revealAllMines();
                gameOver = true;
                showMessage('Game Over! You hit a mine!', 'lose');
            } else if (board[row][col].neighborCount === 0) {
                // Reveal adjacent cells if no neighboring mines
                revealAdjacentCells(row, col);
            }
            
            // Check for win
            if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINE_COUNT && !gameOver) {
                gameOver = true;
                showMessage('Congratulations! You won!', 'win');
                revealAllMines(); // Show mine locations on win
            }
            
            renderBoard();
        }
        
        function handleRightClick(row, col) {
            if (gameOver || board[row][col].isRevealed) {
                return;
            }
            
            board[row][col].isFlagged = !board[row][col].isFlagged;
            renderBoard();
        }
        
        function revealAdjacentCells(row, col) {
            for (let i = Math.max(0, row - 1); i <= Math.min(BOARD_SIZE - 1, row + 1); i++) {
                for (let j = Math.max(0, col - 1); j <= Math.min(BOARD_SIZE - 1, col + 1); j++) {
                    if (!board[i][j].isRevealed && !board[i][j].isFlagged && !board[i][j].isMine) {
                        board[i][j].isRevealed = true;
                        revealedCount++;
                        
                        if (board[i][j].neighborCount === 0) {
                            revealAdjacentCells(i, j);
                        }
                    }
                }
            }
        }
        
        function revealAllMines() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (board[i][j].isMine) {
                        board[i][j].isRevealed = true;
                    }
                }
            }
        }
        
        function showMessage(text, type) {
            messageElement.textContent = text;
            messageElement.className = 'message ' + type;
            messageElement.style.display = 'block';
        }
        
        // Event listeners
        firstClickBombCheckbox.addEventListener('change', () => {
            if (!gameOver && !firstClick) {
                const confirmChange = confirm('Changing this setting will restart the game. Continue?');
                if (confirmChange) {
                    initGame();
                } else {
                    firstClickBombCheckbox.checked = !firstClickBombCheckbox.checked;
                }
            }
        });
        
        restartBtn.addEventListener('click', initGame);
        
        // Start the game
        initGame();
   