// === GESTIÓN DEL JUEGO ===

class GameManager {
    constructor() {
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
                    </div>
                </div>
            </div>
        `;

        this.updatePlayerMarkers();
    }

    // Renderizar lista de jugadores
    renderPlayersList() {
        const currentPlayerIndex = gameLogic.gameState.currentPlayerIndex;
        
        return gameLogic.gameState.players.map((player, index) => {
            const isCurrentTurn = index === currentPlayerIndex;
            return `
                <div class="player-card ${isCurrentTurn ? 'active' : ''} 
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
            `;
        }).join('');
    }

    // Obtener estado del jugador
    getPlayerStatus(player) {
        if (player.isBankrupt) return 'En bancarrota';
        if (player.finished) return 'Juego terminado';
        if (player.inJail) return `En cárcel (${player.jailTurns}/3)`;
        return player === gameLogic.getCurrentPlayer() ? 'Es tu turno' : 'Esperando turno';
    }

    // Configurar event listeners
    setupEventListeners() {
        // Lanzar dados
        document.getElementById('roll-dice')?.addEventListener('click', () => this.handleRollDice());
        
        // Vender propiedad
        document.getElementById('sell-property')?.addEventListener('click', () => this.handleSellProperty());
        
        // Volver al lobby
        document.getElementById('back-to-lobby')?.addEventListener('click', () => window.uiManager.showLobbyScreen());
        
        // Limpiar registro
        document.getElementById('clear-log')?.addEventListener('click', () => this.clearLog());
    }

    // Manejar lanzamiento de dados
    handleRollDice() {
        if (this.isProcessingTurn) return;
        
        const currentPlayer = gameLogic.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.isBankrupt || currentPlayer.finished) {
            this.addToLog('No es tu turno o estás en bancarrota', 'system');
            return;
        }
        
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
                this.addToLog(`${currentPlayer.name} sacó dobles!`, 'important');
                gameLogic.gameState.doubleCount++;
                
                // Verificar 3 dobles seguidos
                if (gameLogic.gameState.doubleCount >= 3) {
                    this.addToLog(`${currentPlayer.name} sacó 3 dobles seguidos. ¡A la cárcel!`, 'important');
                    currentPlayer.position = 10;
                    currentPlayer.inJail = true;
                    currentPlayer.jailTurns = 0;
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
                dice.textContent = '🎲';
                dice.style.animation = 'diceRoll 1s ease-in-out, diceBounce 0.5s ease-in-out 3';
            }
        });

        // Cambiar valores durante la animación
        const changeValues = () => {
            diceElements.forEach(dice => {
                if (dice) {
                    dice.textContent = Math.floor(Math.random() * 6) + 1;
                }
            });
        };

        // Cambiar valores 8 veces durante 1 segundo
        let changes = 0;
        const interval = setInterval(() => {
            changeValues();
            changes++;
            if (changes >= 8) {
                clearInterval(interval);
                
                // Mostrar valores finales
                setTimeout(() => {
                    diceElements.forEach((dice, index) => {
                        if (dice) {
                            dice.classList.remove('rolling');
                            dice.textContent = index === 0 ? dice1 : dice2;
                            dice.style.animation = '';
                        }
                    });
                }, 100);
            }
        }, 125); // 125ms * 8 = 1000ms (1 segundo)
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
            setTimeout(() => {
                this.showBuyPropertyModal(property, isDouble);
            }, 1000);
            return;
        }

        // Verificar si es propiedad con dueño
        if (property && !gameLogic.isBuyablePosition(position)) {
            // Pagar alquiler
            setTimeout(() => {
                this.handleRentPayment(property, isDouble);
            }, 1000);
            return;
        }

        // Esquina o impuesto
        this.handleSpecialPosition(position, isDouble);
    }

    // Mostrar modal de compra
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
                const selectedAnswer = parseFloat(e.target.dataset.answer);
                const correctAnswer = parseFloat(problem.answer);
                const isCorrect = Math.abs(selectedAnswer - correctAnswer) < 0.01; // Usar tolerancia para decimales
                
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
            if (player.isBankrupt || player.finished) return;

            const cell = board.querySelector(`#cell-${player.position}`);
            if (!cell) return;

            // Crear marcador
            const marker = document.createElement('div');
            marker.className = `player-marker`;
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

    // Agregar al registro (con scroll limitado)
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
        
        // Limitar a 50 entradas máximo
        const entries = logContent.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
        
        // Scroll automático al final
        logContent.scrollTop = logContent.scrollHeight;
    }

    // Limpiar registro
    clearLog() {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            logContent.innerHTML = '';
            this.addToLog('Registro limpiado', 'system');
        }
    }
}

// Crear instancia global
window.gameManager = new GameManager();
