import type { Accessor, JSX } from 'solid-js'
import { onCleanup, mergeProps } from 'solid-js'
import type { Instance } from './renderer'
import { insert } from './renderer'
import { AkkadiGlobalContext, createGlobalContext } from './context'
import { KeyboardEventTypes } from '@babylonjs/core'

export interface Props {
  children: JSX.Element
  fallback?: JSX.Element
  id?: string
  class?: string
  height?: string
  width?: string
  tabIndex?: number
}

export function Canvas(_props: Props) {
  const props = mergeProps(
    {
      height: '100vh',
      width: '100vw',
    },
    _props,
  )

  const canvas = (
    <canvas style={{ height: '100%', width: '100%' }} />
  ) as HTMLCanvasElement

  const containerRef = (
    <div
      id={props.id}
      class={props.class}
      style={{
        height: props.height,
        width: props.width,
        position: 'relative',
        overflow: 'hidden',
      }}
      tabIndex={props.tabIndex}
    >
      {canvas}
    </div>
  ) as HTMLDivElement

  const root = createGlobalContext(canvas)

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== containerRef) return
    root.engine.resize()
  }).observe(containerRef)

  insert(
    root.scene,
    (
      (
        <AkkadiGlobalContext.Provider value={root}>
          {props.children}
        </AkkadiGlobalContext.Provider>
      ) as unknown as Accessor<Instance[]>
    )(),
  )

  const debug_observer = root.scene.onKeyboardObservable.add((kb_info) => {
    if (
      kb_info.event.altKey &&
      kb_info.event.key === 'i' &&
      kb_info.type === KeyboardEventTypes.KEYDOWN
    ) {
      root.toggle_debug()
      canvas.focus()
    }
  })

  onCleanup(() => {
    root.scene.onKeyboardObservable.remove(debug_observer)
  })

  return containerRef
}
