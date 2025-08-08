import { NeoTetris } from './NeoTetris.js';


let game = null;
let currentScreen = 'mainMenu';

/**
 * Start a new game
 */
function startGame() {
    
    if (game) {
        game.cleanup();
    }
    
    
    hideAllScreens();
    document.getElementById('gameContainer').style.display = 'flex';
    currentScreen = 'game';
    
    
    game = new NeoTetris();
}

/**
 * Restart the current game
 */
function restartGame() {
    if (game) {
        game.cleanup();
    }
    
    
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('gameOverMenu').style.display = 'none';
    
    
    game = new NeoTetris();
}

/**
 * Return to main menu
 */
function returnToMainMenu() {
    if (game) {
        game.cleanup();
        game = null;
    }
    
    hideAllScreens();
    document.getElementById('mainMenu').style.display = 'flex';
    currentScreen = 'mainMenu';
}

/**
 * Show instructions screen
 */
function showInstructions() {
    hideAllScreens();
    document.getElementById('instructionsMenu').style.display = 'flex';
    currentScreen = 'instructions';
}

/**
 * Show about screen
 */
function showAbout() {
    hideAllScreens();
    document.getElementById('aboutMenu').style.display = 'flex';
    currentScreen = 'about';
}

/**
 * Toggle pause for current game
 */
function togglePauseGame() {
    if (game && !game.gameOver) {
        game.togglePause();
    }
}

/**
 * Resume game from pause menu
 */
function resumeGame() {
    if (game && !game.gameOver) {
        game.paused = false;
        document.getElementById('pauseMenu').style.display = 'none';
    }
}

/**
 * Hide all menu screens
 */
function hideAllScreens() {
    const screens = [
        'mainMenu',
        'instructionsMenu', 
        'aboutMenu',
        'gameContainer',
        'pauseMenu',
        'gameOverMenu'
    ];
    
    screens.forEach(screenId => {
        const element = document.getElementById(screenId);
        if (element) {
            element.style.display = 'none';
        }
    });
}

/**
 * Initialize the game when page loads
 */
function initializeGame() {
    console.log('🎮 NeoTetris Loading...');
    
    
    const requiredElements = [
        'mainMenu',
        'instructionsMenu',
        'aboutMenu',
        'gameContainer',
        'pauseMenu',
        'gameOverMenu',
        'gameCanvas',
        'nextCanvas', 
        'holdCanvas',
        'score',
        'lines',
        'level',
        'finalScore',
        'finalLines',
        'finalLevel'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Missing required elements:', missingElements);
        return;
    }
    
    
    hideAllScreens();
    document.getElementById('mainMenu').style.display = 'flex';
    currentScreen = 'mainMenu';
    
    console.log('✅ NeoTetris Menu System Ready!');
}


window.startNewGame = startGame;
window.restartGame = restartGame;
window.restartCurrentGame = restartGame;
window.returnToMainMenu = returnToMainMenu;
window.showInstructions = showInstructions;
window.showAbout = showAbout;
window.togglePauseGame = togglePauseGame;
window.resumeGame = resumeGame;


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}


document.addEventListener('visibilitychange', () => {
    if (game && !game.gameOver && currentScreen === 'game') {
        if (document.hidden) {
            
            if (!game.paused) {
                game.togglePause();
            }
        }
    }
});


document.addEventListener('keydown', (e) => {
    
    if (e.key === 'Escape') {
        if (currentScreen === 'game' && game && !game.gameOver) {
            game.togglePause();
        } else if (currentScreen !== 'mainMenu') {
            returnToMainMenu();
        }
    }
    
    
    if (e.key === 'Enter' && currentScreen === 'mainMenu') {
        startGame();
    }
});


window.addEventListener('resize', () => {
    
    
});


export { 
    startGame, 
    restartGame, 
    returnToMainMenu, 
    showInstructions, 
    showAbout,
    togglePauseGame,
    resumeGame 
};