// === SPIELFELD BAU ===

function buildPlayfield() {
    const floorGeo = new THREE.BoxGeometry(14, 0.2, 22);
    const floorMesh = new THREE.Mesh(floorGeo, materialConfig.board);
    floorMesh.receiveShadow = true;
    floorMesh.position.set(0, -0.1, 0);

    const floorBody = new CANNON.Body({ mass: 0, material: physicsMaterials.default });
    floorBody.addShape(new CANNON.Box(new CANNON.Vec3(7, 0.1, 11)));
    floorBody.position.set(0, -0.1, 0);
    createEntity(floorMesh, floorBody);

    function addWall(x, y, z, w, h, d, angleY = 0) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, materialConfig.wall);
        mesh.position.set(x, y, z);
        mesh.rotation.y = angleY;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const body = new CANNON.Body({ mass: 0, material: physicsMaterials.wall });
        body.addShape(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)));
        body.position.set(x, y, z);
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angleY);
        createEntity(mesh, body);
    }

    addWall(-5, 0.5, 0, 1, 2, 20); // Links
    addWall(6, 0.5, 1.2, 0.5, 2, 17.5);  // Rechts
    addWall(-1, 0.5, -9.5, 9, 2, 1); // Oben
    addWall(4, 0.5, 1.5, 0.5, 2, 17); // Plunger-Trennwand
    addWall(4.5, 0.5, -8.5, 4, 2, 0.5, -Math.PI / 4); // Deflektor
    addWall(-3.8, 0.5, 6.9, 3, 2, 0.5, -Math.PI / 5); // Trichter Links
    addWall(2.8, 0.5, 6.9, 3, 2, 0.5, Math.PI / 5);  // Trichter Rechts
}

// === BUMPER BAU ===
function buildBumpers() {
    const bumperPos = [{ x: -2, z: -4 }, { x: 2, z: -4 }, { x: 0, z: -6 }];
    bumperPos.forEach(pos => {
        const radius = BUMPER_RADIUS;
        const geo = new THREE.CylinderGeometry(radius, radius, 1, 16);
        const mesh = new THREE.Mesh(geo, materialConfig.bumper);
        mesh.position.set(pos.x, 0.5, pos.z);
        mesh.castShadow = true;

        const body = new CANNON.Body({ mass: 0, material: physicsMaterials.bumper });
        body.addShape(new CANNON.Sphere(radius));
        body.position.set(pos.x, 0.5, pos.z);

        body.addEventListener("collide", (e) => {
            score += 100;
            if (scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');
            mesh.scale.set(1.2, 1.2, 1.2);
            setTimeout(() => mesh.scale.set(1, 1, 1), 100);
        });

        createEntity(mesh, body);
    });
}

// === SLINGSHOT BAU ===
function buildSlingshots() {
    const width = 3;
    const height = 1;
    const depth = 0.5;
    // Wand-Form statt Dreieck
    const slingshotGeo = new THREE.BoxGeometry(width, height, depth);

    // Links und rechts direkt über den Flipperfingern
    const positions = [
        { x: -4, z: 6, rotationY: -Math.PI / 3.5 }, // Links
        { x: 3, z: 6, rotationY: Math.PI / 3.5 + Math.PI }  // Rechts
    ];

    positions.forEach(pos => {
        // Nutzen das wall-Material für die Optik, aber behalten die Bumper-Physik für den Kick
        const mesh = new THREE.Mesh(slingshotGeo, materialConfig.bumper);
        mesh.position.set(pos.x, 0.5, pos.z);
        mesh.rotation.y = pos.rotationY;
        mesh.castShadow = true;

        // Statische Body-Box für Cannon.js
        const body = new CANNON.Body({ mass: 0, material: physicsMaterials.bumper });
        body.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)));
        body.position.set(pos.x, 0.5, pos.z);
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), pos.rotationY);

        let lastKickTime = 0;

        body.addEventListener("collide", (e) => {
            const now = Date.now();
            // Glitch-Schutz: 100ms Cooldown für den Kick
            if (now - lastKickTime < 100) return;

            if (e.body === ballBody) {
                lastKickTime = now;

                // Normale des Aufpralls ermitteln
                let impactNormal = new CANNON.Vec3();
                impactNormal.copy(e.contact.ni);

                // ni zeigt von bi nach bj. Wenn bi die Kugel ist, zeigt die Normale zur Schleuder.
                // Wir negieren den Vektor, um die Kugel wegzuschleudern.
                if (e.contact.bi === ballBody) {
                    impactNormal.negate(impactNormal);
                }

                // Kick nur in der X-Z Ebene
                impactNormal.y = 0;
                impactNormal.normalize();

                // Starker Kick über applyImpulse
                const kickStrength = 20;
                const impulse = new CANNON.Vec3(
                    impactNormal.x * kickStrength,
                    0,
                    impactNormal.z * kickStrength
                );

                ballBody.applyImpulse(impulse, ballBody.position);

                // Score und visuelles Feedback
                score += 50;
                if (scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');

                mesh.scale.set(1.2, 1.2, 1.2);
                setTimeout(() => mesh.scale.set(1, 1, 1), 100);
            }
        });

        createEntity(mesh, body);
    });
}

