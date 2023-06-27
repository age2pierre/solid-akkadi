import { MeshBuilder } from '@babylonjs/core'
import type { Component } from 'solid-js'
import { createUniqueId, onCleanup } from 'solid-js'
import { useAkkadi } from './context'

export const Box: Component = () => {
  const { scene } = useAkkadi()

  const mesh_instance = MeshBuilder.CreateBox(
    createUniqueId(),
    undefined,
    scene,
  )

  onCleanup(() => {
    scene.removeMesh(mesh_instance)
  })

  return mesh_instance as any
}
