import { PieceData } from './PieceData.js';
import { GameRenderer } from './GameRenderer.js';
import { InputHandler } from './InputHandler.js';

export class NeoTetris {
    constructor() {
        
        this.gameCanvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.holdCanvas = document.getElementById('holdCanvas');
        
        
        this.renderer = new GameRenderer(this.gameCanvas, this.nextCanvas, this.holdCanvas);
        this.inputHandler = new InputHandler(this);
        
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.INITIAL_DROP_INTERVAL = 1000;
        this.MIN_DROP_INTERVAL = 100;
        this.LEVEL_SPEED_INCREASE = 100;
        this.LINES_PER_LEVEL = 10;
        
       
        this.T_SPIN_SINGLE_BONUS = 800;
        this.T_SPIN_DOUBLE_BONUS = 1200;
        this.T_SPIN_TRIPLE_BONUS = 1600;
        this.T_SPIN_MINI_BONUS = 100;
        
        
        this.initializeGameState();
        
        
        this.spawnPiece();
        this.gameLoop();
    }
    
    /**
     * Initialize the game state
     */
    initializeGameState() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = this.INITIAL_DROP_INTERVAL;
        this.paused = false;
        this.gameOver = false;
        
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.ghostPiece = null;
        
        
        this.lastRotationWasKick = false;
        this.tSpinData = {
            performed: false,
            type: null, 
            linesCleared: 0
        };
        
        
        this.updateUI();
    }
    
    /**
     * Spawn a new piece
     */
    spawnPiece() {
        
        this.lastRotationWasKick = false;
        this.tSpinData = { performed: false, type: null, linesCleared: 0 };
        
        
        if (!this.nextPiece) {
            this.nextPiece = PieceData.getRandomPiece();
        }
        
        
        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        
        this.nextPiece = PieceData.getRandomPiece();
        this.canHold = true;
        
        
        this.updateGhostPiece();
        this.renderer.drawNextPiece(this.nextPiece);
        
        
        if (this.collision()) {
            this.currentPiece.y = -1;
            if (this.collision()) {
                this.endGame();
                return;
            }
        }
    }
    
    /**
     * Move the current piece
     * @param {number} dx - Horizontal movement (-1, 0, 1)
     * @param {number} dy - Vertical movement (0, 1)
     */
    movePiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.collision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
           
            if (dy > 0) {
                this.lockPiece();
            }
        } else {
            
            if (dx !== 0 || dy !== 0) {
                this.lastRotationWasKick = false;
            }
            this.updateGhostPiece();
        }
    }
    
    /**
     * Rotate the current piece clockwise with T-spin kick detection
     */
    rotatePiece() {
        const rotated = PieceData.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        const originalX = this.currentPiece.x;
        const originalY = this.currentPiece.y;
        
        this.currentPiece.shape = rotated;
        
        
        this.lastRotationWasKick = false;
        
        if (this.collision()) {
            
            const kicks = this.getKickData();
            
            let rotationSuccessful = false;
            for (const kick of kicks) {
                this.currentPiece.x = originalX + kick.dx;
                this.currentPiece.y = originalY + kick.dy;
                
                if (!this.collision()) {
                    rotationSuccessful = true;
                    
                   
                    if (this.currentPiece.name === 'T' && (kick.dx !== 0 || kick.dy !== 0)) {
                        this.lastRotationWasKick = true;
                    }
                    break;
                }
            }
            
            if (!rotationSuccessful) {
                
                this.currentPiece.shape = originalShape;
                this.currentPiece.x = originalX;
                this.currentPiece.y = originalY;
            }
        }
        
        
        this.updateGhostPiece();
    }
    
    /**
     * Get kick data for piece rotation
     * @returns {Array} Array of kick offsets
     */
    getKickData() {
        if (this.currentPiece.name === 'I') {
            
            return [
                { dx: 0, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 2, dy: 0 },
                { dx: -1, dy: -2 },
                { dx: 2, dy: 1 }
            ];
        } else if (this.currentPiece.name === 'O') {
           
            return [{ dx: 0, dy: 0 }];
        } else {
           
            return [
                { dx: 0, dy: 0 },   
                { dx: -1, dy: 0 },  
                { dx: -1, dy: 1 },  
                { dx: 0, dy: -2 },  
                { dx: -1, dy: -2 }  
            ];
        }
    }
    
    /**
     * Check for T-spin when T-piece is locked
     * @returns {Object} T-spin detection result
     */
    detectTSpin() {
        if (this.currentPiece.name !== 'T') {
            return { performed: false, type: null };
        }
        
       
        const centerX = this.currentPiece.x + 1; 
        const centerY = this.currentPiece.y + 1;
        
        
        const corners = [
            { x: centerX - 1, y: centerY - 1 }, 
            { x: centerX + 1, y: centerY - 1 }, 
            { x: centerX - 1, y: centerY + 1 }, 
            { x: centerX + 1, y: centerY + 1 }  
        ];
        
        
        let filledCorners = 0;
        let frontCornersFilled = 0;
        
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            const isFilled = this.isPositionFilled(corner.x, corner.y);
            
            if (isFilled) {
                filledCorners++;
                
                
                if (this.isFrontCorner(i)) {
                    frontCornersFilled++;
                }
            }
        }
        
       
        if (filledCorners >= 3 && this.lastRotationWasKick) {
            if (frontCornersFilled === 2) {
                return { performed: true, type: 'regular' };
            } else if (frontCornersFilled === 1) {
                return { performed: true, type: 'mini' };
            }
        }
        
        return { performed: false, type: null };
    }
    
    /**
     * Check if a position is filled (by boundary or piece)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if position is filled
     */
    isPositionFilled(x, y) {
        
        if (x < 0 || x >= this.BOARD_WIDTH || y >= this.BOARD_HEIGHT) {
            return true;
        }
        
      
        if (y < 0) {
            return false;
        }
        
        
        return this.board[y][x] !== 0;
    }
    
    /**
     * Determine if corner index is a "front" corner based on T-piece orientation
     * @param {number} cornerIndex - Index of corner (0-3)
     * @returns {boolean} True if this is a front corner
     */
    isFrontCorner(cornerIndex) {
        
        const shape = this.currentPiece.shape;
        
        
        if (shape[0][1] === 1) {
            
            return cornerIndex === 2 || cornerIndex === 3;
        } else if (shape[2] && shape[2][1] === 1) {
            
            return cornerIndex === 0 || cornerIndex === 1;
        } else if (shape[1][0] === 1) {
           
            return cornerIndex === 1 || cornerIndex === 3;
        } else {
        
            return cornerIndex === 0 || cornerIndex === 2;
        }
    }
    
    /**
     * Drop the piece instantly to the bottom
     */
    hardDrop() {
        while (!this.collision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.lockPiece();
    }
    
    /**
     * Hold the current piece for later use
     */
    holdPiece() {
        if (!this.canHold) return;
        
        const holdPanel = this.holdCanvas.parentElement;
        
        if (this.heldPiece === null) {
            this.heldPiece = PieceData.copyPiece(this.currentPiece);
            this.heldPiece.x = 0;
            this.heldPiece.y = 0;
            this.spawnPiece();
        } else {
            const temp = PieceData.copyPiece(this.currentPiece);
            temp.x = 0;
            temp.y = 0;
            
            this.currentPiece = this.heldPiece;
            this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
            this.currentPiece.y = 0;
            
            this.heldPiece = temp;
            this.updateGhostPiece();
        }
        
        this.canHold = false;
        holdPanel.classList.add('hold-used');
        this.renderer.drawHeldPiece(this.heldPiece);
    }
    
    /**
     * Update the ghost piece position
     */
    updateGhostPiece() {
        if (!this.currentPiece) return;
        
        this.ghostPiece = PieceData.copyPiece(this.currentPiece);
        
        while (!this.collisionAt(this.ghostPiece.x, this.ghostPiece.y + 1, this.ghostPiece.shape)) {
            this.ghostPiece.y++;
        }
    }
    
    /**
     * Check if current piece position causes collision
     */
    collision() {
        return this.collisionAt(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape);
    }
    
    /**
     * Check if piece at given position would cause collision
     */
    collisionAt(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const px = x + c;
                    const py = y + r;
                    
                    if (px < 0 || px >= this.BOARD_WIDTH) return true;
                    if (py >= this.BOARD_HEIGHT) return true;
                    if (py >= 0 && this.board[py] && this.board[py][px] !== 0) return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Lock the current piece to the board
     */
    lockPiece() {
        
        const tSpinResult = this.detectTSpin();
        
        
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const x = this.currentPiece.x + c;
                    const y = this.currentPiece.y + r;
                    
                    if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
        
    
        this.tSpinData = tSpinResult;
        
        
        this.clearLines();
        
        
        this.spawnPiece();
        
        
        const holdPanel = this.holdCanvas.parentElement;
        if (holdPanel) {
            holdPanel.classList.remove('hold-used');
        }
    }
    
    /**
     * Clear completed lines and update score with T-spin bonuses
     */
    clearLines() {
        let linesCleared = 0;
        let clearedRows = [];
        
        for (let r = this.BOARD_HEIGHT - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                clearedRows.push(r);
                this.board.splice(r, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                r++;
            }
        }
        
        if (linesCleared > 0) {
        
            clearedRows.forEach(row => {
                this.renderer.createLineClearEffect(row);
            });
            
            this.lines += linesCleared;
            
            
            let scoreToAdd = 0;
            let actionName = '';
            
            if (this.tSpinData.performed) {
                
                if (this.tSpinData.type === 'mini') {
                    if (linesCleared === 1) {
                        scoreToAdd = this.T_SPIN_MINI_BONUS * this.level;
                        actionName = 'T-SPIN MINI SINGLE';
                    } else if (linesCleared === 2) {
                        scoreToAdd = (this.T_SPIN_MINI_BONUS + 400) * this.level;
                        actionName = 'T-SPIN MINI DOUBLE';
                    }
                } else {
                    
                    switch (linesCleared) {
                        case 1:
                            scoreToAdd = this.T_SPIN_SINGLE_BONUS * this.level;
                            actionName = 'T-SPIN SINGLE';
                            break;
                        case 2:
                            scoreToAdd = this.T_SPIN_DOUBLE_BONUS * this.level;
                            actionName = 'T-SPIN DOUBLE';
                            break;
                        case 3:
                            scoreToAdd = this.T_SPIN_TRIPLE_BONUS * this.level;
                            actionName = 'T-SPIN TRIPLE';
                            break;
                    }
                }
                
                
                this.showTSpinNotification(actionName, scoreToAdd);
            } else {
                
                const basePoints = [0, 100, 300, 500, 800];
                scoreToAdd = basePoints[linesCleared] * this.level;
                
                if (linesCleared === 4) {
                    actionName = 'TETRIS';
                    this.showTSpinNotification(actionName, scoreToAdd);
                }
            }
            
            this.score += scoreToAdd;
            
            
            this.level = Math.floor(this.lines / this.LINES_PER_LEVEL) + 1;
            this.dropInterval = Math.max(
                this.MIN_DROP_INTERVAL, 
                this.INITIAL_DROP_INTERVAL - (this.level - 1) * this.LEVEL_SPEED_INCREASE
            );
            
            this.updateUI();
        }
        
        
        this.tSpinData = { performed: false, type: null, linesCleared: 0 };
    }
    
    /**
     * Show T-spin notification
     * @param {string} action - Action name to display
     * @param {number} points - Points earned
     */
    showTSpinNotification(action, points) {
        this.renderer.createTSpinNotification(action, points);
    }
    
    /**
     * Update the game UI elements
     */
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    /**
     * Toggle game pause state
     */
    togglePause() {
        this.paused = !this.paused;
        
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = this.paused ? 'flex' : 'none';
        }
    }
    
    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLines').textContent = this.lines;
        document.getElementById('finalLevel').textContent = this.level;
        
        const gameOverMenu = document.getElementById('gameOverMenu');
        if (gameOverMenu) {
            gameOverMenu.style.display = 'flex';
        }
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (!this.gameOver) {
            if (!this.paused) {
                if (currentTime - this.dropTime > this.dropInterval) {
                    this.movePiece(0, 1);
                    this.dropTime = currentTime;
                }
            }
            
            this.renderer.drawBoard(
                this.board, 
                this.currentPiece, 
                this.ghostPiece, 
                this.paused,
                this.BOARD_WIDTH,
                this.BOARD_HEIGHT
            );
            
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        if (this.inputHandler) {
            this.inputHandler.cleanup();
        }
    }
}