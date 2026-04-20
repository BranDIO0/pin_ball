// === TEXTURE & BALL CREATION ===

// Funktion zum Erstellen von Ball-Texturen mit Mustern
function createBallTexture(baseColor, pattern = 'stripes') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Basis-Hintergrund
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    
    if (pattern === 'stripes') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 20;
        for (let i = 0; i < 512; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
        }
    } else if (pattern === 'dots') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let y = 40; y < 512; y += 80) {
            for (let x = 40; x < 512; x += 80) {
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (pattern === 'grid') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 15;
        for (let i = 0; i < 512; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
    } else if (pattern === 'spiral') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        for (let i = 0; i < 100; i += 0.5) {
            const angle = i * 0.1;
            const radius = i * 2;
            const x = 256 + Math.cos(angle) * radius;
            const y = 256 + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else if (pattern === 'waves') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 15;
        for (let y = 0; y < 512; y += 30) {
            ctx.beginPath();
            for (let x = 0; x < 512; x += 10) {
                const waveY = y + Math.sin(x * 0.02) * 15;
                if (x === 0) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

// Ball-Typen definieren
function initializeBallTypes() {
    ballTypes = [
        { id: 'chrome', name: 'Chrom', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#ffffff', 'stripes'), shininess: 150, specular: 0xffffff }) },
        { id: 'gold', name: 'Gold', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#ffd700', 'dots'), shininess: 150, specular: 0xffdf00 }) },
        { id: 'neon-green', name: 'Neon-Grün', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#00ff00', 'stripes'), emissive: 0x00aa00, shininess: 100 }) },
        { id: 'neon-pink', name: 'Neon-Pink', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#ff00ff', 'grid'), emissive: 0x880088, shininess: 100 }) },
        { id: 'neon-cyan', name: 'Neon-Cyan', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#00ffff', 'dots'), emissive: 0x008888, shininess: 100 }) },
        { id: 'lava', name: 'Magma', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#ff3300', 'waves'), emissive: 0x550000, shininess: 50, specular: 0xff8800 }) },
        { id: 'electric-blue', name: 'Electric-Blau', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#0080ff', 'spiral'), emissive: 0x0040aa, shininess: 120 }) },
        { id: 'royal-purple', name: 'Royal-Lila', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#8800ff', 'grid'), emissive: 0x4400aa, shininess: 110 }) },
        { id: 'emerald', name: 'Smaragd', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#00cc88', 'dots'), shininess: 140, specular: 0x00ff99 }) },
        { id: 'ruby-red', name: 'Rubin-Rot', material: new THREE.MeshPhongMaterial({ map: createBallTexture('#cc0000', 'waves'), emissive: 0x660000, shininess: 130 }) }
    ];
    
    // Materialien konfigurieren
    materialConfig = {
        board: new THREE.MeshPhongMaterial({ color: 0x11111a, shininess: 10 }),
        wall: new THREE.MeshPhongMaterial({ color: 0x00e5ff, shininess: 50, transparent: true, opacity: 0.8 }),
        flipper: new THREE.MeshPhongMaterial({ color: 0xff007f, shininess: 100 }),
        ball: ballTypes[currentBallIndex].material,
        plunger: new THREE.MeshPhongMaterial({ color: 0xff8800 }),
        bumper: new THREE.MeshPhongMaterial({ color: 0x39ff14, shininess: 100 })
    };
}
