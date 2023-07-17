import { Color3 } from '@babylonjs/core'

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
import { fromHexToVec3 } from './lib/utils'

export function DemoRapier() {
  return (
    <>
      <BabylonInspector />
      <DefaultCamera alpha={-1.5} beta={1.2} radius={8} />
      <Physics gravity={[0, -1, 0]}>
        <DemoRapierContent />
      </Physics>
    </>
  )
}

function DemoRapierContent() {
  const palette = color_palettes[2]
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
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        colliderDesc={rapier.ColliderDesc.cuboid(2, 0.25, 2).setRestitution(
          0.5,
        )}
        onStartCollide={(target) => {
          console.log(
            `collided with ${(target.parent()?.userData as any).type}`,
          )
        }}
      >
        <MeshBuilder
          kind="Box"
          opts={{ width: 4, height: 0.5, depth: 4 }}
          name="box"
        >
          <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
        </MeshBuilder>
      </StaticBody>
      <DynamicBody
        name="sphere-container"
        position={[0, 5, 0]}
        bodyDesc={rapier.RigidBodyDesc.dynamic()
          .setLinearDamping(0)
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
