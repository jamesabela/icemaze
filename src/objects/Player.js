class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.gridX = x;
        this.gridY = y;
        this.isMoving = false;

        // Shadow
        this.shadow = scene.add.ellipse(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2 + 20,
            40, 15, 0x000000, 0.4
        );
        this.shadow.setDepth(9); // Below player

        // Create player sprite
        this.sprite = scene.add.sprite(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            'player'
        );
        this.sprite.setDisplaySize(CELL_SIZE - 10, CELL_SIZE - 10);
        this.sprite.setDepth(10); // Ensure player is on top
    }

    move(dx, dy, maze) {
        if (this.isMoving) return;

        const nextX = this.gridX + dx;
        const nextY = this.gridY + dy;

        if (maze.isWall(nextX, nextY)) {
            // Check if we can smash the wall
            // Logic to be handled entirely in GameScene or here? 
            // Better to return 'hit' status and let GameScene handle effects
            return { type: 'wall', x: nextX, y: nextY };
        }

        // Check for crushing walls (handled by scene mostly, but simple check here)
        // Ignoring crushing walls for basic movement logic, scene will validate safety

        this.isMoving = true;
        this.gridX = nextX;
        this.gridY = nextY;

        this.sprite.play('player-move');

        // Tween shadow
        this.scene.tweens.add({
            targets: this.shadow,
            x: this.gridX * CELL_SIZE + CELL_SIZE / 2,
            y: this.gridY * CELL_SIZE + CELL_SIZE / 2 + 20,
            duration: 150,
            ease: 'Linear'
        });

        this.scene.tweens.add({
            targets: this.sprite,
            x: this.gridX * CELL_SIZE + CELL_SIZE / 2,
            y: this.gridY * CELL_SIZE + CELL_SIZE / 2,
            duration: 150, // fast smooth movement
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                this.sprite.stop(); // Stop animation
                // this.sprite.setFrame(0); // Optional: reset to idle frame
                eventsCenter.emit('player-moved', { x: this.gridX, y: this.gridY });
            }
        });

        // Rotate sprite (assuming sprite faces RIGHT by default)
        if (dx === 1) {
            this.sprite.setAngle(0);        // Right
            this.sprite.setFlipX(false);
        }
        else if (dx === -1) {
            this.sprite.setAngle(0);
            this.sprite.setFlipX(true); // Flip for Left
        }
        else if (dy === 1) {
            this.sprite.setAngle(90);   // Down
            this.sprite.setFlipX(false);
        }
        else if (dy === -1) {
            this.sprite.setAngle(-90);  // Up
            this.sprite.setFlipX(false);
        }

        return { type: 'move' };
    }

    resetPosition(x, y) {
        this.scene.tweens.killTweensOf(this.sprite);
        this.gridX = x;
        this.gridY = y;
        this.sprite.x = x * CELL_SIZE + CELL_SIZE / 2;
        this.sprite.y = y * CELL_SIZE + CELL_SIZE / 2;
        this.shadow.x = x * CELL_SIZE + CELL_SIZE / 2;
        this.shadow.y = y * CELL_SIZE + CELL_SIZE / 2 + 20;
        this.sprite.setAngle(0);
        this.sprite.setFlipX(false);
        this.isMoving = false;
    }
}
