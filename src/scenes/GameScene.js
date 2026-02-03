class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 512, frameHeight: 512 });
        this.load.spritesheet('guard', 'assets/guard.png', { frameWidth: 512, frameHeight: 512 });
        this.load.image('wall', 'assets/wall.png');
        this.load.image('wall_cracked', 'assets/wall_cracked.png');
        this.load.image('floor', 'assets/floor.png');
    }

    create(data) {
        // Create Animations
        if (!this.anims.exists('player-move')) {
            this.anims.create({
                key: 'player-move',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('guard-move')) {
            this.anims.create({
                key: 'guard-move',
                frames: this.anims.generateFrameNumbers('guard', { start: 0, end: 3 }),
                frameRate: 5,
                repeat: -1
            });
        }

        // Add floor background with darker tint for contrast
        this.add.tileSprite(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'floor')
            .setOrigin(0, 0)
            .setTint(0x6688AA); // Darker blue-grey tint

        // Start UI Scene in parallel
        // Start UI Scene in parallel
        this.scene.launch('UIScene');

        // Particle Emitter for wall smashing
        this.wallParticles = this.add.particles(0, 0, 'wall', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.2, end: 0 },
            lifespan: 500,
            quantity: 16,
            emitting: false
        });

        // Listen for events
        eventsCenter.on('update-score', this.updateScore, this);

        // Initialize Maze
        this.maze = new Maze(this);
        this.maze.generate();

        // Initialize Player
        this.player = new Player(this, 1, 1);

        // Input handling
        this.input.keyboard.on('keydown', this.handleInput, this);

        // Touch handling
        eventsCenter.on('input-left', () => this.handleTouchInput('left'), this);
        eventsCenter.on('input-right', () => this.handleTouchInput('right'), this);
        eventsCenter.on('input-up', () => this.handleTouchInput('up'), this);
        eventsCenter.on('input-down', () => this.handleTouchInput('down'), this);
        eventsCenter.on('input-action', () => this.handleTouchInput('action'), this);

        // Load state from data or defaults
        this.score = data && data.score ? data.score : 0;
        this.lives = data && data.lives !== undefined ? data.lives : 5;
        this.currentSentenceIdx = data && data.level ? data.level : GAME_OPTIONS.startLevel;

        // Apply guard bonus once at game start (only if starting fresh)
        if (!data || !data.level) {
            this.score += GAME_OPTIONS.guardCount * 50;
            this.score += GAME_OPTIONS.wallCount * 30; // Wall trap bonus
            // Hint bonus
            if (!GAME_OPTIONS.hintsEnabled) {
                this.score += 100;
            }
        }

        this.gameOver = false;

        // Always wait for input to start
        this.gameActive = false;
        let levelData = LEVELS[this.currentSentenceIdx];
        let startTextContent = `LEVEL ${this.currentSentenceIdx + 1}\nStage ${levelData.stage}: ${levelData.name}\n\nPRESS SPACE TO START`;

        this.startText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, startTextContent,
            { fontSize: '32px', fill: '#000000', align: 'center', backgroundColor: '#ffffff', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setDepth(20);

        // Hazard setup
        this.setupHazards();

        // Word setup
        this.collectedWords = [];
        this.levelDuration = 120000; // 2 minutes (120 seconds) per level
        this.timeLeft = this.levelDuration;
        this.setupLevel();

        // Setup hint lightbulb if enabled
        if (GAME_OPTIONS.hintsEnabled) {
            this.createHintLightbulb();
        }
    }

    startGame() {
        this.gameActive = true;
        this.startText.setVisible(false);
    }

    setupHazards() {
        this.crushingWalls = [];
        this.guards = [];

        // Find potential crushing wall spots (adjacent to path, but not start)
        let potentialCrushers = [];
        for (let y = 1; y < GAME_HEIGHT - 1; y++) {
            for (let x = 1; x < GAME_WIDTH - 1; x++) {
                if (this.maze.isWall(x, y)) {
                    let neighbors = [
                        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
                    ];
                    for (let n of neighbors) {
                        let nx = x + n.dx;
                        let ny = y + n.dy;
                        if (!this.maze.isWall(nx, ny) && !(nx === 1 && ny === 1)) {
                            potentialCrushers.push({ x, y, tx: nx, ty: ny, dx: n.dx, dy: n.dy });
                        }
                    }
                }
            }
        }

        Phaser.Utils.Array.Shuffle(potentialCrushers);
        let numCrushers = Math.min(GAME_OPTIONS.wallCount, potentialCrushers.length); // Configurable
        let selected = potentialCrushers.slice(0, numCrushers);

        for (let c of selected) {
            this.crushingWalls.push(new CrushingWall(this, c.x, c.y, c.dx, c.dy));
        }

        for (let i = 0; i < GAME_OPTIONS.guardCount; i++) {
            // Basic logic to spacing guards might be needed or just pile them at end? 
            // Let's spawn them in random valid locations if > 1, or just predefined corners?
            // For now, let's keep one at default, others random?
            // Or just spawn randomly for all if > 1?
            // Implementation plan said: "Use GAME_OPTIONS.guardCount".
            // Let's spawn the first one at default, and extras at valid random spots (away from start).

            if (i === 0) {
                this.guards.push(new Guard(this, GAME_WIDTH - 2, GAME_HEIGHT - 2));
            } else {
                // Random guard spawn
                let gx, gy;
                let safe = false;
                while (!safe) {
                    gx = Phaser.Math.Between(1, GAME_WIDTH - 2);
                    gy = Phaser.Math.Between(1, GAME_HEIGHT - 2);
                    if (!this.maze.isWall(gx, gy) && (Math.abs(gx - 1) + Math.abs(gy - 1) > 5)) {
                        safe = true;
                    }
                }
                this.guards.push(new Guard(this, gx, gy));
            }
        }
    }

    setupLevel() {
        if (this.currentSentenceIdx >= LEVELS.length) {
            this.handleWin();
            return;
        }

        let levelData = LEVELS[this.currentSentenceIdx];
        this.targetWords = levelData.words.map(obj => obj.word);
        this.collectedWords = [];
        this.levelDuration = GAME_OPTIONS.timeLimit === -1 ? -1 : GAME_OPTIONS.timeLimit * 1000;
        this.timeLeft = this.levelDuration; // Reset timer
        this.wordObjects = {}; // Map "x,y" -> textObject-colors mapped later

        // Find valid positions for words
        let validPositions = [];
        for (let y = 0; y < GAME_HEIGHT; y++) {
            for (let x = 0; x < GAME_WIDTH; x++) {
                if (!this.maze.isWall(x, y) && !(x === 1 && y === 1)) {
                    // Check if crushing wall targets this? (Optional safety)
                    validPositions.push({ x, y });
                }
            }
        }
        Phaser.Utils.Array.Shuffle(validPositions);

        this.targetWords.forEach((word, index) => {
            if (index < validPositions.length) {
                let pos = validPositions[index];

                // Get semantic info
                let wordData = levelData.words[index];
                let semanticColor = SEMANTIC_COLORS[wordData.type] || '#000000';

                // Determine text color for contrast
                let textColor = (wordData.type === 'WHAT_DOING' || wordData.type === 'WHO') ? '#000000' : '#FFFFFF';

                let text = this.add.text(
                    pos.x * CELL_SIZE + CELL_SIZE / 2,
                    pos.y * CELL_SIZE + CELL_SIZE / 2,
                    word,
                    {
                        font: '24px Arial',
                        fill: textColor,
                        fontStyle: 'bold',
                        backgroundColor: semanticColor,
                        padding: { x: 4, y: 4 }
                    }
                ).setOrigin(0.5).setDepth(2);

                this.wordObjects[`${pos.x},${pos.y}`] = { word: word, text: text };
            }
        });

        this.updateUI();
    }

    handleTouchInput(action) {
        if (this.gameOver) {
            // Game over handling is now automatic
            return;
        }

        if (!this.gameActive) {
            if (action === 'action') {
                this.startGame();
            }
            return;
        }

        if (action === 'action') {
            this.pickupWord();
            return;
        }

        let dx = 0;
        let dy = 0;

        if (action === 'left') dx = -1;
        else if (action === 'right') dx = 1;
        else if (action === 'up') dy = -1;
        else if (action === 'down') dy = 1;

        if (dx !== 0 || dy !== 0) {
            let result = this.player.move(dx, dy, this.maze);

            if (result && result.type === 'wall') {
                this.handleWallHit(result.x, result.y);
            }
        }
    }

    handleInput(event) {
        if (this.gameOver) {
            // Game over handling is now automatic
            return;
        }

        if (!this.gameActive) {
            if (event.code === 'Space') {
                this.startGame();
            }
            return;
        }

        // Pickup (Space)
        if (event.code === 'Space') {
            this.pickupWord();
            return;
        }

        let dx = 0;
        let dy = 0;

        if (event.code === 'ArrowLeft' || event.code === 'KeyA') dx = -1;
        else if (event.code === 'ArrowRight' || event.code === 'KeyD') dx = 1;
        else if (event.code === 'ArrowUp' || event.code === 'KeyW') dy = -1;
        else if (event.code === 'ArrowDown' || event.code === 'KeyS') dy = 1;

        if (dx !== 0 || dy !== 0) {
            let result = this.player.move(dx, dy, this.maze);

            if (result && result.type === 'wall') {
                this.handleWallHit(result.x, result.y);
            }
        }
    }

    pickupWord() {
        let key = `${this.player.gridX},${this.player.gridY}`;
        if (this.wordObjects[key]) {
            let obj = this.wordObjects[key];
            let nextNeeded = this.targetWords[this.collectedWords.length];

            if (obj.word === nextNeeded) {
                // Correct
                this.collectedWords.push(obj.word);
                obj.text.destroy();
                delete this.wordObjects[key];
                this.score += 10;

                // Time extension based on difficulty
                if (GAME_OPTIONS.timeLimit === 30) {
                    this.timeLeft += 10000; // +10 seconds
                } else if (GAME_OPTIONS.timeLimit === 60) {
                    this.timeLeft += 5000; // +5 seconds
                }
                // No time extension for 2 minutes or untimed

                this.updateUI();

                if (this.collectedWords.length === this.targetWords.length) {
                    // Bonus Calculation
                    let bonus = 0;
                    if (this.levelDuration !== -1 && this.timeLeft > 0) {
                        bonus = Math.floor(this.timeLeft / 1000) * 3;
                    }

                    // Time limit multiplier (adjusted for time extensions)
                    let multiplier = 1.0;
                    if (GAME_OPTIONS.timeLimit === 30) {
                        multiplier = 3.0;
                    } else if (GAME_OPTIONS.timeLimit === 60) {
                        multiplier = 2.0;
                    } else if (GAME_OPTIONS.timeLimit === 120) {
                        multiplier = 1.0;
                    } else if (GAME_OPTIONS.timeLimit === -1) {
                        multiplier = 0.5; // Penalty for untimed
                    }

                    let levelScore = Math.floor((50 + bonus) * multiplier);
                    this.score += levelScore; // Base Bonus + Time Bonus, multiplied

                    this.time.delayedCall(1500, () => {
                        this.scene.restart({
                            level: this.currentSentenceIdx + 1,
                            score: this.score,
                            lives: this.lives
                        });
                    });
                }
            } else {
                // Wrong
                this.lives -= 1;
                this.player.resetPosition(1, 1); // Send back to start
                this.updateUI();
                if (this.lives <= 0) this.handleDeath("Ran out of lives!");
            }
        }
    }

    handleWallHit(x, y) {
        let result = this.maze.damageWall(x, y);
        if (result === 'broken') {
            this.score -= 1;
            this.updateUI();

            // Smash effect
            let px = x * CELL_SIZE + CELL_SIZE / 2;
            let py = y * CELL_SIZE + CELL_SIZE / 2;
            this.wallParticles.emitParticleAt(px, py);

        } else if (result === 'hit') {
            this.score -= 1;
            this.updateUI();
        }
    }

    updateScore(score) {
        // Legacy
    }

    updateUI() {
        eventsCenter.emit('update-ui', {
            score: this.score,
            lives: this.lives,
            sentence: this.collectedWords ? this.collectedWords.join(' ') : ''
        });
    }

    handleDeath(reason) {
        if (this.gameOver) return;

        this.lives--;
        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver = true;
            this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 'GAME OVER\n' + reason,
                { fontSize: '32px', fill: '#ff0000', align: 'center', backgroundColor: '#ffffff' }
            ).setOrigin(0.5).setDepth(20);

            // Flash the correct word sequence
            this.flashCorrectSequence(() => {
                // After animation, show final message and reload
                this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 'Returning to menu...',
                    { fontSize: '24px', fill: '#666', align: 'center' }
                ).setOrigin(0.5).setDepth(21);

                this.time.delayedCall(2000, () => {
                    window.location.reload();
                });
            });
        } else {
            // Flash red or something?
            this.player.resetPosition(1, 1);
        }
    }

    handleWin() {
        this.gameOver = true;
        this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 'YOU WIN!',
            { fontSize: '40px', fill: '#00ff00', align: 'center', backgroundColor: '#ffffff' }
        ).setOrigin(0.5).setDepth(20);

        // Flash the correct word sequence
        this.flashCorrectSequence(() => {
            // After animation, show final message and reload
            this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 'Returning to menu...',
                { fontSize: '24px', fill: '#666', align: 'center' }
            ).setOrigin(0.5).setDepth(21);

            this.time.delayedCall(2000, () => {
                window.location.reload();
            });
        });
    }

    update(time, delta) {
        if (this.gameOver || !this.gameActive) return;

        // Check Player vs Crushing Walls
        if (this.crushingWalls) {
            for (let wall of this.crushingWalls) {
                if (wall.isCrushing(this.player.gridX, this.player.gridY)) {
                    if (wall.isExtending) {
                        this.handleDeath("Crushed!");
                        return;
                    }
                }
            }
        }

        // Check Player vs Hint Lightbulb
        if (this.hintLightbulb && this.hintLightbulbPos) {
            if (this.player.gridX === this.hintLightbulbPos.x && this.player.gridY === this.hintLightbulbPos.y) {
                this.flashNextWord();
                this.relocateHintLightbulb();
            }
        }

        // Check Player vs Guards
        if (this.guards) {
            for (let guard of this.guards) {
                if (guard.gridX === this.player.gridX && guard.gridY === this.player.gridY) {
                    this.handleDeath("Caught by guard!");
                    return;
                }
            }
        }

        // Timer Logic
        if (delta && this.levelDuration !== -1) {
            this.timeLeft -= delta;
            eventsCenter.emit('update-timer', { percent: this.timeLeft / this.levelDuration });

            if (this.timeLeft <= 0) {
                this.handleDeath("Time's Up!");
                return;
            }
        }
    }

    createHintLightbulb() {
        // Find a random valid position for the lightbulb
        let validPositions = [];
        for (let y = 0; y < GAME_HEIGHT; y++) {
            for (let x = 0; x < GAME_WIDTH; x++) {
                if (!this.maze.isWall(x, y) && !(x === 1 && y === 1)) {
                    validPositions.push({ x, y });
                }
            }
        }

        if (validPositions.length > 0) {
            let pos = Phaser.Utils.Array.GetRandom(validPositions);
            this.hintLightbulb = this.add.text(
                pos.x * CELL_SIZE + CELL_SIZE / 2,
                pos.y * CELL_SIZE + CELL_SIZE / 2,
                '💡',
                { fontSize: '32px' }
            ).setOrigin(0.5).setDepth(3);

            this.hintLightbulbPos = { x: pos.x, y: pos.y };
        }
    }

    relocateHintLightbulb() {
        if (!this.hintLightbulb) return;

        // Find new valid position
        let validPositions = [];
        for (let y = 0; y < GAME_HEIGHT; y++) {
            for (let x = 0; x < GAME_WIDTH; x++) {
                if (!this.maze.isWall(x, y) && !(x === 1 && y === 1) &&
                    !(x === this.hintLightbulbPos.x && y === this.hintLightbulbPos.y)) {
                    validPositions.push({ x, y });
                }
            }
        }

        if (validPositions.length > 0) {
            let pos = Phaser.Utils.Array.GetRandom(validPositions);
            this.hintLightbulb.setPosition(
                pos.x * CELL_SIZE + CELL_SIZE / 2,
                pos.y * CELL_SIZE + CELL_SIZE / 2
            );
            this.hintLightbulbPos = { x: pos.x, y: pos.y };
        }
    }

    flashNextWord() {
        if (this.collectedWords.length >= this.targetWords.length) return;

        let nextWord = this.targetWords[this.collectedWords.length];

        // Find the text object for the next word
        let wordTextObj = null;
        for (let key in this.wordObjects) {
            if (this.wordObjects[key].word === nextWord) {
                wordTextObj = this.wordObjects[key].text;
                break;
            }
        }

        if (wordTextObj) {
            // Flash 3 times
            let flashCount = 0;
            let flashInterval = this.time.addEvent({
                delay: 300,
                repeat: 5, // 3 flashes = 6 toggles
                callback: () => {
                    wordTextObj.setVisible(!wordTextObj.visible);
                    flashCount++;
                    if (flashCount >= 6) {
                        wordTextObj.setVisible(true); // Ensure it's visible at the end
                    }
                }
            });
        }
    }

    flashCorrectSequence(onComplete) {
        // Flash each word in the target sequence
        let currentIndex = 0;
        let flashDelay = 800; // Time between each word flash

        const flashNextWord = () => {
            if (currentIndex >= this.targetWords.length) {
                // Sequence complete
                if (onComplete) {
                    this.time.delayedCall(500, onComplete);
                }
                return;
            }

            let targetWord = this.targetWords[currentIndex];

            // Find the word object
            let wordTextObj = null;
            for (let key in this.wordObjects) {
                if (this.wordObjects[key].word === targetWord) {
                    wordTextObj = this.wordObjects[key].text;
                    break;
                }
            }

            if (wordTextObj) {
                // Flash this word 3 times quickly
                let flashCount = 0;
                let quickFlash = this.time.addEvent({
                    delay: 150,
                    repeat: 5, // 3 flashes = 6 toggles
                    callback: () => {
                        wordTextObj.setVisible(!wordTextObj.visible);
                        flashCount++;
                        if (flashCount >= 6) {
                            wordTextObj.setVisible(true);
                        }
                    }
                });
            }

            currentIndex++;
            this.time.delayedCall(flashDelay, flashNextWord);
        };

        flashNextWord();
    }
}
