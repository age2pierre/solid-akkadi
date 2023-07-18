import { Color3 } from '@babylonjs/core'
import { createSignal, onCleanup, Show } from 'solid-js'

import { CONTAINER_ID } from './App'
import { color_palettes } from './color-palettes'
import { default as classes } from './demos.module.css'
import { MeshAsset } from './lib/assets'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { Group } from './lib/Group'
import { Html } from './lib/html'
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
  function toggleCube() {
    setCubeVisibility(!visibleCube())
  }

  let toggle_pos = false
  const timer_pos = setInterval(() => {
    setPosBall(toggle_pos ? [2, 2, 2] : [1, 1, 1])
    toggle_pos = !toggle_pos
  }, 1000)

  onCleanup(() => {
    clearInterval(timer_pos)
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
        <Group name="box-container" position={[-2, 0, -2]}>
          <Show when={visibleCube()}>
            <MeshBuilder kind="Box" opts={{ size: 1 }} name="toggling-box">
              <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
            </MeshBuilder>
          </Show>
          <Html mountId={CONTAINER_ID}>
            <div class={classes.crateGui}>Welcome to Solid-Akkadi</div>
          </Html>
        </Group>
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
          <MeshController onPick={toggleCube}>
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
          <MeshController onPick={toggleCube}>
            <MeshAsset assetFile="Crate.glb" />
          </MeshController>
        </Group>
      </Group>
    </>
  )
}
