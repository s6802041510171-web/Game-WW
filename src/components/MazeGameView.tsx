import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { 
  Shield, Heart, Clock, AlertTriangle, CheckCircle2, XCircle, 
  Terminal, Lock, ArrowRight, RotateCcw, Zap, Sparkles, 
  Key, Radar, HeartHandshake, ShieldAlert, Cpu, Cable, Coffee, 
  Disc, Trash2, Box, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Unlock, Award, PackageCheck, HelpCircle, Navigation, Camera
} from 'lucide-react';
import { Question, GameDifficulty, AnswerLog, InventoryItem, Chest, ZoneNumber, MazeGrid } from '../types';
import { getMazeForZone } from '../data/mazeData';
import { QUESTION_BANK } from '../data/questions';
import { playCorrectSound, playWrongSound, playHeartbeat, playAlarmGlitch } from '../utils/sound';

interface MazeGameViewProps {
  difficulty: GameDifficulty;
  hp: number;
  score: number;
  hintsLeft: number;
  onUpdateHp: (newHp: number) => void;
  onUpdateScore: (deltaScore: number) => void;
  onUseHint: () => void;
  onAnswerLog: (log: AnswerLog) => void;
  onEndGame: (reason: 'cleared' | 'hp_zero') => void;
  onAbortGame: () => void;
}

