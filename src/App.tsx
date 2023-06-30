import { Group } from './Group'
import { MeshBuilder } from './MeshBuilder'
import { Show, createSignal, onCleanup } from 'solid-js'
import { PRESETS, createSpringSignals } from './spring'
import type { Vec3 } from './types'

export function App() {
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
    <Group name="app-container">
      {/* <MeshBuilder kind="Box" opts={{ size: 1 }} visible={visibleCube()} /> */}
      <Show when={visibleCube()}>
        <MeshBuilder kind="Box" opts={{ size: 1 }} name="toggling-box" />
      </Show>
      <Group name="sphere-container" position={posBall() as Vec3}>
        <MeshBuilder
          kind="Sphere"
          opts={{ diameter: 1 }}
          name="moving-sphere"
        />
      </Group>
    </Group>
  )
}
