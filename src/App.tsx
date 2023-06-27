import { Canvas } from './Canvas'
import { Group } from './Group'
import { Box } from './Box'
import { Show, createSignal, onCleanup } from 'solid-js'
import type { Vec3 } from './types'

export function App() {
  const [posCube, setPosCube] = createSignal<Vec3>([2, 2, 2])
  const [visibleCube, setCubeVisibility] = createSignal(true)

  let toggle_pos = false
  const timer_pos = setInterval(() => {
    setPosCube(toggle_pos ? [2, 2, 2] : [1, 1, 1])
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
        <Show when={visibleCube()}>
          <Box />
        </Show>
        <Group position={posCube()}>
          <Box />
        </Group>
      </Group>
    </Canvas>
  )
}
