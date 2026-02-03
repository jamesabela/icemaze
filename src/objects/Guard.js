class Guard {
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
        this.shadow.setDepth(8);

        this.sprite = scene.add.sprite(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            'guard'
        );
        this.sprite.setDisplaySize(CELL_SIZE - 10, CELL_SIZE - 10);
        this.sprite.setDepth(9);

        // Start moving
        this.moveLoop();
    }

    moveLoop() {
        if (!this.scene) return;

        const delay = Phaser.Math.Between(500, 800);
        this.scene.time.delayedCall(delay, () => {
            if (this.scene) this.move();
        });
    }

    move() {
        if (this.isMoving || !this.scene.maze) return;

        // Possible directions
        let directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];
        Phaser.Utils.Array.Shuffle(directions);

        let moved = false;

        for (let dir of directions) {
            let nx = this.gridX + dir.dx;
            let ny = this.gridY + dir.dy;

            // Check bounds and walls
            if (!this.scene.maze.isWall(nx, ny)) {
                // Also check for crushing walls (avoid them)
                // Assuming scene has a method or we can check globally
                // For simplicity, let's assume smart guards don't walk into *active* danger
                // But simplified: just check static walls for now.

                this.isMoving = true;
                this.gridX = nx;
                this.gridY = ny;

                this.sprite.play('guard-move');

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
                    duration: 150,
                    ease: 'Linear',
                    onComplete: () => {
                        this.isMoving = false;
                        this.sprite.stop();
                        this.moveLoop();
                    }
                });

                // Rotate sprite
                if (dir.dx === 1) {
                    this.sprite.setAngle(0);
                    this.sprite.setFlipX(false);
                }
                else if (dir.dx === -1) {
                    this.sprite.setAngle(0);
                    this.sprite.setFlipX(true);
                }
                else if (dir.dy === 1) {
                    this.sprite.setAngle(90);
                    this.sprite.setFlipX(false);
                }
                else if (dir.dy === -1) {
                    this.sprite.setAngle(-90);
                    this.sprite.setFlipX(false);
                }

                moved = true;
                break;
            }
        }

        if (!moved) {
            this.moveLoop(); // Try again later
        }
    }
}
