# NeoTetris

A modern implementation of the classic Tetris game featuring a sleek neon aesthetic, smooth controls, and enhanced gameplay mechanics built with vanilla JavaScript and HTML5 Canvas.

Try it here: [Live Demo URL] (to be added)


## Features

- Modern neon-themed visual design with animated backgrounds
- Hold functionality to save pieces for strategic play
- Ghost piece preview showing where pieces will land
- Smooth controls with customizable key repeat timing
- Progressive difficulty with increasing speed per level
- Particle effects and line clear animations
- Responsive pause system with overlay menu
- Clean menu system with game instructions
- Post-game statistics display
- Modular ES6 architecture for maintainable code

## How to Play

### Controls
- **Arrow Keys (← →)**: Move piece left/right
- **Arrow Down (↓)**: Soft drop (faster descent)
- **Arrow Up (↑)**: Rotate piece clockwise
- **Spacebar**: Hard drop (instant placement)
- **C**: Hold current piece for later use
- **P**: Pause/Resume game
- **Escape**: Return to main menu

### Game Rules
- Fill complete horizontal lines to clear them and earn points
- Game speeds up every 10 lines cleared (level progression)
- Use the hold function strategically to save pieces
- Ghost piece shows landing position for better placement
- Game ends when pieces reach the top of the playing field

## Scoring System

- **Single Line**: 100 × Level
- **Double Lines**: 300 × Level
- **Triple Lines**: 500 × Level
- **Tetris (4 Lines)**: 800 × Level

## Technical Features

### Architecture
- Modular ES6 class-based design
- Separate systems for rendering, input handling, and game logic
- Clean separation of concerns for maintainability

### Rendering System
- HTML5 Canvas with hardware acceleration
- Real-time particle effects and animations
- Smooth 60fps gameplay with requestAnimationFrame
- Dynamic lighting and glow effects

### Input System
- Advanced key repeat handling with customizable timing
- Responsive controls optimized for competitive play
- Proper key state management and cleanup

### Visual Effects
- Animated neon backgrounds with color cycling
- Line clear effects with particles and flashing
- Smooth piece rotation and movement animations
- Modern glassmorphism UI elements

## Game Components

### Core Classes
- **NeoTetris**: Main game logic and state management
- **GameRenderer**: Canvas rendering and visual effects
- **InputHandler**: Keyboard input processing with repeat handling
- **PieceData**: Tetris piece definitions and rotation logic

### Menu System
- Intuitive main menu with smooth transitions
- Comprehensive instructions screen
- About page with technical details
- Pause menu with game controls
- Game over screen with final statistics

## Development

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Local web server (optional for development)

### Setup
1. Clone the repository:
```bash
git clone https://github.com/lazzerex/NeoTetris.git
```

2. Navigate to the project directory:
```bash
cd NeoTetris
```

3. Open `index.html` in your browser or serve through a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

### File Structure
```
NeoTetris/
├── index.html          # Main HTML file with menu system
├── styles.css          # Complete styling with neon theme
├── main.js            # Game initialization and menu management
└── js/
    ├── NeoTetris.js   # Core game logic and state
    ├── GameRenderer.js # Canvas rendering and effects
    ├── InputHandler.js # Keyboard input processing
    └── PieceData.js   # Piece definitions and utilities
```

### Technologies Used
- HTML5 Canvas for high-performance rendering
- Vanilla JavaScript ES6+ with modules
- CSS3 with custom properties and animations
- Modern web APIs (requestAnimationFrame, performance timing)
- Responsive design principles

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Requires modern browser support for ES6 modules and HTML5 Canvas.

## Performance

- Optimized 60fps gameplay
- Efficient particle system with automatic cleanup
- Memory-conscious resource management
- Smooth animations without frame drops

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow ES6+ standards
- Maintain modular architecture
- Add comments for complex logic
- Test across multiple browsers
- Ensure 60fps performance

## Future Enhancements

- Multi-player support
- Custom key bindings
- Sound effects and music
- Mobile touch controls
- High score persistence
- Additional visual themes

## Acknowledgments

- Inspired by the original Tetris by Alexey Pajitnov
- Modern web development best practices
- HTML5 Canvas optimization techniques
- Community feedback and suggestions

## License

This project is open source and available under the [MIT License](LICENSE).