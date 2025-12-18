// === CONSTANTES DEL JUEGO ===

// Tokens disponibles (6 en total)
const TOKENS = [
    { id: 'hat', color: '#e74c3c', symbol: '🎩', name: 'Sombrero' },
    { id: 'car', color: '#3498db', symbol: '🚗', name: 'Coche' },
    { id: 'dog', color: '#2ecc71', symbol: '🐶', name: 'Perro' },
    { id: 'ship', color: '#f1c40f', symbol: '🚢', name: 'Barco' },
    { id: 'cat', color: '#9b59b6', symbol: '🐱', name: 'Gato' },
    { id: 'plane', color: '#1abc9c', symbol: '✈️', name: 'Avión' }
];

// Nombres para bots
const BOT_NAMES = [
    "Profesor Matemático", 
    "Genio Calculador", 
    "Maestro Álgebra", 
    "Cerebro Digital", 
    "Calculadora Humana",
    "Dr. Matemáticas",
    "El Calculista"
];

// Configuración por defecto
const DEFAULT_CONFIG = {
    startingMoney: 1500,
    maxPlayers: 6,
    minPlayers: 2,
    jailPosition: 10,
    goPosition: 0,
    goToJailPosition: 30,
    salary: 200,
    maxLaps: 3
};

// Tipos de celdas
const CELL_TYPES = {
    PROPERTY: 'property',
    RAILROAD: 'railroad',
    UTILITY: 'utility',
    CHANCE: 'chance',
    COMMUNITY: 'community',
    TAX: 'tax',
    CORNER: 'corner'
};

// Estados del juego
const GAME_STATES = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
    ENDED: 'ended',
    PAUSED: 'paused'
};

// Modos de juego
const GAME_MODES = {
    LOCAL: 'local',
    ONLINE: 'online',
    PARTY: 'party'
};

// Niveles de dificultad
const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

// Eventos del juego
const GAME_EVENTS = {
    PLAYER_MOVED: 'player_moved',
    PROPERTY_BOUGHT: 'property_bought',
    RENT_PAID: 'rent_paid',
    CARD_DRAWN: 'card_drawn',
    TURN_CHANGED: 'turn_changed',
    GAME_ENDED: 'game_ended'
};

// Exportar constantes
window.CONSTANTS = {
    TOKENS,
    BOT_NAMES,
    DEFAULT_CONFIG,
    CELL_TYPES,
    GAME_STATES,
    GAME_MODES,
    DIFFICULTY_LEVELS,
    GAME_EVENTS
};
