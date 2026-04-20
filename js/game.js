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
        body.addShape(new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)));
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
    const bumperPos = [{x: -2, z: -4}, {x: 2, z: -4}, {x: 0, z: -6}];
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
            if(scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');
            mesh.scale.set(1.2, 1.2, 1.2);
            setTimeout(() => mesh.scale.set(1, 1, 1), 100);
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
    leftGeo.translate(width/2, 0, 0); 
    leftFlipperMesh = new THREE.Mesh(leftGeo, materialConfig.flipper);
    leftFlipperMesh.castShadow = true;

    leftFlipperBody = new CANNON.Body({ mass: 5, material: physicsMaterials.flipper });
    leftFlipperBody.addShape(new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)), new CANNON.Vec3(width/2, 0, 0));
    leftFlipperBody.position.set(-2.3 - GAP/2, 0.5, 7.5); 
    
    const leftBase = new CANNON.Body({ mass: 0 });
    leftBase.position.set(-2.3 - GAP/2, 0.5, 7.5);
    world.addBody(leftBase);

    leftHinge = new CANNON.HingeConstraint(leftBase, leftFlipperBody, {
        pivotA: new CANNON.Vec3(0,0,0), axisA: new CANNON.Vec3(0,1,0),
        pivotB: new CANNON.Vec3(0,0,0), axisB: new CANNON.Vec3(0,1,0)
    });
    world.addConstraint(leftHinge);
    createEntity(leftFlipperMesh, leftFlipperBody);

    // Rechter Flipper
    const rightGeo = new THREE.BoxGeometry(width, height, depth);
    rightGeo.translate(-width/2, 0, 0);
    rightFlipperMesh = new THREE.Mesh(rightGeo, materialConfig.flipper);
    rightFlipperMesh.castShadow = true;

    rightFlipperBody = new CANNON.Body({ mass: 5, material: physicsMaterials.flipper });
    rightFlipperBody.addShape(new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)), new CANNON.Vec3(-width/2, 0, 0));
    rightFlipperBody.position.set(1.3 + GAP/2, 0.5, 7.5);
    
    const rightBase = new CANNON.Body({ mass: 0 });
    rightBase.position.set(1.3 + GAP/2, 0.5, 7.5);
    world.addBody(rightBase);

    rightHinge = new CANNON.HingeConstraint(rightBase, rightFlipperBody, {
        pivotA: new CANNON.Vec3(0,0,0), axisA: new CANNON.Vec3(0,1,0),
        pivotB: new CANNON.Vec3(0,0,0), axisB: new CANNON.Vec3(0,1,0)
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
        leftFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -0.5); 
        leftFlipperBody.angularVelocity.set(0,0,0); 
    } else if (leftEuler.y > 0.3) { 
        leftFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), 0.3); 
        leftFlipperBody.angularVelocity.set(0,0,0); 
    }

    const rightEuler = new CANNON.Vec3(); 
    rightFlipperBody.quaternion.toEuler(rightEuler);
    if (rightEuler.y > 0.5) { 
        rightFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), 0.5); 
        rightFlipperBody.angularVelocity.set(0,0,0); 
    } else if (rightEuler.y < -0.3) { 
        rightFlipperBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -0.3); 
        rightFlipperBody.angularVelocity.set(0,0,0); 
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
    // Spiel pausieren
    lives = MAX_LIVES;
    score = 0;
    updateLivesDisplay();
    if (scoreElement) scoreElement.innerText = score.toString().padStart(6, '0');
    resetBall();
}
