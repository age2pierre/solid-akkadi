import type { ParentComponent } from 'solid-js'
import { onCleanup, mergeProps } from 'solid-js'
import { AkkadiGlobalContext, createGlobalContext } from './context'
import { KeyboardEventTypes } from '@babylonjs/core'

export const Canvas: ParentComponent<{
  width?: string
  height?: string
}> = (_props) => {
  const props = mergeProps(
    {
      height: '100vh',
      width: '100vw',
    },
    _props,
  )

  const canvasRef = (
    <canvas style={{ height: '100%', width: '100%' }} />
  ) as unknown as HTMLCanvasElement

  const containerRef = (
    <div
      style={{
        width: props.width,
        height: props.height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {canvasRef}
    </div>
  ) as unknown as HTMLDivElement

  const root = createGlobalContext(canvasRef)
  const debug_observer = root.scene.onKeyboardObservable.add((kb_info) => {
    if (
      kb_info.event.altKey &&
      kb_info.event.key === 'i' &&
      kb_info.type === KeyboardEventTypes.KEYDOWN
    ) {
      root.toggle_debug()
      canvasRef.focus()
    }
  })

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== containerRef) return
    root.engine.resize()
  }).observe(containerRef)

  onCleanup(() => {
    root.scene.onKeyboardObservable.remove(debug_observer)
  })

  return (
    <AkkadiGlobalContext.Provider value={root}>
      {containerRef}
      {_props.children}
    </AkkadiGlobalContext.Provider>
  )
}
