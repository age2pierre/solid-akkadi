import { Canvas } from '../renderer'
import { Match, Switch, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { SpringBox } from './SpringBox'
import { Box } from './Box'

export function App() {
  const [demo_id, set_demo_id] = createSignal(0)
  return (
    <Canvas id="akkadi-canva">
      <freeCamera name="main_camera" position={[0, 0, 10]} target={[0, 0, 0]} />
      <Switch fallback={null}>
        <Match when={demo_id() === 1}>
          <Box />
        </Match>
        <Match when={demo_id() === 2}>
          <SpringBox spring_preset="stiff" init_position={[0, 0.5, 0]} />
          <SpringBox spring_preset="noWobble" init_position={[0, 0.5, -2]} />
          <SpringBox spring_preset="gentle" init_position={[0, 0.5, -4]} />
          <SpringBox spring_preset="wobbly" init_position={[0, 0.5, -6]} />
        </Match>
      </Switch>
      <Portal mount={document.getElementById('akkadi-canva')!}>
        <div
          style={{
            margin: '10px',
            padding: '10px',
            background: 'rgba(0.5,0.5,0.5,0.5)',
            color: 'white',
          }}
        >
          <button onClick={() => set_demo_id((prev) => Math.max(0, prev - 1))}>
            {'< PREV'}
          </button>
          <button onClick={() => set_demo_id((prev) => Math.min(2, prev + 1))}>
            {'NEXT >'}
          </button>
          <span>{` Demo #${demo_id()}`}</span>
        </div>
      </Portal>
    </Canvas>
  )
}
