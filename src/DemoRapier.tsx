import { Color3 } from '@babylonjs/core'
import { createSignal } from 'solid-js'

import { color_palettes } from './color-palettes'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { PBRMaterial } from './lib/materials'
import { MeshBuilder } from './lib/meshes'
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
      <StaticBody
        name="box-container"
        position={[0, 0.5, 0]}
        rotation={[0.2, 0, 0]}
        colliderDesc={rapier.ColliderDesc.cuboid(2, 0.25, 2).setRestitution(
          0.5,
        )}
      >
        <MeshBuilder
          kind="Box"
          opts={{ width: 4, height: 0.5, depth: 4 }}
          name="box"
        >
          <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
        </MeshBuilder>
      </StaticBody>
      <StaticBody
        name="trigger-body"
        position={[0, -4, 3]}
        colliderDesc={rapier.ColliderDesc.cuboid(5, 1, 5).setSensor(true)}
        onStartCollide={(target) => {
          console.log(
            `collided with ${(target.parent()?.userData as any).type}`,
          )
          resetSpherePos([Math.random(), 5, Math.random()])
        }}
      />
      <DynamicBody
        name="sphere-container"
        position={sphereInitPos()}
        bodyDesc={rapier.RigidBodyDesc.dynamic()
          .setLinearDamping(1)
          .setUserData({ type: 'BALL' })}
        colliderDesc={rapier.ColliderDesc.ball(0.5).setRestitution(0.5)}
      >
        <MeshBuilder kind="Sphere" opts={{ diameter: 1 }}>
          <PBRMaterial
            baseColor={fromHexToVec3(palette[0])}
            metallic={1}
            roughness={0}
          />
        </MeshBuilder>
      </DynamicBody>
    </>
  )
}
