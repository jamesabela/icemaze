const config = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT
    },
    pixelArt: false, // Set to true if we were using pixel art, but we are using shapes
    scene: [GameScene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Don't start immediately
// const game = new Phaser.Game(config);

let game;

function initGame() {
    // Populate Stage Select
    const stageSelect = document.getElementById('stage-select');
    let stagesAdded = new Set();

    LEVELS.forEach((level, index) => {
        if (!stagesAdded.has(level.stage)) {
            stagesAdded.add(level.stage);
            let option = document.createElement('option');
            option.value = index; // Store the index of the first level of this stage
            option.innerText = `Stage ${level.stage}: ${level.name}`;
            stageSelect.appendChild(option);
        }
    });

    // Start Button Listener
    document.getElementById('btn-start-game').addEventListener('click', () => {
        // Read Options
        GAME_OPTIONS.startLevel = parseInt(document.getElementById('stage-select').value);

        // Time Limit
        let timeRadios = document.getElementsByName('time-limit');
        for (let r of timeRadios) {
            if (r.checked) {
                GAME_OPTIONS.timeLimit = parseInt(r.value);
                break;
            }
        }

        GAME_OPTIONS.guardCount = parseInt(document.getElementById('guard-count').value);
        GAME_OPTIONS.wallCount = parseInt(document.getElementById('wall-count').value);
        GAME_OPTIONS.hintsEnabled = document.getElementById('hints-enabled').checked;

        // Hide Screen
        document.getElementById('start-screen').style.display = 'none';

        // Start Phaser
        game = new Phaser.Game(config);
    });
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', initGame);
