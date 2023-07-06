import { type ParentProps } from 'solid-js'
import { BabylonContext, createGlobalContext } from './useBabylon'

export function Canvas(
  _props: ParentProps<{
    class?: string
  }>,
) {
  const canvasRef = (
    <canvas class={_props.class} />
  ) as unknown as HTMLCanvasElement

  const root = createGlobalContext(canvasRef)

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== canvasRef) return
    root.engine.resize()
  }).observe(canvasRef)

  return (
    <BabylonContext.Provider value={root}>
      {canvasRef}
      <template id="babylon-children">{_props.children}</template>
    </BabylonContext.Provider>
  )
}
