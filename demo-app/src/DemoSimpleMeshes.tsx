import { Color3 } from '@babylonjs/core'
import {
  BabylonInspector,
  createSpringSignals,
  DefaultCamera,
  DefaultEnvironment,
  fromHexToVec3,
  Html,
  MeshBuilder,
  MeshController,
  PBRMaterial,
  SPRING_PRESETS,
  TransformNode,
} from 'solid-akkadi'
import { createSignal, type JSX, onCleanup, Show } from 'solid-js'

import { CONTAINER_ID } from './App'
import { COLOR_PALETTES } from './color-palettes'
import { default as classes } from './demos.module.css'

export function DemoSimpleMeshes(): JSX.Element {
  const [posBall, setPosBall] = createSpringSignals<3>(
    [2, 2, 2],
    SPRING_PRESETS.wobbly,
  )
  const [visibleCube, setCubeVisibility] = createSignal(true)
  function toggleCube(): void {
    setCubeVisibility(!visibleCube())
  }

  let toggle = false
  const timer = setInterval(() => {
    setPosBall(toggle ? [2, 2, 2] : [1, 1, 1])
    toggle = !toggle
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })

  const palette = COLOR_PALETTES[6]
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
      <TransformNode name="meshes-container" position={[0, 0.5, 0]}>
        <Show when={visibleCube()}>
          <MeshBuilder
            kind="Box"
            opts={{ size: 1 }}
            name="toggling-box"
            position={[-2, 0, -2]}
          >
            <PBRMaterial baseColor={fromHexToVec3(palette[1])} />
          </MeshBuilder>
        </Show>
        <MeshBuilder
          position={posBall()}
          kind="Sphere"
          opts={{ diameter: 1 }}
          name="moving-sphere"
        >
          <PBRMaterial baseColor={fromHexToVec3(palette[3])} />
        </MeshBuilder>
        <MeshController onPick={toggleCube}>
          <MeshBuilder
            position={[-2, 0, 2]}
            kind="TorusKnot"
            name="clickable-torus"
            opts={{ radius: 0.5, radialSegments: 64, tube: 0.2 }}
          >
            <PBRMaterial
              baseColor={fromHexToVec3(palette[0])}
              metallic={1}
              roughness={0}
            />
          </MeshBuilder>
        </MeshController>
        <MeshBuilder
          kind="Goldberg"
          opts={{}}
          position={[3, -0.5, 0]}
          name="mesh-with-tag"
        >
          <PBRMaterial
            baseColor={fromHexToVec3(palette[0])}
            metallic={0}
            roughness={1}
          />
          <Html mountId={CONTAINER_ID}>
            <div class={classes.crateGui}>
              Welcome to{' '}
              <a href="https://github.com/age2pierre/solid-akkadi">
                Solid-Akkadi
              </a>
            </div>
          </Html>
        </MeshBuilder>
      </TransformNode>
    </>
  )
}
