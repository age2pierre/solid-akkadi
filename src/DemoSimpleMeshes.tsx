import { Group } from './lib/Group'
import { MeshBuilder } from './lib/MeshBuilder'
import { Show, createSignal, onCleanup } from 'solid-js'
import { PRESETS, createSpringSignals } from './lib/spring'
import type { Vec3 } from './lib/types'
import { DefaultStage } from './lib/DefaultStage'
import { color_palettes } from './color-palettes'
import { StandardMaterial } from './lib/materials'
import { fromHexToVec3 } from './lib/utils'
import { BabylonInspector } from './lib/BabylonInspector'
import { Color3 } from '@babylonjs/core'
import { HemisphericLight } from './lib/lights'

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

  return (
    <>
      <HemisphericLight name="main-light" />
      <BabylonInspector />
      <DefaultStage
        options={{
          skyboxColor: Color3.FromHexString(color_palettes[2][0]),
          groundColor: Color3.FromHexString(color_palettes[2][0]).scale(1.2),
        }}
      />
      <Group name="app-container" position={[0, 0.5, 0]}>
        {/* <MeshBuilder kind="Box" opts={{ size: 1 }} visible={visibleCube()} /> */}
        <Show when={visibleCube()}>
          <MeshBuilder kind="Box" opts={{ size: 1 }} name="toggling-box">
            <StandardMaterial
              diffuseColor={fromHexToVec3(color_palettes[2][1])}
              specularColor={fromHexToVec3(color_palettes[2][1])}
            />
          </MeshBuilder>
        </Show>
        <Group name="sphere-container" position={posBall() as Vec3}>
          <MeshBuilder
            kind="Sphere"
            opts={{ diameter: 1 }}
            name="moving-sphere"
          >
            <StandardMaterial
              diffuseColor={fromHexToVec3(color_palettes[2][3])}
              specularColor={fromHexToVec3(color_palettes[2][3])}
            />
          </MeshBuilder>
        </Group>
      </Group>
    </>
  )
}
