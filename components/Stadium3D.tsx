"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Node } from "@/lib/engine";

export type Mode = "heat" | "columns" | "wire";
export type View = "aerial" | "plan" | "pitch";

type RingPulse = { ring: THREE.Mesh; phase: number };
type Beacon = { x: number; z: number; y: number; load: number; phase: number };
type SceneApi = {
  update: (nodes: Node[], mode: Mode, selected: string) => void;
  setView: (view: View, immediate?: boolean) => void;
  setScrollProgress: (progress: number) => void;
  onSelect?: (id: string) => void;
};

const SX = 1.15;
const TIERS = [[68, 96, 0, 13], [99, 122, 17, 31], [125, 150, 35, 56]];
const SEGMENTS = 160;
const CAMERAS: Record<View, [number[], number[]]> = {
  aerial: [[0, 640, 900], [0, 10, 0]],
  plan: [[0, 670, 1], [0, 0, 0]],
  pitch: [[0, 85, 250], [0, 8, 0]],
};

const heatColor = (load: number) =>
  new THREE.Color().setHSL(
    0.33 * (1 - Math.min(1, Math.max(0, (load - 0.4) / 0.8))),
    0.9,
    0.5,
  );

function nodePosition(node: Node) {
  const angle = (node.a * Math.PI) / 180;
  let radius = node.d;
  let y = 0;
  if (node.t === "Small cell") {
    radius = 80;
    y = 9;
  } else if (node.t === "New SC") {
    radius = 105;
    y = 24;
  } else if (node.t === "COW") {
    radius = 190;
  }
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

function interpolatedLoad(nodes: Node[], positions: THREE.Vector3[], x: number, z: number) {
  let total = 0;
  let weight = 0;
  nodes.forEach((node, index) => {
    const influence = 1 / Math.pow(Math.hypot(positions[index].x - x, positions[index].z - z) + 30, 3);
    total += node.u * influence;
    weight += influence;
  });
  return weight ? total / weight : 0;
}

function ovalBand(inner: number, outer: number, y: number) {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    vertices.push(cos * inner * SX, y, sin * inner, cos * outer * SX, y, sin * outer);
    if (i < SEGMENTS) {
      const offset = i * 2;
      indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedPitch() {
  const shape = new THREE.Shape();
  shape.moveTo(-62, -36);
  shape.lineTo(62, -36);
  shape.quadraticCurveTo(68, -36, 68, -30);
  shape.lineTo(68, 30);
  shape.quadraticCurveTo(68, 36, 62, 36);
  shape.lineTo(-62, 36);
  shape.quadraticCurveTo(-68, 36, -68, 30);
  shape.lineTo(-68, -30);
  shape.quadraticCurveTo(-68, -36, -62, -36);
  return new THREE.ShapeGeometry(shape);
}

function makeLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create a canvas context for stadium labels.");
  context.fillStyle = "rgba(255, 255, 255, .96)";
  context.beginPath();
  context.roundRect(2, 2, 252, 76, 12);
  context.fill();
  context.strokeStyle = "#237a58";
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = "#23342d";
  context.font = "bold 34px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 41);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }),
  );
  sprite.scale.set(34, 10.6, 1);
  return sprite;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if ("map" in material && material.map) material.map.dispose();
        material.dispose();
      });
    }
  });
}

