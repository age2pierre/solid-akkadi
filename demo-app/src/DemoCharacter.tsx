import { KeyboardEventTypes } from '@babylonjs/core'
import {
  BabylonInspector,
  CharacterController3D,
  createSpringSignals,
  fromHexToVec3,
  MeshAsset,
  MeshBuilder,
  PBRMaterial,
  Physics3D,
  PolarCamera,
  SPRING_PRESETS,
  SpringGroup,
  StaticBody3D,
  useBabylon,
  useRapier3D,
} from 'solid-akkadi'
import { onCleanup, untrack } from 'solid-js'
import { createStore } from 'solid-js/store'

import { COLOR_PALETTES } from './color-palettes'

export function DemoCharacter() {
  return (
    <>
      <BabylonInspector />
      <Physics3D gravity={[0, -9.81, 0]}>
        <DemoEnvironnement />
        <Player />
      </Physics3D>
    </>
  )
}

const palette = COLOR_PALETTES[1]

function DemoEnvironnement() {
  return (
    <>
      <StaticBody3D
        colliderDescMapper={(collider) => collider.setRestitution(0.5)}
      >
        <MeshAsset assetFile="arena.glb" />
      </StaticBody3D>
    </>
  )
}

function Player() {
  const { rapier } = useRapier3D()
  const [movement, setMov] = createSpringSignals<3>([0, 0, 0])
  const dpad = createDpadStore()

  return (
    <CharacterController3D
      colliderDesc={rapier.ColliderDesc.capsule(0.25, 0.25)}
      controllerMapper={(ctrl) => {
        ctrl.enableAutostep(0.3, 0.1, false)
        ctrl.enableSnapToGround(0.3)
        return ctrl
      }}
      movement={movement()}
      position={[0, 10, 0]}
      onFrame={({ deltaMs }) => {
        const { down, up, left, right } = untrack(() => dpad)
        const diag = (left || right) && (up || down)
        const maxSpeed = (deltaMs / 1000) * 4
        const speed = diag ? Math.SQRT1_2 * maxSpeed : maxSpeed
        setMov([
          left ? -speed : right ? speed : 0,
          -maxSpeed,
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
    </CharacterController3D>
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
  const observer = scene.onKeyboardObservable.add((kbInfo) => {
    if (keyMap.up.includes(kbInfo.event.key)) {
      setDpad({ up: kbInfo.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.left.includes(kbInfo.event.key)) {
      setDpad({ left: kbInfo.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.down.includes(kbInfo.event.key)) {
      setDpad({ down: kbInfo.type === KeyboardEventTypes.KEYDOWN })
    }
    if (keyMap.right.includes(kbInfo.event.key)) {
      setDpad({ right: kbInfo.type === KeyboardEventTypes.KEYDOWN })
    }
  })
  onCleanup(() => {
    observer?.remove()
  })
  return dpad
}
