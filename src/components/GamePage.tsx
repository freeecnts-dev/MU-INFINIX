import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GamePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const controls = useRef({ forward: false, back: false, left: false, right: false });
  const attackRef = useRef(false);

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

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x34432d })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    const grid = new THREE.GridHelper(100, 50, 0x68734b, 0x46533b);
    grid.position.y = 0;
    scene.add(grid);

    const player = new THREE.Group();
    scene.add(player);

    const armor = new THREE.MeshStandardMaterial({ color: 0x24558b, metalness: 0.65, roughness: 0.35 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xd6a33b, metalness: 0.7 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xd5a47b });
    const dark = new THREE.MeshStandardMaterial({ color: 0x202631 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.45), armor);
    body.position.y = 1.35;
    player.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skin);
    head.position.y = 2.12;
    player.add(head);

    const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 4), gold);
    helmet.position.y = 2.48;
    helmet.rotation.y = Math.PI / 4;
    player.add(helmet);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.3), gold);
    leftArm.position.set(-0.55, 1.35, 0);
    player.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.3), gold);
    rightArm.position.set(0.55, 1.35, 0);
    player.add(rightArm);

    const legs: THREE.Mesh[] = [];
    for (const x of [-0.22, 0.22]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.75, 0.35), dark);
      leg.position.set(x, 0.48, 0);
      player.add(leg);
      legs.push(leg);
    }

    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.25, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xdceaff, metalness: 0.9, roughness: 0.2 })
    );
    sword.position.set(0.55, 1.1, -0.35);
    sword.rotation.x = -0.25;
    player.add(sword);

    const monster = new THREE.Group();
    const monsterBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x8d2525, roughness: 0.8 })
    );
    monsterBody.position.y = 0.9;
    monster.add(monsterBody);

    const monsterHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x501818 })
    );
    monsterHead.position.y = 1.9;
    monster.add(monsterHead);
    monster.position.set(0, 0, -7);
    scene.add(monster);

    for (let i = 0; i < 24; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.22, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x51351f })
      );
      trunk.position.y = 0.75;
      tree.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1, 2.5, 7),
        new THREE.MeshStandardMaterial({ color: 0x24452d })
      );
      leaves.position.y = 2.4;
      tree.add(leaves);

      const side = i % 2 === 0 ? -1 : 1;
      tree.position.set(side * (5 + (i % 4) * 2), 0, -12 + Math.floor(i / 2) * 4);
      scene.add(tree);
    }

    camera.position.set(0, 4, 7);
    camera.lookAt(0, 1, 0);

    let frame = 0;
    let attackTime = 0;
    let animationId = 0;

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

      if (attackRef.current) attackTime = 12;
      if (attackTime > 0) {
        rightArm.rotation.x = -Math.sin((12 - attackTime) / 12 * Math.PI) * 1.8;
        attackTime--;
      } else {
        rightArm.rotation.x = 0;
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
        <div className="text-xs text-amber-200">Guerreiro • Nível 1</div>
      </div>

      <div ref={canvasRef} className="flex-1 min-h-0 relative">
        <div className="absolute top-3 left-3 z-10 rounded bg-black/50 px-3 py-2 text-xs text-amber-200">
          Monstro à frente
        </div>
        <div className="absolute top-3 right-3 z-10 rounded bg-black/50 px-3 py-2 text-xs">
          HP: <span className="text-green-400">100%</span>
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
