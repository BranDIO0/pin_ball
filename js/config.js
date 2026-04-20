// === GLOBALE KONFIGURATION ===

// Globale Variablen Hauptspiel
let scene, camera, renderer;
let world;
let ballMesh, ballBody;
let leftFlipperMesh, leftFlipperBody, leftHinge;
let rightFlipperMesh, rightFlipperBody, rightHinge;
let plungerMesh, plungerBody;

let score = 0;
let scoreElement;
let lives = 3;
let livesElement;
const MAX_LIVES = 3;

// Variablen Preview/Detailansicht
let previewScene, previewCamera, previewRenderer, previewBallMesh;
let isModalOpen = false;
let previewDrag = false;
let previousMousePos = { x: 0, y: 0 };
let previewAutoRotate = true;

// Verschiedene Ball-Optionen (Materialien mit Texturen)
let ballTypes = [];
let currentBallIndex = 0;

// Haupt-Materialien
let materialConfig = {};

// Cannon Materialien
let physicsMaterials = {};
const state = { leftFlipper: false, rightFlipper: false, plungerDrag: false, plungerStartY: 0, plungerPull: 0 };
const bodies = [];
const meshes = [];

// === KONSTANTEN ===
const TIME_STEP = 1 / 60;
const FLIPPER_WIDTH = 2.2;
const FLIPPER_HEIGHT = 0.8;
const FLIPPER_DEPTH = 0.3;
const BALL_RADIUS = 0.4;
const BUMPER_RADIUS = 0.8;
