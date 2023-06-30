if (import.meta.env.DEV) {
  await import('@babylonjs/core/Debug/debugLayer')
  await import('@babylonjs/inspector')
}

import '@babylonjs/loaders'

import { render } from 'solid-js/web'
import { App } from './App'
import { Canvas } from './Canvas'

render(
  () => (
    <Canvas>
      <App />
    </Canvas>
  ),
  document.getElementById('root')!,
)
