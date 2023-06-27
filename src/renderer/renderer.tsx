import type { Accessor, Component, JSX } from 'solid-js'
import { createMemo, splitProps, untrack } from 'solid-js'
import type { Node } from '@babylonjs/core'
import { Camera, Light, Scene } from '@babylonjs/core'
import { FreeCamera, Mesh, TransformNode, Vector3 } from '@babylonjs/core'
import { useContext } from 'solid-js'
import { createRenderer } from 'solid-js/universal'
import { AkkadiGlobalContext } from './context'
import type {
  FreeCameraProps,
  MeshProps,
  TagElements,
  TransformNodeProps,
  Vector3Attributes,
} from './jsx-types'
import type { ConditionalKeys } from 'type-fest'

export * from 'solid-js'

export const DEBUG = window.location.search.indexOf('debug') > -1

export function log(action: string, ...options: any[]) {
  DEBUG &&
    console.debug(
      `%c${action} %c`,
      'font-weight: bold',
      'font-weight: normal',
      ...options,
    )
}

export type Instance = Node & { metadata: Record<string, never> }

let counter = 0

function exhaustiveCheck(arg: never) {
  throw new Error(arg + ' is not handled')
}

export const custom_renderer = createRenderer<Instance>({
  createElement: function (tag: string): Instance {
    const ctx = useContext(AkkadiGlobalContext)
    const temp_name = `${tag}-${counter++}`
    log('createElement', tag)
    switch (tag as TagElements) {
      case 'transformNode': {
        const el = new TransformNode(temp_name, ctx.scene)
        return el
      }
      case 'mesh': {
        const el = new Mesh(temp_name, ctx.scene)
        return el
      }
      case 'freeCamera': {
        const el = new FreeCamera(temp_name, new Vector3(0, 0, 0), ctx.scene)
        return el
      }
      default:
        throw new Error(`Creation of element ${tag} is not handled!`)
    }
  },
  createTextNode: function (_value: string): Instance {
    throw new Error('Function createTextNode not implemented.')
  },
  replaceText: function (_textNode: Instance, _value: string): void {
    throw new Error('Function replaceText not implemented.')
  },
  isTextNode: function (_node: Instance): boolean {
    throw new Error('Function isTextNode not implemented.')
  },
  setProperty: function <T>(
    node: Instance,
    name: string,
    value: T,
    _prev?: T | undefined,
  ): void {
    if (name !== 'position') {
      log('setProperty', { node, name, value, _prev })
    }
    if (name === 'name') {
      if (typeof value === 'string') {
        node.name = value
      }
      return
    }
    if (node instanceof Mesh) {
      const _name = name as keyof MeshProps
      switch (_name) {
        case 'fromInstance': {
          if (!(value instanceof Mesh)) throw new Error('value is not a Mesh')
          value.metadata = node.metadata
          value.parent = node.parent
          value.name = node.name
          node.getChildren().forEach((child) => (child.parent = value))
          node.parent = null
          node.dispose(true)
          return
        }
        default: {
          exhaustiveCheck(_name)
          return
        }
      }
    }
    if (node instanceof TransformNode) {
      const _name = name as keyof TransformNodeProps
      switch (_name) {
        case 'position': {
          setVector3Attributes(node, _name, value as Vector3Attributes)
          return
        }
        case 'scaling': {
          setVector3Attributes(node, _name, value as Vector3Attributes)
          return
        }
        case 'rotation': {
          setVector3Attributes(node, _name, value as Vector3Attributes)
          return
        }
      }
    }
    if (node instanceof FreeCamera) {
      const _name = name as keyof FreeCameraProps
      switch (_name) {
        case 'position': {
          setVector3Attributes(node, _name, value as Vector3Attributes)
          return
        }
        case 'target': {
          setVector3Attributes(node, _name, value as Vector3Attributes)
          return
        }
      }
    }
    exhaustiveCheck(name as never)
  },
  insertNode: function (
    parent: Instance | Scene,
    node: Instance,
    _anchor?: Instance | undefined,
  ): void {
    log('insertNode', { node, parent })
    if (parent instanceof Scene) {
      if (node instanceof Camera) {
        parent.addCamera(node)
      }
      if (node instanceof TransformNode) {
        parent.addTransformNode(node)
      }
      if (node instanceof Light) {
        parent.addLight(node)
      }
    } else {
      node.parent = parent
    }
  },
  removeNode: function (_parent: Instance, node: Instance): void {
    log('removeNode', { node, _parent })
    node.getDescendants().forEach((desc) => (desc.parent = null))
    node.parent = null
    node.dispose()
  },
  getParentNode: function (node: Instance): Instance {
    log('getParentNode', { node })
    return node.parent!
  },
  getFirstChild: function (node: Instance): Instance {
    log('getFirstChild', { node })
    return node.getChildren()[0]
  },
  getNextSibling: function (node: Instance): Instance {
    log('getNextSibling', { node })
    return node.parent!.getChildren((child) => child !== node)[0]
  },
})

export const {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
} = custom_renderer

type DynamicProps<T> = T & {
  children?: JSX.Element
  component?: Component<T> | string | keyof JSX.IntrinsicElements
}

/**
 * renders an arbitrary custom or native component and passes the other props
 * ```typescript
 * <Dynamic component={multiline() ? 'textarea' : 'input'} value={value()} />
 * ```
 * @description https://www.solidjs.com/docs/latest/api#%3Cdynamic%3E
 */
export function Dynamic<T>(props: DynamicProps<T>): Accessor<JSX.Element> {
  const [p, others] = splitProps(props, ['component'])
  const ret = createMemo<JSX.Element>(() => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const component = p.component as Function | string
    switch (typeof component) {
      case 'function':
        return untrack(() => component(others))
      case 'string': {
        const el = createElement(component)
        spread(el, others, true)
        return el
      }
      default:
        break
    }
  })
  return ret
}

function setVector3Attributes<T extends Node>(
  node: T,
  name: ConditionalKeys<T, Vector3> & string,
  value?: Vector3Attributes,
) {
  if (!(name in node)) {
    throw new Error(
      `name ${name} not in node, impossible to set value ${value}`,
    )
  }
  if (!(node[name] instanceof Vector3)) {
    throw new Error(
      `name ${name} is not a vector3, impossible to set value ${value}`,
    )
  }
  if (value == undefined) {
    console.error(`unexpected undefined ${name} props`)
    return
  }
  const [_x, _y, _z] = value
  ;(node[name] as Vector3).x = _x
  ;(node[name] as Vector3).y = _y
  ;(node[name] as Vector3).z = _z
  return
}
