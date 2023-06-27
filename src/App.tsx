import { Canvas } from './Canvas'
import { Group } from './Group'
import { MeshBuilder } from './MeshBuilder'
import { Show, createSignal, onCleanup, For } from 'solid-js'
import type { Vec3 } from './types'

export function App() {
  const [posBall, setPosBall] = createSignal<Vec3>([2, 2, 2])
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
    <Canvas>
      <Group>
        {/* <MeshBuilder kind="Box" opts={{ size: 1 }} visible={visibleCube()} /> */}
        <Show when={visibleCube()}>
          <MeshBuilder kind="Box" opts={{ size: 1 }} />
        </Show>
        <Group position={posBall()}>
          <MeshBuilder kind="Sphere" opts={{ diameter: 1 }} />
        </Group>
      </Group>
    </Canvas>
  )
}