export const MazeGameView: React.FC<MazeGameViewProps> = ({
  difficulty,
  hp,
  score,
  hintsLeft,
  onUpdateHp,
  onUpdateScore,
  onUseHint,
  onAnswerLog,
  onEndGame,
  onAbortGame
}) => {
  const [currentZone, setCurrentZone] = useState<ZoneNumber>(1);
  const [maze, setMaze] = useState<MazeGrid>(() => getMazeForZone(1));
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(() => getMazeForZone(1).startPos);
  
  // Camera View Mode: 3D Third Person or 3D First Person
  const [cameraMode, setCameraMode] = useState<'3D_TPV' | '3D_FPV' | '2D_TACTICAL'>('3D_TPV');

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeChest, setActiveChest] = useState<Chest | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Question Modal State
  const initialTime = difficulty === 'hardcore' ? 45 : 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsEarnedThisTurn, setPointsEarnedThisTurn] = useState(0);
  const [lootModalItem, setLootModalItem] = useState<InventoryItem | null>(null);
  const [zoneMessage, setZoneMessage] = useState<string | null>('BREACH STARTED: ENTERING ZONE 1 (USE WASD / ARROW KEYS)');

  // Scanner Drone Fog of War Status
  const [isFullMapRevealed, setIsFullMapRevealed] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshRef = useRef<THREE.Group | null>(null);
  const chestsGroupRef = useRef<THREE.Group | null>(null);
  const exitPortalRef = useRef<THREE.Group | null>(null);

  // Keyboard active key state for smooth continuous movement
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Keys collected count
  const keycardsCollected = inventory.filter(i => i.type === 'keycard' || i.type === 'token').length;
  const gateUnlocked = keycardsCollected >= maze.requiredKeys;

  // References for continuous 3D world physics & controls
  const playerWorldPosRef = useRef<{ x: number; z: number }>({ x: maze.startPos.x * 3, z: maze.startPos.y * 3 });
  const playerYawRef = useRef<number>(0);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const activeChestRef = useRef<Chest | null>(null);
  const hpRef = useRef<number>(hp);
  const currentGridPosRef = useRef<{ x: number; y: number }>(maze.startPos);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync state refs for animation loop
  useEffect(() => {
    activeChestRef.current = activeChest;
  }, [activeChest]);

  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);

  // Reset 3D position when zone changes
  useEffect(() => {
    const newMaze = getMazeForZone(currentZone);
    setMaze(newMaze);
    setPlayerPos(newMaze.startPos);
    currentGridPosRef.current = newMaze.startPos;
    playerWorldPosRef.current = { x: newMaze.startPos.x * 3, z: newMaze.startPos.y * 3 };
    playerYawRef.current = 0;
    setZoneMessage(`HORROR ZONE ${currentZone} INITIALIZED: SURVIVE THE DARK NIGHTMARE MAZE`);
    const t = setTimeout(() => setZoneMessage(null), 3500);
    return () => clearTimeout(t);
  }, [currentZone]);

  // Question Timer
  useEffect(() => {
    if (!activeQuestion || isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleQuestionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestion, isSubmitted]);

  // Global Keyboard Controls (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      keysDownRef.current[e.key] = true;
      keysDownRef.current[e.key.toLowerCase()] = true;
      keysDownRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.key] = false;
      keysDownRef.current[e.key.toLowerCase()] = false;
      keysDownRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper procedural Horror Textures
  const createHorrorWallTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark gothic nightmare stone
      ctx.fillStyle = '#0f0a12';
      ctx.fillRect(0, 0, 512, 512);

      const rows = 16;
      const cols = 8;
      const rh = 512 / rows;
      const cw = 512 / cols;

      for (let r = 0; r < rows; r++) {
        const offsetX = (r % 2) * (cw / 2);
        for (let c = -1; c <= cols; c++) {
          const x = c * cw + offsetX;
          const y = r * rh;
          ctx.fillStyle = (r + c) % 3 === 0 ? '#180f1d' : (r % 2 === 0) ? '#120a16' : '#1e1124';
          ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);

          ctx.strokeStyle = '#060308';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, cw, rh);
        }
      }

      // Glowing horror red runes and blood cracks
      ctx.shadowColor = '#ff1133';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;

      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        let cx = (i * 70 + 30) % 512;
        let cy = (i * 90 + 40) % 512;
        ctx.moveTo(cx, cy);
        for (let j = 0; j < 4; j++) {
          cx += (Math.random() - 0.5) * 50;
          cy += (Math.random() - 0.5) * 50;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, []);

  const createHorrorFloorTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a050a';
      ctx.fillRect(0, 0, 512, 512);

      // Cobblestone grid
      ctx.strokeStyle = '#1a0b18';
      ctx.lineWidth = 4;
      const step = 64;
      for (let i = 0; i <= 512; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Blood stain splashes
      for (let i = 0; i < 18; i++) {
        const bx = (i * 37) % 512;
        const by = (i * 59) % 512;
        const rad = 6 + (i % 5) * 4;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  // Construct Cyber-Horror Anime Boy Character
  const createAnimeBoyCharacter = useCallback(() => {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfce0d1, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
    const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x141419, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x9a8c77, roughness: 0.7 });
    const shoeBaseMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 });

    // 1. Head & Glowing Visor
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.62;
    group.add(headMesh);

    // Visor with glowing crimson horror eyes
    const visorGeo = new THREE.BoxGeometry(0.36, 0.1, 0.12);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.65, 0.26);
    group.add(visorMesh);

    // Spiky Hair
    for (let i = 0; i < 14; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.1, 0.28, 4);
      const spike = new THREE.Mesh(spikeGeo, hairMat);
      const angle = (i / 14) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.22, 1.76 + (i % 2) * 0.05, Math.sin(angle) * 0.22);
      spike.rotation.x = Math.sin(angle) * 0.4;
      spike.rotation.z = -Math.cos(angle) * 0.4;
      group.add(spike);
    }
    const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 12), hairMat);
    topHair.position.set(0, 1.72, -0.02);
    group.add(topHair);

    // 2. Torso - Shirt + Black Horror Hoodie
    const shirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.7, 12), shirtMat);
    shirtMesh.position.y = 1.05;
    group.add(shirtMesh);

    const hoodieMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.3, 0.75, 12, 1, true, 0.5, Math.PI * 1.6),
      hoodieMat
    );
    hoodieMesh.position.y = 1.05;
    hoodieMesh.rotation.y = Math.PI * 0.2;
    group.add(hoodieMesh);

    // Crimson Drawstrings
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const strL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), stringMat);
    strL.position.set(-0.08, 1.22, 0.28);
    const strR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), stringMat);
    strR.position.set(0.08, 1.22, 0.28);
    group.add(strL);
    group.add(strR);

    // 3. Arms & Hands
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
    const leftArm = new THREE.Mesh(armGeo, hoodieMat);
    leftArm.position.set(-0.38, 1.05, 0);
    leftArm.rotation.z = 0.15;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, hoodieMat);
    rightArm.position.set(0.38, 1.05, 0);
    rightArm.rotation.z = -0.15;
    group.add(rightArm);

    const handGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(-0.43, 0.7, 0);
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0.43, 0.7, 0);
    group.add(rightHand);

    // 4. Cargo Pants & Sneakers
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.7, 8), pantsMat);
    leftLeg.position.set(-0.16, 0.42, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.7, 8), pantsMat);
    rightLeg.position.set(0.16, 0.42, 0);
    group.add(rightLeg);

    const shoeGeo = new THREE.BoxGeometry(0.15, 0.12, 0.3);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeBaseMat);
    leftShoe.position.set(-0.16, 0.08, 0.04);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeBaseMat);
    rightShoe.position.set(0.16, 0.08, 0.04);
    group.add(rightShoe);

    // Crimson Flashlight / Aura Light attached to character
    const playerAura = new THREE.PointLight(0xef4444, 3, 8);
    playerAura.position.set(0, 1.6, 0.5);
    group.add(playerAura);

    return group;
  }, []);

  // -------------------------------------------------------------
  // THREE.JS 3D ENVIRONMENT SETUP & CONTINUOUS ANIMATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current || cameraMode === '2D_TACTICAL') return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene setup with spooky horror fog and darkness
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060205);
    scene.fog = new THREE.FogExp2(0x0c0307, 0.055);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Atmospheric Horror Lighting
    const ambientLight = new THREE.AmbientLight(0x441525, 0.7);
    scene.add(ambientLight);

    const horrorLight = new THREE.DirectionalLight(0x7f1d1d, 1.2);
    horrorLight.position.set(10, 25, 10);
    horrorLight.castShadow = true;
    scene.add(horrorLight);

    // 5. Build 3D Horror Stone Maze World
    const TILE_SIZE = 3;
    const WALL_HEIGHT = 2.8;

    const wallTex = createHorrorWallTexture();
    const floorTex = createHorrorFloorTexture();

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.8,
      metalness: 0.2
    });

    const wallCapMaterial = new THREE.MeshStandardMaterial({
      color: 0x3f0f18,
      roughness: 0.7
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.9
    });

    // Build Walls, Floor & Flickering Horror Sconces
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const posX = x * TILE_SIZE;
        const posZ = y * TILE_SIZE;

        if (maze.grid[y][x] === 1) {
          // Dark Horror Wall
          const wallGeo = new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT, TILE_SIZE);
          const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
          wallMesh.position.set(posX, WALL_HEIGHT / 2, posZ);
          wallMesh.castShadow = true;
          wallMesh.receiveShadow = true;
          scene.add(wallMesh);

          // Top Wall Trim Cap
          const capGeo = new THREE.BoxGeometry(TILE_SIZE * 1.02, 0.12, TILE_SIZE * 1.02);
          const capMesh = new THREE.Mesh(capGeo, wallCapMaterial);
          capMesh.position.set(posX, WALL_HEIGHT + 0.06, posZ);
          scene.add(capMesh);
        } else {
          // Cobblestone Blood Floor
          const floorGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
          const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
          floorMesh.rotation.x = -Math.PI / 2;
          floorMesh.position.set(posX, 0, posZ);
          floorMesh.receiveShadow = true;
          scene.add(floorMesh);

          // Random horror flickering torches along passages
          if ((x * 7 + y * 13) % 9 === 0) {
            const torchLight = new THREE.PointLight(0xff3311, 1.8, 6);
            torchLight.position.set(posX, 2.2, posZ);
            scene.add(torchLight);
          }
        }
      }
    }

    // 6. Player Anime Boy 3D Character
    const playerGroup = createAnimeBoyCharacter();
    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    // 7. Render 3D Horror Treasure Chests
    const chestsGroup = new THREE.Group();
    maze.chests.forEach((chest) => {
      const chestGroup = new THREE.Group();
      chestGroup.name = `chest-${chest.id}`;
      chestGroup.position.set(chest.x * TILE_SIZE, 0.4, chest.y * TILE_SIZE);

      const boxGeo = new THREE.BoxGeometry(1.2, 0.8, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: chest.isOpened ? 0x444444 : 0xd97706,
        metalness: 0.8,
        roughness: 0.3
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.castShadow = true;
      chestGroup.add(boxMesh);

      if (!chest.isOpened) {
        const ringGeo = new THREE.TorusGeometry(0.75, 0.06, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.45;
        chestGroup.add(ringMesh);

        const chestLight = new THREE.PointLight(0xef4444, 2.5, 5);
        chestLight.position.y = 1.0;
        chestGroup.add(chestLight);
      }

      chestsGroup.add(chestGroup);
    });
    scene.add(chestsGroup);
    chestsGroupRef.current = chestsGroup;

    // 8. Exit Gate Portal
    const exitGroup = new THREE.Group();
    exitGroup.position.set(maze.exitPos.x * TILE_SIZE, 0, maze.exitPos.y * TILE_SIZE);

    const arcGeo = new THREE.TorusGeometry(1.4, 0.18, 8, 32, Math.PI);
    const arcMat = new THREE.MeshStandardMaterial({
      color: gateUnlocked ? 0x10b981 : 0xef4444,
      metalness: 0.9,
      roughness: 0.1
    });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.position.y = 1.4;
    exitGroup.add(arcMesh);

    const portalLight = new THREE.PointLight(gateUnlocked ? 0x10b981 : 0xef4444, 3, 8);
    portalLight.position.y = 1.5;
    exitGroup.add(portalLight);

    scene.add(exitGroup);
    exitPortalRef.current = exitGroup;

    // Helper continuous wall collision checker (Circle vs Box)
    const checkWallCollision = (px: number, pz: number, radius: number) => {
      const gridX = Math.floor((px + TILE_SIZE / 2) / TILE_SIZE);
      const gridY = Math.floor((pz + TILE_SIZE / 2) / TILE_SIZE);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx = gridX + dx;
          const cy = gridY + dy;

          if (cy < 0 || cy >= maze.height || cx < 0 || cx >= maze.width || maze.grid[cy][cx] === 1) {
            const minX = cx * TILE_SIZE - TILE_SIZE / 2;
            const maxX = cx * TILE_SIZE + TILE_SIZE / 2;
            const minZ = cy * TILE_SIZE - TILE_SIZE / 2;
            const maxZ = cy * TILE_SIZE + TILE_SIZE / 2;

            const closestX = Math.max(minX, Math.min(px, maxX));
            const closestZ = Math.max(minZ, Math.min(pz, maxZ));

            const distX = px - closestX;
            const distZ = pz - closestZ;
            if (distX * distX + distZ * distZ < radius * radius) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // Continuous Frame Loop for 60fps smooth physics movement & mouse look
    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Animate Chests hovering
      if (chestsGroupRef.current) {
        chestsGroupRef.current.children.forEach((c) => {
          c.position.y = 0.4 + Math.sin(now * 0.003) * 0.08;
          c.rotation.y = now * 0.001;
        });
      }

      // Continuous Movement & Physics processing (only if not in chest modal and alive)
      if (!activeChestRef.current && hpRef.current > 0) {
        const keys = keysDownRef.current;
        const turnSpeed = 2.4; // rad per sec
        const moveSpeed = 6.2; // units per sec

        // Rotate turning with A/D or ArrowLeft/ArrowRight
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
          playerYawRef.current += turnSpeed * delta;
        }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) {
          playerYawRef.current -= turnSpeed * delta;
        }

        // Forward / Backward movement with W/S or ArrowUp/ArrowDown
        let forwardInput = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) forwardInput += 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) forwardInput -= 1;

        if (forwardInput !== 0) {
          const moveDist = forwardInput * moveSpeed * delta;
          const dx = Math.sin(playerYawRef.current) * moveDist;
          const dz = Math.cos(playerYawRef.current) * moveDist;

          const radius = 0.55;
          const currX = playerWorldPosRef.current.x;
          const currZ = playerWorldPosRef.current.z;

          // Slide along X
          const nextX = currX + dx;
          if (!checkWallCollision(nextX, currZ, radius)) {
            playerWorldPosRef.current.x = nextX;
          }

          // Slide along Z
          const nextZ = currZ + dz;
          if (!checkWallCollision(playerWorldPosRef.current.x, nextZ, radius)) {
            playerWorldPosRef.current.z = nextZ;
          }

          // Sync Discrete Grid Position for Radar HUD
          const gridX = Math.round(playerWorldPosRef.current.x / TILE_SIZE);
          const gridY = Math.round(playerWorldPosRef.current.z / TILE_SIZE);

          if (gridX !== currentGridPosRef.current.x || gridY !== currentGridPosRef.current.y) {
            currentGridPosRef.current = { x: gridX, y: gridY };
            setPlayerPos({ x: gridX, y: gridY });
          }

          // Check Chest Proximity
          maze.chests.forEach((c) => {
            if (!c.isOpened) {
              const chestX = c.x * TILE_SIZE;
              const chestZ = c.y * TILE_SIZE;
              const dist = Math.hypot(playerWorldPosRef.current.x - chestX, playerWorldPosRef.current.z - chestZ);
              if (dist < 1.3) {
                const q = QUESTION_BANK.find(question => question.id === c.questionId);
                if (q) {
                  // Clear active keys & trigger chest question
                  keysDownRef.current = {};
                  setActiveChest(c);
                  setActiveQuestion(q);
                  setSelectedOption(null);
                  setIsSubmitted(false);
                  setIsCorrect(null);
                  setTimeLeft(initialTime);
                }
              }
            }
          });

          // Check Exit Gate Proximity
          const exitX = maze.exitPos.x * TILE_SIZE;
          const exitZ = maze.exitPos.y * TILE_SIZE;
          const distExit = Math.hypot(playerWorldPosRef.current.x - exitX, playerWorldPosRef.current.z - exitZ);
          if (distExit < 1.3) {
            if (gateUnlocked) {
              if (currentZone < 3) {
                const nextZone = (currentZone + 1) as ZoneNumber;
                setCurrentZone(nextZone);
                onUpdateScore(300);
              } else {
                onEndGame('cleared');
              }
            }
          }
        }
      }

      // Update 3D Character Mesh transform
      if (playerMeshRef.current) {
        playerMeshRef.current.position.x = playerWorldPosRef.current.x;
        playerMeshRef.current.position.z = playerWorldPosRef.current.z;
        playerMeshRef.current.rotation.y = playerYawRef.current;
      }

      // Update Camera Position: ALWAYS LOCKED DIRECTLY BEHIND PLAYER LOOKING FORWARD
      if (cameraRef.current) {
        const camDist = 4.2;
        const camHeight = 2.4;
        const lookHeight = 1.3;

        const px = playerWorldPosRef.current.x;
        const pz = playerWorldPosRef.current.z;
        const yaw = playerYawRef.current;

        cameraRef.current.position.x = px - Math.sin(yaw) * camDist;
        cameraRef.current.position.z = pz - Math.cos(yaw) * camDist;
        cameraRef.current.position.y = camHeight;

        cameraRef.current.lookAt(
          px + Math.sin(yaw) * 2.5,
          lookHeight,
          pz + Math.cos(yaw) * 2.5
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [maze, cameraMode, gateUnlocked, createHorrorWallTexture, createHorrorFloorTexture, createAnimeBoyCharacter, currentZone, initialTime, keycardsCollected, onEndGame, onUpdateScore]);

  // Update Three.js player position on playerPos state change
  useEffect(() => {
    if (playerMeshRef.current) {
      const TILE_SIZE = 3;
      playerMeshRef.current.position.x = playerPos.x * TILE_SIZE;
      playerMeshRef.current.position.z = playerPos.y * TILE_SIZE;
    }
  }, [playerPos]);

  const handleQuestionTimeout = () => {
    if (!activeQuestion || !activeChest || isSubmitted) return;
    setIsSubmitted(true);
    setIsCorrect(false);
    playWrongSound();

    const hasShield = inventory.some(i => i.type === 'shield');
    if (hasShield) {
      setInventory(prev => prev.filter(i => i.type !== 'shield'));
      setZoneMessage('EM SHIELD ABSORBED DAMAGE!');
      setTimeout(() => setZoneMessage(null), 2500);
    } else {
      onUpdateHp(hp - 1);
    }

    const log: AnswerLog = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      selectedOption: -1,
      correctOption: activeQuestion.correctAnswer,
      isCorrect: false,
      timeSpentSeconds: initialTime,
      pointsEarned: 0
    };
    onAnswerLog(log);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !activeQuestion || !activeChest || isSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = selectedOption === activeQuestion.correctAnswer;
    setIsSubmitted(true);
    setIsCorrect(correct);

    const timeSpent = initialTime - timeLeft;
    let earned = 0;

    if (correct) {
      const basePoints = activeQuestion.points;
      const timeBonus = Math.floor((timeLeft / initialTime) * 50);
      earned = basePoints + timeBonus;
      playCorrectSound();
      onUpdateScore(earned);

      setMaze(prev => ({
        ...prev,
        chests: prev.chests.map(c => c.id === activeChest.id ? { ...c, isOpened: true } : c)
      }));

      setInventory(prev => [...prev, activeChest.item]);
      setLootModalItem(activeChest.item);
    } else {
      playWrongSound();
      playAlarmGlitch();
      const shieldIndex = inventory.findIndex(i => i.type === 'shield');
      if (shieldIndex !== -1) {
        setInventory(prev => prev.filter((_, idx) => idx !== shieldIndex));
        setZoneMessage('EM SHIELD ABSORBED DAMAGE!');
        setTimeout(() => setZoneMessage(null), 2500);
      } else {
        onUpdateHp(hp - 1);
      }
    }

    setPointsEarnedThisTurn(earned);

    const log: AnswerLog = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      selectedOption: selectedOption,
      correctOption: activeQuestion.correctAnswer,
      isCorrect: correct,
      timeSpentSeconds: timeSpent,
      pointsEarned: earned
    };
    onAnswerLog(log);
  };

  const handleCloseQuestionModal = () => {
    setActiveQuestion(null);
    setActiveChest(null);

    if (hp <= 0 && isCorrect === false) {
      onEndGame('hp_zero');
    }
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.type === 'medkit') {
      if (hp < 3) {
        onUpdateHp(hp + 1);
        setInventory(prev => prev.filter(i => i.id !== item.id));
        setZoneMessage('NANO MEDKIT USED: +1 CYBER HP');
        setTimeout(() => setZoneMessage(null), 2500);
      } else {
        setZoneMessage('HP ALREADY AT MAXIMUM!');
        setTimeout(() => setZoneMessage(null), 2000);
      }
    } else if (item.type === 'scanner') {
      setIsFullMapRevealed(true);
      setInventory(prev => prev.filter(i => i.id !== item.id));
      setZoneMessage('RADAR DRONE ACTIVE: FULL MAZE REVEALED!');
      setTimeout(() => setZoneMessage(null), 3000);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center justify-between p-3 sm:p-4 max-w-6xl mx-auto font-mono space-y-4 animate-fade-in">
      
      {/* HUD Header */}
      <div className="w-full bg-[#080808] border border-red-900/40 p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Zone & Keys Status */}
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-[10px] text-red-500 uppercase tracking-widest block">3D LOCATION PROTOCOL</span>
              <span className="text-white font-bold uppercase text-sm sm:text-base tracking-wider">
                ZONE {currentZone}: {currentZone === 1 ? 'EXTERNAL BREACH' : currentZone === 2 ? 'INNER VAULT' : 'CORE RECOVERY'}
              </span>
            </div>
            <div className="h-6 w-px bg-red-900/40" />
            <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-[#0f0f0f] px-2.5 py-1 border border-amber-900/40">
              <Key className="w-4 h-4 text-amber-500" />
              <span>KEYCARDS: {keycardsCollected}/{maze.requiredKeys}</span>
            </div>
          </div>

          {/* Camera Mode Toggle & Points & HP */}
          <div className="flex items-center space-x-3">
            
            {/* 3D Camera Selector */}
            <div className="hidden sm:flex border border-red-900/40 bg-[#0f0f0f] p-0.5 text-[10px]">
              <button
                onClick={() => setCameraMode('3D_TPV')}
                className={`px-2 py-1 font-bold ${cameraMode === '3D_TPV' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                3D THIRD-PERSON
              </button>
              <button
                onClick={() => setCameraMode('3D_FPV')}
                className={`px-2 py-1 font-bold ${cameraMode === '3D_FPV' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                3D CORRIDOR
              </button>
              <button
                onClick={() => setCameraMode('2D_TACTICAL')}
                className={`px-2 py-1 font-bold ${cameraMode === '2D_TACTICAL' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                2D TACTICAL
              </button>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-red-500 uppercase tracking-widest block">Data Points</span>
              <span className="text-base sm:text-lg font-bold text-white flex items-center justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {score.toString().padStart(6, '0')}
              </span>
            </div>

            <div className="text-right pl-3 border-l border-red-900/40">
              <span className="text-[10px] text-red-500 uppercase tracking-widest block">Cyber HP</span>
              <div className="flex gap-1 mt-0.5">
                {[1, 2, 3].map((hIndex) => (
                  <span
                    key={hIndex}
                    className={`text-lg transition-all ${
                      hIndex <= hp ? 'text-red-600 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-gray-800'
                    }`}
                  >
                    ❤
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic Zone Toast Alert */}
        {zoneMessage && (
          <div className="p-2 bg-red-950/60 border border-red-600 text-red-200 text-xs font-mono font-bold uppercase tracking-widest text-center animate-pulse">
            🚨 {zoneMessage}
          </div>
        )}
      </div>

      {/* Main 3D Canvas + Inventory Sidebar */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 3D Maze Viewport Container */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-red-900/50 p-2 shadow-2xl flex flex-col items-center justify-center relative min-h-[420px] overflow-hidden">
          
          {/* Top Left Keyboard Info */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 text-[10px] text-gray-300 bg-black/80 px-2.5 py-1 border border-red-900/40 uppercase font-mono backdrop-blur-sm">
            <Navigation className="w-3.5 h-3.5 text-red-500 animate-spin" />
            <span>KEYBOARD: [W][A][S][D] OR [ARROWS]</span>
          </div>

          {/* Top Right Mini Radar Overlay inside 3D Game View */}
          <div className="absolute top-3 right-3 z-30 bg-black/90 backdrop-blur-md p-2.5 border border-red-500/50 rounded shadow-2xl space-y-1.5 font-mono pointer-events-auto">
            <div className="flex items-center justify-between gap-3 text-[10px] text-red-400 uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-red-500 animate-pulse" /> MINI RADAR
              </span>
              <span className="text-amber-400">({playerPos.x}, {playerPos.y})</span>
            </div>

            <div 
              className="grid gap-0.5 bg-black p-1 border border-red-900/40 rounded max-w-[150px]"
              style={{ gridTemplateColumns: `repeat(${maze.width}, minmax(0, 1fr))` }}
            >
              {maze.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const chest = maze.chests.find(c => c.x === x && c.y === y);
                  const isExit = maze.exitPos.x === x && maze.exitPos.y === y;
                  const isWall = cell === 1;

                  let colorClass = 'bg-gray-950';
                  if (isPlayer) colorClass = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse';
                  else if (chest && !chest.isOpened) colorClass = 'bg-amber-400 animate-bounce';
                  else if (isExit) colorClass = gateUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-red-800';
                  else if (isWall) colorClass = 'bg-gray-800/80';

                  return <div key={`radar-${x}-${y}`} className={`w-2 h-2 ${colorClass}`} />;
                })
              )}
            </div>
          </div>

          {cameraMode !== '2D_TACTICAL' ? (
            /* 3D WebGL Canvas Mounting Point with Mouse & Touch Look Drag */
            <div
              ref={mountRef}
              onMouseDown={(e) => {
                isDraggingRef.current = true;
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
              }}
              onMouseMove={(e) => {
                if (!isDraggingRef.current) return;
                const dx = e.clientX - lastMousePosRef.current.x;
                playerYawRef.current -= dx * 0.005;
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
              }}
              onMouseUp={() => { isDraggingRef.current = false; }}
              onMouseLeave={() => { isDraggingRef.current = false; }}
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  isDraggingRef.current = true;
                  lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
              }}
              onTouchMove={(e) => {
                if (!isDraggingRef.current || e.touches.length === 0) return;
                const dx = e.touches[0].clientX - lastMousePosRef.current.x;
                playerYawRef.current -= dx * 0.005;
                lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }}
              onTouchEnd={() => { isDraggingRef.current = false; }}
              className="w-full h-[400px] rounded border border-red-900/30 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            />
          ) : (
            /* 2D Tactical Grid Fallback */
            <div 
              className="grid gap-1 bg-[#050505] p-3 border border-red-900/30 max-w-full overflow-auto my-auto select-none"
              style={{
                gridTemplateColumns: `repeat(${maze.width}, minmax(0, 1fr))`
              }}
            >
              {maze.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const chest = maze.chests.find(c => c.x === x && c.y === y);
                  const isExit = maze.exitPos.x === x && maze.exitPos.y === y;
                  const isWall = cell === 1;

                  const distance = Math.hypot(playerPos.x - x, playerPos.y - y);
                  const isVisible = isFullMapRevealed || distance <= 2.8 || isPlayer || isExit;

                  let tileClass = 'bg-[#0f0f0f] border border-red-900/10';
                  if (!isVisible) {
                    tileClass = 'bg-[#030303] border-transparent opacity-30';
                  } else if (isWall) {
                    tileClass = 'bg-[#1a0808] border border-red-900/40 shadow-inner';
                  }

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-mono font-bold relative ${tileClass}`}
                    >
                      {!isVisible ? (
                        <span className="text-[8px] text-gray-900">•</span>
                      ) : isPlayer ? (
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse">
                          👾
                        </div>
                      ) : chest ? (
                        <div className={`p-0.5 ${chest.isOpened ? 'text-gray-600 opacity-40' : 'text-amber-400 animate-bounce'}`}>
                          {chest.isOpened ? '📭' : '🎁'}
                        </div>
                      ) : isExit ? (
                        <div className={`text-base ${gateUnlocked ? 'text-emerald-400 animate-pulse' : 'text-red-600'}`}>
                          {gateUnlocked ? '🚪' : '🔒'}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* On-Screen Touch & Continuous Direction Controls */}
          <div className="mt-2 mb-1 flex flex-col sm:flex-row items-center justify-between w-full px-2 text-xs font-mono gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span>🖱️ DRAG MOUSE TO ROTATE VIEW</span>
              <span className="text-gray-600">|</span>
              <span>⌨️ WASD TO WALK</span>
            </span>
            <div className="flex gap-2">
              <button
                onMouseDown={() => { keysDownRef.current['w'] = true; }}
                onMouseUp={() => { keysDownRef.current['w'] = false; }}
                onTouchStart={() => { keysDownRef.current['w'] = true; }}
                onTouchEnd={() => { keysDownRef.current['w'] = false; }}
                className="px-3 py-1 bg-[#14080a] hover:bg-red-950 border border-red-900/50 text-red-400 font-bold active:bg-red-900 select-none"
              >
                [W / Forward]
              </button>
              <button
                onMouseDown={() => { keysDownRef.current['a'] = true; }}
                onMouseUp={() => { keysDownRef.current['a'] = false; }}
                onTouchStart={() => { keysDownRef.current['a'] = true; }}
                onTouchEnd={() => { keysDownRef.current['a'] = false; }}
                className="px-3 py-1 bg-[#14080a] hover:bg-red-950 border border-red-900/50 text-red-400 font-bold active:bg-red-900 select-none"
              >
                [A / Turn Left]
              </button>
              <button
                onMouseDown={() => { keysDownRef.current['s'] = true; }}
                onMouseUp={() => { keysDownRef.current['s'] = false; }}
                onTouchStart={() => { keysDownRef.current['s'] = true; }}
                onTouchEnd={() => { keysDownRef.current['s'] = false; }}
                className="px-3 py-1 bg-[#14080a] hover:bg-red-950 border border-red-900/50 text-red-400 font-bold active:bg-red-900 select-none"
              >
                [S / Backward]
              </button>
              <button
                onMouseDown={() => { keysDownRef.current['d'] = true; }}
                onMouseUp={() => { keysDownRef.current['d'] = false; }}
                onTouchStart={() => { keysDownRef.current['d'] = true; }}
                onTouchEnd={() => { keysDownRef.current['d'] = false; }}
                className="px-3 py-1 bg-[#14080a] hover:bg-red-950 border border-red-900/50 text-red-400 font-bold active:bg-red-900 select-none"
              >
                [D / Turn Right]
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Agent Inventory */}
        <div className="bg-[#0a0a0a] border border-red-900/50 p-4 shadow-2xl space-y-4 font-mono flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="border-b border-red-900/30 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-red-500" /> AGENT INVENTORY ({inventory.length})
              </h3>
            </div>

            {/* Keys / Tokens Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Required Keycards & Access Pass</div>
              <div className={`p-2.5 border text-xs font-bold flex items-center justify-between ${gateUnlocked ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300' : 'bg-[#080808] border-red-900/30 text-gray-400'}`}>
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  {gateUnlocked ? 'EXIT GATE UNLOCKED!' : `Keys: ${keycardsCollected}/${maze.requiredKeys}`}
                </span>
                <span className="text-[10px] uppercase font-mono">{gateUnlocked ? 'READY TO ESCAPE' : 'LOCKED'}</span>
              </div>
            </div>

            {/* Survival & Usable Items */}
            <div className="space-y-2">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Survival Gear & Equipment</div>
              {inventory.filter(i => !i.isJunk).length === 0 ? (
                <div className="p-3 border border-dashed border-gray-900 text-center text-gray-600 text-[11px]">
                  ไม่มีอุปกรณ์เอาชีวิตรอดในกระเป๋า (เปิดกล่องเพื่อค้นหา)
                </div>
              ) : (
                <div className="space-y-2">
                  {inventory.filter(i => !i.isJunk).map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-[#080808] border border-red-900/30 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-amber-400">⚡</span> {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-['Kanit',sans-serif] mt-0.5">{item.description}</div>
                      </div>
                      {item.usable && (
                        <button
                          onClick={() => handleUseItem(item)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase transition-colors shrink-0"
                        >
                          USE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Junk Collection Bin */}
            <div className="space-y-2 pt-2 border-t border-red-900/30">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5 text-gray-500" /> Junk & Corrupted Data ({inventory.filter(i => i.isJunk).length})
              </div>
              {inventory.filter(i => i.isJunk).length === 0 ? (
                <div className="text-[10px] text-gray-600 italic">ยังไม่พบขยะข้อมูล</div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto">
                  {inventory.filter(i => i.isJunk).map((junk, idx) => (
                    <div key={idx} className="p-2 bg-[#050505] border border-gray-900 text-[11px] text-gray-500 flex items-center gap-2">
                      <span className="text-gray-600">🗑️</span>
                      <div>
                        <div className="font-bold text-gray-400">{junk.name}</div>
                        <div className="text-[9px] font-['Kanit',sans-serif]">{junk.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <button
            onClick={onAbortGame}
            className="w-full py-2.5 bg-[#080808] hover:bg-red-950/20 text-red-500 border border-red-900/40 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            [ABORT PROTOCOL]
          </button>

        </div>

      </div>

      {/* Security Question Challenge Modal (Triggered by Chest) */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
          <div className="bg-[#0a0a0a] border border-red-900/60 max-w-2xl w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
              <div className="flex items-center space-x-2 text-red-500 font-bold">
                <Lock className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="uppercase tracking-widest text-sm">SECURITY CHEST CHALLENGE</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                CRITICALITY: <strong className="text-amber-400">{activeQuestion.points} PT</strong>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed uppercase font-['JetBrains_Mono',monospace]">
              {activeQuestion.question}
            </h3>

            {activeQuestion.scenarioContext && (
              <div className="p-3 bg-[#080808] border border-red-900/30 text-xs text-gray-300 font-['Kanit',sans-serif]">
                {activeQuestion.scenarioContext.content}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {activeQuestion.options.map((optionText, index) => {
                const isSelected = selectedOption === index;
                const letter = String.fromCharCode(65 + index);
                let style = 'bg-[#0f0f0f] border-red-900/30 text-gray-300 hover:bg-red-950/20 hover:border-red-600';

                if (isSubmitted) {
                  if (index === activeQuestion.correctAnswer) {
                    style = 'bg-emerald-950/40 border-emerald-500 text-white font-bold';
                  } else if (isSelected) {
                    style = 'bg-red-950/40 border-red-600 text-white font-bold';
                  } else {
                    style = 'bg-[#080808] border-gray-900 text-gray-600 opacity-40';
                  }
                } else if (isSelected) {
                  style = 'bg-red-950/30 border-red-600 text-white font-bold';
                }

                return (
                  <button
                    key={index}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(index)}
                    className={`p-3 border text-left text-xs font-['Kanit',sans-serif] transition-all flex items-center justify-between ${style}`}
                  >
                    <span>[{letter}] {optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5 inline text-red-500 mr-1" /> Time left: {timeLeft}s
              </div>
              {!isSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className={`px-5 py-2.5 border text-xs font-bold uppercase font-mono tracking-widest ${
                    selectedOption !== null
                      ? 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                      : 'bg-[#0f0f0f] border-gray-900 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  UNLOCK CHEST
                </button>
              ) : (
                <button
                  onClick={handleCloseQuestionModal}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white border border-red-400 font-bold text-xs uppercase tracking-widest"
                >
                  CONTINUE MAZE EXPLORATION
                </button>
              )}
            </div>

            {/* Answer Result Feedback */}
            {isSubmitted && (
              <div className={`p-3 border text-xs font-['Kanit',sans-serif] ${isCorrect ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' : 'bg-red-950/30 border-red-600 text-red-200'}`}>
                <div className="font-bold font-mono mb-1">{isCorrect ? 'SUCCESS: CHEST UNLOCKED!' : 'ACCESS DENIED: SECURITY ALARM TRIGGERED!'}</div>
                <p>{activeQuestion.explanation}</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Item Looted Modal */}
      {lootModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
          <div className="bg-[#0a0a0a] border border-amber-500/80 max-w-md w-full p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-center space-y-4">
            <div className="text-4xl animate-bounce">
              {lootModalItem.isJunk ? '🗑️' : '📦'}
            </div>
            <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wider">
              {lootModalItem.isJunk ? 'FOUND JUNK / CORRUPTED DATA' : 'SURVIVAL EQUIPMENT DISCOVERED!'}
            </h3>
            <div className="p-3 bg-[#080808] border border-amber-900/40 space-y-1">
              <div className="text-sm font-bold text-white">{lootModalItem.name}</div>
              <p className="text-xs text-gray-300 font-['Kanit',sans-serif]">{lootModalItem.description}</p>
            </div>
            <button
              onClick={() => setLootModalItem(null)}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest"
            >
              STORE IN INVENTORY
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

