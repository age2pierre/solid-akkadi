import { MeshBuilder } from '@babylonjs/core'
import type { Vector3Attributes } from '../renderer'
import { mergeProps, onCleanup } from 'solid-js'
import { useAkkadi } from '../renderer/context'
import { PRESETS, createSpringSignal } from '../renderer/spring'

type SpringBoxProps = {
  init_position?: Vector3Attributes
  spring_preset?: keyof typeof PRESETS
}
export function SpringBox(props: SpringBoxProps) {
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
    console.debug('onCleanup SpringBox')
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
