// === PUNTO DE ENTRADA PRINCIPAL ===

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Math-opoly cargando...');
    
    // Verificar que todos los módulos estén cargados
    if (!window.CONSTANTS || !window.GAME_DATA || !window.gameLogic || !window.uiManager) {
        console.error('Faltan módulos necesarios');
        showError('Error al cargar el juego. Por favor, recarga la página.');
        return;
    }
    
    try {
        // Inicializar UI
        window.uiManager.init();
        
        // Configurar manejo de errores
        window.addEventListener('error', (event) => {
            console.error('Error no capturado:', event.error);
            showError(`Error: ${event.message}`);
        });
        
        // Configurar recarga de página para desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Modo desarrollo activado');
            
            // Recargar automáticamente en cambios (solo desarrollo)
            const reloadOnChanges = () => {
                const timestamp = new Date().getTime();
                localStorage.setItem('lastReload', timestamp);
            };
            
            window.addEventListener('beforeunload', reloadOnChanges);
        }
        
        console.log('Math-opoly cargado correctamente');
        
    } catch (error) {
        console.error('Error al inicializar el juego:', error);
        showError('Error crítico al iniciar el juego. Por favor, recarga la página.');
    }
});

// Mostrar error
function showError(message) {
    const container = document.getElementById('app-container') || document.body;
    container.innerHTML = `
        <div class="error-screen">
            <div class="error-content">
                <h1>⚠️ Error</h1>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Recargar Página
                </button>
            </div>
        </div>
    `;
}

// Estilos para pantalla de error
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a2a6c, #b21f1f);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    
    .error-content {
        background: rgba(0, 0, 0, 0.8);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 500px;
        width: 90%;
    }
    
    .error-content h1 {
        color: #ffd166;
        margin-bottom: 20px;
        font-size: 2.5rem;
    }
    
    .error-content p {
        color: white;
        margin-bottom: 30px;
        font-size: 1.1rem;
        line-height: 1.6;
    }
`;

document.head.appendChild(errorStyles);
