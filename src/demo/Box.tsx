import { MeshBuilder } from '@babylonjs/core'
import type { Vector3Attributes } from '../renderer'
import { createSignal, onCleanup } from 'solid-js'
import { useAkkadi } from '../renderer/context'

export function Box() {
  const { scene, engine } = useAkkadi()

  const mesh_instance = MeshBuilder.CreateBox('box_mesh', undefined, scene)

  const [pos, setPos] = createSignal<Vector3Attributes>([-2, 0.5, 0])

  let counter = 0

  const observer = scene.onBeforeRenderObservable.add(() => {
    counter += engine.getDeltaTime()
    setPos(([_x, y, z]) => [Math.sin(counter / 1000), y, z])
  })

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
    console.debug('onCleanup Box')
  })

  return (
    <transformNode name="cubes_tf" position={pos()}>
      <mesh name="box_mesh" fromInstance={mesh_instance} />
    </transformNode>
  )
}
