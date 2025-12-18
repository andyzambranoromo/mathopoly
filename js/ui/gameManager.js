// === GESTIÓN DEL JUEGO ===

class GameManager {
    constructor() {
        this.isFocusEnabled = true;
        this.currentZoom = 1;
        this.boardTransform = { x: 0, y: 0, scale: 1 };
        this.diceHistory = [];
        this.isProcessingTurn = false;
        this.currentCard = null;
    }

    // Inicializar juego
    init(players) {
        // Configurar juego
        gameLogic.reset();
        
        // Agregar jugadores
        players.forEach(playerData => {
            gameLogic.addPlayer(playerData);
        });

        // Renderizar juego
        this.renderGame();
        this.setupEventListeners();
        
        console.log('Juego inicializado con', players.length, 'jugadores');
        
        // Mostrar mensaje de inicio
        this.addToLog('🎮 ¡Juego iniciado!', 'system');
        this.addToLog(`Jugadores: ${players.map(p => p.name).join(', ')}`, 'system');
        this.updateCurrentPlayerInfo();
        
        // Si el primer jugador es bot, iniciar automáticamente
        const currentPlayer = gameLogic.getCurrentPlayer();
        if (currentPlayer && currentPlayer.isBot) {
            setTimeout(() => this.handleRollDice(), 1000);
        }
    }

    // Renderizar juego
   renderGame() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    gameScreen.innerHTML = `
        <div class="game-container">
            <header class="game-header">
                <div class="game-title">
                    <h1>MATH-OPOLY</h1>
                    <div class="game-mode">Modo Local</div>
                </div>
                
                <div class="game-controls">
                    <!-- ELIMINADO: focus-toggle, view-board -->
                    <button id="open-dice" class="btn btn-primary">
                        <i class="fas fa-dice"></i> Dados
                    </button>
                    <button id="back-to-lobby" class="btn btn-danger">
                        <i class="fas fa-home"></i> Lobby
                    </button>
                </div>
            </header>

            <main class="game-main">
                <!-- Panel de jugadores -->
                <div class="players-panel">
                    <h2>Jugadores</h2>
                    <div id="players-list" class="players-list">
                        ${this.renderPlayersList()}
                    </div>
                </div>

                <!-- Área del tablero -->
                <div class="game-board-area">
                    <div class="board-container">
                        <div class="board-wrapper">
                            <div class="board" id="game-board">
                                ${this.renderBoard()}
                            </div>
                            
                            <!-- Centro del tablero -->
                            <div class="board-center">
                                <div class="dice-area">
                                    <div class="dice-container">
                                        <div class="dice" id="dice1">?</div>
                                        <div class="dice" id="dice2">?</div>
                                    </div>
                                    <div class="dice-result" id="dice-result">
                                        Lanza los dados para comenzar
                                    </div>
                                    <button id="roll-dice" class="btn btn-primary roll-dice-btn">
                                        <i class="fas fa-dice"></i> LANZAR DADOS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel del registro -->
                <div class="game-log-panel">
                    <div class="log-header">
                        <h2>Registro del Juego</h2>
                        <button id="clear-log" class="btn btn-warning btn-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div id="log-content" class="log-content"></div>
                </div>
            </main>

            <!-- Barra inferior -->
            <div class="game-controls-bottom">
                <div class="current-player-info" id="current-player-info">
                    ${this.renderCurrentPlayerInfo()}
                </div>
                
                <div class="game-actions">
                    <button id="sell-property" class="btn btn-warning">
                        <i class="fas fa-money-bill-wave"></i> Vender
                    </button>
                    <button id="trade-property" class="btn btn-info">
                        <i class="fas fa-exchange-alt"></i> Intercambiar
                    </button>
                </div>
            </div>
        </div>
    `;

