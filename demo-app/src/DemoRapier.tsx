import { Color3 } from '@babylonjs/core'
import {
  BabylonInspector,
  DebugRapier3D,
  DefaultCamera,
  DefaultEnvironment,
  DynamicBody3D,
  EmptyMaterial,
  fromHexToVec3,
  Group,
  MeshBuilder,
  MeshController,
  PBRMaterial,
  Physics3D,
  StaticBody3D,
  useRapier3D,
  type Vec3,
} from 'solid-akkadi'
import { createSignal } from 'solid-js'

import { COLOR_PALETTES } from './color-palettes'

export function DemoRapier() {
  return (
    <>
      <BabylonInspector />
      <DefaultCamera alpha={-1.5} beta={1.2} radius={8} />
      <Physics3D gravity={[0, -9.81, 0]}>
        <DemoRapierContent />
      </Physics3D>
    </>
  )
}

function DemoRapierContent() {
  const palette = COLOR_PALETTES[2]
  const [sphereInitPos, resetSpherePos] = createSignal([0, 5, 0] as Vec3)
  const [rootRot, setRootRot] = createSignal(0.1)
  const { rapier } = useRapier3D()
  return (
    <>
      <DebugRapier3D />
      <DefaultEnvironment
        options={{
          skyboxColor: Color3.FromHexString(palette[2]),
          groundColor: Color3.FromHexString(palette[2]).scale(1.2),
        }}
      />
      <Group position={[1, 0, 1]} rotation={[0, rootRot(), 0]}>
        <Group
          name="platform-container"
          position={[0, 1, 0]}
          rotation={[0.3, 0, 0]}
        >
          <MeshController
            onPick={() => {
              setRootRot(rootRot() + Math.PI / 4)
            }}
          >
            <StaticBody3D
              colliderDescMapper={(collider) => collider.setRestitution(0.5)}
            >
              <MeshBuilder
                kind="Box"
                opts={{ width: 4, height: 0.5, depth: 4 }}
                name="box"
              >
                <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
              </MeshBuilder>

              <MeshBuilder kind="Torus" opts={{ diameter: 2, thickness: 0.9 }}>
                <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
              </MeshBuilder>
            </StaticBody3D>
          </MeshController>
        </Group>
        <StaticBody3D
          colliderDescMapper={(col) => col.setSensor(true)}
          onStartCollide={() => {
            resetSpherePos([Math.random() * 2, 7, Math.random() * 2])
          }}
        >
          <MeshBuilder
            name="box-trigger"
            kind="Box"
            opts={{ width: 12, height: 0.5, depth: 12 }}
          >
            <EmptyMaterial />
          </MeshBuilder>
        </StaticBody3D>
        <DynamicBody3D
          name="sphere-container"
          position={sphereInitPos()}
          bodyDesc={rapier.RigidBodyDesc.dynamic().setLinearDamping(1)}
          colliderDesc={rapier.ColliderDesc.ball(0.5).setRestitution(0.5)}
        >
          <MeshBuilder
            kind="Geodesic"
            opts={{
              size: 0.6,
            }}
          >
            <PBRMaterial
              baseColor={fromHexToVec3(palette[3])}
              metallic={0}
              roughness={1}
            />
          </MeshBuilder>
        </DynamicBody3D>
      </Group>
    </>
  )
}
