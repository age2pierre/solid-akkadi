import { Color3 } from '@babylonjs/core'
import { createSignal, onCleanup, Show } from 'solid-js'

import { color_palettes } from './color-palettes'
import { MeshAsset } from './lib/assets'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { Group } from './lib/Group'
import { PBRMaterial } from './lib/materials'
import { MeshBuilder, MeshController } from './lib/meshes'
import { createSpringSignals, PRESETS } from './lib/spring'
import type { Vec3 } from './lib/types'
import { fromHexToVec3 } from './lib/utils'

export function DemoSimpleMeshes() {
  const [posBall, setPosBall] = createSpringSignals<3>(
    [2, 2, 2],
    PRESETS.wobbly,
  )
  const [visibleCube, setCubeVisibility] = createSignal(true)

  let toggle_pos = false
  const timer_pos = setInterval(() => {
    setPosBall(toggle_pos ? [2, 2, 2] : [1, 1, 1])
    toggle_pos = !toggle_pos
  }, 1000)

  const timer_vis = setInterval(() => {
    setCubeVisibility(!visibleCube())
  }, 1500)

  onCleanup(() => {
    clearInterval(timer_pos)
    clearInterval(timer_vis)
  })

  const palette = color_palettes[6]
  return (
    <>
      <BabylonInspector />
      <DefaultEnvironment
        options={{
          skyboxColor: Color3.FromHexString(palette[2]),
          groundColor: Color3.FromHexString(palette[2]).scale(1.2),
        }}
      />
      <DefaultCamera alpha={-1.5} beta={1.2} radius={8} />
      <Group name="meshes-container" position={[0, 0.5, 0]}>
        <Show when={visibleCube()}>
          <MeshBuilder kind="Box" opts={{ size: 1 }} name="toggling-box">
            <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
          </MeshBuilder>
        </Show>
        <Group name="sphere-container" position={posBall() as Vec3}>
          <MeshBuilder
            kind="Sphere"
            opts={{ diameter: 1 }}
            name="moving-sphere"
          >
            <PBRMaterial baseColor={fromHexToVec3(palette[3])} />
          </MeshBuilder>
        </Group>
        <Group name="sphere-container" position={[-2, 0, 2]}>
          <MeshController
            onDoublePick={() => window.alert('double clicked torus hourray !')}
          >
            <MeshBuilder
              kind="TorusKnot"
              opts={{ radius: 0.5, radialSegments: 64, tube: 0.2 }}
            >
              <PBRMaterial
                baseColor={fromHexToVec3(palette[0])}
                metallic={1}
                roughness={0}
              />
            </MeshBuilder>
          </MeshController>
        </Group>
        <Group name="crate-container" position={[3, -0.5, 0]} scale={[7, 7, 7]}>
          <MeshController
            onDoublePick={() => window.alert('double clicked crate hourray !')}
          >
            <MeshAsset assetFile="Crate.glb" />
          </MeshController>
        </Group>
      </Group>
    </>
  )
}
