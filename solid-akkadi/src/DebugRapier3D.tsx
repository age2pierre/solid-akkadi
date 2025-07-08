import {
  Color3,
  Mesh,
  StandardMaterial,
  UtilityLayerRenderer,
  VertexBuffer,
  VertexData,
} from '@babylonjs/core'
import { type JSX,onCleanup } from 'solid-js'

import { createFrameEffect } from './effects'
import { useRapier3D } from './rapier-3d'
import { range } from './utils'

/**
 * Shows the different colliders as wireframed overlays
 *
 * @category Physic3d
 * */

export function DebugRapier3D(): JSX.Element {
  const { world } = useRapier3D()
  const debugMesh = new Mesh(
    'RapierDebugMesh',
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene,
  )
  const material = new StandardMaterial(
    'DebugRapierMaterial',
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene,
  )
  material.wireframe = true
  material.emissiveColor = Color3.White()
  debugMesh.material = material

  createFrameEffect(() => {
    const buffers = world.debugRender()
    const indicesNb = buffers.vertices.length / 3
    if (debugMesh.getTotalIndices() !== indicesNb) {
      const vertexData = new VertexData()
      vertexData.positions = buffers.vertices
      vertexData.indices = range(indicesNb)
      vertexData.colors = buffers.colors
      vertexData.applyToMesh(debugMesh, true)
    } else {
      debugMesh.updateVerticesData(VertexBuffer.PositionKind, buffers.vertices)
      debugMesh.updateVerticesData(VertexBuffer.ColorKind, buffers.colors)
    }
  })

  onCleanup(() => {
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene.removeMesh(
      debugMesh,
      true,
    )
  })
  return <></>
}
