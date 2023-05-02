import { MeshBuilder } from '@babylonjs/core'
import type { Vector3Attributes } from '../renderer'
import { Canvas } from '../renderer'
import { createSignal, mergeProps, onCleanup } from 'solid-js'
import { useAkkadi } from '../renderer/context'
import { PRESETS, createSpringSignal } from '../renderer/spring'

export function App() {
  return (
    <Canvas>
      <freeCamera name="main_camera" position={[0, 0, 10]} target={[0, 0, 0]} />
      {/* <Box /> */}
      <SpringBox spring_preset="stiff" init_position={[0, 0.5, 0]} />
      <SpringBox spring_preset="noWobble" init_position={[0, 0.5, 2]} />
      <SpringBox spring_preset="gentle" init_position={[0, 0.5, 4]} />
      <SpringBox spring_preset="wobbly" init_position={[0, 0.5, 6]} />
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

type SpringBoxProps = {
  init_position?: Vector3Attributes
  spring_preset?: keyof typeof PRESETS
}

function SpringBox(props: SpringBoxProps) {
  const { scene } = useAkkadi()
  const merged_props = mergeProps(
    {
      init_position: [0, 0.5, 0] as Vector3Attributes,
      spring_preset: 'wobbly' as keyof typeof PRESETS,
    },
    props,
  )

  const [val, setVal] = createSpringSignal(
    -1,
    PRESETS[merged_props.spring_preset],
  )

  const mesh_instance = MeshBuilder.CreateBox('box_mesh', undefined, scene)

  const timer_id = setInterval(() => {
    setVal((prev_val) => -1 * prev_val)
  }, 5000)

  onCleanup(() => {
    clearInterval(timer_id)
  })

  return (
    <transformNode
      name="spring_cube_tf"
      position={[
        val() + merged_props.init_position[0],
        merged_props.init_position[1],
        merged_props.init_position[2],
      ]}
    >
      <mesh name="spring_box_mesh" fromInstance={mesh_instance} />
    </transformNode>
  )
}
