// === GESTOR PRINCIPAL DE UI ===

class UIManager {
    constructor() {
        this.currentScreen = 'lobby';
    }

    // Inicializar UI
    init() {
        console.log('Inicializando Math-opoly UI...');
        
        // Mostrar pantalla de lobby
        this.showLobbyScreen();
        
        // Configurar navegación global
        this.setupGlobalNavigation();
        
        console.log('UI inicializada');
    }

    // Mostrar pantalla de lobby
    showLobbyScreen() {
        this.hideAllScreens();
        document.getElementById('lobby-screen').classList.add('active');
        this.currentScreen = 'lobby';
        
        // Inicializar lobby manager
        if (window.lobbyManager) {
            window.lobbyManager.init();
        }
    }

    // Mostrar pantalla de juego
    showGameScreen(players) {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        this.currentScreen = 'game';
        
        // Inicializar game manager
        if (window.gameManager) {
            window.gameManager.init(players);
        }
    }

    // Mostrar pantalla de resultados
    showResultsScreen(results) {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');
        this.currentScreen = 'results';
        
        // Renderizar resultados
        this.renderResults(results);
    }

    // Ocultar todas las pantallas
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    // Configurar navegación global
    setupGlobalNavigation() {
        // Botón de ayuda
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
            
            if (e.key === 'Escape' && this.currentScreen === 'game') {
                this.showPauseMenu();
            }
        });
    }

    // Mostrar ayuda
    showHelp() {
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Ayuda de Math-opoly</h2>
            </div>
            <div class="modal-body">
                <div class="help-content">
                    <h3>🎮 Cómo Jugar</h3>
                    <p><strong>1.</strong> Selecciona el modo de juego (Local u Online)</p>
                    <p><strong>2.</strong> Configura los jugadores (2-8 jugadores)</p>
                    <p><strong>3.</strong> Lanza los dados para moverte por el tablero</p>
                    <p><strong>4.</strong> Resuelve problemas matemáticos para comprar propiedades</p>
                    <p><strong>5.</strong> Cobra alquiler cuando otros caigan en tus propiedades</p>
                    <p><strong>6.</strong> El último jugador con dinero gana</p>
                    
                    <h3>🎯 Controles</h3>
                    <p><strong>Espacio / Click:</strong> Lanzar dados</p>
                    <p><strong>Enter:</strong> Terminar turno</p>
                    <p><strong>F1:</strong> Mostrar ayuda</p>
                    <p><strong>ESC:</strong> Menú de pausa</p>
                    
                    <h3>💰 Reglas</h3>
                    <p>• Cada jugador comienza con $1500</p>
                    <p>• Al pasar por SALIDA recibes $200</p>
                    <p>• Si sacas dobles, vuelves a lanzar</p>
                    <p>• 3 dobles seguidos = ¡A la cárcel!</p>
                    <p>• 3 vueltas completas = Juego terminado</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="close-help">Cerrar</button>
            </div>
        `);

        modal.querySelector('#close-help').addEventListener('click', () => this.closeModal());
    }

    // Mostrar menú de pausa
    showPauseMenu() {
        const modal = this.createModal(`
            <div class="modal-header">
                <h2 class="modal-title">Juego en Pausa</h2>
            </div>
            <div class="modal-body">
                <div class="pause-menu">
                    <button class="btn btn-primary btn-block" id="resume-game">
                        <i class="fas fa-play"></i> Continuar Juego
                    </button>
                    <button class="btn btn-warning btn-block" id="restart-game">
                        <i class="fas fa-redo"></i> Reiniciar Juego
                    </button>
                    <button class="btn btn-danger btn-block" id="quit-to-lobby">
                        <i class="fas fa-home"></i> Salir al Lobby
                    </button>
                </div>
            </div>
        `);

        modal.querySelector('#resume-game').addEventListener('click', () => this.closeModal());
        modal.querySelector('#restart-game').addEventListener('click', () => {
            this.closeModal();
            this.restartGame();
        });
        modal.querySelector('#quit-to-lobby').addEventListener('click', () => {
            this.closeModal();
            this.showLobbyScreen();
        });
    }

    // Reiniciar juego
    restartGame() {
        if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
            // Obtener jugadores actuales
            const currentPlayers = gameLogic.gameState.players.map(p => ({
                name: p.name,
                token: p.token,
                tokenColor: p.tokenColor,
                tokenSymbol: p.tokenSymbol,
                isBot: p.isBot
            }));
            
            // Reiniciar y volver a empezar
            this.showGameScreen(currentPlayers);
        }
    }

    // Renderizar resultados
    renderResults(results) {
        const resultsScreen = document.getElementById('results-screen');
        if (!resultsScreen) return;

        resultsScreen.innerHTML = `
            <div class="results-container">
                <div class="results-header">
                    <h1 class="logo">RESULTADOS FINALES</h1>
                    <p class="results-subtitle">El juego ha terminado</p>
                </div>
                
                <div class="podium-container" id="podium-container">
                    ${this.renderPodium(results)}
                </div>
                
                <div class="results-summary">
                    ${this.renderSummary(results)}
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary btn-lg" id="play-again">
                        <i class="fas fa-redo"></i> JUGAR DE NUEVO
                    </button>
                    <button class="btn btn-secondary btn-lg" id="back-to-lobby-results">
                        <i class="fas fa-home"></i> VOLVER AL LOBBY
                    </button>
                </div>
            </div>
        `;

        // Configurar event listeners
        document.getElementById('play-again').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('back-to-lobby-results').addEventListener('click', () => {
            this.showLobbyScreen();
        });
    }

    // Renderizar podio
    renderPodium(results) {
        const top3 = results.slice(0, 3);
        
        return top3.map((player, index) => `
            <div class="podium-place podium-${index + 1}">
                <div class="place-number">${index + 1}</div>
                <div class="winner-avatar" style="background-color: ${player.tokenColor}">
                    ${player.tokenSymbol}
                </div>
                <div class="winner-name">${player.name}</div>
                <div class="winner-money">$${player.money}</div>
                <div class="winner-stats">
                    <span><i class="fas fa-home"></i> ${player.properties.length}</span>
                    <span><i class="fas fa-train"></i> ${player.railroads.length}</span>
                </div>
            </div>
        `).join('');
    }

    // Renderizar resumen
    renderSummary(results) {
        const totalMoney = results.reduce((sum, player) => sum + player.money, 0);
        const totalProperties = results.reduce((sum, player) => sum + player.properties.length, 0);
        
        return `
            <div class="summary-card">
                <h3>Estadísticas del Juego</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <div class="stat-value">${results.length}</div>
                            <div class="stat-label">Jugadores</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <div class="stat-value">$${totalMoney}</div>
                            <div class="stat-label">Dinero Total</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <div class="stat-value">${totalProperties}</div>
                            <div class="stat-label">Propiedades</div>
                        </div>
                    </div>
                </div>
                
                <div class="players-ranking">
                    <h4>Clasificación Completa</h4>
                    ${results.map((player, index) => `
                        <div class="ranking-item ${index < 3 ? 'top-3' : ''}">
                            <span class="rank">${index + 1}.</span>
                            <span class="player-name">${player.name}</span>
                            <span class="player-money">$${player.money}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Crear modal (método auxiliar)
    createModal(content) {
        // Cerrar modales existentes
        this.closeModal();
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'global-modal-overlay';
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal';
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
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Crear instancia global
window.uiManager = new UIManager();
