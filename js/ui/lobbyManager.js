// === GESTIÓN DEL LOBBY ===

class LobbyManager {
    constructor() {
        this.selectedMode = 'local';
        this.playerCount = 1; // Cambiado: comienza con 1 jugador
        this.players = [];
        this.selectedTokens = new Set();
        this.availableTokens = new Set(CONSTANTS.TOKENS.map(t => t.id));
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
                        <span>Jugadores: <span id="player-count">${this.playerCount}</span>/4</span>
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
                <h3>Configuración de Jugadores</h3>
                
                <div class="player-count-controls">
                    <div class="form-group">
                        <label>Número de Jugadores (2-4):</label>
                        <div class="count-buttons">
                            ${[2, 3, 4].map(count => `
                                <button class="count-btn ${count === this.playerCount ? 'active' : ''}" 
                                        data-count="${count}">
                                    ${count}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div id="player-inputs" class="player-inputs">
                    ${this.renderPlayerInputs()}
                </div>

                <div class="lobby-actions">
                    <button id="add-bot" class="btn btn-warning" ${this.playerCount >= 4 ? 'disabled' : ''}>
                        <i class="fas fa-robot"></i> Agregar Bot
                    </button>
                    <button id="start-game" class="btn btn-success start-btn">
                        <i class="fas fa-play"></i> COMENZAR JUEGO
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar configuración online
    renderOnlineConfig() {
        return `
            <div class="online-setup">
                <h3>Juego Online</h3>
                <div class="online-options">
                    <div class="online-option" id="create-room">
                        <i class="fas fa-plus-circle"></i>
                        <h4>Crear Sala</h4>
                        <p>Crea una nueva sala y comparte el código</p>
                    </div>
                    <div class="online-option" id="join-room">
                        <i class="fas fa-sign-in-alt"></i>
                        <h4>Unirse a Sala</h4>
                        <p>Ingresa el código de una sala existente</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar inputs de jugadores
    renderPlayerInputs() {
        let html = '';
        
        // Obtener tokens ya seleccionados
        const usedTokens = new Set();
        
        for (let i = 0; i < this.playerCount; i++) {
            // Encontrar token disponible
            let availableToken = null;
            for (const token of CONSTANTS.TOKENS) {
                if (!usedTokens.has(token.id)) {
                    availableToken = token;
                    usedTokens.add(token.id);
                    break;
                }
            }
            
            // Si no hay token disponible, usar el primero
            if (!availableToken) {
                availableToken = CONSTANTS.TOKENS[0];
            }
            
            this.selectedTokens.add(availableToken.id);
            
            html += `
                <div class="player-input-row" data-index="${i}">
                    <input type="text" 
                           class="player-name-input" 
                           placeholder="Jugador ${i + 1}"
                           value="${i === 0 ? 'Jugador 1' : ''}"
                           maxlength="15">
                    
                    <div class="token-selection">
                        ${CONSTANTS.TOKENS.map(t => {
                            const isSelected = t.id === availableToken.id;
                            const isUsed = usedTokens.has(t.id) && !isSelected;
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

    // Configurar event listeners
    setupEventListeners() {
        // Selección de modo
        document.addEventListener('click', (e) => {
            const modeCard = e.target.closest('.mode-card');
            if (modeCard) {
                this.selectedMode = modeCard.dataset.mode;
                this.renderLobby();
            }

            // Botones de cantidad
            const countBtn = e.target.closest('.count-btn');
            if (countBtn) {
                this.playerCount = parseInt(countBtn.dataset.count);
                this.renderLobby();
            }

            // Tokens
            const tokenOption = e.target.closest('.token-option');
            if (tokenOption && !tokenOption.classList.contains('used')) {
                const row = tokenOption.closest('.player-input-row');
                const index = parseInt(row.dataset.index);
                const oldToken = row.querySelector('.token-option.selected');
                
                if (oldToken) {
                    oldToken.classList.remove('selected');
                    this.selectedTokens.delete(oldToken.dataset.token);
                }
                
                tokenOption.classList.add('selected');
                this.selectedTokens.add(tokenOption.dataset.token);
            }

            // Eliminar jugador
            const removeBtn = e.target.closest('.remove-player');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removePlayer(index);
            }

            // Agregar bot
            if (e.target.id === 'add-bot' || e.target.closest('#add-bot')) {
                this.addBot();
            }

            // Iniciar juego
            if (e.target.id === 'start-game' || e.target.closest('#start-game')) {
                this.startGame();
            }

            // Crear sala
            if (e.target.id === 'create-room' || e.target.closest('#create-room')) {
                this.showCreateRoom();
            }

            // Unirse a sala
            if (e.target.id === 'join-room' || e.target.closest('#join-room')) {
                this.showJoinRoom();
            }
        });

        // Input de nombres
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('player-name-input')) {
                this.updatePlayerCount();
            }
        });
    }

    // Actualizar contador de jugadores
    updatePlayerCount() {
        const inputs = document.querySelectorAll('.player-name-input');
        const filledCount = Array.from(inputs).filter(input => input.value.trim()).length;
        
        const countElement = document.getElementById('player-count');
        if (countElement) {
            countElement.textContent = filledCount;
        }
        
        // Actualizar estado del botón de agregar bot
        const addBotBtn = document.getElementById('add-bot');
        if (addBotBtn) {
            addBotBtn.disabled = this.playerCount >= CONSTANTS.DEFAULT_CONFIG.maxPlayers;
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

    // Iniciar juego
    startGame() {
        // Recoger datos de jugadores
        this.players = [];
        const playerRows = document.querySelectorAll('.player-input-row');
        
        for (const row of playerRows) {
            const nameInput = row.querySelector('.player-name-input');
            const tokenOption = row.querySelector('.token-option.selected');
            
            if (!nameInput || !tokenOption) continue;
            
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

    // Mostrar crear sala (placeholder)
    showCreateRoom() {
        alert('Funcionalidad de crear sala en desarrollo');
    }

    // Mostrar unirse a sala (placeholder)
    showJoinRoom() {
        alert('Funcionalidad de unirse a sala en desarrollo');
    }
}

// Crear instancia global
window.lobbyManager = new LobbyManager();
