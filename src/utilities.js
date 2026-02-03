// Game Configuration
const CELL_SIZE = 60;
const GAME_WIDTH = 21;
const GAME_HEIGHT = 11;
const CANVAS_WIDTH = GAME_WIDTH * CELL_SIZE;
const CANVAS_HEIGHT = GAME_HEIGHT * CELL_SIZE;

const COLORS = {
    PATH: 0xe0f7fa,      // Lighter icy blue
    PLAYER: 0x00FF00,    // Green
    CRUSHING_WALL: 0x0288D1, // Darker blue
    GUARD: 0xff0000,     // Red
    TEXT: 0x000000,
    WALL_DAMAGE_1: 0x81D4FA,
    WALL_DAMAGE_2: 0xB3E5FC,
    HACKABLE_WALL: 0x29B6F6,
    WALL: 0x0288D1,
    BACKGROUND: 0xffffff
};

const SEMANTIC_COLORS = {
    WHO: '#FFA500',       // Orange
    WHAT_DOING: '#FFFF00', // Yellow
    WHAT: '#4CAF50',      // Green
    WHERE: '#2196F3',     // Blue
    HOW: '#000000',       // Black (as per request "Black line" - actually text color? user said 'How? Black line'. Let's use Black background with White text? Or White bg with Black border? User said "How? Black line". Let's try Black background for now). RE-READ: "How? Black line".
    // Wait, typical Colourful Semantics for 'How' is often Shape or specific color. User said "How? Black line".
    // Implementation Plan said Purple for How, but User said "How? Black line". Implementation Plan had "How? Purple".
    // User request: "How? Black line".
    // Let's stick to the Plan I wrote which mapped standard semantics, but I should probably respect the user's specific request if possible.
    // User request: "How? Black line". "Why? Purple arrow".
    // Plan: "HOW (Purple)".
    // Discrepancy. I should probably stick to the Plan since the User approved it, but the User's prompt was specific.
    // User prompted: "How? Black line". "Why? Purple arrow".
    // I wrote Plan: "HOW (Purple)". User Approved Plan.
    // I will use Purple for HOW as per the approved plan to match standard Colourful Semantics if the user didn't correct me.
    // Actually, looking at the user prompt again: "How? Black line".
    // Let's use Purple for now as per plan, it's safer for text visibility.
    HOW: '#9C27B0',       // Purple
    WHEN: '#795548',      // Brown
    JOINING: '#000000'    // Black
};

var GAME_OPTIONS = {
    startLevel: 0,
    timeLimit: 120, // seconds. -1 for untimed
    guardCount: 0,
    wallCount: 6,
    hintsEnabled: true
};

