import { Color3 } from '@babylonjs/core'
import { BabylonInspector } from './lib/BabylonInspector'
import { DefaultCamera, DefaultEnvironment } from './lib/defaultStage'
import { color_palettes } from './color-palettes'
import { MeshAsset } from './lib/assets'
import { Group } from './lib/Group'

export const DemoAssets = () => {
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
      <DefaultCamera alpha={-1.5} beta={1.2} radius={8} />
      <Group scale={[5, 5, 5]}>
        <MeshAsset fileName="Crate.glb" />
      </Group>
    </>
  )
}