// === FLIPPER BAU ===
function buildFlippers() {
    const width = FLIPPER_WIDTH;
    const height = FLIPPER_HEIGHT;
    const depth = FLIPPER_DEPTH;
    const GAP = 1.5; // Abstand zwischen Flippern

    // Linker Flipper
    const leftGeo = new THREE.BoxGeometry(width, height, depth);
    leftGeo.translate(width / 2, 0, 0);
    leftFlipperMesh = new THREE.Mesh(leftGeo, materialConfig.flipper);
    leftFlipperMesh.castShadow = true;

    leftFlipperBody = new CANNON.Body({ mass: 5, material: physicsMaterials.flipper });
    leftFlipperBody.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)), new CANNON.Vec3(width / 2, 0, 0));
    leftFlipperBody.position.set(-2.3 - GAP / 2, 0.5, 7.5);

    const leftBase = new CANNON.Body({ mass: 0 });
    leftBase.position.set(-2.3 - GAP / 2, 0.5, 7.5);
    world.addBody(leftBase);

    leftHinge = new CANNON.HingeConstraint(leftBase, leftFlipperBody, {
        pivotA: new CANNON.Vec3(0, 0, 0), axisA: new CANNON.Vec3(0, 1, 0),
        pivotB: new CANNON.Vec3(0, 0, 0), axisB: new CANNON.Vec3(0, 1, 0)
    });
    world.addConstraint(leftHinge);
    createEntity(leftFlipperMesh, leftFlipperBody);

    // Rechter Flipper
    const rightGeo = new THREE.BoxGeometry(width, height, depth);
    rightGeo.translate(-width / 2, 0, 0);
    rightFlipperMesh = new THREE.Mesh(rightGeo, materialConfig.flipper);
    rightFlipperMesh.castShadow = true;

    rightFlipperBody = new CANNON.Body({ mass: 5, material: physicsMaterials.flipper });
    rightFlipperBody.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)), new CANNON.Vec3(-width / 2, 0, 0));
    rightFlipperBody.position.set(1.3 + GAP / 2, 0.5, 7.5);

    const rightBase = new CANNON.Body({ mass: 0 });
    rightBase.position.set(1.3 + GAP / 2, 0.5, 7.5);
    world.addBody(rightBase);

    rightHinge = new CANNON.HingeConstraint(rightBase, rightFlipperBody, {
        pivotA: new CANNON.Vec3(0, 0, 0), axisA: new CANNON.Vec3(0, 1, 0),
        pivotB: new CANNON.Vec3(0, 0, 0), axisB: new CANNON.Vec3(0, 1, 0)
    });
    world.addConstraint(rightHinge);
    createEntity(rightFlipperMesh, rightFlipperBody);
}