    this.updatePlayerMarkers();
    }

    // Renderizar lista de jugadores
    renderPlayersList() {
        return gameLogic.gameState.players.map((player, index) => `
            <div class="player-card ${index === gameLogic.gameState.currentPlayerIndex ? 'active' : ''} 
                                   ${player.isBankrupt ? 'bankrupt' : ''}"
                 data-player-index="${index}">
                <div class="player-header">
                    <div class="player-avatar" style="background-color: ${player.tokenColor}">
                        ${player.tokenSymbol}
                    </div>
                    <div class="player-info">
                        <div class="player-name">
                            ${player.name} ${player.isBot ? '🤖' : ''}
                        </div>
                        <div class="player-status">
                            ${this.getPlayerStatus(player)}
                        </div>
                    </div>
                </div>
                <div class="player-money">$${player.money}</div>
                <div class="player-stats">
                    <div><i class="fas fa-home"></i> ${player.properties.length}</div>
                    <div><i class="fas fa-train"></i> ${player.railroads.length}</div>
                    <div><i class="fas fa-bolt"></i> ${player.utilities.length}</div>
                    <div><i class="fas fa-undo"></i> ${player.laps}/3</div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar tablero lineal como Monopoly
    renderBoard() {
        const boardLayout = this.getBoardLayout();
        return boardLayout.map(cell => this.renderCell(cell)).join('');
    }

    // Obtener layout del tablero (LINEAL como Monopoly)
    getBoardLayout() {
        return [
            // Fila inferior (de derecha a izquierda) - posición 0 a 10
            { type: 'corner', text: 'SALIDA', position: 0, emoji: "💰", cornerClass: 'go' },
            { type: 'property', id: 1, position: 1 },
            { type: 'community', text: 'COMUNIDAD', position: 2, emoji: "🏛️" },
            { type: 'property', id: 2, position: 3 },
            { type: 'tax', text: 'IMPUESTO', position: 4, emoji: "💸", taxAmount: 200 },
            { type: 'railroad', id: 1, position: 5 },
            { type: 'property', id: 3, position: 6 },
            { type: 'chance', text: 'SUERTE', position: 7, emoji: "🎲" },
            { type: 'property', id: 4, position: 8 },
            { type: 'property', id: 5, position: 9 },
            
            // Esquina inferior izquierda
            { type: 'corner', text: 'CÁRCEL', position: 10, emoji: "🚓", cornerClass: 'jail' },
            
            // Columna izquierda (de abajo hacia arriba) - posición 11 a 20
            { type: 'property', id: 6, position: 11 },
            { type: 'utility', id: 1, position: 12, utilityType: 'electric' },
            { type: 'property', id: 7, position: 13 },
            { type: 'property', id: 8, position: 14 },
            { type: 'railroad', id: 2, position: 15 },
            { type: 'property', id: 9, position: 16 },
            { type: 'community', text: 'COMUNIDAD', position: 17, emoji: "🏛️" },
            { type: 'property', id: 10, position: 18 },
            { type: 'property', id: 11, position: 19 },
            
            // Esquina superior izquierda
            { type: 'corner', text: 'PARADA', position: 20, emoji: "🅿️", cornerClass: 'parking' },
            
            // Fila superior (de izquierda a derecha) - posición 21 a 30
            { type: 'property', id: 12, position: 21 },
            { type: 'chance', text: 'SUERTE', position: 22, emoji: "🎲" },
            { type: 'property', id: 13, position: 23 },
            { type: 'property', id: 14, position: 24 },
            { type: 'railroad', id: 3, position: 25 },
            { type: 'property', id: 15, position: 26 },
            { type: 'property', id: 16, position: 27 },
            { type: 'utility', id: 2, position: 28, utilityType: 'water' },
            { type: 'property', id: 17, position: 29 },
            
            // Esquina superior derecha
            { type: 'corner', text: 'VE A LA CÁRCEL', position: 30, emoji: "🔒", cornerClass: 'go-to-jail' },
            
            // Columna derecha (de arriba hacia abajo) - posición 31 a 39
            { type: 'property', id: 18, position: 31 },
            { type: 'property', id: 19, position: 32 },
            { type: 'community', text: 'COMUNIDAD', position: 33, emoji: "🏛️" },
            { type: 'property', id: 20, position: 34 },
            { type: 'railroad', id: 4, position: 35 },
            { type: 'chance', text: 'SUERTE', position: 36, emoji: "🎲" },
            { type: 'property', id: 21, position: 37 },
            { type: 'tax', text: 'LUJO', position: 38, emoji: "💎", taxAmount: 100 },
            { type: 'property', id: 22, position: 39 }
        ];
    }

    // Renderizar celda
    renderCell(cellInfo) {
        let content = '';
        let className = `cell ${cellInfo.type}`;
        
        switch(cellInfo.type) {
            case 'corner':
                content = `
                    <div class="cell-icon">${cellInfo.emoji}</div>
                    <div class="corner-text">${cellInfo.text}</div>
                `;
                if (cellInfo.cornerClass) {
                    className += ` ${cellInfo.cornerClass}`;
                }
                break;
                
            case 'property':
                const property = GAME_DATA.BOARD_PROPERTIES.find(p => p.id === cellInfo.id);
                if (property) {
                    content = `
                        <div class="color-bar" style="background-color: ${property.color}"></div>
                        <div class="property-name">${property.name}</div>
                        <div class="property-price">$${property.price}</div>
                    `;
                }
                break;
                
            case 'railroad':
                const railroad = GAME_DATA.RAILROADS.find(r => r.id === cellInfo.id);
                if (railroad) {
                    content = `
                        <div class="cell-icon">🚂</div>
                        <div class="property-name">${railroad.name}</div>
                        <div class="property-price">$${railroad.price}</div>
                    `;
                }
                break;
                
            case 'utility':
                const utility = GAME_DATA.UTILITIES.find(u => u.id === cellInfo.id);
                if (utility) {
                    const emoji = cellInfo.utilityType === 'electric' ? '💡' : '💧';
                    content = `
                        <div class="cell-icon">${emoji}</div>
                        <div class="property-name">${utility.name}</div>
                        <div class="property-price">$${utility.price}</div>
                    `;
                }
                break;
                
            case 'chance':
            case 'community':
                content = `
                    <div class="cell-icon">${cellInfo.emoji}</div>
                    <div class="card-text">${cellInfo.text}</div>
                `;
                break;
                
            case 'tax':
                content = `
                    <div class="cell-icon">${cellInfo.emoji}</div>
                    <div class="tax-text">${cellInfo.text}</div>
                    <div class="tax-amount">$${cellInfo.taxAmount}</div>
                `;
                break;
        }
        
        return `<div class="${className}" id="cell-${cellInfo.position}" data-position="${cellInfo.position}" data-type="${cellInfo.type}">${content}</div>`;
    }

    // Renderizar información del jugador actual
    renderCurrentPlayerInfo() {
        const player = gameLogic.getCurrentPlayer();
        if (!player) return '<div>Esperando jugadores...</div>';
        
        return `
            <div class="current-turn-info">
                <div class="turn-indicator"></div>
                <div class="player-turn">
                    <div class="player-turn-icon" style="background-color: ${player.tokenColor}">
                        ${player.tokenSymbol}
                    </div>
                    <div class="player-turn-details">
                        <h3>${player.name} ${player.isBot ? '🤖' : ''}</h3>
                        <p>${this.getPlayerStatus(player)}</p>
                        <p class="turn-money">Dinero: $${player.money}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener estado del jugador
    getPlayerStatus(player) {
        if (player.isBankrupt) return 'En bancarrota';
        if (player.finished) return 'Juego terminado';
        if (player.inJail) return `En cárcel (${player.jailTurns}/3)`;
        return 'Es tu turno';
    }

    // Configurar event listeners
    setupEventListeners() {
        // Lanzar dados
        document.getElementById('roll-dice')?.addEventListener('click', () => this.handleRollDice());
        
        // Vender propiedad
        document.getElementById('sell-property')?.addEventListener('click', () => this.handleSellProperty());
        
        // Intercambiar propiedad
        document.getElementById('trade-property')?.addEventListener('click', () => this.handleTradeProperty());
        
        // Volver al lobby
        document.getElementById('back-to-lobby')?.addEventListener('click', () => window.uiManager.showLobbyScreen());
        
        // Alternar enfoque
        document.getElementById('focus-toggle')?.addEventListener('click', () => this.toggleFocus());
        
        // Ver tablero completo
        document.getElementById('view-board')?.addEventListener('click', () => this.showBoardModal());
        
        // Abrir dados
        document.getElementById('open-dice')?.addEventListener('click', () => this.showDiceModal());
        
        // Limpiar registro
        document.getElementById('clear-log')?.addEventListener('click', () => this.clearLog());
    }

    // Manejar lanzamiento de dados
    handleRollDice() {
        if (this.isProcessingTurn) return;
        
        this.isProcessingTurn = true;
        const result = gameLogic.rollDice();
        if (!result) {
            this.isProcessingTurn = false;
            return;
        }

        // Mostrar animación
        this.showDiceAnimation(result.dice1, result.dice2);
        
        // Deshabilitar botón temporalmente
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) rollBtn.disabled = true;

        // Después de la animación
        setTimeout(() => {
            this.showDiceResult(result);
            
            if (result.isDouble) {
                this.addToLog(`${gameLogic.getCurrentPlayer().name} sacó dobles!`, 'important');
                gameLogic.gameState.doubleCount++;
                
                // Verificar 3 dobles seguidos
                if (gameLogic.gameState.doubleCount >= 3) {
                    this.addToLog(`${gameLogic.getCurrentPlayer().name} sacó 3 dobles seguidos. ¡A la cárcel!`, 'important');
                    const player = gameLogic.getCurrentPlayer();
                    player.position = 10;
                    player.inJail = true;
                    player.jailTurns = 0;
                    this.updatePlayerMarkers();
                    
                    // Terminar turno
                    setTimeout(() => {
                        this.handleEndTurn();
                    }, 1500);
                    return;
                }
            } else {
                gameLogic.gameState.doubleCount = 0;
            }
            
            // Mover jugador
            this.movePlayer(result.total, result.isDouble);
            
        }, 1000);
    }

    // Mostrar animación de dados
    showDiceAnimation(dice1, dice2) {
        const diceElements = [document.getElementById('dice1'), document.getElementById('dice2')];
        
        diceElements.forEach(dice => {
            if (dice) {
                dice.classList.add('rolling');
                dice.textContent = '?';
            }
        });

        setTimeout(() => {
            diceElements.forEach((dice, index) => {
                if (dice) {
                    dice.classList.remove('rolling');
                    dice.textContent = index === 0 ? dice1 : dice2;
                }
            });
        }, 1000);
    }

    // Mostrar resultado de dados
    showDiceResult(result) {
        const resultElement = document.getElementById('dice-result');
        if (resultElement) {
            resultElement.textContent = `Total: ${result.total} (${result.dice1} + ${result.dice2}) ${result.isDouble ? '¡DOBLES!' : ''}`;
        }
    }

    // Mover jugador
    async movePlayer(steps, isDouble) {
        const player = gameLogic.getCurrentPlayer();
        if (!player) {
            this.isProcessingTurn = false;
            return;
        }

        this.addToLog(`${player.name} lanza ${steps} espacios`, 'player');
        
        // Mover paso a paso
        for (let i = 0; i < steps; i++) {
            const newPosition = gameLogic.movePlayer(gameLogic.gameState.currentPlayerIndex, 1);
            
            // Actualizar marcadores
            this.updatePlayerMarkers();
            
            // Pequeña pausa entre movimientos
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Verificar posición final
        const finalPosition = player.position;
        this.addToLog(`${player.name} llegó a la posición ${finalPosition}`, 'player');
        
        // Verificar acción de la posición
        this.handlePositionAction(finalPosition, isDouble);
    }

    // Manejar acción de posición
    handlePositionAction(position, isDouble) {
        const player = gameLogic.getCurrentPlayer();
        if (!player) {
            this.isProcessingTurn = false;
            return;
        }

        // Verificar si está en la cárcel
        if (player.inJail) {
            this.handleJailTurn(isDouble);
            return;
        }

        // Obtener tipo de celda
        const cell = document.querySelector(`#cell-${position}`);
        if (!cell) {
            this.isProcessingTurn = false;
            return;
        }

        const cellType = cell.dataset.type;
        
        // Verificar si es carta (se activa automáticamente)
        if (cellType === 'chance' || cellType === 'community') {
            // Sacar carta automáticamente después de 1 segundo
            setTimeout(() => {
                this.handleCardDraw(cellType);
            }, 1000);
            return;
        }

        // Verificar si es propiedad comprable
        const property = gameLogic.getPropertyAtPosition(position);
        if (property && gameLogic.isBuyablePosition(position)) {
            // Mostrar modal para comprar
            this.showBuyPropertyModal(property, isDouble);
            return;
        }

        // Verificar si es propiedad con dueño
        if (property && !gameLogic.isBuyablePosition(position)) {
            // Pagar alquiler
            this.handleRentPayment(property, isDouble);
            return;
        }

        // Esquina o impuesto
        this.handleSpecialPosition(position, isDouble);
    }

    // Manejar turno en cárcel
    handleJailTurn(isDouble) {
        const player = gameLogic.getCurrentPlayer();
        if (!player) {
            this.isProcessingTurn = false;
            return;
        }

        player.jailTurns++;
        
        if (isDouble) {
            // Salir de la cárcel por dobles
            player.inJail = false;
            player.jailTurns = 0;
            this.addToLog(`${player.name} sacó dobles y sale de la cárcel!`, 'important');
            
            // Continuar movimiento
            this.continueTurn(isDouble);
        } else if (player.jailTurns >= 3) {
            // Pagar fianza después de 3 turnos
            if (player.money >= 50) {
                player.money -= 50;
                player.inJail = false;
                player.jailTurns = 0;
                this.addToLog(`${player.name} paga fianza de $50 y sale de la cárcel`, 'player');
                this.updatePlayersList();
                this.continueTurn(false);
            } else {
                player.isBankrupt = true;
                this.addToLog(`${player.name} no puede pagar la fianza y va a la bancarrota!`, 'important');
                this.updatePlayersList();
                setTimeout(() => this.handleEndTurn(), 1500);
            }
        } else {
            this.addToLog(`${player.name} está en la cárcel (turno ${player.jailTurns}/3)`, 'player');
            // Terminar turno
            setTimeout(() => this.handleEndTurn(), 1500);
        }
    }

    // Manejar posición especial (esquina o impuesto)
    handleSpecialPosition(position, isDouble) {
        const player = gameLogic.getCurrentPlayer();
        if (!player) {
            this.isProcessingTurn = false;
            return;
        }

        switch(position) {
            case 0: // SALIDA
                player.money += 200;
                this.addToLog(`${player.name} pasó por SALIDA y recibe $200`, 'player');
                this.updatePlayersList();
                break;
                
            case 4: // IMPUESTO
                const taxAmount = 200;
                if (player.money >= taxAmount) {
                    player.money -= taxAmount;
                    this.addToLog(`${player.name} paga impuesto de $${taxAmount}`, 'player');
                } else {
                    player.isBankrupt = true;
                    this.addToLog(`${player.name} no puede pagar el impuesto y va a la bancarrota!`, 'important');
                }
                this.updatePlayersList();
                break;
                
            case 10: // CÁRCEL (visita)
                this.addToLog(`${player.name} está de visita en la cárcel`, 'player');
                break;
                
            case 20: // PARADA LIBRE
                this.addToLog(`${player.name} está en parada libre`, 'player');
                break;
                
            case 30: // VE A LA CÁRCEL
                player.position = 10;
                player.inJail = true;
                player.jailTurns = 0;
                this.addToLog(`${player.name} va a la cárcel!`, 'important');
                this.updatePlayerMarkers();
                break;
                
            case 38: // IMPUESTO DE LUJO
                const luxuryTax = 100;
                if (player.money >= luxuryTax) {
                    player.money -= luxuryTax;
                    this.addToLog(`${player.name} paga impuesto de lujo de $${luxuryTax}`, 'player');
                } else {
                    player.isBankrupt = true;
                    this.addToLog(`${player.name} no puede pagar el impuesto de lujo y va a la bancarrota!`, 'important');
                }
                this.updatePlayersList();
                break;
        }
        
        // Continuar turno
        this.continueTurn(isDouble);
    }

    // Mostrar modal de compra con botones grandes
    showBuyPropertyModal(property, isDouble) {
        const player = gameLogic.getCurrentPlayer();
        if (!player || player.money < property.price) {
            this.addToLog(`${player.name} no tiene suficiente dinero para comprar`, 'player');
            this.continueTurn(isDouble);
            return;
        }

        // Generar problema matemático
        const problem = gameLogic.generateMathProblem();
        
        // Crear modal con botones grandes
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Desafío Matemático</h2>
            </div>
            <div class="modal-body">
                <div class="property-info">
                    <h3 style="color: ${property.color || '#333'}; text-align: center; margin-bottom: 20px;">
                        ${property.name}
                    </h3>
                    <div class="property-details">
                        <div class="detail-item">
                            <i class="fas fa-tag"></i>
                            <span><strong>Precio:</strong> $${property.price}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-home"></i>
                            <span><strong>Alquiler:</strong> $${property.rent || 'Variable'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="math-challenge">
                    <h4>Resuelve para comprar:</h4>
                    <div class="math-question">${problem.question} = ?</div>
                    <div class="math-options">
                        ${problem.options.map((option, index) => `
                            <button class="math-option" data-answer="${option}">
                                <span class="option-number">${String.fromCharCode(65 + index)}</span>
                                <span class="option-value">${option}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="warning">
                    <p><i class="fas fa-exclamation-triangle"></i> <strong>ADVERTENCIA:</strong></p>
                    <p>• No responder: Multa de $50</p>
                    <p>• Respuesta incorrecta: Multa de $10</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger btn-lg" id="decline-buy">
                    <i class="fas fa-times"></i> No Comprar (Multa $50)
                </button>
            </div>
        `, 'modal-lg');

        // Agregar event listeners a los botones de opciones
        modal.querySelectorAll('.math-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedAnswer = parseInt(e.target.dataset.answer);
                const isCorrect = selectedAnswer === problem.answer;
                
                if (isCorrect) {
                    // Comprar propiedad
                    const success = gameLogic.buyProperty(gameLogic.gameState.currentPlayerIndex, property.id);
                    if (success) {
                        this.addToLog(`¡${player.name} respondió correctamente y compró ${property.name}!`, 'player');
                    }
                } else {
                    // Multa por respuesta incorrecta
                    player.money -= 10;
                    this.addToLog(`${player.name} respondió incorrectamente. Multa de $10.`, 'player');
                }
                
                this.closeModal();
                this.updatePlayersList();
                this.updatePlayerMarkers();
                this.continueTurn(isDouble);
            });
        });

        modal.querySelector('#decline-buy').addEventListener('click', () => {
            // Multa por no intentar
            player.money -= 50;
            this.addToLog(`${player.name} decidió no comprar. Multa de $50.`, 'player');
            
            this.closeModal();
            this.updatePlayersList();
            this.continueTurn(isDouble);
        });
    }

    // Manejar pago de alquiler
    handleRentPayment(property, isDouble) {
        const player = gameLogic.getCurrentPlayer();
        const owner = gameLogic.gameState.players.find(p => 
            p.properties.some(prop => prop.id === property.id) ||
            p.railroads.some(r => r.id === property.id) ||
            p.utilities.some(u => u.id === property.id)
        );

        if (!player || !owner || player.id === owner.id) {
            this.continueTurn(isDouble);
            return;
        }

        // Calcular alquiler
        let rent = property.rent || 0;
        
        // Para ferrocarriles: $25 por cada ferrocarril que tenga el dueño
        if (property.type === 'railroad') {
            const railroadCount = owner.railroads.length;
            rent = 25 * Math.pow(2, railroadCount - 1); // 25, 50, 100, 200
        }
        
        // Para servicios: 4 veces el valor de los dados si tiene 1, 10 veces si tiene 2
        if (property.type === 'utility') {
            const utilityCount = owner.utilities.length;
            const diceRoll = gameLogic.gameState.diceHistory[0]?.total || 7;
            rent = utilityCount === 1 ? diceRoll * 4 : diceRoll * 10;
        }

        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;
            this.addToLog(`${player.name} paga $${rent} de alquiler a ${owner.name} por ${property.name}`, 'player');
        } else {
            player.isBankrupt = true;
            // Transferir todas las propiedades al dueño
            player.properties.forEach(prop => owner.properties.push(prop));
            player.railroads.forEach(rr => owner.railroads.push(rr));
            player.utilities.forEach(util => owner.utilities.push(util));
            player.properties = [];
            player.railroads = [];
            player.utilities = [];
            
            this.addToLog(`${player.name} no puede pagar $${rent} y va a la bancarrota! Todas sus propiedades pasan a ${owner.name}`, 'important');
        }
        
        this.updatePlayersList();
        this.updatePlayerMarkers();
        this.continueTurn(isDouble);
    }

    // Manejar carta (automático cuando se cae en la casilla)
    handleCardDraw(type) {
        const card = gameLogic.drawCard(type);
        this.showCardModal(
            type === 'chance' ? '🎲 Tarjeta de Suerte' : '🏛️ Tarjeta de Comunidad',
            card,
            type
        );
    }

    // Mostrar modal de carta
    showCardModal(title, card, type) {
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
            </div>
            <div class="modal-body">
                <div class="card-content">
                    <div class="card-icon">${type === 'chance' ? '🎲' : '🏛️'}</div>
                    <div class="card-text">${card.text}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary btn-lg" id="close-card">Aceptar</button>
            </div>
        `);

        modal.querySelector('#close-card').addEventListener('click', () => {
            this.closeModal();
            this.addToLog(`${gameLogic.getCurrentPlayer().name} sacó: ${card.text}`, 'player');
            
            // Aplicar efecto de la carta
            this.applyCardEffect(card);
        });
    }

    // Aplicar efecto de carta
    applyCardEffect(card) {
        const player = gameLogic.getCurrentPlayer();
        if (!player) {
            this.isProcessingTurn = false;
            return;
        }

        switch(card.action) {
            case 'money':
                player.money += card.value;
                this.addToLog(`${player.name} ${card.value >= 0 ? 'recibe' : 'paga'} $${Math.abs(card.value)}`, 'player');
                break;
                
            case 'goto':
                const oldPosition = player.position;
                player.position = card.value;
                
                if (card.value === 10) {
                    player.inJail = true;
                    player.jailTurns = 0;
                    this.addToLog(`${player.name} va a la cárcel!`, 'important');
                } else {
                    // Verificar si pasó por SALIDA
                    if (player.position < oldPosition) {
                        player.money += 200;
                        this.addToLog(`${player.name} pasó por SALIDA y recibe $200`, 'player');
                    }
                    this.addToLog(`${player.name} se mueve a posición ${card.value}`, 'player');
                }
                
                this.updatePlayerMarkers();
                
                if (card.money) {
                    player.money += card.money;
                    this.addToLog(`${player.name} recibe $${card.money}`, 'player');
                }
                
                // Verificar acción en la nueva posición
                setTimeout(() => {
                    this.handlePositionAction(player.position, false);
                }, 1000);
                return; // No continuar turno todavía
                
            case 'birthday':
                // Todos los jugadores pagan al jugador actual
                let totalCollected = 0;
                gameLogic.gameState.players.forEach(p => {
                    if (p.id !== player.id && !p.isBankrupt) {
                        const amount = Math.min(card.value, p.money);
                        p.money -= amount;
                        player.money += amount;
                        totalCollected += amount;
                    }
                });
                this.addToLog(`${player.name} recibe $${totalCollected} de los demás jugadores por su cumpleaños`, 'player');
                break;
        }
        
        this.updatePlayersList();
        
        // Continuar turno
        setTimeout(() => {
            this.continueTurn(false);
        }, 1000);
    }

    // Continuar turno automáticamente
    continueTurn(isDouble) {
        this.isProcessingTurn = false;
        
        if (isDouble) {
            this.addToLog('¡Dobles! Tira de nuevo', 'important');
            // Habilitar botón de lanzar dados después de 1 segundo
            setTimeout(() => {
                const rollBtn = document.getElementById('roll-dice');
                if (rollBtn) rollBtn.disabled = false;
                
                // Si es bot, lanzar automáticamente
                const player = gameLogic.getCurrentPlayer();
                if (player && player.isBot) {
                    setTimeout(() => this.handleRollDice(), 1000);
                }
            }, 1000);
        } else {
            // Terminar turno automáticamente después de 2 segundos
            setTimeout(() => {
                this.handleEndTurn();
            }, 2000);
        }
        
        this.updateCurrentPlayerInfo();
    }

    // Manejar terminar turno (automático)
    handleEndTurn() {
        gameLogic.nextTurn();
        this.updatePlayersList();
        this.updateCurrentPlayerInfo();
        this.updatePlayerMarkers();
        
        // Reiniciar dados
        const diceResult = document.getElementById('dice-result');
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        
        if (diceResult) diceResult.textContent = 'Lanza los dados para comenzar';
        if (dice1) dice1.textContent = '?';
        if (dice2) dice2.textContent = '?';
        
        // Habilitar botón de lanzar dados
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) {
            rollBtn.disabled = false;
            
            // Verificar si el juego terminó
            if (gameLogic.checkGameEnd()) {
                this.showResults();
                return;
            }
            
            const currentPlayer = gameLogic.getCurrentPlayer();
            if (currentPlayer) {
                this.addToLog(`Es el turno de ${currentPlayer.name}`, 'important');
                
                // Si es bot, jugar automáticamente después de 1.5 segundos
                if (currentPlayer.isBot) {
                    setTimeout(() => {
                        if (!gameLogic.gameState.gameFinished && !this.isProcessingTurn) {
                            this.handleRollDice();
                        }
                    }, 1500);
                }
            }
        }
    }

    // Manejar venta de propiedad
    handleSellProperty() {
        const player = gameLogic.getCurrentPlayer();
        if (!player || player.properties.length === 0) {
            alert('No tienes propiedades para vender');
            return;
        }

        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Vender Propiedades</h2>
            </div>
            <div class="modal-body">
                <div class="properties-list">
                    ${player.properties.map(prop => `
                        <div class="property-item">
                            <div class="property-info">
                                <h4 style="color: ${prop.color}">${prop.name}</h4>
                                <div class="property-details">
                                    <span><i class="fas fa-tag"></i> Precio: $${prop.price}</span>
                                    <span><i class="fas fa-home"></i> Alquiler: $${prop.rent}</span>
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sell" data-id="${prop.id}">
                                <i class="fas fa-money-bill-wave"></i> Vender por $${Math.floor(prop.price * 0.7)}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="close-sell">Cerrar</button>
            </div>
        `);

        modal.querySelectorAll('.btn-sell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyId = parseInt(e.target.dataset.id);
                const property = player.properties.find(p => p.id === propertyId);
                
                if (property) {
                    const sellPrice = Math.floor(property.price * 0.7);
                    player.money += sellPrice;
                    
                    // Remover propiedad
                    const index = player.properties.indexOf(property);
                    player.properties.splice(index, 1);
                    
                    this.addToLog(`${player.name} vendió ${property.name} por $${sellPrice}`, 'player');
                    this.updatePlayersList();
                    this.updatePlayerMarkers();
                    
                    // Cerrar modal si no hay más propiedades
                    if (player.properties.length === 0) {
                        this.closeModal();
                    } else {
                        // Actualizar modal
                        this.closeModal();
                        this.handleSellProperty();
                    }
                }
            });
        });

        modal.querySelector('#close-sell').addEventListener('click', () => this.closeModal());
    }

    // Manejar intercambio de propiedad
    handleTradeProperty() {
        alert('Funcionalidad de intercambio en desarrollo');
    }

    // Alternar enfoque
    toggleFocus() {
        this.isFocusEnabled = !this.isFocusEnabled;
        const btn = document.getElementById('focus-toggle');
        
        if (btn) {
            btn.innerHTML = this.isFocusEnabled 
                ? '<i class="fas fa-crosshairs"></i> Enfoque (ON)'
                : '<i class="fas fa-crosshairs"></i> Enfoque (OFF)';
        }
        
        this.updatePlayerMarkers();
    }

    // Mostrar modal del tablero
    showBoardModal() {
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Tablero Completo</h2>
            </div>
            <div class="modal-body">
                <div class="full-board-container">
                    <div class="full-board">
                        ${this.renderBoard()}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="close-board">Cerrar</button>
            </div>
        `, 'modal-xl');

        modal.querySelector('#close-board').addEventListener('click', () => this.closeModal());
        
        // Agregar marcadores al tablero del modal
        setTimeout(() => {
            const board = modal.querySelector('.full-board');
            if (board) {
                // Remover marcadores existentes
                board.querySelectorAll('.player-marker, .ownership-indicator').forEach(el => el.remove());
                
                // Agregar marcadores de jugadores
                gameLogic.gameState.players.forEach((player, playerIndex) => {
                    if (player.isBankrupt) return;

                    const cell = board.querySelector(`#cell-${player.position}`);
                    if (!cell) return;

                    // Crear marcador
                    const marker = document.createElement('div');
                    marker.className = `player-marker`;
                    marker.style.backgroundColor = player.tokenColor;
                    marker.innerHTML = player.tokenSymbol;
                    
                    // Posicionar marcador
                    const offsets = [
                        { top: '5px', left: '5px' },
                        { top: '5px', right: '5px' },
                        { bottom: '5px', left: '5px' },
                        { bottom: '5px', right: '5px' }
                    ];
                    
                    const offset = offsets[playerIndex % offsets.length] || offsets[0];
                    Object.assign(marker.style, offset);
                    
                    cell.appendChild(marker);
                });
            }
        }, 100);
    }

    // Mostrar modal de dados
    showDiceModal() {
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Control de Dados</h2>
            </div>
            <div class="modal-body">
                <div class="dice-controls">
                    <div class="dice-container-large">
                        <div class="dice-large" id="dice1-large">?</div>
                        <div class="dice-large" id="dice2-large">?</div>
                    </div>
                    <div class="dice-result-large" id="dice-result-large">
                        Presiona para lanzar
                    </div>
                    <button class="btn btn-primary btn-lg" id="roll-dice-large">
                        <i class="fas fa-dice"></i> LANZAR DADOS
                    </button>
                    
                    <div class="dice-history">
                        <h4>Historial de Lanzamientos</h4>
                        <div id="history-list">
                            ${this.renderDiceHistory()}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="close-dice">Cerrar</button>
            </div>
        `);

        // Configurar lanzamiento en modal
        modal.querySelector('#roll-dice-large').addEventListener('click', () => {
            const result = gameLogic.rollDice();
            if (!result) return;

            // Animación
            const dice1 = modal.querySelector('#dice1-large');
            const dice2 = modal.querySelector('#dice2-large');
            
            dice1.classList.add('rolling');
            dice2.classList.add('rolling');
            dice1.textContent = '?';
            dice2.textContent = '?';

            setTimeout(() => {
                dice1.classList.remove('rolling');
                dice2.classList.remove('rolling');
                dice1.textContent = result.dice1;
                dice2.textContent = result.dice2;
                
                const resultElement = modal.querySelector('#dice-result-large');
                resultElement.textContent = `Total: ${result.total} (${result.dice1} + ${result.dice2})`;
                
                // Actualizar historial
                this.updateDiceHistory(modal);
            }, 1000);
        });

        modal.querySelector('#close-dice').addEventListener('click', () => this.closeModal());
    }

    // Renderizar historial de dados
    renderDiceHistory() {
        return gameLogic.gameState.diceHistory.map(roll => `
            <div class="history-item">
                <span class="history-player">${roll.player}:</span>
                <span class="history-dice">${roll.dice1}+${roll.dice2}=${roll.total}</span>
                ${roll.isDouble ? '<span class="history-double">¡DOBLES!</span>' : ''}
                <span class="history-time">${roll.timestamp}</span>
            </div>
        `).join('');
    }

    // Actualizar historial de dados
    updateDiceHistory(modal) {
        const historyList = modal.querySelector('#history-list');
        if (historyList) {
            historyList.innerHTML = this.renderDiceHistory();
        }
    }

    // Crear modal
    createModal(content, size = '') {
        // Cerrar modales existentes
        this.closeModal();
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'modal-overlay';
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = `modal ${size}`;
        modal.innerHTML = content;
        
        // Agregar botón de cerrar
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.closeModal());
        
        const header = modal.querySelector('.modal-header');
        if (header) {
            header.appendChild(closeBtn);
        }
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        return modal;
    }

    // Cerrar modal
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Actualizar marcadores de jugadores
    updatePlayerMarkers() {
        const board = document.querySelector('#game-board');
        if (!board) return;

        // Remover marcadores existentes
        board.querySelectorAll('.player-marker, .ownership-indicator').forEach(el => el.remove());

        // Primero agregar indicadores de propiedad
        gameLogic.gameState.players.forEach(player => {
            player.properties.forEach(property => {
                const cell = board.querySelector(`#cell-${property.position}`);
                if (cell) {
                    const indicator = document.createElement('div');
                    indicator.className = 'ownership-indicator';
                    indicator.style.backgroundColor = player.tokenColor;
                    indicator.innerHTML = player.tokenSymbol;
                    
                    // Posicionar indicador
                    const position = property.position;
                    if (position <= 10) {
                        indicator.style.bottom = '2px';
                        indicator.style.left = '2px';
                    } else if (position <= 20) {
                        indicator.style.top = '2px';
                        indicator.style.left = '2px';
                    } else if (position <= 30) {
                        indicator.style.top = '2px';
                        indicator.style.right = '2px';
                    } else {
                        indicator.style.top = '2px';
                        indicator.style.right = '2px';
                    }
                    
                    cell.appendChild(indicator);
                }
            });
        });

        // Luego agregar marcadores de jugadores
        gameLogic.gameState.players.forEach((player, playerIndex) => {
            if (player.isBankrupt) return;

            const cell = board.querySelector(`#cell-${player.position}`);
            if (!cell) return;

            // Crear marcador
            const marker = document.createElement('div');
            marker.className = `player-marker ${playerIndex === gameLogic.gameState.currentPlayerIndex && this.isFocusEnabled ? 'focused' : ''}`;
            marker.style.backgroundColor = player.tokenColor;
            marker.innerHTML = player.tokenSymbol;
            
            // Posicionar marcador basado en la posición en el tablero
            const position = player.position;
            const offsets = [
                { bottom: '5px', right: '5px' },
                { bottom: '5px', left: '5px' },
                { top: '5px', right: '5px' },
                { top: '5px', left: '5px' }
            ];
            
            const offset = offsets[playerIndex % offsets.length] || offsets[0];
            Object.assign(marker.style, offset);
            
            cell.appendChild(marker);
        });
    }

    // Actualizar lista de jugadores
    updatePlayersList() {
        const playersList = document.getElementById('players-list');
        if (playersList) {
            playersList.innerHTML = this.renderPlayersList();
        }
    }

    // Actualizar información del jugador actual
    updateCurrentPlayerInfo() {
        const currentPlayerInfo = document.getElementById('current-player-info');
        if (currentPlayerInfo) {
            currentPlayerInfo.innerHTML = this.renderCurrentPlayerInfo();
        }
    }

    // Agregar al registro
    addToLog(message, type = 'system') {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <div class="log-time">[${timestamp}]</div>
            <div class="log-message">${message}</div>
        `;

        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;

        // Guardar en gameData
        gameLogic.gameState.gameLog.push({ timestamp, message, type });
    }

    // Limpiar registro
    clearLog() {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            logContent.innerHTML = '';
            gameLogic.gameState.gameLog = [];
            this.addToLog('Registro limpiado', 'system');
        }
    }

    // Mostrar resultados
    showResults() {
        const results = gameLogic.getResults();
        window.uiManager.showResultsScreen(results);
    }
}

// Crear instancia global
window.gameManager = new GameManager();
