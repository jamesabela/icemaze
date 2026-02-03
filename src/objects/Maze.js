class Maze {
    constructor(scene) {
        this.scene = scene;
        this.grid = [];
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        // this.graphics = this.scene.add.graphics(); // Removed
        this.hackableWalls = new Set();
        this.wallDamage = {};
        this.wallSprites = {}; // Map "x,y" -> Sprite
    }

    generate() {
        // Initialize grid with walls (1)
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(1));

        // Starting point (1, 1)
        let stack = [{ x: 1, y: 1 }];
        this.grid[1][1] = 0;

        while (stack.length > 0) {
            let current = stack[stack.length - 1];
            let x = current.x;
            let y = current.y;

            // Define possible directions (jump 2 steps)
            let directions = [
                { dx: 0, dy: -2 },
                { dx: 0, dy: 2 },
                { dx: -2, dy: 0 },
                { dx: 2, dy: 0 }
            ];

            // Shuffle directions
            directions.sort(() => Math.random() - 0.5);

            let foundNext = false;
            for (let dir of directions) {
                let nx = x + dir.dx;
                let ny = y + dir.dy;

                if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1) {
                    if (this.grid[ny][nx] === 1) {
                        this.grid[ny][nx] = 0;
                        this.grid[y + dir.dy / 2][x + dir.dx / 2] = 0;
                        stack.push({ x: nx, y: ny });
                        foundNext = true;
                        break;
                    }
                }
            }

            if (!foundNext) {
                stack.pop();
            }
        }

        // Relax the maze
        this.relaxMaze();

        // Generate hackable walls
        this.generateHackableWalls();

        this.draw();
    }

    relaxMaze() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.grid[y][x] === 1) {
                    if (Math.random() < 0.15) {
                        this.grid[y][x] = 0;
                    }
                }
            }
        }
    }

    generateHackableWalls() {
        this.hackableWalls.clear();
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.grid[y][x] === 1) {
                    if (Math.random() < 0.5) {
                        this.hackableWalls.add(`${x},${y}`);
                    }
                }
            }
        }
    }

    draw() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let key = `${x},${y}`;
                if (this.grid[y][x] === 1) {
                    // It is a wall
                    let texture = 'wall';
                    // Check damage
                    if (this.wallDamage[key]) {
                        // For damage >= 1, we show cracked.
                        // Can differ by degree if I had more sprites.
                        texture = 'wall_cracked';
                    }

                    if (!this.wallSprites[key]) {
                        let sprite = this.scene.add.image(
                            x * CELL_SIZE + CELL_SIZE / 2,
                            y * CELL_SIZE + CELL_SIZE / 2,
                            texture
                        );
                        sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);

                        // Tinting logic from previous request:
                        // Lighter blue for hackable, Darker for solid.
                        if (this.hackableWalls.has(key)) {
                            sprite.clearTint();
                        } else {
                            sprite.setTint(0x88CCEE); // Slightly darker/desaturated
                        }

                        this.wallSprites[key] = sprite;
                    } else {
                        // Update texture if needed
                        if (this.wallSprites[key].texture.key !== texture) {
                            this.wallSprites[key].setTexture(texture);
                        }
                    }
                } else {
                    // Not a wall
                    if (this.wallSprites[key]) {
                        this.wallSprites[key].destroy();
                        delete this.wallSprites[key];
                    }
                }
            }
        }
    }

    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.grid[y][x] === 1;
    }

    damageWall(x, y) {
        if (!this.hackableWalls.has(`${x},${y}`)) return false; // Indestructible

        let key = `${x},${y}`;
        this.wallDamage[key] = (this.wallDamage[key] || 0) + 1;

        if (this.wallDamage[key] >= 3) {
            this.grid[y][x] = 0; // Break wall
            delete this.wallDamage[key];
            this.draw();
            return 'broken';
        }

        this.draw();
        return 'hit';
    }
}