// === PLUNGER BAU ===
function buildPlunger() {
    plungerMesh = new THREE.Group();

    // Schaft (Zylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 16);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMesh = new THREE.Mesh(shaftGeo, materialConfig.wall);
    shaftMesh.position.set(0, 0, 0.5);
    shaftMesh.castShadow = true;
    plungerMesh.add(shaftMesh);

    // Kopf (dickeres Ende)
    const tipGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
    tipGeo.rotateX(Math.PI / 2);
    const tipMesh = new THREE.Mesh(tipGeo, materialConfig.plunger);
    tipMesh.position.set(0, 0, -0.9);
    tipMesh.castShadow = true;
    plungerMesh.add(tipMesh);

    plungerMesh.position.set(5, 0.5, 8.5);

    plungerBody = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.KINEMATIC,
        material: physicsMaterials.wall
    });
    // Physik-Box passend zum Kopf (Halbe Ausdehnung: 0.35, 0.35, 0.2)
    plungerBody.addShape(new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.2)), new CANNON.Vec3(0, 0, -0.9));
    plungerBody.position.set(5, 0.5, 8.5);

    createEntity(plungerMesh, plungerBody);
}

// === BALL BAU ===
function buildBall() {
    const radius = BALL_RADIUS;
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    ballMesh = new THREE.Mesh(geo, materialConfig.ball);
    ballMesh.castShadow = true;

    ballBody = new CANNON.Body({
        mass: 1,
        material: physicsMaterials.ball,
        linearDamping: 0.1,
        angularDamping: 0.1
    });
    ballBody.addShape(new CANNON.Sphere(radius));

    createEntity(ballMesh, ballBody);
    resetBall();
}

function resetBall() {
    ballBody.position.set(5, 0.4, 7);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);
}

// === FLIPPER LOGIK ===
function updateFlippers() {
    const motorSpeed = 25;
    leftHinge.enableMotor();
    leftHinge.setMotorSpeed(state.leftFlipper ? -motorSpeed : motorSpeed);
    rightHinge.enableMotor();
    rightHinge.setMotorSpeed(state.rightFlipper ? motorSpeed : -motorSpeed);

    // Limits
    const leftEuler = new CANNON.Vec3();
    leftFlipperBody.quaternion.toEuler(leftEuler);
    if (leftEuler.y < -0.5) {
        leftFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.5);
        leftFlipperBody.angularVelocity.set(0, 0, 0);
    } else if (leftEuler.y > 0.3) {
        leftFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.3);
        leftFlipperBody.angularVelocity.set(0, 0, 0);
    }

    const rightEuler = new CANNON.Vec3();
    rightFlipperBody.quaternion.toEuler(rightEuler);
    if (rightEuler.y > 0.5) {
        rightFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0.5);
        rightFlipperBody.angularVelocity.set(0, 0, 0);
    } else if (rightEuler.y < -0.3) {
        rightFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.3);
        rightFlipperBody.angularVelocity.set(0, 0, 0);
    }
}

// === PLUNGER LOGIK ===
function updatePlunger() {
    const newZ = 8.5 + (state.plungerPull * 1.5);
    plungerMesh.position.z = newZ;
    if (plungerBody) {
        plungerBody.position.z = newZ;
    }
}

function firePlunger(powerFactor) {
    if (ballBody.position.x > 4 && ballBody.position.z > 5) {
        const force = 35 + (powerFactor * 50);
        ballBody.applyImpulse(new CANNON.Vec3(0, 0, -force), ballBody.position);
    }
}

// === GAME LOGIC UPDATE ===
function updateGameLogic() {
    if (ballBody.position.z > 12) {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
            gameOver();
        } else {
            resetBall();
        }
    }
}

// === LIVES & GAME OVER ===
function updateLivesDisplay() {
    if (livesElement) {
        livesElement.innerText = lives.toString();
    }
}

function gameOver() {
    // Game Over UI anzeigen und finalen Score setzen
    document.getElementById('final-score').innerText = score.toString().padStart(6, '0');
    document.getElementById('game-over-screen').style.display = 'flex';

    resetBall(); // Kugel sofort an den Start zurücksetzen, damit sie nicht weiter fällt
}

function restartGame() {
    // Werte zurücksetzen
    lives = MAX_LIVES;
    score = 0;
    updateLivesDisplay();
    if (scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');
    resetBall();
    if (typeof dropTargetBank !== 'undefined') dropTargetBank.resetAll();

    // Screen ausblenden und weiterspielen
    document.getElementById('game-over-screen').style.display = 'none';
}
