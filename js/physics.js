// === CANNON.JS PHYSICS ENGINE SETUP ===

function initPhysicsWorld() {
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 20;
    world.gravity.set(0, -9.82, 8);

    // Materialien erstellen
    physicsMaterials.default = new CANNON.Material();
    physicsMaterials.ball = new CANNON.Material();
    physicsMaterials.wall = new CANNON.Material();
    physicsMaterials.flipper = new CANNON.Material();
    physicsMaterials.bumper = new CANNON.Material();

    // Kontaktmaterialien definieren
    world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterials.ball, physicsMaterials.wall, { friction: 0.0, restitution: 0.4 }));
    world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterials.ball, physicsMaterials.flipper, { friction: 0.1, restitution: 0.6 }));
    world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterials.ball, physicsMaterials.bumper, { friction: 0.0, restitution: 1.2 }));
}

function stepPhysics() {
    world.step(TIME_STEP);
}
