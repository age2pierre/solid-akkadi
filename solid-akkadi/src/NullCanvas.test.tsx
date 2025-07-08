import { type Scene } from '@babylonjs/core'
import { createRoot, createSignal, type JSX } from 'solid-js'
import { describe, expect, it } from 'vitest'

import { DefaultCamera } from './DefaultCamera'
import { Group } from './Group'
import { NullCanvas } from './NullCanvas'

describe('NullCanvas', () => {
  it('it can handle a basic scene with reactive node parenting', (): void => {
    let scene!: Scene

    const Component = (props: { offset: number }): JSX.Element => {
      return (
        <NullCanvas ref={scene}>
          <DefaultCamera />
          <Group
            name="container"
            position={[props.offset, props.offset, props.offset]}
          >
            <Group name="empty" position={[2, 2, 2]} />
          </Group>
        </NullCanvas>
      )
    }

    const { dispose, setOffset } = createRoot((dispose) => {
      const [offset, setOffset] = createSignal(3)
      void (<Component offset={offset()} />)
      return { dispose, setOffset }
    })
    const container = scene.getTransformNodeByName('container')
    expect(container).toBeDefined()
    expect(container?.getChildren()).toHaveLength(1)

    const empty = scene.getTransformNodeByName('empty')
    expect(empty?.parent?.name).toBe('container')
    const absPos = empty?.getAbsolutePosition()
    expect(absPos?.x).toBe(5)
    expect(absPos?.y).toBe(5)
    expect(absPos?.z).toBe(5)

    setOffset(6)
    // wait a tick to resolve all effects
    // await new Promise((done) => setTimeout(done, 0))
    scene.render(false, true)

    const absPos2 = empty?.getAbsolutePosition()
    expect(absPos2?.x).toBe(8)
    expect(absPos2?.y).toBe(8)
    expect(absPos2?.z).toBe(8)

    dispose()
  })
})
