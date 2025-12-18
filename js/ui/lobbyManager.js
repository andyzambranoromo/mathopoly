// === GESTIÓN DEL LOBBY ===

class LobbyManager {
    constructor() {
        this.selectedMode = 'local';
        this.playerCount = 2;
        this.players = [];
        this.selectedTokens = new Set();
    }

    // Inicializar lobby
    init() {
        this.renderLobby();
        this.setupEventListeners();
        console.log('Lobby inicializado');
    }

    // Renderizar lobby
    renderLobby() {
        const lobbyScreen = document.getElementById('lobby-screen');
        if (!lobbyScreen) return;

        lobbyScreen.innerHTML = `
            <div class="lobby-container">
                <header class="lobby-header">
                    <div class="logo">
                        <div class="logo-main">MATH-OPOLY</div>
                        <div class="logo-subtitle">El juego de monopolio con desafíos matemáticos</div>
                    </div>
                    <div class="player-count-display">
                        <i class="fas fa-users"></i>
                        <span>Jugadores: <span id="player-count">${this.playerCount}</span>/6</span>
                    </div>
                </header>

                <main class="lobby-main">
                    <div class="mode-selection">
                        <h2>Selecciona Modo de Juego</h2>
                        <div class="mode-options">
                            <div class="mode-card ${this.selectedMode === 'local' ? 'active' : ''}" data-mode="local">
                                <div class="mode-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="mode-title">Modo Local</div>
                                <div class="mode-description">
                                    Juega en un solo dispositivo con amigos o familiares
                                </div>
                            </div>
                            <div class="mode-card ${this.selectedMode === 'online' ? 'active' : ''}" data-mode="online">
                                <div class="mode-icon">
                                    <i class="fas fa-globe"></i>
                                </div>
                                <div class="mode-title">Modo Online</div>
                                <div class="mode-description">
                                    Juega con amigos desde diferentes dispositivos
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="mode-configuration" class="mode-configuration">
                        ${this.selectedMode === 'local' ? this.renderLocalConfig() : this.renderOnlineConfig()}
                    </div>

                    <div class="game-info">
                        <div class="info-item">
                            <i class="fas fa-brain"></i>
                            <span>Desafíos Matemáticos</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-dice"></i>
                            <span>Estrategia + Suerte</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-trophy"></i>
                            <span>Competitivo</span>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.updatePlayerCount();
    }

    // Renderizar configuración local
    renderLocalConfig() {
        return `
            <div class="player-setup">
                <h3>Configuración de Jugadores (2-6 jugadores)</h3>
                
                <div id="player-inputs" class="player-inputs">
                    ${this.renderPlayerInputs()}
                </div>

                <div class="lobby-actions">
                    <button id="add-player" class="btn btn-primary" ${this.playerCount >= 6 ? 'disabled' : ''}>
                        <i class="fas fa-user-plus"></i> Agregar Jugador
                    </button>
                    <button id="add-bot" class="btn btn-warning" ${this.playerCount >= 6 ? 'disabled' : ''}>
                        <i class="fas fa-robot"></i> Agregar Bot
                    </button>
                    <button id="start-game" class="btn btn-success start-btn">
                        <i class="fas fa-play"></i> COMENZAR JUEGO
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar inputs de jugadores
    renderPlayerInputs() {
        let html = '';
        
        // Reiniciar tokens seleccionados
        this.selectedTokens.clear();
        
        for (let i = 0; i < this.playerCount; i++) {
            // Encontrar token disponible
            let availableToken = null;
            for (const token of CONSTANTS.TOKENS) {
                if (!this.selectedTokens.has(token.id)) {
                    availableToken = token;
                    this.selectedTokens.add(token.id);
                    break;
                }
            }
            
            // Si no hay token disponible, usar el primero
            if (!availableToken) {
                availableToken = CONSTANTS.TOKENS[0];
            }
            
            html += `
                <div class="player-input-row" data-index="${i}">
                    <input type="text" 
                           class="player-name-input" 
                           placeholder="Jugador ${i + 1}"
                           value="${i === 0 ? 'Jugador 1' : i === 1 ? 'Jugador 2' : ''}"
                           maxlength="15">
                    
                    <div class="token-selection">
                        ${CONSTANTS.TOKENS.map(t => {
                            const isSelected = t.id === availableToken.id;
                            const isUsed = this.isTokenUsed(t.id, i);
                            return `
                                <div class="token-option ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}" 
                                     data-token="${t.id}"
                                     data-color="${t.color}"
                                     data-symbol="${t.symbol}"
                                     style="background-color: ${t.color}"
                                     ${isUsed ? 'title="Token ya utilizado"' : ''}>
                                    ${t.symbol}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${i >= CONSTANTS.DEFAULT_CONFIG.minPlayers ? `
                        <button class="btn btn-danger btn-sm remove-player" data-index="${i}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
            `;
        }
        return html;
    }

    // Verificar si un token está usado por otro jugador
    isTokenUsed(tokenId, currentIndex) {
        // Para saber si está usado, necesitamos ver los tokens seleccionados en otras filas
        const allTokenOptions = document.querySelectorAll('.token-option.selected');
        for (const option of allTokenOptions) {
            const row = option.closest('.player-input-row');
            if (row) {
                const index = parseInt(row.dataset.index);
                if (index !== currentIndex && option.dataset.token === tokenId) {
                    return true;
                }
            }
        }
        return false;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Selección de modo
        document.addEventListener('click', (e) => {
            const modeCard = e.target.closest('.mode-card');
            if (modeCard) {
                this.selectedMode = modeCard.dataset.mode;
                this.renderLobby();
            }

            // Tokens
            const tokenOption = e.target.closest('.token-option');
            if (tokenOption && !tokenOption.classList.contains('used')) {
                const row = tokenOption.closest('.player-input-row');
                const index = parseInt(row.dataset.index);
                
                // Guardar el token actual seleccionado
                const currentToken = tokenOption.dataset.token;
                
                // Deseleccionar todos los tokens en esta fila
                const allTokensInRow = row.querySelectorAll('.token-option');
                allTokensInRow.forEach(t => t.classList.remove('selected'));
                
                // Seleccionar el nuevo token
                tokenOption.classList.add('selected');
                
                // Actualizar la lista de tokens seleccionados
                this.updateSelectedTokens();
                
                // Forzar re-render para actualizar los estados "used"
                this.updateTokenStates();
            }

            // Eliminar jugador
            const removeBtn = e.target.closest('.remove-player');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removePlayer(index);
            }

            // Agregar jugador humano
            if (e.target.id === 'add-player' || e.target.closest('#add-player')) {
                this.addHumanPlayer();
            }

            // Agregar bot
            if (e.target.id === 'add-bot' || e.target.closest('#add-bot')) {
                this.addBot();
            }

            // Iniciar juego
            if (e.target.id === 'start-game' || e.target.closest('#start-game')) {
                this.startGame();
            }
        });

        // Input de nombres
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('player-name-input')) {
                this.updatePlayerCount();
            }
        });
    }

    // Actualizar lista de tokens seleccionados
    updateSelectedTokens() {
        this.selectedTokens.clear();
        const selectedOptions = document.querySelectorAll('.token-option.selected');
        selectedOptions.forEach(option => {
            this.selectedTokens.add(option.dataset.token);
        });
    }

    // Actualizar estados de tokens
    updateTokenStates() {
        const allTokenOptions = document.querySelectorAll('.token-option');
        const selectedTokens = Array.from(document.querySelectorAll('.token-option.selected'))
            .map(opt => opt.dataset.token);
        
        allTokenOptions.forEach(option => {
            const tokenId = option.dataset.token;
            const isSelected = option.classList.contains('selected');
            
            // Si el token está seleccionado en otra fila y no es el actual, marcarlo como usado
            if (selectedTokens.includes(tokenId) && !isSelected) {
                option.classList.add('used');
            } else {
                option.classList.remove('used');
            }
        });
    }

    // Agregar jugador humano
    addHumanPlayer() {
        if (this.playerCount >= CONSTANTS.DEFAULT_CONFIG.maxPlayers) {
            alert(`Máximo ${CONSTANTS.DEFAULT_CONFIG.maxPlayers} jugadores permitidos`);
            return;
        }

        this.playerCount++;
        this.renderLobby();
        
        // Establecer nombre del nuevo jugador
        const lastInput = document.querySelector('.player-input-row:last-child .player-name-input');
        if (lastInput) {
            lastInput.value = `Jugador ${this.playerCount}`;
            this.updatePlayerCount();
        }
    }

    // Agregar bot
    addBot() {
        if (this.playerCount >= CONSTANTS.DEFAULT_CONFIG.maxPlayers) {
            alert(`Máximo ${CONSTANTS.DEFAULT_CONFIG.maxPlayers} jugadores permitidos`);
            return;
        }

        this.playerCount++;
        
        // Encontrar nombre de bot único
        const existingNames = new Set(
            Array.from(document.querySelectorAll('.player-name-input'))
                .map(input => input.value.trim())
        );
        
        let botName;
        for (const name of CONSTANTS.BOT_NAMES) {
            if (!existingNames.has(name)) {
                botName = name;
                break;
            }
        }
        
        if (!botName) {
            botName = `Bot ${this.playerCount}`;
        }
        
        this.renderLobby();
        
        // Establecer nombre del bot
        const lastInput = document.querySelector('.player-input-row:last-child .player-name-input');
        if (lastInput) {
            lastInput.value = botName;
            this.updatePlayerCount();
        }
    }

    // Eliminar jugador
    removePlayer(index) {
        if (this.playerCount <= CONSTANTS.DEFAULT_CONFIG.minPlayers) {
            alert(`Se necesitan al menos ${CONSTANTS.DEFAULT_CONFIG.minPlayers} jugadores`);
            return;
        }
        
        this.playerCount--;
        this.renderLobby();
    }

    // Actualizar contador de jugadores
    updatePlayerCount() {
        const inputs = document.querySelectorAll('.player-name-input');
        const filledCount = Array.from(inputs).filter(input => input.value.trim()).length;
        
        const countElement = document.getElementById('player-count');
        if (countElement) {
            countElement.textContent = filledCount;
        }
        
        // Actualizar estado de los botones
        const addPlayerBtn = document.getElementById('add-player');
        const addBotBtn = document.getElementById('add-bot');
        
        if (addPlayerBtn) {
            addPlayerBtn.disabled = this.playerCount >= CONSTANTS.DEFAULT_CONFIG.maxPlayers;
        }
        if (addBotBtn) {
            addBotBtn.disabled = this.playerCount >= CONSTANTS.DEFAULT_CONFIG.maxPlayers;
        }
    }

    // Iniciar juego
    startGame() {
        // Recoger datos de jugadores
        this.players = [];
        const playerRows = document.querySelectorAll('.player-input-row');
        
        for (const row of playerRows) {
            const nameInput = row.querySelector('.player-name-input');
            const tokenOption = row.querySelector('.token-option.selected');
            
            if (!nameInput || !tokenOption) {
                alert('Todos los jugadores deben seleccionar un token');
                return;
            }
            
            const name = nameInput.value.trim();
            if (!name) {
                alert('Todos los jugadores deben tener un nombre');
                return;
            }

            // Verificar nombre duplicado
            if (this.players.some(p => p.name === name)) {
                alert(`El nombre "${name}" ya está en uso`);
                return;
            }

            this.players.push({
                name: name,
                token: tokenOption.dataset.token,
                tokenColor: tokenOption.dataset.color,
                tokenSymbol: tokenOption.dataset.symbol,
                isBot: CONSTANTS.BOT_NAMES.some(botName => name === botName) || name.toLowerCase().includes('bot')
            });
        }

        if (this.players.length < CONSTANTS.DEFAULT_CONFIG.minPlayers) {
            alert(`Se necesitan al menos ${CONSTANTS.DEFAULT_CONFIG.minPlayers} jugadores`);
            return;
        }

        console.log('Iniciando juego con jugadores:', this.players);
        
        // Cambiar a pantalla de juego
        window.uiManager.showGameScreen(this.players);
    }
}

// Crear instancia global
window.lobbyManager = new LobbyManager();
