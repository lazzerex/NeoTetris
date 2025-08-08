export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keyState = {};
        this.repeatDelay = 150; 
        this.repeatRate = 50;   
        this.keyTimers = {};
        
        this.setupEventListeners();
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        
        document.addEventListener('keydown', (e) => {
            if (this.isGameKey(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (this.game.gameOver) return;
        
        const key = e.key;
        
        
        if (key === 'p' || key === 'P') {
            if (!this.keyState[key]) {
                this.game.togglePause();
                this.keyState[key] = true;
            }
            return;
        }
        
        
        if (key === 'Escape') {
            if (!this.keyState[key]) {
                
                if (window.returnToMainMenu) {
                    window.returnToMainMenu();
                }
                this.keyState[key] = true;
            }
            return;
        }
        
        
        if (this.game.paused) return;
        
        
        if (!this.keyState[key]) {
            this.handleSinglePress(key);
            this.keyState[key] = true;
            
            
            if (this.isRepeatableKey(key)) {
                this.keyTimers[key] = setTimeout(() => {
                    this.startKeyRepeat(key);
                }, this.repeatDelay);
            }
        }
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        const key = e.key;
        this.keyState[key] = false;
        
        
        if (this.keyTimers[key]) {
            clearTimeout(this.keyTimers[key]);
            clearInterval(this.keyTimers[key]);
            delete this.keyTimers[key];
        }
    }
    
    /**
     * Handle single key presses (non-repeating or first press)
     * @param {string} key - Key that was pressed
     */
    handleSinglePress(key) {
        switch(key) {
            case 'ArrowLeft':
                this.game.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.game.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.game.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.game.rotatePiece();
                break;
            case ' ':
                this.game.hardDrop();
                break;
            case 'c':
            case 'C':
                this.game.holdPiece();
                break;
        }
    }
    
    /**
     * Start repeating a key action
     * @param {string} key - Key to repeat
     */
    startKeyRepeat(key) {
        this.keyTimers[key] = setInterval(() => {
            if (this.keyState[key] && !this.game.paused && !this.game.gameOver) {
                this.handleSinglePress(key);
            }
        }, this.repeatRate);
    }
    
    /**
     * Check if a key should repeat when held down
     * @param {string} key - Key to check
     * @returns {boolean} True if key should repeat
     */
    isRepeatableKey(key) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key);
    }
    
    /**
     * Check if a key is used by the game (for preventing defaults)
     * @param {string} key - Key to check
     * @returns {boolean} True if key is used by the game
     */
    isGameKey(key) {
        return [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            ' ', 'c', 'C', 'p', 'P', 'Escape'
        ].includes(key);
    }
    
    /**
     * Clean up timers (call when destroying the input handler)
     */
    cleanup() {
        Object.values(this.keyTimers).forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.keyTimers = {};
        this.keyState = {};
    }
}