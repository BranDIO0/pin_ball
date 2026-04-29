// === MAIN INITIALIZATION & ANIMATION LOOP ===

function init() {
    document.getElementById('loading').style.display = 'none';
    scoreElement = document.getElementById('score');
    livesElement = document.getElementById('lives');

    // Initialisierungen
    initializeBallTypes();
    initPhysicsWorld();
    initMainScene();

    // Spielfeld bauen
    buildPlayfield();
    buildBumpers();
    buildSlingshots();
    buildFlippers();
    buildPlunger();
    buildBall();
    buildDropTargets();

    // Preview-Szene (Detailansicht) initialisieren
    initPreviewScene();
    generateBallOptionsUI();

    // Input und Events
    setupInput();
    window.addEventListener('resize', onWindowResize);
    
    // Animation Loop starten
    animate();
}

// === HAUPTSCHLEIFE ===
function animate() {
    requestAnimationFrame(animate);

    if (!isModalOpen) {
        // Hauptspiel läuft
        stepPhysics();
        updateFlippers();
        updatePlunger();
        updateGameLogic();
        
        renderMainGame();
    } else {
        // Modal offen - Preview-Szene rendern
        renderPreviewScene();
    }
}

// Initialisierung starten wenn Seite geladen ist
window.addEventListener('load', init);