export default function Stadium3D({
  nodes,
  mode,
  view,
  selected,
  onSelect,
  height = 560,
  scrollProgress,
}: {
  nodes: Node[];
  mode: Mode;
  view: View;
  selected?: string;
  onSelect?: (id: string) => void;
  height?: number;
  scrollProgress?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);

  useEffect(() => {
    const element = box.current;
    if (!element) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6eee4);
    scene.fog = new THREE.Fog(0xe6eee4, 900, 1800);

    const camera = new THREE.PerspectiveCamera(42, 1, 1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D model of the stadium and its mobile network");
    element.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.03;
    controls.minDistance = 70;
    controls.maxDistance = 1300;
    controls.enablePan = true;
    controls.enabled = scrollProgress === undefined;
    controls.target.set(0, 10, 0);

    let cameraGoal: [THREE.Vector3, THREE.Vector3] | null = null;
    let activeScrollProgress = scrollProgress;
    const setView = (nextView: View, immediate = false) => {
      const [position, target] = CAMERAS[nextView];
      cameraGoal = [new THREE.Vector3(...position), new THREE.Vector3(...target)];
      if (immediate && cameraGoal) {
        camera.position.copy(cameraGoal[0]);
        controls.target.copy(cameraGoal[1]);
        cameraGoal = null;
      }
    };
    const setScrollProgress = (progress: number) => {
      activeScrollProgress = Math.max(0, Math.min(1, progress));
      controls.enabled = false;
      cameraGoal = null;
    };
    setView("aerial", true);

    scene.add(new THREE.HemisphereLight(0xdff4ee, 0x3c3025, 1.5));
    const sunlight = new THREE.DirectionalLight(0xffe6bd, 2.2);
    sunlight.position.set(-180, 300, 180);
    scene.add(sunlight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(600, 96),
      new THREE.MeshStandardMaterial({ color: 0xaac39f, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    const city = new THREE.Group();
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xbac0af, roughness: 0.9 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xd1cdbb, roughness: 0.95 });
    let seed = 41;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 38; i++) {
      const angle = (i / 38) * Math.PI * 2 + random() * 0.08;
      const radius = 235 + random() * 135;
      const width = 12 + random() * 23;
      const depth = 14 + random() * 25;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, 8 + random() * 32, depth),
        i % 3 === 0 ? roofMaterial : buildingMaterial,
      );
      building.position.set(Math.cos(angle) * radius, building.geometry.parameters.height / 2 - 1, Math.sin(angle) * radius);
      building.rotation.y = -angle;
      city.add(building);
    }
    scene.add(city);

    const base = new THREE.Mesh(
      ovalBand(151, 165, 3),
      new THREE.MeshStandardMaterial({ color: 0x777b70, roughness: 0.82, side: THREE.DoubleSide }),
    );
    base.position.y = 0;
    scene.add(base);

    const tiers = TIERS.map(([inner, outer, lowerY, upperY]) => {
      const geometry = ovalBand(inner, outer, 0);
      const position = geometry.getAttribute("position") as THREE.BufferAttribute;
      const colors = new Float32Array(position.count * 3);
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      for (let i = 0; i < position.count; i++) {
        position.setY(i, i % 2 === 0 ? lowerY : upperY);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      const stand = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          wireframe: false,
        }),
      );
      scene.add(stand);

      const fascia = new THREE.Mesh(
        ovalBand(inner, outer, lowerY - 0.5),
        new THREE.MeshStandardMaterial({ color: 0x58625c, roughness: 0.85, side: THREE.DoubleSide }),
      );
      scene.add(fascia);
      return stand;
    });

    const pitch = new THREE.Mesh(
      roundedPitch(),
      new THREE.MeshStandardMaterial({ color: 0x438552, roughness: 0.96, side: THREE.DoubleSide }),
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 1.1;
    scene.add(pitch);

    const pitchMarkings = new THREE.Group();
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xe7e6c6, transparent: true, opacity: 0.72 });
    const addLine = (x1: number, z1: number, x2: number, z2: number, width = 0.45) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(Math.hypot(x2 - x1, z2 - z1), 0.18, width),
        markingMaterial,
      );
      line.position.set((x1 + x2) / 2, 1.28, (z1 + z2) / 2);
      line.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      pitchMarkings.add(line);
    };
    addLine(-57, -31, 57, -31);
    addLine(-57, 31, 57, 31);
    addLine(-57, -31, -57, 31);
    addLine(57, -31, 57, 31);
    addLine(0, -31, 0, 31, 0.3);
    const centerCircle = new THREE.Mesh(
      new THREE.TorusGeometry(9, 0.35, 6, 48),
      markingMaterial,
    );
    centerCircle.rotation.x = Math.PI / 2;
    centerCircle.position.y = 1.3;
    pitchMarkings.add(centerCircle);
    scene.add(pitchMarkings);

    const cricketStrip = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.35, 34),
      new THREE.MeshStandardMaterial({ color: 0xbba979, roughness: 0.9 }),
    );
    cricketStrip.position.set(0, 1.35, 0);
    scene.add(cricketStrip);

    const roof = new THREE.Mesh(
      ovalBand(171, 184, 70),
      new THREE.MeshStandardMaterial({ color: 0xb7c1b6, roughness: 0.76, side: THREE.DoubleSide }),
    );
    scene.add(roof);
    const roofBraces = new THREE.Group();
    const braceMaterial = new THREE.MeshStandardMaterial({
      color: 0xb5b7a9,
      metalness: 0.3,
      roughness: 0.6,
    });
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const brace = new THREE.Mesh(new THREE.BoxGeometry(48, 0.8, 1.4), braceMaterial);
      brace.position.set(Math.cos(angle) * 147 * SX, 70.5, Math.sin(angle) * 147);
      brace.rotation.y = -angle;
      roofBraces.add(brace);
    }
    scene.add(roofBraces);
    const roofEdge = new THREE.Mesh(
      ovalBand(119, 123, 70.5),
      new THREE.MeshStandardMaterial({ color: 0xb8b8a6, metalness: 0.25, roughness: 0.55, side: THREE.DoubleSide }),
    );
    scene.add(roofEdge);

    const supports = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const support = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.6, 68, 8),
        new THREE.MeshStandardMaterial({ color: 0x9b927e, metalness: 0.25, roughness: 0.65 }),
      );
      support.position.set(Math.cos(angle) * 170 * SX, 34, Math.sin(angle) * 170);
      supports.add(support);
    }
    scene.add(supports);

    const floodlights = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.8, 92, 8),
        new THREE.MeshStandardMaterial({ color: 0x897d67, roughness: 0.8 }),
      );
      tower.position.set(Math.cos(angle) * 190 * SX, 46, Math.sin(angle) * 190);
      floodlights.add(tower);
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(13, 5, 4),
        new THREE.MeshBasicMaterial({ color: 0xfff0c2 }),
      );
      lamp.position.set(tower.position.x, 94, tower.position.z);
      floodlights.add(lamp);
    }
    scene.add(floodlights);

    const seatCount = 3 * 12 * 112;
    const seats = new THREE.InstancedMesh(
      new THREE.BoxGeometry(2.4, 1.3, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
      seatCount,
    );
    seats.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    const dummy = new THREE.Object3D();
    const seatRows = [
      [80, 95, 4],
      [111, 121, 21],
      [137, 149, 39],
    ];
    const seatPositions: THREE.Vector3[] = [];
    let seatIndex = 0;
    seatRows.forEach(([inner, outer, y]) => {
      for (let row = 0; row < 12; row++) {
        const radius = inner + ((outer - inner) * row) / 11;
        for (let seat = 0; seat < 112; seat++) {
          const angle = (seat / 112) * Math.PI * 2;
          dummy.position.set(Math.cos(angle) * radius * SX, y + row * 0.5, Math.sin(angle) * radius);
          dummy.rotation.set(0, -angle, 0);
          dummy.updateMatrix();
          seats.setMatrixAt(seatIndex++, dummy.matrix);
          seatPositions.push(dummy.position.clone());
        }
      }
    });
    scene.add(seats);

    const coverageColumns = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.5, 1, 1.5).translate(0, 0.5, 0),
      new THREE.MeshBasicMaterial(),
      2400,
    );
    scene.add(coverageColumns);

    const beacons = Array.from({ length: 2400 }, (): Beacon => {
      const tier = TIERS[Math.floor(random() * TIERS.length)];
      const fraction = random();
      const angle = random() * Math.PI * 2;
      const radius = tier[0] + (tier[1] - tier[0]) * fraction;
      return {
        x: Math.cos(angle) * radius * SX,
        z: Math.sin(angle) * radius,
        y: tier[2] + (tier[3] - tier[2]) * fraction,
        load: 0,
        phase: random() * Math.PI * 2,
      };
    });

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    const pulseRings: RingPulse[] = [];
    const columnMatrix = new THREE.Object3D();
    const update = (nextNodes: Node[], nextMode: Mode, selectedId: string) => {
      const positions = nextNodes.map(nodePosition);
      tiers.forEach((tier) => {
        const position = tier.geometry.getAttribute("position") as THREE.BufferAttribute;
        const colors = tier.geometry.getAttribute("color") as THREE.BufferAttribute;
        for (let i = 0; i < position.count; i++) {
          const color = heatColor(interpolatedLoad(nextNodes, positions, position.getX(i), position.getZ(i)));
          colors.setXYZ(i, color.r, color.g, color.b);
        }
        colors.needsUpdate = true;
        (tier.material as THREE.MeshBasicMaterial).wireframe = nextMode === "wire";
      });

      seatPositions.forEach((seat, index) => {
        seats.setColorAt(index, heatColor(interpolatedLoad(nextNodes, positions, seat.x, seat.z)));
      });
      beacons.forEach((beacon) => {
        beacon.load = interpolatedLoad(nextNodes, positions, beacon.x, beacon.z);
      });
      if (seats.instanceColor) seats.instanceColor.needsUpdate = true;

      coverageColumns.visible = nextMode === "columns";
      beacons.forEach((beacon, index) => {
        coverageColumns.setColorAt(index, heatColor(beacon.load));
      });
      if (coverageColumns.instanceColor) coverageColumns.instanceColor.needsUpdate = true;

      nodesGroup.children.slice().forEach((child) => {
        nodesGroup.remove(child);
        disposeObject(child);
      });
      pulseRings.length = 0;

      nextNodes.forEach((node, index) => {
        const position = positions[index];
        const color = heatColor(node.u);
        const group = new THREE.Group();
        group.position.copy(position);
        group.userData.id = node.id;

        const mastHeight = node.t === "Macro" ? 46 : node.t === "COW" ? 24 : 11;
        const mastMaterial = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.45,
          roughness: 0.55,
        });
        const mast = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 1.4, mastHeight, 8),
          mastMaterial,
        );
        mast.position.y = mastHeight / 2;
        mast.userData.id = node.id;
        group.add(mast);

        const antenna = new THREE.Mesh(
          new THREE.ConeGeometry(node.t === "Macro" ? 5 : 3, node.t === "Macro" ? 9 : 5, 4),
          mastMaterial,
        );
        antenna.position.y = mastHeight + 3;
        antenna.userData.id = node.id;
        group.add(antenna);

        if (node.t === "COW") {
          const unit = new THREE.Mesh(
            new THREE.BoxGeometry(14, 5, 6),
            new THREE.MeshStandardMaterial({ color: 0xd9a35b, roughness: 0.7 }),
          );
          unit.position.y = 2.5;
          unit.userData.id = node.id;
          group.add(unit);
        }

        const radius = node.t === "Macro" ? (node.e5 ? 170 : 110) : node.t === "COW" ? 90 : node.nw ? 45 : 60;
        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(radius, 48),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false }),
        );
        disc.rotation.x = -Math.PI / 2;
        disc.position.y = 0.6 - position.y;
        group.add(disc);

        const pulse = new THREE.Mesh(
          new THREE.RingGeometry(radius * 0.96, radius, 64),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          }),
        );
        pulse.rotation.x = -Math.PI / 2;
        pulse.position.y = 0.7 - position.y;
        group.add(pulse);
        pulseRings.push({ ring: pulse, phase: index * 0.7 });

        if (!node.nw || node.t === "COW") {
          const tag = makeLabel(node.id);
          tag.position.y = mastHeight + 17;
          tag.userData.id = node.id;
          group.add(tag);
        }

        if (node.id === selectedId) {
          const selection = new THREE.Mesh(
            new THREE.TorusGeometry(10, 0.9, 8, 40),
            new THREE.MeshBasicMaterial({ color: 0xffffff }),
          );
          selection.rotation.x = Math.PI / 2;
          selection.position.y = mastHeight + 3;
          group.add(selection);
        }

        const backhaul = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, mastHeight * 0.4, 0),
            new THREE.Vector3(-position.x, 5 - position.y, -position.z),
          ]),
          new THREE.LineBasicMaterial({
            color: node.bh >= 10 ? 0x5fcf8a : 0xaaa18d,
            transparent: true,
            opacity: 0.42,
          }),
        );
        group.add(backhaul);
        nodesGroup.add(group);
      });
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown: [number, number] = [0, 0];
    const pickNode = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(nodesGroup.children, true).find((hit) => hit.object.userData.id);
    };
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = [event.clientX, event.clientY];
    };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 5) return;
      const hit = pickNode(event);
      if (hit) api.current?.onSelect?.(hit.object.userData.id as string);
    };
    const onPointerMove = (event: PointerEvent) => {
      renderer.domElement.style.cursor = pickNode(event) ? "pointer" : "grab";
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const width = element.clientWidth;
      const nextHeight = element.clientHeight || height;
      if (!width || !nextHeight) return;
      renderer.setSize(width, nextHeight, false);
      camera.aspect = width / nextHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);

    let animationFrame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      if (activeScrollProgress !== undefined) {
        const path: [number, number[], number[]][] = [
          [0, [0, 640, 900], [0, 10, 0]],
          [0.28, [610, 430, 280], [0, 14, 0]],
          [0.58, [0, 270, 460], [0, 10, 0]],
          [0.82, [0, 110, 255], [0, 8, 0]],
          [1, [0, 670, 1], [0, 0, 0]],
        ];
        let segment = 0;
        while (segment < path.length - 2 && activeScrollProgress > path[segment + 1][0]) segment++;
        const [start, startPosition, startTarget] = path[segment];
        const [end, endPosition, endTarget] = path[segment + 1];
        const amount = THREE.MathUtils.smoothstep(activeScrollProgress, start, end);
        const position = new THREE.Vector3(...startPosition).lerp(new THREE.Vector3(...endPosition), amount);
        const target = new THREE.Vector3(...startTarget).lerp(new THREE.Vector3(...endTarget), amount);
        camera.position.lerp(position, 0.075);
        controls.target.lerp(target, 0.075);
      } else if (cameraGoal) {
        camera.position.lerp(cameraGoal[0], 0.055);
        controls.target.lerp(cameraGoal[1], 0.055);
        if (camera.position.distanceTo(cameraGoal[0]) < 1) cameraGoal = null;
      }
      pulseRings.forEach(({ ring, phase }) => {
        const progress = (elapsed * 0.42 + phase) % 1;
        ring.scale.setScalar(0.5 + progress * 0.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - progress);
      });
      if (coverageColumns.visible) {
        beacons.forEach((beacon, index) => {
          columnMatrix.position.set(beacon.x, beacon.y, beacon.z);
          columnMatrix.scale.set(1, 1.5 + Math.min(1.4, beacon.load) * 7 + Math.sin(elapsed * 2 + beacon.phase) * 1.1, 1);
          columnMatrix.updateMatrix();
          coverageColumns.setMatrixAt(index, columnMatrix.matrix);
        });
        coverageColumns.instanceMatrix.needsUpdate = true;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    api.current = { update, setView, setScrollProgress, onSelect };
    update(nodes, mode, selected || "");

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      if (element.contains(renderer.domElement)) element.removeChild(renderer.domElement);
      api.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (api.current) {
      api.current.onSelect = onSelect;
      api.current.update(nodes, mode, selected || "");
    }
  }, [nodes, mode, selected]);

  useEffect(() => {
    api.current?.setView(view);
  }, [view]);

  useEffect(() => {
    if (scrollProgress !== undefined) api.current?.setScrollProgress(scrollProgress);
  }, [scrollProgress]);

  return (
    <div
      ref={box}
      className="w-full overflow-hidden"
      style={{ height: scrollProgress === undefined ? height : "100%" }}
    />
  );
}
