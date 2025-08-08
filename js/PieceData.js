// ===== PIECE DEFINITIONS AND UTILITIES =====

export class PieceData {
    static pieces = [
        { // I - Cyan
            shape: [[1,1,1,1]],
            color: '#00ffff',
            name: 'I'
        },
        { // O - Yellow
            shape: [[1,1],[1,1]],
            color: '#ffff00',
            name: 'O'
        },
        { // T - Purple/Magenta
            shape: [[0,1,0],[1,1,1]],
            color: '#ff00ff',
            name: 'T'
        },
        { // S - Green
            shape: [[0,1,1],[1,1,0]],
            color: '#00ff00',
            name: 'S'
        },
        { // Z - Red
            shape: [[1,1,0],[0,1,1]],
            color: '#ff0000',
            name: 'Z'
        },
        { // J - Blue
            shape: [[1,0,0],[1,1,1]],
            color: '#0000ff',
            name: 'J'
        },
        { // L - Orange
            shape: [[0,0,1],[1,1,1]],
            color: '#ff8800',
            name: 'L'
        }
    ];
    
    /**
     * Get a random piece with initialized position
     * @returns {Object} A deep copy of a random piece
     */
    static getRandomPiece() {
        const piece = JSON.parse(JSON.stringify(
            this.pieces[Math.floor(Math.random() * this.pieces.length)]
        ));
        piece.x = 0;
        piece.y = 0;
        return piece;
    }
    
    /**
     * Rotate a matrix 90 degrees clockwise
     * @param {Array} matrix - 2D array representing the piece shape
     * @returns {Array} Rotated 2D array
     */
    static rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = matrix[r][c];
            }
        }
        
        return rotated;
    }
    
    /**
     * Create a deep copy of a piece
     * @param {Object} piece - Piece object to copy
     * @returns {Object} Deep copy of the piece
     */
    static copyPiece(piece) {
        return JSON.parse(JSON.stringify(piece));
    }
    
    /**
     * Get piece dimensions
     * @param {Object} piece - Piece object
     * @returns {Object} Object with width and height properties
     */
    static getPieceDimensions(piece) {
        return {
            width: piece.shape[0].length,
            height: piece.shape.length
        };
    }
}