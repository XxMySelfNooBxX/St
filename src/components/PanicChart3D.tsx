import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Task } from '../types';

// Animated bar that grows from floor on mount
function PanicBar({ task, index, total, isAtRisk }: {
  task: Task; index: number; total: number; isAtRisk: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const heightRef = useRef(0);
  const targetHeight = Math.max(0.05, ((task.panicScore ?? 0) / 10) * 3.5);
  const spacing = 1.8;
  const totalWidth = (total - 1) * spacing;
  const xPos = index * spacing - totalWidth / 2;

  const color =
    (task.panicScore ?? 0) >= 8 ? '#ef4444' :
    (task.panicScore ?? 0) >= 5 ? '#f59e0b' : '#6366f1';

  const category =
    task.category === 'Urgent & Critical' ? 'URG' :
    task.category === 'High Dependency' ? 'DEP' : 'MIC';

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (heightRef.current < targetHeight) {
      heightRef.current = Math.min(heightRef.current + delta * 2.5, targetHeight);
      meshRef.current.scale.y = heightRef.current / targetHeight;
      meshRef.current.position.y = heightRef.current / 2;
    }
  });

  const shortTitle = task.title.length > 16 ? task.title.substring(0, 14) + '…' : task.title;

  return (
    <group position={[xPos, 0, 0]}>
      {/* The bar */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        scale={[1, 0.001, 1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.1, targetHeight, 1.1]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isAtRisk ? 0.4 : 0.1}
          roughness={0.15}
          metalness={0.3}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.4}
          thickness={1.5}
          ior={1.4}
          transparent
          opacity={task.status === 'completed' ? 0.3 : 1}
        />
      </mesh>

      {/* Floating "AT RISK" label for risky tasks */}
      {isAtRisk && (
        <Float speed={2} floatIntensity={0.25}>
          <Text
            position={[0, targetHeight + 0.5, 0]}
            fontSize={0.22}
            color="#ef4444"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            ⚠ AT RISK
          </Text>
        </Float>
      )}

      {/* Panic score on top of bar */}
      <Text
        position={[0, targetHeight + (isAtRisk ? 1.0 : 0.25), 0]}
        fontSize={0.35}
        color={color}
        anchorX="center"
        anchorY="bottom"
        fontWeight={700}
      >
        {task.panicScore ?? 0}
      </Text>

      {/* Task short title below floor */}
      <Text
        position={[0, -0.18, 0]}
        fontSize={0.18}
        color="#71717a"
        anchorX="center"
        anchorY="top"
        maxWidth={1.5}
        textAlign="center"
      >
        {shortTitle}
      </Text>

      {/* Category badge */}
      <Text
        position={[0, -0.48, 0]}
        fontSize={0.14}
        color={color}
        anchorX="center"
        anchorY="top"
      >
        {category}
      </Text>

      {/* Glow base disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

function Scene({ tasks }: { tasks: Task[] }) {
  const pending = tasks.filter(t => t.status !== 'completed');
  const all = tasks.length > 0 ? tasks : [];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 4, -4]} intensity={0.8} color="#818cf8" />
      <pointLight position={[4, 2, 4]} intensity={0.5} color="#fb7185" />

      {/* Dark floor grid */}
      <Grid
        args={[20, 20]}
        position={[0, -0.01, 0]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#27272a"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#3f3f46"
        fadeDistance={18}
        fadeStrength={1}
        infiniteGrid
      />

      {/* High-quality contact shadows for realistic grounding */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.7}
        scale={20}
        blur={2.5}
        far={4.5}
        resolution={1024}
        color="#000000"
      />

      {/* Bars */}
      {all.map((task, i) => (
        <PanicBar
          key={task.id}
          task={task}
          index={i}
          total={all.length}
          isAtRisk={!!task.atRisk}
        />
      ))}

      {/* Axis label */}
      <Text position={[0, 4.2, 0]} fontSize={0.3} color="#52525b" anchorX="center">
        PANIC SCORE (0–10)
      </Text>

      {/* Empty state */}
      {all.length === 0 && (
        <Text position={[0, 1.5, 0]} fontSize={0.4} color="#52525b" anchorX="center">
          No tasks yet — brain dump first
        </Text>
      )}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={pending.filter(t => t.atRisk).length > 0}
        autoRotateSpeed={0.6}
      />
      <Environment preset="city" />
    </>
  );
}

interface PanicChart3DProps {
  tasks: Task[];
}

export function PanicChart3D({ tasks }: PanicChart3DProps) {
  return (
    <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/10 bg-zinc-950 relative">
      <div className="absolute top-3 left-3 z-10 flex gap-2 items-center pointer-events-none">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded border border-white/10">
          3D Panic Chart
        </div>
        <div className="text-[10px] text-zinc-600 bg-zinc-900/70 px-2 py-1 rounded">drag to orbit · scroll to zoom</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-3 pointer-events-none">
        {[
          { color: 'bg-red-500', label: 'Urgent' },
          { color: 'bg-amber-400', label: 'Dependency' },
          { color: 'bg-indigo-500', label: 'Micro' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[9px] text-zinc-500">
            <div className={`w-2 h-2 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
      </div>

      <Canvas
        camera={{ position: [0, 4, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#09090b' }}
      >
        <Suspense fallback={null}>
          <Scene tasks={tasks} />
        </Suspense>
      </Canvas>
    </div>
  );
}
