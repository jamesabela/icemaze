class CrushingWall {
    constructor(scene, x, y, directionX, directionY) {
        this.scene = scene;
        this.wallX = x; // Base wall position
        this.wallY = y;
        this.targetX = x + directionX; // path position to crush
        this.targetY = y + directionY;
        this.directionX = directionX;
        this.directionY = directionY;

        this.sprite = this.scene.add.image(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            'wall'
        );
        this.sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);
        this.sprite.setDepth(5);
        this.sprite.setTint(0x5599DD);


        this.isExtending = false;
        this.isRetracting = false;

        this.startCycle();
    }

    startCycle() {
        const initialDelay = Phaser.Math.Between(0, 2000);
        this.scene.time.delayedCall(initialDelay, () => {
            this.animateOpen();
        });
    }

    animateOpen() {
        this.isExtending = true;

        // Calculate target pixel position
        const targetPixelX = (this.wallX + this.directionX) * CELL_SIZE + CELL_SIZE / 2;
        const targetPixelY = (this.wallY + this.directionY) * CELL_SIZE + CELL_SIZE / 2;

        // Tween to extend
        this.scene.tweens.add({
            targets: this.sprite,
            x: targetPixelX,
            y: targetPixelY,
            duration: 200, // fast smash
            ease: 'Linear',
            onComplete: () => {
                this.isExtending = false;
                // Stay open
                const stayTime = Phaser.Math.Between(1000, 3000);
                this.scene.time.delayedCall(stayTime, () => {
                    this.animateClose();
                });
            }
        });
    }

    animateClose() {
        this.isRetracting = true;

        const basePixelX = this.wallX * CELL_SIZE + CELL_SIZE / 2;
        const basePixelY = this.wallY * CELL_SIZE + CELL_SIZE / 2;

        this.scene.tweens.add({
            targets: this.sprite,
            x: basePixelX,
            y: basePixelY,
            duration: 1000, // slow retract
            ease: 'Linear',
            onComplete: () => {
                this.isRetracting = false;
                // Stay closed
                const waitTime = Phaser.Math.Between(3000, 5000);
                this.scene.time.delayedCall(waitTime, () => {
                    this.animateOpen();
                });
            }
        });
    }

    isCrushing(px, py) {
        // First check if player is at the target cell of this wall
        if (px !== this.targetX || py !== this.targetY) {
            return false;
        }

        // Check if wall is currently covering the target path cell
        const targetPixelX = (this.wallX + this.directionX) * CELL_SIZE + CELL_SIZE / 2;
        const targetPixelY = (this.wallY + this.directionY) * CELL_SIZE + CELL_SIZE / 2;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, targetPixelX, targetPixelY);

        // If it's close enough to the target, it's dangerous
        return dist < 10;
    }
}
