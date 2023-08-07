import { KeyboardEventTypes } from '@babylonjs/core'
import {
  BabylonInspector,
  CharacterController,
  createSpringSignals,
  fromHexToVec3,
  MeshAsset,
  MeshBuilder,
  PBRMaterial,
  Physics,
  PolarCamera,
  SPRING_PRESETS,
  SpringGroup,
  StaticBody,
  useBabylon,
  useRapier3d,
} from 'solid-akkadi'
import { onCleanup, untrack } from 'solid-js'
import { createStore } from 'solid-js/store'

import { color_palettes } from './color-palettes'

export function DemoCharacter() {
  return (
    <>
      <BabylonInspector />
      <Physics gravity={[0, -9.81, 0]}>
        <DemoEnvironnement />
        <Player />
      </Physics>
    </>
  )
}

const palette = color_palettes[1]

function DemoEnvironnement() {
  return (
    <>
      <StaticBody
        colliderDescMapper={(collider) => collider.setRestitution(0.5)}
      >
        <MeshAsset assetFile="arena.glb" />
      </StaticBody>
    </>
  )
}

function Player() {
  const { rapier } = useRapier3d()
  const [movement, setMov] = createSpringSignals<3>([0, 0, 0])
  const dpad = createDpadStore()

  return (
    <CharacterController
      colliderDesc={rapier.ColliderDesc.capsule(0.25, 0.25)}
      controllerMapper={(ctrl) => {
        ctrl.enableAutostep(0.3, 0.1, false)
        ctrl.enableSnapToGround(0.3)
        return ctrl
      }}
      movement={movement()}
      position={[0, 10, 0]}
      onFrame={({ delta_ms }) => {
        const { down, up, left, right } = untrack(() => dpad)
        const diag = (left || right) && (up || down)
        const max_speed = (delta_ms / 1000) * 4
        const speed = diag ? Math.SQRT1_2 * max_speed : max_speed
        setMov([
          left ? -speed : right ? speed : 0,
          -max_speed,
          up ? speed : down ? -speed : 0,
        ])
      }}
    >
      <SpringGroup name="player_container" opts={SPRING_PRESETS.stiff}>
        <MeshBuilder
          kind="Capsule"
          opts={{ height: 1, radius: 0.25 }}
          name="player"
        >
          <PBRMaterial baseColor={fromHexToVec3(palette[2])} />
        </MeshBuilder>
      </SpringGroup>
      <SpringGroup name="camera_container" opts={SPRING_PRESETS.slow}>
        <PolarCamera azimuth={-Math.PI / 2} name="fps_camera" />
      </SpringGroup>
    </CharacterController>
  )
}

function createDpadStore() {
  const { scene } = useBabylon()
  const keyMap = {
    up: ['z'],
    left: ['q'],
    down: ['s'],
    right: ['d'],
  }
  const [dpad, setDpad] = createStore({
    up: false,
    left: false,
    down: false,
    right: false,
  })
  const observer = scene.onKeyboardObservable.add((kb_info) => {
    if (keyMap.up.includes(kb_info.event.key)) {
      setDpad({ up: kb_info.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.left.includes(kb_info.event.key)) {
      setDpad({ left: kb_info.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.down.includes(kb_info.event.key)) {
      setDpad({ down: kb_info.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.right.includes(kb_info.event.key)) {
      setDpad({ right: kb_info.type === KeyboardEventTypes.KEYDOWN })
    }
  })
  onCleanup(() => {
    observer?.remove()
  })
  return dpad
}
