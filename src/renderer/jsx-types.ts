import type { JSX } from 'solid-js'
import type { Node, TransformNode, Mesh, FreeCamera } from '@babylonjs/core'

type ElementProps<T> = {
  name?: string
  children?: JSX.Element
  ref?: T | ((el: T) => void)
}

export type Vector3Attributes = [number, number, number]

export type NodeProps = ElementProps<Node>

export type TransformNodeProps = {
  position?: Vector3Attributes
  scaling?: Vector3Attributes
  rotation?: Vector3Attributes
}

export type MeshProps = {
  fromInstance: Mesh
}

export type FreeCameraProps = {
  position: Vector3Attributes
  target: Vector3Attributes
}

export type NodeElements = {
  transformNode: ElementProps<TransformNode> & TransformNodeProps
  mesh: ElementProps<Mesh> & MeshProps
  freeCamera: ElementProps<FreeCamera> & FreeCameraProps
}
export type TagElements = keyof NodeElements

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends NodeElements {}
  }
}
