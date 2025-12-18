// === LÓGICA DEL JUEGO SIMPLIFICADA ===

class GameLogic {
    constructor() {
        this.gameState = { ...GAME_DATA.INITIAL_GAME_STATE };
        this.currentProblem = null;
    }

    // Generar problema matemático
    generateMathProblem() {
        const problem = GAME_DATA.MATH_PROBLEMS[
            Math.floor(Math.random() * GAME_DATA.MATH_PROBLEMS.length)
        ];
        
        const options = [problem.answer, ...problem.wrong]
            .sort(() => Math.random() - 0.5);
        
        this.currentProblem = {
            question: problem.question,
            answer: problem.answer,
            options: options
        };
        
        return this.currentProblem;
    }

    // Lanzar dados
    rollDice() {
        if (this.gameState.gameFinished || this.gameState.currentPlayerIndex === null) {
            return null;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        const isDouble = dice1 === dice2;

        // Actualizar historial de dados
        this.gameState.diceHistory.unshift({
            dice1, dice2, total, isDouble,
            player: this.gameState.players[this.gameState.currentPlayerIndex]?.name,
            timestamp: new Date().toLocaleTimeString()
        });

        if (this.gameState.diceHistory.length > 10) {
            this.gameState.diceHistory.pop();
        }

        return { dice1, dice2, total, isDouble };
    }

    // Mover jugador
    movePlayer(playerIndex, steps) {
        const player = this.gameState.players[playerIndex];
        if (!player || player.isBankrupt || player.finished) return;

        const oldPosition = player.position;
        player.position = (oldPosition + steps) % 40;

        // Verificar si pasó por SALIDA
        if (player.position < oldPosition) {
            player.money += 200;
            player.laps++;
            
            if (player.laps >= 3) {
                player.finished = true;
            }
        }

        return player.position;
    }

    // Comprar propiedad
    buyProperty(playerIndex, propertyId) {
        const player = this.gameState.players[playerIndex];
        const property = this.gameState.properties.find(p => p.id === propertyId);
        
        if (!player || !property || player.money < property.price) {
            return false;
        }

        player.money -= property.price;
        player.properties.push(property);
        return true;
    }

    // Pagar alquiler
    payRent(playerIndex, propertyId) {
        const player = this.gameState.players[playerIndex];
        const property = this.gameState.properties.find(p => p.id === propertyId);
        const owner = this.gameState.players.find(p => 
            p.properties.some(prop => prop.id === propertyId)
        );

        if (!player || !property || !owner || player.id === owner.id) {
            return false;
        }

        const rent = property.rent;
        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;
            return true;
        } else {
            player.isBankrupt = true;
            return false;
        }
    }

    // Siguiente turno
    nextTurn() {
        if (this.gameState.gameFinished) return;

        let nextIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
        let attempts = 0;

        // Buscar siguiente jugador activo
        while (attempts < this.gameState.players.length) {
            const player = this.gameState.players[nextIndex];
            if (!player.isBankrupt && !player.finished) {
                break;
            }
            nextIndex = (nextIndex + 1) % this.gameState.players.length;
            attempts++;
        }

        this.gameState.currentPlayerIndex = nextIndex;
        this.gameState.doubleCount = 0;
        this.gameState.turnCount++;

        // Verificar si el juego terminó
        this.checkGameEnd();
    }

    // Verificar fin del juego
    checkGameEnd() {
        const activePlayers = this.gameState.players.filter(p => !p.isBankrupt && !p.finished);
        
        if (activePlayers.length <= 1) {
            this.gameState.gameFinished = true;
            return true;
        }

        return false;
    }

    // Obtener resultados
    getResults() {
        return [...this.gameState.players]
            .filter(p => !p.isBankrupt)
            .sort((a, b) => b.money - a.money);
    }

    // Reiniciar juego
    reset() {
        this.gameState = { ...GAME_DATA.INITIAL_GAME_STATE };
        this.currentProblem = null;
    }

    // Agregar jugador
    addPlayer(playerData) {
        const player = {
            id: this.gameState.players.length + 1,
            name: playerData.name,
            token: playerData.token,
            tokenColor: playerData.tokenColor,
            tokenSymbol: playerData.tokenSymbol,
            money: 1500,
            position: 0,
            properties: [],
            railroads: [],
            utilities: [],
            isBankrupt: false,
            laps: 0,
            isBot: playerData.isBot || false,
            inJail: false,
            jailTurns: 0,
            finished: false
        };

        this.gameState.players.push(player);
        return player;
    }

    // Obtener jugador actual
    getCurrentPlayer() {
        return this.gameState.players[this.gameState.currentPlayerIndex];
    }

    // Obtener propiedad en posición
    getPropertyAtPosition(position) {
        return this.gameState.properties.find(p => p.position === position) ||
               this.gameState.railroads.find(r => r.position === position) ||
               this.gameState.utilities.find(u => u.position === position);
    }

    // Verificar si posición es propiedad comprable
    isBuyablePosition(position) {
        const property = this.getPropertyAtPosition(position);
        if (!property) return false;

        const owner = this.gameState.players.find(p => 
            p.properties.some(prop => prop.id === property.id) ||
            p.railroads.some(r => r.id === property.id) ||
            p.utilities.some(u => u.id === property.id)
        );

        return !owner;
    }

    // Sacar carta
    drawCard(type = 'chance') {
        const cards = type === 'chance' 
            ? this.gameState.chanceCards 
            : this.gameState.communityChestCards;
        
        return cards[Math.floor(Math.random() * cards.length)];
    }
}

// Crear instancia global
window.gameLogic = new GameLogic();
