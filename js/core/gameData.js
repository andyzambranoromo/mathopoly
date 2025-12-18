// === DATOS DEL JUEGO SIMPLIFICADOS ===

// Problemas matemáticos CORREGIDOS
const MATH_PROBLEMS = [
    // Sumas
    { question: "8 + 5", answer: 13, wrong: [11, 14, 12] },
    { question: "12 + 7", answer: 19, wrong: [18, 20, 21] },
    { question: "9 + 6", answer: 15, wrong: [14, 16, 13] },
    { question: "14 + 8", answer: 22, wrong: [20, 23, 24] },
    { question: "17 + 9", answer: 26, wrong: [25, 27, 28] },
    
    // Restas
    { question: "15 - 7", answer: 8, wrong: [9, 6, 7] },
    { question: "20 - 9", answer: 11, wrong: [10, 12, 13] },
    { question: "18 - 6", answer: 12, wrong: [11, 13, 14] },
    { question: "25 - 8", answer: 17, wrong: [16, 18, 15] },
    { question: "30 - 12", answer: 18, wrong: [17, 19, 20] },
    
    // Multiplicaciones
    { question: "6 × 4", answer: 24, wrong: [20, 22, 26] },
    { question: "7 × 3", answer: 21, wrong: [18, 24, 20] },
    { question: "5 × 8", answer: 40, wrong: [35, 45, 38] },
    { question: "9 × 2", answer: 18, wrong: [16, 20, 14] },
    { question: "4 × 7", answer: 28, wrong: [24, 30, 32] },
    
    // Divisiones
    { question: "24 ÷ 6", answer: 4, wrong: [3, 5, 6] },
    { question: "35 ÷ 5", answer: 7, wrong: [6, 8, 9] },
    { question: "18 ÷ 3", answer: 6, wrong: [5, 7, 4] },
    { question: "28 ÷ 4", answer: 7, wrong: [6, 8, 5] },
    
    // Mixtas simples
    { question: "3 + 4 × 2", answer: 11, wrong: [14, 10, 9] },
    { question: "(5 + 3) × 2", answer: 16, wrong: [13, 11, 10] },
    
    // Nuevos problemas
    { question: "7 + 8", answer: 15, wrong: [13, 16, 14] },
    { question: "25 - 13", answer: 12, wrong: [11, 13, 10] },
    { question: "6 × 6", answer: 36, wrong: [30, 32, 38] },
    { question: "48 ÷ 8", answer: 6, wrong: [5, 7, 8] },
    { question: "9 + 7 - 3", answer: 13, wrong: [15, 11, 12] }
];

// Propiedades del tablero
const BOARD_PROPERTIES = [
    { id: 1, name: "Mediterránea", color: "#8B4513", price: 60, rent: 2, position: 1 },
    { id: 2, name: "Báltica", color: "#8B4513", price: 60, rent: 4, position: 3 },
    { id: 3, name: "Oriental", color: "#87CEEB", price: 100, rent: 6, position: 6 },
    { id: 4, name: "Vermont", color: "#87CEEB", price: 100, rent: 6, position: 8 },
    { id: 5, name: "Connecticut", color: "#87CEEB", price: 120, rent: 8, position: 9 },
    { id: 6, name: "San Carlos", color: "#FFB6C1", price: 140, rent: 10, position: 11 },
    { id: 7, name: "Estados", color: "#FFB6C1", price: 140, rent: 10, position: 13 },
    { id: 8, name: "Virginia", color: "#FFB6C1", price: 160, rent: 12, position: 14 },
    { id: 9, name: "San James", color: "#FFA500", price: 180, rent: 14, position: 16 },
    { id: 10, name: "Tennessee", color: "#FFA500", price: 180, rent: 14, position: 18 },
    { id: 11, name: "Nueva York", color: "#FFA500", price: 200, rent: 16, position: 19 },
    { id: 12, name: "Kentucky", color: "#FF0000", price: 220, rent: 18, position: 21 },
    { id: 13, name: "Indiana", color: "#FF0000", price: 220, rent: 18, position: 23 },
    { id: 14, name: "Illinois", color: "#FF0000", price: 240, rent: 20, position: 24 },
    { id: 15, name: "Atlántico", color: "#FFFF00", price: 260, rent: 22, position: 26 },
    { id: 16, name: "Ventnor", color: "#FFFF00", price: 260, rent: 22, position: 27 },
    { id: 17, name: "Marvin", color: "#FFFF00", price: 280, rent: 24, position: 29 },
    { id: 18, name: "Pacífico", color: "#008000", price: 300, rent: 26, position: 31 },
    { id: 19, name: "Carolina", color: "#008000", price: 300, rent: 26, position: 32 },
    { id: 20, name: "Pensilvania", color: "#008000", price: 320, rent: 28, position: 34 },
    { id: 21, name: "Park", color: "#000080", price: 350, rent: 35, position: 37 },
    { id: 22, name: "Marítimo", color: "#000080", price: 400, rent: 50, position: 39 }
];

// Ferrocarriles
const RAILROADS = [
    { id: 1, name: "Ferrocarril Reading", price: 200, position: 5 },
    { id: 2, name: "Ferrocarril Pensilvania", price: 200, position: 15 },
    { id: 3, name: "Ferrocarril B&O", price: 200, position: 25 },
    { id: 4, name: "Ferrocarril Short Line", price: 200, position: 35 }
];

// Servicios
const UTILITIES = [
    { id: 1, name: "Compañía Eléctrica", price: 150, position: 12 },
    { id: 2, name: "Compañía de Agua", price: 150, position: 28 }
];

// Cartas de Suerte
const CHANCE_CARDS = [
    { text: "🎯 Avanza hasta SALIDA. Cobra $200.", action: "goto", value: 0, money: 200 },
    { text: "🏦 Error del banco a tu favor. Cobra $200.", action: "money", value: 200 },
    { text: "💸 Paga facturas del doctor. $50.", action: "money", value: -50 },
    { text: "🚓 Ve a la cárcel.", action: "goto", value: 10 },
    { text: "🎉 Cumpleaños. Recibe $10 de cada jugador.", action: "birthday", value: 10 }
];

// Cartas de Comunidad
const COMMUNITY_CHEST_CARDS = [
    { text: "🏆 Segundo lugar concurso belleza. Cobra $10.", action: "money", value: 10 },
    { text: "💼 Recibes honorarios de consultoría. $25.", action: "money", value: 25 },
    { text: "🏥 Factura del hospital. Paga $100.", action: "money", value: -100 },
    { text: "🎓 Paga matrícula universitaria. $150.", action: "money", value: -150 },
    { text: "💰 Reembolso de seguros. Cobra $100.", action: "money", value: 100 }
];

// Configuración inicial del juego
const INITIAL_GAME_STATE = {
    mode: 'local',
    players: [],
    currentPlayerIndex: 0,
    properties: BOARD_PROPERTIES,
    railroads: RAILROADS,
    utilities: UTILITIES,
    chanceCards: CHANCE_CARDS,
    communityChestCards: COMMUNITY_CHEST_CARDS,
    board: [],
    turnCount: 0,
    maxTurns: 3,
    gameLog: [],
    housePrice: 50,
    doubleCount: 0,
    gameFinished: false,
    diceHistory: []
};

// Exportar datos del juego
window.GAME_DATA = {
    MATH_PROBLEMS,
    BOARD_PROPERTIES,
    RAILROADS,
    UTILITIES,
    CHANCE_CARDS,
    COMMUNITY_CHEST_CARDS,
    INITIAL_GAME_STATE
};