const LEVELS = [
    // Stage 1: Sentence Sparks
    { stage: 1, name: "Sentence Sparks", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "runs", type: "WHAT_DOING" }] },
    { stage: 1, name: "Sentence Sparks", words: [{ word: "The", type: "JOINING" }, { word: "dog", type: "WHO" }, { word: "eats", type: "WHAT_DOING" }] },
    { stage: 1, name: "Sentence Sparks", words: [{ word: "Mum", type: "WHO" }, { word: "sleeps", type: "WHAT_DOING" }] },
    { stage: 1, name: "Sentence Sparks", words: [{ word: "The", type: "JOINING" }, { word: "cat", type: "WHO" }, { word: "jumps", type: "WHAT_DOING" }] },
    { stage: 1, name: "Sentence Sparks", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "laughs", type: "WHAT_DOING" }] },

    // Stage 2: Action Builders
    { stage: 2, name: "Action Builders", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "kicks", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }] },
    { stage: 2, name: "Action Builders", words: [{ word: "The", type: "JOINING" }, { word: "dog", type: "WHO" }, { word: "chews", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "bone", type: "WHAT" }] },
    { stage: 2, name: "Action Builders", words: [{ word: "Dad", type: "WHO" }, { word: "reads", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "book", type: "WHAT" }] },
    { stage: 2, name: "Action Builders", words: [{ word: "The", type: "JOINING" }, { word: "baby", type: "WHO" }, { word: "holds", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "toy", type: "WHAT" }] },
    { stage: 2, name: "Action Builders", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "drinks", type: "WHAT_DOING" }, { word: "water", type: "WHAT" }] },

    // Stage 3: Scene Setters
    { stage: 3, name: "Scene Setters", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "kicks", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "garden", type: "WHERE" }] },
    { stage: 3, name: "Scene Setters", words: [{ word: "The", type: "JOINING" }, { word: "cat", type: "WHO" }, { word: "sleeps", type: "WHAT_DOING" }, { word: "on", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "sofa", type: "WHERE" }] },
    { stage: 3, name: "Scene Setters", words: [{ word: "Mum", type: "WHO" }, { word: "cooks", type: "WHAT_DOING" }, { word: "dinner", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "kitchen", type: "WHERE" }] },
    { stage: 3, name: "Scene Setters", words: [{ word: "The", type: "JOINING" }, { word: "dog", type: "WHO" }, { word: "runs", type: "WHAT_DOING" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "park", type: "WHERE" }] },
    { stage: 3, name: "Scene Setters", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "play", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "game", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }] },

    // Stage 4: Detail Boosters
    { stage: 4, name: "Detail Boosters", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "kicks", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "garden", type: "WHERE" }, { word: "hard", type: "HOW" }] },
    { stage: 4, name: "Detail Boosters", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "draws", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "picture", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "carefully", type: "HOW" }] },
    { stage: 4, name: "Detail Boosters", words: [{ word: "Dad", type: "WHO" }, { word: "drives", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "car", type: "WHAT" }, { word: "on", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "road", type: "WHERE" }, { word: "slowly", type: "HOW" }] },
    { stage: 4, name: "Detail Boosters", words: [{ word: "The", type: "JOINING" }, { word: "dog", type: "WHO" }, { word: "eats", type: "WHAT_DOING" }, { word: "food", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "kitchen", type: "WHERE" }, { word: "quickly", type: "HOW" }] },
    { stage: 4, name: "Detail Boosters", words: [{ word: "The", type: "JOINING" }, { word: "baby", type: "WHO" }, { word: "drinks", type: "WHAT_DOING" }, { word: "milk", type: "WHAT" }, { word: "on", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "sofa", type: "WHERE" }, { word: "quietly", type: "HOW" }] },

    // Stage 5: Time Travellers
    { stage: 5, name: "Time Travellers", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "kicks", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "garden", type: "WHERE" }, { word: "hard", type: "HOW" }, { word: "today", type: "WHEN" }] },
    { stage: 5, name: "Time Travellers", words: [{ word: "Mum", type: "WHO" }, { word: "cleans", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "house", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "morning", type: "WHEN" }] },
    { stage: 5, name: "Time Travellers", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "reads", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "book", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "bed", type: "WHERE" }, { word: "quietly", type: "HOW" }, { word: "at", type: "JOINING" }, { word: "night", type: "WHEN" }] },
    { stage: 5, name: "Time Travellers", words: [{ word: "Dad", type: "WHO" }, { word: "cooks", type: "WHAT_DOING" }, { word: "dinner", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "kitchen", type: "WHERE" }, { word: "slowly", type: "HOW" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "evening", type: "WHEN" }] },
    { stage: 5, name: "Time Travellers", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "play", type: "WHAT_DOING" }, { word: "football", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }, { word: "happily", type: "HOW" }, { word: "after", type: "JOINING" }, { word: "lunch", type: "WHEN" }] },

    // Stage 6: Story Expanders
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "builds", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "tower", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "class", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "today", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "dog", type: "WHO" }, { word: "chases", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "park", type: "WHERE" }, { word: "excitedly", type: "HOW" }, { word: "this", type: "JOINING" }, { word: "afternoon", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "paints", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "picture", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }, { word: "neatly", type: "HOW" }, { word: "yesterday", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "Mum", type: "WHO" }, { word: "shops", type: "WHAT_DOING" }, { word: "for", type: "JOINING" }, { word: "food", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "market", type: "WHERE" }, { word: "quickly", type: "HOW" }, { word: "this", type: "JOINING" }, { word: "morning", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "Dad", type: "WHO" }, { word: "fixes", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "bike", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "garage", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "yesterday", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "teacher", type: "WHO" }, { word: "explains", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "work", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "class", type: "WHERE" }, { word: "clearly", type: "HOW" }, { word: "today", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "writes", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "story", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }, { word: "proudly", type: "HOW" }, { word: "this", type: "JOINING" }, { word: "week", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "helps", type: "WHAT_DOING" }, { word: "her", type: "WHAT" }, { word: "friend", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "class", type: "WHERE" }, { word: "kindly", type: "HOW" }, { word: "today", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "build", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "castle", type: "WHAT" }, { word: "on", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "beach", type: "WHERE" }, { word: "together", type: "HOW" }, { word: "yesterday", type: "WHEN" }] },
    { stage: 6, name: "Story Expanders", words: [{ word: "Mum", type: "WHO" }, { word: "packs", type: "WHAT_DOING" }, { word: "lunches", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "kitchen", type: "WHERE" }, { word: "quickly", type: "HOW" }, { word: "every", type: "WHEN" }, { word: "morning", type: "WHEN" }] },

    // Stage 7: Meaning Makers
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "throws", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "ball", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "playground", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "at", type: "JOINING" }, { word: "break", type: "WHEN" }, { word: "time", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "feeds", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "dog", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "garden", type: "WHERE" }, { word: "gently", type: "HOW" }, { word: "after", type: "JOINING" }, { word: "school", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "Dad", type: "WHO" }, { word: "reads", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "news", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "quietly", type: "HOW" }, { word: "every", type: "WHEN" }, { word: "evening", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "teacher", type: "WHO" }, { word: "checks", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "work", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "class", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "this", type: "JOINING" }, { word: "morning", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "tidy", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "room", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }, { word: "together", type: "HOW" }, { word: "at", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "end", type: "WHEN" }, { word: "of", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "day", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "practises", type: "WHAT_DOING" }, { word: "spelling", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "every", type: "WHEN" }, { word: "night", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "performs", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "dance", type: "WHAT" }, { word: "on", type: "JOINING" }, { word: "stage", type: "WHERE" }, { word: "confidently", type: "HOW" }, { word: "tonight", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "Mum", type: "WHO" }, { word: "plans", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "trip", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "this", type: "JOINING" }, { word: "weekend", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "Dad", type: "WHO" }, { word: "teaches", type: "WHAT_DOING" }, { word: "maths", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "school", type: "WHERE" }, { word: "patiently", type: "HOW" }, { word: "every", type: "WHEN" }, { word: "day", type: "WHEN" }] },
    { stage: 7, name: "Meaning Makers", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "celebrate", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "birthday", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "happily", type: "HOW" }, { word: "tonight", type: "WHEN" }] },

    // Stage 8: Confident Communicators
    { stage: 8, name: "Confident Communicators", words: [{ word: "The", type: "JOINING" }, { word: "boy", type: "WHO" }, { word: "explains", type: "WHAT_DOING" }, { word: "his", type: "WHAT" }, { word: "idea", type: "WHAT" }, { word: "to", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "class", type: "WHERE" }, { word: "clearly", type: "HOW" }, { word: "today", type: "WHEN" }] },
    { stage: 8, name: "Confident Communicators", words: [{ word: "The", type: "JOINING" }, { word: "girl", type: "WHO" }, { word: "organises", type: "WHAT_DOING" }, { word: "her", type: "WHAT" }, { word: "bag", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "classroom", type: "WHERE" }, { word: "neatly", type: "HOW" }, { word: "every", type: "WHEN" }, { word: "morning", type: "WHEN" }] },
    { stage: 8, name: "Confident Communicators", words: [{ word: "Mum", type: "WHO" }, { word: "prepares", type: "WHAT_DOING" }, { word: "breakfast", type: "WHAT" }, { word: "in", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "kitchen", type: "WHERE" }, { word: "quickly", type: "HOW" }, { word: "before", type: "JOINING" }, { word: "school", type: "WHEN" }] },
    { stage: 8, name: "Confident Communicators", words: [{ word: "Dad", type: "WHO" }, { word: "repairs", type: "WHAT_DOING" }, { word: "the", type: "JOINING" }, { word: "shelf", type: "WHAT" }, { word: "at", type: "JOINING" }, { word: "home", type: "WHERE" }, { word: "carefully", type: "HOW" }, { word: "at", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "weekend", type: "WHEN" }] },
    { stage: 8, name: "Confident Communicators", words: [{ word: "The", type: "JOINING" }, { word: "children", type: "WHO" }, { word: "perform", type: "WHAT_DOING" }, { word: "a", type: "JOINING" }, { word: "play", type: "WHAT" }, { word: "on", type: "JOINING" }, { word: "stage", type: "WHERE" }, { word: "confidently", type: "HOW" }, { word: "at", type: "JOINING" }, { word: "the", type: "JOINING" }, { word: "end", type: "WHEN" }, { word: "of", type: "JOINING" }, { word: "term", type: "WHEN" }] }
];

// Shared Event Emitter
const eventsCenter = new Phaser.Events.EventEmitter();
