import { Color3 } from '@babylonjs/core'

import { color_palettes } from './color-palettes'
import { MeshAsset } from './lib/assets'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { Group } from './lib/Group'
import { MeshController } from './lib/meshes'
import { createSpringSignals, PRESETS } from './lib/spring'

export function DemoAssets() {
  const [crateScale, setCrateScale] = createSpringSignals<3>(
    [5, 5, 5],
    PRESETS.wobbly,
  )
  const palette = color_palettes[6]
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
      <Group name="meshes-containter">
        <Group name="crate-container" position={[2, 0, 2]} scale={crateScale()}>
          <MeshController
            onDoublePick={() => {
              setCrateScale([8, 4, 8])
              setTimeout(() => {
                setCrateScale([5, 5, 5])
              }, 50)
            }}
          >
            <MeshAsset assetFile="Crate.glb" />
          </MeshController>
        </Group>
        <Group
          name="tile_01"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 2]}
        >
          <MeshAsset
            assetFile="Vulpes_modules.glb"
            namesToInstantiate={['__root__', 'wall_corner_ruined']}
          />
          <MeshAsset
            assetFile="Vulpes_modules.glb"
            namesToInstantiate={['__root__', 'wall_corner_ruined_ivy']}
          />
        </Group>
        <Group name="tile_02" rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <MeshAsset
            assetFile="Vulpes_modules.glb"
            namesToInstantiate={['__root__', 'wall_corner_ruined']}
          />
        </Group>
        <Group
          name="tile_03"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[2, 0, 2]}
        >
          <MeshAsset
            assetFile="Vulpes_modules.glb"
            namesToInstantiate={['__root__', 'flat_coblblestone']}
          />
        </Group>
        <Group
          name="tile_04"
          rotation={[-Math.PI / 2, -Math.PI / 2, 0]}
          position={[2, 0, 0]}
        >
          <MeshAsset
            assetFile="Vulpes_modules.glb"
            namesToInstantiate={['__root__', 'wall_corner_touret']}
          />
        </Group>
        <Group
          name="robot-container"
          scale={[0.25, 0.25, 0.25]}
          position={[1, 0, 1]}
        >
          <MeshAsset assetFile="Animated_Robot.glb" />
        </Group>
      </Group>
    </>
  )
}
