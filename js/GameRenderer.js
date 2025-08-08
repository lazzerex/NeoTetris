export class GameRenderer {
    constructor(gameCanvas, nextCanvas, holdCanvas) {
        this.gameCanvas = gameCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        this.holdCanvas = holdCanvas;
        this.holdCtx = holdCanvas.getContext('2d');
        
        this.CELL_SIZE = 30;
        this.PREVIEW_CELL_SIZE = 15;
        
        
        this.BACKGROUND_COLOR = '#000022';
        this.GRID_COLOR = '#333366';
        this.GHOST_STROKE_COLOR = 'rgba(255, 255, 255, 0.4)';
        this.GHOST_FILL_COLOR = 'rgba(255, 255, 255, 0.1)';
        this.HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.3)';
        this.PAUSE_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.7)';
        this.PAUSE_TEXT_COLOR = '#00ffff';
        
        
        this.particles = [];
        this.lineClearEffects = [];
        this.tSpinNotifications = [];
        this.lastTime = 0;
    }
    
    /**
     * Draw the main game board with all pieces
     */
    drawBoard(board, currentPiece, ghostPiece, paused, boardWidth, boardHeight) {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        
        this.drawAnimatedBackground();
        
        
        this.drawLockedPieces(board, boardWidth, boardHeight);
        
        
        if (ghostPiece && currentPiece) {
            this.drawGhostPiece(ghostPiece);
        }
        
        
        if (currentPiece) {
            this.drawActivePiece(currentPiece);
        }
        
        
        this.updateParticles(deltaTime);
        this.drawParticles();
        
        
        this.updateLineClearEffects(deltaTime);
        this.drawLineClearEffects();
        
        
        this.updateTSpinNotifications(deltaTime);
        this.drawTSpinNotifications();
        
        
        this.drawGrid(boardWidth, boardHeight);
        
        
        if (paused) {
            this.drawPauseOverlay();
        }
    }
    
    /**
     * Draw animated background with subtle effects
     */
    drawAnimatedBackground() {
        const time = performance.now() * 0.001;
        
        
        this.gameCtx.fillStyle = this.BACKGROUND_COLOR;
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        
        this.gameCtx.strokeStyle = `rgba(0, 255, 255, ${0.05 + Math.sin(time) * 0.02})`;
        this.gameCtx.lineWidth = 1;
        
        for (let i = 0; i < this.gameCanvas.width; i += 60) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(i, 0);
            this.gameCtx.lineTo(i, this.gameCanvas.height);
            this.gameCtx.stroke();
        }
        
        for (let i = 0; i < this.gameCanvas.height; i += 60) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, i);
            this.gameCtx.lineTo(this.gameCanvas.width, i);
            this.gameCtx.stroke();
        }
    }
    
    /**
     * Draw locked pieces on the board
     */
    drawLockedPieces(board, boardWidth, boardHeight) {
        for (let r = 0; r < boardHeight; r++) {
            for (let c = 0; c < boardWidth; c++) {
                if (board[r][c]) {
                    this.drawCell(c, r, board[r][c], this.gameCtx, this.CELL_SIZE, true);
                }
            }
        }
    }
    
    /**
     * Draw the currently active piece with glow effect
     */
    drawActivePiece(currentPiece) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    const x = currentPiece.x + c;
                    const y = currentPiece.y + r;
                    if (y >= 0) {
                        this.drawCell(x, y, currentPiece.color, this.gameCtx, this.CELL_SIZE, false, true);
                    }
                }
            }
        }
    }
    
    /**
     * Draw the ghost piece (shows where piece will land)
     */
    drawGhostPiece(ghostPiece) {
        for (let r = 0; r < ghostPiece.shape.length; r++) {
            for (let c = 0; c < ghostPiece.shape[r].length; c++) {
                if (ghostPiece.shape[r][c]) {
                    const x = ghostPiece.x + c;
                    const y = ghostPiece.y + r;
                    if (y >= 0) {
                        this.drawGhostCell(x, y);
                    }
                }
            }
        }
    }
    
    /**
     * Draw a regular game cell with color and highlight
     */
    drawCell(x, y, color, ctx, cellSize, isLocked = false, isActive = false) {
        const time = performance.now() * 0.003;
        
        
        if (isActive) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        }
        
        
        const alpha = isActive ? 0.9 + Math.sin(time * 3) * 0.1 : 1;
        ctx.fillStyle = this.adjustColorAlpha(color, alpha);
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, 
                    cellSize - 2, cellSize - 2);
        
        
        ctx.shadowBlur = 0;
        
        
        ctx.fillStyle = this.HIGHLIGHT_COLOR;
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, 
                    cellSize - 2, 3);
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, 
                    3, cellSize - 2);
        
        
        if (isActive) {
            ctx.fillStyle = this.adjustColorAlpha(color, 0.3);
            ctx.fillRect(x * cellSize + 3, y * cellSize + 3, 
                        cellSize - 6, cellSize - 6);
        }
    }
    
    /**
     * Draw a ghost cell (transparent outline)
     */
    drawGhostCell(x, y) {
        const time = performance.now() * 0.005;
        const alpha = 0.4 + Math.sin(time) * 0.2;
        
        
        this.gameCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        this.gameCtx.lineWidth = 2;
        this.gameCtx.strokeRect(x * this.CELL_SIZE + 2, y * this.CELL_SIZE + 2, 
                               this.CELL_SIZE - 4, this.CELL_SIZE - 4);
        
        
        this.gameCtx.fillStyle = this.GHOST_FILL_COLOR;
        this.gameCtx.fillRect(x * this.CELL_SIZE + 2, y * this.CELL_SIZE + 2, 
                             this.CELL_SIZE - 4, this.CELL_SIZE - 4);
    }
    
    /**
     * Draw grid lines over the game board
     */
    drawGrid(boardWidth, boardHeight) {
        const time = performance.now() * 0.001;
        this.gameCtx.strokeStyle = `rgba(51, 51, 102, ${0.6 + Math.sin(time) * 0.2})`;
        this.gameCtx.lineWidth = 1;
        
        
        for (let i = 0; i <= boardWidth; i++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(i * this.CELL_SIZE, 0);
            this.gameCtx.lineTo(i * this.CELL_SIZE, this.gameCanvas.height);
            this.gameCtx.stroke();
        }
        
        
        for (let i = 0; i <= boardHeight; i++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, i * this.CELL_SIZE);
            this.gameCtx.lineTo(this.gameCanvas.width, i * this.CELL_SIZE);
            this.gameCtx.stroke();
        }
    }
    
    /**
     * Draw pause overlay with animation
     */
    drawPauseOverlay() {
        const time = performance.now() * 0.003;
        
        this.gameCtx.fillStyle = this.PAUSE_OVERLAY_COLOR;
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        
        this.gameCtx.fillStyle = this.PAUSE_TEXT_COLOR;
        this.gameCtx.font = '30px Courier New';
        this.gameCtx.textAlign = 'center';
        this.gameCtx.shadowColor = this.PAUSE_TEXT_COLOR;
        this.gameCtx.shadowBlur = 20 + Math.sin(time * 2) * 10;
        this.gameCtx.fillText('PAUSED', this.gameCanvas.width / 2, this.gameCanvas.height / 2);
        this.gameCtx.shadowBlur = 0;
    }
    
    /**
     * Draw a piece preview in the specified canvas
     */
    drawPreviewPiece(piece, canvas, ctx) {
        
        ctx.fillStyle = this.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!piece) return;
        
        
        const offsetX = (canvas.width - piece.shape[0].length * this.PREVIEW_CELL_SIZE) / 2;
        const offsetY = (canvas.height - piece.shape.length * this.PREVIEW_CELL_SIZE) / 2;
        
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const x = offsetX + c * this.PREVIEW_CELL_SIZE;
                    const y = offsetY + r * this.PREVIEW_CELL_SIZE;
                    
                    
                    ctx.shadowColor = piece.color;
                    ctx.shadowBlur = 8;
                    
                    
                    ctx.fillStyle = piece.color;
                    ctx.fillRect(x + 1, y + 1, 
                               this.PREVIEW_CELL_SIZE - 2, this.PREVIEW_CELL_SIZE - 2);
                    
                    ctx.shadowBlur = 0;
                    
                    
                    ctx.fillStyle = this.HIGHLIGHT_COLOR;
                    ctx.fillRect(x + 1, y + 1, 
                               this.PREVIEW_CELL_SIZE - 2, 2);
                    ctx.fillRect(x + 1, y + 1, 
                               2, this.PREVIEW_CELL_SIZE - 2);
                }
            }
        }
    }
    
    /**
     * Create line clear effect
     */
    createLineClearEffect(row) {
        this.lineClearEffects.push({
            row: row,
            timer: 0,
            duration: 500,
            intensity: 1
        });
        
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.gameCanvas.width,
                y: row * this.CELL_SIZE + this.CELL_SIZE / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 100 - 50,
                life: 1,
                decay: 0.02,
                color: `hsl(${180 + Math.random() * 60}, 100%, 70%)`
            });
        }
    }
    
    /**
     * Create T-spin notification effect
     */
    createTSpinNotification(action, points) {
        this.tSpinNotifications.push({
            action: action,
            points: points,
            x: this.gameCanvas.width / 2,
            y: this.gameCanvas.height / 2,
            timer: 0,
            duration: 2000,
            scale: 0.5,
            alpha: 1,
            color: action.includes('T-SPIN') ? '#ff00ff' : '#ffff00'
        });
        
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.gameCanvas.width / 2 + (Math.random() - 0.5) * 100,
                y: this.gameCanvas.height / 2 + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 200 - 100,
                life: 1,
                decay: 0.015,
                color: action.includes('T-SPIN') ? '#ff00ff' : '#ffff00'
            });
        }
    }
    
    /**
     * Update T-spin notifications
     */
    updateTSpinNotifications(deltaTime) {
        for (let i = this.tSpinNotifications.length - 1; i >= 0; i--) {
            const notification = this.tSpinNotifications[i];
            notification.timer += deltaTime;
            
            const progress = notification.timer / notification.duration;
            
            
            if (progress < 0.3) {
                
                notification.scale = 0.5 + (progress / 0.3) * 0.5;
                notification.alpha = 1;
            } else if (progress < 0.7) {
                
                notification.scale = 1;
                notification.alpha = 1;
            } else {
                
                notification.scale = 1 + (progress - 0.7) * 0.3;
                notification.alpha = 1 - ((progress - 0.7) / 0.3);
            }
            
            
            notification.y -= deltaTime * 0.02;
            
            if (notification.timer >= notification.duration) {
                this.tSpinNotifications.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw T-spin notifications
     */
    drawTSpinNotifications() {
        for (const notification of this.tSpinNotifications) {
            this.gameCtx.save();
            
            this.gameCtx.globalAlpha = notification.alpha;
            this.gameCtx.translate(notification.x, notification.y);
            this.gameCtx.scale(notification.scale, notification.scale);
            
            
            this.gameCtx.fillStyle = notification.color;
            this.gameCtx.font = 'bold 20px Courier New';
            this.gameCtx.textAlign = 'center';
            this.gameCtx.shadowColor = notification.color;
            this.gameCtx.shadowBlur = 20;
            this.gameCtx.fillText(notification.action, 0, -10);
            
            
            this.gameCtx.fillStyle = '#ffffff';
            this.gameCtx.font = 'bold 16px Courier New';
            this.gameCtx.shadowColor = '#ffffff';
            this.gameCtx.shadowBlur = 10;
            this.gameCtx.fillText(`+${notification.points}`, 0, 15);
            
            this.gameCtx.restore();
        }
    }
    
    /**
     * Update particle effects
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw particle effects
     */
    drawParticles() {
        for (const particle of this.particles) {
            this.gameCtx.save();
            this.gameCtx.globalAlpha = particle.life;
            this.gameCtx.fillStyle = particle.color;
            this.gameCtx.shadowColor = particle.color;
            this.gameCtx.shadowBlur = 10;
            this.gameCtx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.gameCtx.restore();
        }
    }
    
    /**
     * Update line clear effects
     */
    updateLineClearEffects(deltaTime) {
        for (let i = this.lineClearEffects.length - 1; i >= 0; i--) {
            const effect = this.lineClearEffects[i];
            effect.timer += deltaTime;
            effect.intensity = 1 - (effect.timer / effect.duration);
            
            if (effect.timer >= effect.duration) {
                this.lineClearEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw line clear effects
     */
    drawLineClearEffects() {
        for (const effect of this.lineClearEffects) {
            const y = effect.row * this.CELL_SIZE;
            const alpha = effect.intensity;
            
            this.gameCtx.save();
            this.gameCtx.globalAlpha = alpha;
            
            
            const gradient = this.gameCtx.createLinearGradient(0, y, this.gameCanvas.width, y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.gameCtx.fillStyle = gradient;
            this.gameCtx.fillRect(0, y, this.gameCanvas.width, this.CELL_SIZE);
            
            this.gameCtx.restore();
        }
    }
    
    /**
     * Adjust color alpha
     */
    adjustColorAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }
    
    /**
     * Draw the next piece preview
     */
    drawNextPiece(nextPiece) {
        this.drawPreviewPiece(nextPiece, this.nextCanvas, this.nextCtx);
    }
    
    /**
     * Draw the held piece preview
     */
    drawHeldPiece(heldPiece) {
        this.drawPreviewPiece(heldPiece, this.holdCanvas, this.holdCtx);
    }
}