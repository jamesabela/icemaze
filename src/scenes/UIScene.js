class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Cache DOM elements
        this.scoreEl = document.getElementById('score-val');
        this.livesEl = document.getElementById('lives-val');
        this.sentenceEl = document.getElementById('sentence-val');
        this.timerBar = document.getElementById('timer-bar');

        // Setup Button Listeners
        this.setupButton('btn-left', 'input-left');
        this.setupButton('btn-right', 'input-right');
        this.setupButton('btn-up', 'input-up');
        this.setupButton('btn-down', 'input-down');
        this.setupButton('btn-action', 'input-action');

        // Listen for Game Events
        eventsCenter.on('update-ui', this.updateUI, this);
        eventsCenter.on('update-timer', this.updateTimer, this);
    }

    setupButton(id, eventName) {
        const btn = document.getElementById(id);
        if (btn) {
            // Remove old listeners to be safe (though typically page load refreshes them)
            // But if we restart scene, we don't want duplicate listeners on DOM elements if they persist.
            // DOM elements are outside Phaser, so they persist.
            // We should ideally *not* add listeners here if they already exist, 
            // OR remove them on shutdown.

            // Cleanest way: wrapper function
            const handler = (e) => {
                e.preventDefault(); // prevent mouse double clicks / zoom on touch
                eventsCenter.emit(eventName);
            };

            // Allow mouse and touch
            btn.onpointerdown = handler;
        }
    }

    updateUI(data) {
        if (this.scoreEl) this.scoreEl.innerText = data.score;
        if (this.livesEl) this.livesEl.innerText = data.lives;
        if (this.sentenceEl) this.sentenceEl.innerText = data.sentence || '...';
    }

    updateTimer(data) {
        if (this.timerBar) {
            const percent = Math.max(0, Math.min(1, data.percent));
            this.timerBar.style.width = `${percent * 100}%`;

            // Optional: visual urgency
            if (percent < 0.3) {
                this.timerBar.style.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3)'; // Red-ish shift
            } else {
                this.timerBar.style.filter = 'none';
            }
        }
    }
}
