import { Color3 } from '@babylonjs/core'
import { createSignal } from 'solid-js'

import { color_palettes } from './color-palettes'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { Group } from './lib/Group'
import { PBRMaterial } from './lib/materials'
import { MeshBuilder, MeshController } from './lib/meshes'
import {
  DebugRapier,
  DynamicBody,
  Physics,
  StaticBody,
  useRapier,
} from './lib/rapier'
import { type Vec3 } from './lib/types'
import { fromHexToVec3 } from './lib/utils'

export function DemoRapier() {
  return (
    <>
      <BabylonInspector />
      <DefaultCamera alpha={-1.5} beta={1.2} radius={8} />
      <Physics gravity={[0, -9.81, 0]}>
        <DemoRapierContent />
      </Physics>
    </>
  )
}

function DemoRapierContent() {
  const palette = color_palettes[2]
  const [sphereInitPos, resetSpherePos] = createSignal([0, 5, 0] as Vec3)
  const [rootRot, setRootRot] = createSignal(0.1)
  const { rapier } = useRapier()
  return (
    <>
      <DebugRapier />
      <DefaultEnvironment
        options={{
          skyboxColor: Color3.FromHexString(palette[2]),
          groundColor: Color3.FromHexString(palette[2]).scale(1.2),
        }}
      />
      <Group position={[1, 0, 1]} rotation={[0, rootRot(), 0]}>
        <StaticBody
          name="platform-container"
          position={[0, 1, 0]}
          rotation={[0.2, 0, 0]}
          bodyDesc={rapier.RigidBodyDesc.fixed()}
          colliderDesc={rapier.ColliderDesc.cuboid(2, 0.25, 2).setRestitution(
            0.5,
          )}
        >
          <MeshController
            onPick={() => {
              setRootRot(rootRot() + Math.PI / 4)
            }}
          >
            <MeshBuilder
              kind="Box"
              opts={{ width: 4, height: 0.5, depth: 4 }}
              name="box"
            >
              <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
            </MeshBuilder>
          </MeshController>
        </StaticBody>
        <StaticBody
          name="trigger-body"
          position={[0, -3, 2]}
          rotation={[0, 0, 0]}
          bodyDesc={rapier.RigidBodyDesc.fixed()}
          colliderDesc={rapier.ColliderDesc.cuboid(8, 1, 8).setSensor(true)}
          onStartCollide={() => {
            resetSpherePos([Math.random() * 2, 7, Math.random() * 2])
          }}
        />
        <DynamicBody
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
        </DynamicBody>
      </Group>
    </>
  )
}
