// === DROP TARGET BANK LOGIK ===

class DropTarget {
    constructor(id, x, y, z) {
        this.id = id;
        this.isUp = true; // Zustand: "aufgestellt"
        
        // Geometrie für das Target (Quader)
        const width = 0.8;
        const height = 1.0;
        const depth = 0.2;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ color: 0xffea00, shininess: 80 }); // Auffälliges Gelb
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.initialY = y + height / 2; // Speichern der Ursprungshöhe, platziert auf dem Boden
        this.mesh.position.set(x, this.initialY, z);
        
        this.body = new CANNON.Body({ mass: 0, material: physicsMaterials.wall }); // mass: 0 macht das Objekt statisch
        this.body.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)));
        this.body.position.copy(this.mesh.position);
        
        this.body.addEventListener("collide", (e) => {
            if (e.body === ballBody) dropTargetBank.onTargetHit(this.id);
        });
        
        createEntity(this.mesh, this.body); // Nutzt deine existierende Funktion aus scene.js
    }

    // Wird aufgerufen, wenn die Kugel das Target trifft
    hit() {
        if (!this.isUp) return false; // Ignorieren, wenn bereits versenkt
        
        this.isUp = false;
        
        // Visuelles und physisches Versenken
        if(this.mesh) this.mesh.position.y -= 1.5; // Unter das Spielfeld schieben
        if(this.body) {
            this.body.position.copy(this.mesh.position);
            this.body.collisionFilterGroup = 0; // Kollisionen komplett deaktivieren
            this.body.collisionFilterMask = 0;
        }
        
        return true;
    }

    // Setzt das Target wieder auf
    reset() {
        if (this.isUp) return;
        
        this.isUp = true;
        
        // Visuelles und physisches Aufstellen
        if(this.mesh) this.mesh.position.y = this.initialY; // Zurück auf Ursprungshöhe
        if(this.body) {
            this.body.position.copy(this.mesh.position);
            this.body.collisionFilterGroup = 1; // Kollisionen wieder aktivieren
            this.body.collisionFilterMask = 1;
        }
    }
}

// Hilfsfunktion für den Score (Aktualisiert die Variablen und das HTML aus config.js / main.js)
function addScore(points) {
    score += points;
    if (scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');
}

class DropTargetBank {
    constructor() {
        // Bank aus exakt 3 Drop Targets erstellen (Positionen nach Bedarf anpassen)
        this.targets = [
            new DropTarget(1, -2.5, 0, -7),
            new DropTarget(2, 0, 0, 3),
            new DropTarget(3, 2.5, 0, 0)
        ];
        
        this.pointsPerHit = 500; // Kleine Punktzahl pro Treffer
        this.bonusPoints = 5000; // Großer Bonus für die ganze Bank
    }

    // Diese Funktion wird z. B. vom Cannon.js Collision-Event aufgerufen
    onTargetHit(targetId) {
        const target = this.targets.find(t => t.id === targetId);
        
        if (target && target.hit()) {
            // Punktestand aktualisieren (setzt voraus, dass du eine Funktion dafür hast, z.B. addScore)
            if (typeof addScore === 'function') addScore(this.pointsPerHit);

            // Bank-Status nach jedem gültigen Treffer prüfen
            this.checkBankStatus();
        }
    }

    checkBankStatus() {
        // Überwachen, ob alle Targets versenkt sind
        const allDown = this.targets.every(t => !t.isUp);
        
        if (allDown) {
            if (typeof addScore === 'function') addScore(this.bonusPoints);

            // Bank automatisch zurücksetzen (mit 500ms Verzögerung für besseres visuelles Feedback)
            setTimeout(() => {
                this.targets.forEach(t => t.reset());
            }, 500);
        }
    }
}

// Globale Initialisierung
let dropTargetBank;

function buildDropTargets() {
    dropTargetBank = new DropTargetBank();
}