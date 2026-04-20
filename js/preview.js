// === PREVIEW SCENE LOGIK (Ball Detailansicht) ===

function initPreviewScene() {
    const container = document.getElementById('preview-canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    previewScene = new THREE.Scene();
    
    previewCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    previewCamera.position.z = 4.5;

    // Transparenter Background, damit das CSS durchscheint
    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    previewRenderer.setSize(width, height);
    container.appendChild(previewRenderer.domElement);

    // Preview Beleuchtung (etwas dramatischer)
    previewScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.position.set(5, 5, 5);
    previewScene.add(spotLight);

    const backLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    backLight.position.set(-5, -5, -5);
    previewScene.add(backLight);

    // Großer Preview-Ball
    const geo = new THREE.SphereGeometry(1.5, 64, 64);
    previewBallMesh = new THREE.Mesh(geo, ballTypes[currentBallIndex].material);
    previewScene.add(previewBallMesh);

    setupPreviewDragControls();
}

function setupPreviewDragControls() {
    const container = document.getElementById('preview-canvas-container');
    
    container.addEventListener('pointerdown', (e) => {
        previewDrag = true;
        previewAutoRotate = false; // Auto-Rotation stoppen beim Anfassen
        previousMousePos = { x: e.offsetX, y: e.offsetY };
        container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
        if (previewDrag) {
            const deltaMove = {
                x: e.offsetX - previousMousePos.x,
                y: e.offsetY - previousMousePos.y
            };

            // Rotation anwenden (X-Bewegung dreht um Y-Achse, Y-Bewegung dreht um X-Achse)
            previewBallMesh.rotation.y += deltaMove.x * 0.01;
            previewBallMesh.rotation.x += deltaMove.y * 0.01;

            previousMousePos = { x: e.offsetX, y: e.offsetY };
        }
    });

    const stopDrag = (e) => {
        previewDrag = false;
        container.releasePointerCapture(e.pointerId);
        // Auto-Rotation nach kurzer Verzögerung wieder starten
        setTimeout(() => { if(!previewDrag) previewAutoRotate = true; }, 2000);
    };

    container.addEventListener('pointerup', stopDrag);
    container.addEventListener('pointercancel', stopDrag);
}

function generateBallOptionsUI() {
    const container = document.getElementById('ball-options-container');
    container.innerHTML = '';
    
    ballTypes.forEach((ball, index) => {
        const btn = document.createElement('button');
        btn.className = `ball-opt-btn ${index === currentBallIndex ? 'active' : ''}`;
        btn.innerText = ball.name;
        btn.onclick = () => selectBallType(index);
        container.appendChild(btn);
    });
}

function selectBallType(index) {
    currentBallIndex = index;
    const selectedMat = ballTypes[index].material;
    
    // Preview Ball updaten
    previewBallMesh.material = selectedMat;
    
    // Echten Spiel-Ball updaten
    ballMesh.material = selectedMat;

    // UI Buttons aktualisieren
    generateBallOptionsUI();
}

function openBallModal() {
    isModalOpen = true;
    document.getElementById('ball-modal').style.display = 'flex';
    
    // Die Größe des Preview-Containers wird erst nach 'display: flex' korrekt berechnet
    const container = document.getElementById('preview-canvas-container');
    const width = container.clientWidth || 260; // 260 als Fallback entsprechend CSS
    const height = container.clientHeight || 260;
    
    previewCamera.aspect = width / height;
    previewCamera.updateProjectionMatrix();
    previewRenderer.setSize(width, height);
}

function closeBallModal() {
    isModalOpen = false;
    document.getElementById('ball-modal').style.display = 'none';
}

function renderPreviewScene() {
    if (previewAutoRotate) {
        previewBallMesh.rotation.y += 0.005;
        previewBallMesh.rotation.x += 0.002;
    }
    previewRenderer.render(previewScene, previewCamera);
}
