import { MeshBuilder } from '@babylonjs/core'
import type { Vector3Attributes } from '../renderer'
import { Canvas } from '../renderer'
import { createSignal, onCleanup } from 'solid-js'
import { useAkkadi } from '../renderer/context'

export function App() {
  return (
    <Canvas>
      <freeCamera name="main_camera" position={[0, 0, 10]} target={[0, 0, 0]} />
      <Box />
    </Canvas>
  )
}

function Box() {
  const { scene, engine } = useAkkadi()

  const mesh_instance = MeshBuilder.CreateBox('box_mesh', undefined, scene)

  const [pos, setPos] = createSignal<Vector3Attributes>([-2, 0.5, 0])

  let counter = 0

  const observer = scene.onBeforeRenderObservable.add(() => {
    counter += engine.getDeltaTime()
    setPos(([_x, y, z]) => [Math.sin(counter / 1000), y, z])
  })

  onCleanup(() => scene.onBeforeRenderObservable.remove(observer))

  return (
    <transformNode name="cubes_tf" position={pos()}>
      <mesh name="box_mesh" fromInstance={mesh_instance} />
    </transformNode>
  )
}
