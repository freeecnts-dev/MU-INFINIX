import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GamePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const controls = useRef({ forward: false, back: false, left: false, right: false });
  const attackRef = useRef(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(100);
  const [experience, setExperience] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101827);
    scene.fog = new THREE.Fog(0x101827, 15, 55);

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb8cfff, 0x302016, 2));

    const sun = new THREE.DirectionalLight(0xffd69a, 2);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    // CENARIO MEDIEVAL MU INFINIX
    scene.background = new THREE.Color(0x899bb0);
    scene.fog = new THREE.Fog(0x899bb0, 28, 85);


    // Texturas procedurais do cenário
    const makeTerrainTexture = (kind: 'grass' | 'stone') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Falha ao criar textura');

      if (kind === 'grass') {
        ctx.fillStyle = '#354b32';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 9000; i++) {
          const shade = Math.floor(Math.random() * 55);
          ctx.fillStyle = 'rgba(105,' + (125 + shade) + ',65,0.3)';
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 4);
        }
      } else {
        ctx.fillStyle = '#393b39';
        ctx.fillRect(0, 0, 512, 512);
        for (let row = 0; row < 18; row++) {
          for (let col = 0; col < 7; col++) {
            const x = col * 74 + (row % 2) * 8 + 3;
            const y = row * 29 + 3;
            const shade = 105 + Math.floor(Math.random() * 55);
            ctx.fillStyle = 'rgb(' + shade + ',' + (shade - 3) + ',' + (shade - 9) + ')';
            ctx.fillRect(x, y, 68, 25);
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(x + 3, y + 2, 58, 2);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fillRect(x + 2, y + 20, 62, 2);
          }
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      return texture;
    };

    const grassTexture = makeTerrainTexture('grass');
    grassTexture.repeat.set(12, 12);
    const pathTexture = makeTerrainTexture('stone');
    pathTexture.repeat.set(2, 28);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.06;
    scene.add(ground);

    // Caminho de pedras detalhado
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 110),
      new THREE.MeshStandardMaterial({ map: pathTexture, roughness: 1 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0, -15);
    scene.add(path);

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaa69a, roughness: 1
    });

    for (let i = 0; i < 95; i++) {
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.06, 0),
        stoneMaterial
      );
      stone.position.set(
        ((i * 17) % 45) / 10 - 2.2,
        0.035,
        15 - i * 0.65
      );
      stone.scale.set(1.3, 0.25, 0.8);
      scene.add(stone);
    }

    // Rochas nas laterais
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x555b59, roughness: 1
    });

    for (let i = 0; i < 18; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45 + (i % 3) * 0.18, 1),
        rockMaterial
      );
      const side = i % 2 === 0 ? -1 : 1;
      rock.position.set(side * (4 + (i % 4)), 0.3, 8 - i * 2.5);
      rock.rotation.set(i * 0.4, i, i * 0.2);
      scene.add(rock);
    }

    const player = new THREE.Group();
    scene.add(player);

    const armor = new THREE.MeshStandardMaterial({ color: 0x173d70, metalness: 0.8, roughness: 0.28 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xd9a52e, metalness: 0.8, roughness: 0.24 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xc8d5e5, metalness: 0.9, roughness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x202633, metalness: 0.35, roughness: 0.65 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc58b63, roughness: 0.8 });
    const red = new THREE.MeshStandardMaterial({ color: 0x8d1824, metalness: 0.35 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 0.48), armor);
    body.position.y = 1.35;
    player.add(body);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.09), silver);
    chest.position.set(0, 1.42, -0.27);
    player.add(chest);

    const chestCenter = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.035), gold);
    chestCenter.position.set(0, 1.42, -0.325);
    player.add(chestCenter);

    // Detalhes metalicos da armadura
    const trimMetal = new THREE.MeshStandardMaterial({
      color: 0xf0c65a, metalness: 0.92, roughness: 0.2
    });
    const blueGem = new THREE.MeshStandardMaterial({
      color: 0x31b9ff, metalness: 0.5, roughness: 0.18,
      emissive: 0x087acb, emissiveIntensity: 0.8
    });

    // Placas laterais do peito
    for (const x of [-0.23, 0.23]) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.48, 0.055), silver
      );
      plate.position.set(x, 1.43, -0.37);
      player.add(plate);

      for (const y of [1.24, 1.62]) {
        const rivet = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 10, 8), trimMetal
        );
        rivet.position.set(x, y, -0.415);
        player.add(rivet);
      }
    }

    // Joia azul no centro da armadura
    const chestGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.105, 1), blueGem
    );
    chestGem.position.set(0, 1.68, -0.39);
    player.add(chestGem);

    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.52), dark);
    belt.position.y = 0.82;
    player.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), gold);
    buckle.position.set(0, 0.82, -0.3);
    player.add(buckle);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), skin);
    head.position.y = 2.12;
    player.add(head);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), silver);
    helmet.position.y = 2.27;
    player.add(helmet);

    const helmetFront = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.12), gold);
    helmetFront.position.set(0, 2.12, -0.25);
    player.add(helmetFront);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.48, 6), red);
    crest.position.set(0, 2.62, 0);
    player.add(crest);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.06), dark);
    visor.position.set(0, 2.17, -0.29);
    player.add(visor);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.78, 0.3), armor);
    leftArm.position.set(-0.58, 1.32, 0);
    player.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.78, 0.3), armor);
    rightArm.position.set(0.58, 1.32, 0);
    player.add(rightArm);

    for (const x of [-0.58, 0.58]) {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), gold);
      shoulder.scale.set(1.15, 0.7, 1);
      shoulder.position.set(x, 1.72, 0);
      player.add(shoulder);

      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.34), silver);
      forearm.position.set(x, 0.98, -0.02);
      player.add(forearm);
    }

    const legs = [];
    for (const x of [-0.23, 0.23]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.65, 0.34), dark);
      leg.position.set(x, 0.43, 0);
      player.add(leg);
      legs.push(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.48), armor);
      boot.position.set(x, 0.12, -0.07);
      player.add(boot);

      const knee = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.38), gold);
      knee.position.set(x, 0.68, -0.02);
      player.add(knee);
    }

    const sword = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.05, 0.045), silver);
    blade.position.y = 0.55;
    sword.add(blade);

    // Filete metalico no centro da espada
    const bladeLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.78, 0.012), trimMetal
    );
    bladeLine.position.set(0, 0.58, -0.03);
    sword.add(bladeLine);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.09, 0.12), gold);
    guard.position.y = 0.08;
    sword.add(guard);

    const swordGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09, 1), blueGem
    );
    swordGem.position.set(0, 0.1, -0.075);
    sword.add(swordGem);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.12), dark);
    grip.position.y = -0.1;
    sword.add(grip);
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), gold);
    pommel.position.y = -0.28;
    sword.add(pommel);
    // Espada presa à mão direita para acompanhar os golpes
    sword.position.set(0.13, -0.43, -0.12);
    sword.rotation.x = -0.25;
    rightArm.add(sword);

    // DEMONIO DAS SOMBRAS - MU INFINIX
    const monster = new THREE.Group();

    const demonSkin = new THREE.MeshStandardMaterial({
      color: 0x65151d, roughness: 0.72, metalness: 0.15
    });
    const demonArmor = new THREE.MeshStandardMaterial({
      color: 0x171923, roughness: 0.3, metalness: 0.8
    });
    const demonGold = new THREE.MeshStandardMaterial({
      color: 0x9b6427, metalness: 0.75, roughness: 0.25
    });
    const demonGlow = new THREE.MeshStandardMaterial({
      color: 0xff1717,
      emissive: 0xff0000,
      emissiveIntensity: 2.5
    });

    // Corpo e peito
    const demonBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 20, 16),
      demonSkin
    );
    demonBody.scale.set(1, 1.35, 0.72);
    demonBody.position.y = 1.25;
    monster.add(demonBody);

    const chestArmor = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 16, 12),
      demonArmor
    );
    chestArmor.scale.set(1, 1.15, 0.5);
    chestArmor.position.set(0, 1.42, 0.34);
    monster.add(chestArmor);

    // Cabeça
    const demonHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.43, 20, 16),
      demonSkin
    );
    demonHead.position.set(0, 2.35, 0.12);
    monster.add(demonHead);

    // Olhos brilhantes
    for (const x of [-0.19, 0.19]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 12),
        demonGlow
      );
      eye.position.set(x, 2.39, 0.49);
      monster.add(eye);
    }

    // Chifres
    for (const x of [-0.31, 0.31]) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.85, 8),
        demonArmor
      );
      horn.position.set(x, 2.92, 0.05);
      horn.rotation.z = x < 0 ? 0.38 : -0.38;
      monster.add(horn);
    }

    // Ombreiras com espinhos
    const demonArms: THREE.Mesh[] = [];
    for (const x of [-0.72, 0.72]) {
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 12, 10),
        demonArmor
      );
      shoulder.position.set(x, 1.85, 0);
      monster.add(shoulder);

      for (let j = 0; j < 2; j++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.13, 0.55, 7),
          demonGold
        );
        spike.position.set(x * 1.2, 2.1 + j * 0.2, 0);
        spike.rotation.z = x < 0 ? 0.8 : -0.8;
        monster.add(spike);
      }

      // Braços e garras
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.17, 0.65, 4, 8),
        demonSkin
      );
      arm.position.set(x * 1.1, 1.25, 0.05);
      arm.rotation.z = x < 0 ? -0.18 : 0.18;
      monster.add(arm);
      demonArms.push(arm);

      for (let j = 0; j < 3; j++) {
        const claw = new THREE.Mesh(
          new THREE.ConeGeometry(0.065, 0.38, 6),
          demonGold
        );
        claw.position.set(x * 1.12 + (j - 1) * 0.13, 0.72, 0.22);
        claw.rotation.x = Math.PI;
        monster.add(claw);
      }

      // Pernas
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.55, 4, 8),
        demonArmor
      );
      leg.position.set(x * 0.42, 0.42, 0);
      monster.add(leg);
    }

    // Espinhos nas costas
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.65, 7),
        demonArmor
      );
      spike.position.set(0, 1.15 + i * 0.3, -0.48);
      spike.rotation.x = -0.7;
      monster.add(spike);
    }

    // Aura vermelha no chão
    const aura = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.045, 8, 48),
      demonGlow
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.08;
    monster.add(aura);

    monster.position.set(0, 0, -7);
    scene.add(monster);


    // Floresta com copas em camadas
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x49301e, roughness: 1
    });
    const leafMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x183d29, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x285337, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x376441, roughness: 1 })
    ];

    for (let i = 0; i < 34; i++) {
      const tree = new THREE.Group();
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (5 + (i % 5) * 2.1);
      const z = 12 - Math.floor(i / 2) * 5;

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.3, 2.5, 8),
        trunkMaterial
      );
      trunk.position.y = 1.25;
      tree.add(trunk);

      for (let layer = 0; layer < 3; layer++) {
        const leaves = new THREE.Mesh(
          new THREE.ConeGeometry(1.35 - layer * 0.22, 2.5, 9),
          leafMaterials[(i + layer) % leafMaterials.length]
        );
        leaves.position.y = 2.5 + layer * 0.85;
        tree.add(leaves);
      }

      tree.position.set(x, 0, z);
      tree.rotation.y = i * 0.7;
      scene.add(tree);
    }

    // Vegetação pequena
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x55713a, roughness: 1
    });

    for (let i = 0; i < 100; i++) {
      const grass = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.45, 5),
        grassMaterial
      );
      grass.position.set(
        ((i * 37) % 90) - 45,
        0.2,
        ((i * 19) % 100) - 50
      );
      scene.add(grass);
    }

    // Pequenas luzes magicas na floresta
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd66b });

    for (let i = 0; i < 18; i++) {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        glowMaterial
      );
      glow.position.set(
        (i % 2 === 0 ? -1 : 1) * (3 + (i % 4)),
        0.8 + (i % 3) * 0.5,
        -4 - i * 2
      );
      scene.add(glow);
    }

    camera.position.set(0, 4, 7);
    camera.lookAt(0, 1, 0);

    let frame = 0;
    let attackTime = 0;
    let animationId = 0;
    let demonAttackTime = 0;
    let demonAttackCooldown = 0;
    let wasAttacking = false;
    let monsterHealth = 100;
    let heroHealth = 100;
    let totalExperience = 0;
    let monsterDefeated = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'ArrowUp') controls.current.forward = true;
      if (event.key === 's' || event.key === 'ArrowDown') controls.current.back = true;
      if (event.key === 'a' || event.key === 'ArrowLeft') controls.current.left = true;
      if (event.key === 'd' || event.key === 'ArrowRight') controls.current.right = true;
      if (event.code === 'Space') attackRef.current = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'ArrowUp') controls.current.forward = false;
      if (event.key === 's' || event.key === 'ArrowDown') controls.current.back = false;
      if (event.key === 'a' || event.key === 'ArrowLeft') controls.current.left = false;
      if (event.key === 'd' || event.key === 'ArrowRight') controls.current.right = false;
      if (event.code === 'Space') attackRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frame += 0.04;

      // Respiração e movimentos do Demônio das Sombras
      const breathing = Math.sin(frame * 2.2) * 0.045;
      demonBody.position.y = 1.25 + breathing;
      chestArmor.position.y = 1.42 + breathing;
      demonHead.rotation.z = Math.sin(frame * 1.5) * 0.07;

      // Olhos pulsando e aura girando
      demonGlow.emissiveIntensity = 1.8 + (Math.sin(frame * 5) + 1) * 1.1;
      aura.rotation.y += 0.035;

      // Ataque visual quando o guerreiro chega perto
      const demonDistance = monster.position.distanceTo(player.position);
      if (demonAttackCooldown > 0) demonAttackCooldown--;
      if (demonDistance < 4 && demonAttackCooldown <= 0) {
        demonAttackTime = 32;
        demonAttackCooldown = 100;
      }

      if (demonAttackTime > 0) demonAttackTime--;

      demonArms.forEach((arm, index) => {
        const side = index === 0 ? -1 : 1;
        const idleMove = Math.sin(frame * 2 + index) * 0.045;
        const attackMove = demonAttackTime > 0
          ? Math.sin((32 - demonAttackTime) / 32 * Math.PI) * 1.1
          : 0;
        arm.rotation.z = side * (0.18 + idleMove);
        arm.rotation.x = -attackMove;
      });

      const moving = controls.current.forward || controls.current.back ||
        controls.current.left || controls.current.right;

      if (controls.current.forward) player.position.z -= 0.08;
      if (controls.current.back) player.position.z += 0.08;
      if (controls.current.left) player.position.x -= 0.08;
      if (controls.current.right) player.position.x += 0.08;

      player.position.x = THREE.MathUtils.clamp(player.position.x, -18, 18);
      player.position.z = THREE.MathUtils.clamp(player.position.z, -30, 18);

      if (controls.current.left) player.rotation.y = -0.35;
      else if (controls.current.right) player.rotation.y = 0.35;
      else player.rotation.y = 0;

      legs[0].rotation.x = moving ? Math.sin(frame * 5) * 0.5 : 0;
      legs[1].rotation.x = moving ? -Math.sin(frame * 5) * 0.5 : 0;

      // Ataque com golpe único ao pressionar o botão
      const attacking = attackRef.current;
      if (attacking && !wasAttacking) {
        attackTime = 12;

        const distanceToMonster = player.position.distanceTo(monster.position);
        if (distanceToMonster < 3.2 && !monsterDefeated) {
          monsterHealth = Math.max(0, monsterHealth - 25);
          setMonsterHp(monsterHealth);

          if (monsterHealth === 0) {
            monsterDefeated = true;
            monster.visible = false;
            totalExperience += 50;
            setExperience(totalExperience);
          }
        }
      }
      wasAttacking = attacking;

      if (attackTime > 0) {
        const swing = Math.sin((12 - attackTime) / 12 * Math.PI);
        rightArm.rotation.x = -swing * 1.8;
        sword.rotation.x = -0.25 - swing * 1.1;
        sword.rotation.z = -swing * 0.35;
        attackTime--;
      } else {
        rightArm.rotation.x = 0;
        sword.rotation.x = -0.25;
        sword.rotation.z = 0;
      }

      camera.position.x += (player.position.x - camera.position.x) * 0.08;
      camera.position.z += (player.position.z + 7 - camera.position.z) * 0.08;
      camera.position.y += (4 - camera.position.y) * 0.06;
      camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z - 2);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  const hold = (direction: keyof typeof controls.current, pressed: boolean) => {
    controls.current[direction] = pressed;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 text-white flex flex-col">
      <div className="h-14 shrink-0 bg-slate-950/95 border-b border-amber-500/40 flex items-center justify-between px-4">
        <div>
          <div className="font-bold tracking-widest text-amber-400">MU INFINIX</div>
          <div className="text-[10px] text-slate-400">PROTÓTIPO 3D</div>
        </div>
        <div className="text-xs text-amber-200">Guerreiro • Nível 1 • EXP: {experience}</div>
      </div>

      <div ref={canvasRef} className="flex-1 min-h-0 relative">
        <div className="absolute top-3 left-3 z-10 rounded bg-black/50 px-3 py-2 text-xs text-amber-200">
          Monstro à frente
        </div>
        <div className="absolute top-3 right-3 z-10 rounded bg-black/50 px-3 py-2 text-xs">
          <div className="text-green-400">HP: {playerHp}/100</div>
          <div className="text-blue-300">MP: {playerMp}/100</div>
          <div className="text-red-300">Demônio: {monsterHp}/100</div>
          <div className="mt-1 h-1.5 w-28 rounded bg-slate-700 overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: playerHp + '%' }} />
          </div>
          <div className="mt-1 h-1.5 w-28 rounded bg-slate-700 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: playerMp + '%' }} />
          </div>
          <div className="mt-1 h-1.5 w-28 rounded bg-slate-700 overflow-hidden">
            <div className="h-full bg-red-700" style={{ width: monsterHp + '%' }} />
          </div>
        </div>
      </div>


      {/* MUINFINIX_MENU_BUTTONS */}
      <div className="shrink-0 bg-slate-950/95 border-t border-amber-500/30 p-2">
        {activeMenu && (
          <div className="mb-2 rounded-xl border border-amber-400/60 bg-slate-900 p-3">
            <div className="flex justify-between items-center">
              <strong className="text-amber-300">{activeMenu}</strong>
              <button onClick={() => setActiveMenu(null)} className="bg-red-900 rounded px-3 py-1 text-xs">FECHAR ✕</button>
            </div>
            <div className="text-center text-xs text-slate-200 py-3">
              {activeMenu === '🎒 INVENTÁRIO' && 'Mochila, armas, armaduras e itens do guerreiro.'}
              {activeMenu === '🛡 PERSONAGEM' && 'Atributos, nível e equipamentos do personagem.'}
              {activeMenu === '✨ HABILIDADES' && 'Magias e ataques especiais.'}
              {activeMenu === '📜 MISSÕES' && 'Missões e objetivos da aventura.'}
              {activeMenu === '🗺 MAPA' && 'Mapa do mundo MU INFINIX.'}
              {activeMenu === '🛒 LOJA' && 'Loja de itens e equipamentos.'}
              {activeMenu === '⚙ OPÇÕES' && 'Configurações de áudio e controles.'}
            </div>
            <div className="text-center text-[10px] text-amber-500">SISTEMA EM DESENVOLVIMENTO</div>
          </div>
        )}
        <div className="flex gap-1 overflow-x-auto">
          {(['🎒 INVENTÁRIO', '🛡 PERSONAGEM', '✨ HABILIDADES', '📜 MISSÕES', '🗺 MAPA', '🛒 LOJA', '⚙ OPÇÕES'] as const).map((item) => (
            <button key={item} onClick={() => setActiveMenu(activeMenu === item ? null : item)}
              className={`shrink-0 rounded-lg border px-2 py-2 text-[10px] font-bold text-amber-100 ${activeMenu === item ? 'border-amber-300 bg-amber-900' : 'border-slate-600 bg-slate-800'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-slate-950 border-t border-amber-500/30 p-3 flex items-center justify-between">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button className="game-control" onPointerDown={() => hold('forward', true)} onPointerUp={() => hold('forward', false)} onPointerLeave={() => hold('forward', false)}>▲</button>
          <div />
          <button className="game-control" onPointerDown={() => hold('left', true)} onPointerUp={() => hold('left', false)} onPointerLeave={() => hold('left', false)}>◀</button>
          <button className="game-control" onPointerDown={() => hold('back', true)} onPointerUp={() => hold('back', false)} onPointerLeave={() => hold('back', false)}>▼</button>
          <button className="game-control" onPointerDown={() => hold('right', true)} onPointerUp={() => hold('right', false)} onPointerLeave={() => hold('right', false)}>▶</button>
        </div>
        <button
          onPointerDown={() => { attackRef.current = true; }}
          onPointerUp={() => { attackRef.current = false; }}
          onPointerLeave={() => { attackRef.current = false; }}
          className="w-20 h-20 rounded-full border-4 border-amber-300 bg-red-800 text-white font-bold shadow-lg active:scale-95"
        >
          ATACAR
        </button>
      </div>

      <style>{`
        .game-control {
          width: 42px;
          height: 42px;
          border-radius: 9px;
          border: 1px solid #b98a35;
          background: #263449;
          color: #f4d58a;
          font-size: 18px;
          touch-action: none;
        }
        .game-control:active { background: #76501d; }
      `}</style>
    </div>
  );
}
