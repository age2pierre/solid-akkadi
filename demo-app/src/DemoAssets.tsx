import { Color3 } from '@babylonjs/core'
import {
  BabylonInspector,
  createSpringSignals,
  DefaultCamera,
  DefaultEnvironment,
  MeshAsset,
  MeshController,
  SPRING_PRESETS,
  TransformNode,
} from 'solid-akkadi'
import { type JSX } from 'solid-js'

import { COLOR_PALETTES } from './color-palettes'

export function DemoAssets(): JSX.Element {
  const [crateScale, setCrateScale] = createSpringSignals<3>(
    [5, 5, 5],
    SPRING_PRESETS.wobbly,
  )
  const palette = COLOR_PALETTES[1]
  return (
    <>
      <BabylonInspector />
      <DefaultEnvironment
        options={{
          skyboxColor: Color3.FromHexString(palette[2]),
          groundColor: Color3.FromHexString(palette[2]).scale(1.2),
        }}
      />
      <DefaultCamera alpha={-1.5} beta={1.2} radius={10} />
      <TransformNode name="meshes-containter">
        <MeshController
          onDoublePick={() => {
            setCrateScale([8, 4, 8])
            setTimeout(() => {
              setCrateScale([5, 5, 5])
            }, 50)
          }}
        >
          <MeshAsset
            name="crate-container"
            position={[2, 0, 2]}
            scale={crateScale()}
            assetFile="Crate.glb"
          />
        </MeshController>
        <MeshAsset
          name="tile_01"
          rotation={[-Math.PI / 2, Math.PI / 2, 0]}
          position={[0, 0, 2]}
          assetFile="Vulpes_modules.glb"
          namesToInstantiate={[
            '__root__',
            'wall_corner_ruined',
            'wall_corner_ruined_ivy',
          ]}
        />
        <MeshAsset
          name="tile_02"
          rotation={[-Math.PI / 2, -Math.PI / 2, 0]}
          assetFile="Vulpes_modules.glb"
          namesToInstantiate={['__root__', 'wall_corner_ruined']}
        />
        <MeshAsset
          name="tile_03"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[2, 0, 2]}
          assetFile="Vulpes_modules.glb"
          namesToInstantiate={['__root__', 'flat_coblblestone']}
        />
        <MeshAsset
          name="tile_04"
          rotation={[-Math.PI / 2, Math.PI / 2, 0]}
          position={[2, 0, 0]}
          assetFile="Vulpes_modules.glb"
          namesToInstantiate={['__root__', 'wall_corner_touret']}
        />
        <MeshAsset
          name="robot-container"
          scale={[0.25, 0.25, 0.25]}
          position={[1, 0, 1]}
          assetFile="Animated_Robot.glb"
        />
      </TransformNode>
    </>
  )
}
