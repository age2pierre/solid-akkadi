import {
  type AbstractMesh,
  type Light,
  type Node,
  type TransformNode,
} from '@babylonjs/core'
import {
  type Accessor,
  createContext,
  type JSX,
  type ParentProps,
  useContext,
} from 'solid-js'

// --- Context Definitions ---

/**
 * Context for any Babylon.js Node. Used for parenting.
 * @category Core
 */
const NodeContext = createContext<Accessor<Node | null>>()

/**
 * Context for any Babylon.js TransformNode.
 * @category Core
 */
const TransformNodeContext = createContext<Accessor<TransformNode | null>>()

/**
 * Context for any Babylon.js AbstractMesh. Used for attaching materials.
 * @category Meshes
 */
const AbstractMeshContext = createContext<Accessor<AbstractMesh | null>>()

/**
 * Context for any Babylon.js Light.
 * @category Lights
 */
const LightContext = createContext<Accessor<Light | null>>()

// --- Context Hooks ---

/**
 * Hook to access the nearest parent Node context.
 * @category Core
 */
export function useNodeContext(): Accessor<Node | null> {
  const ctx = useContext(NodeContext)
  if (!ctx)
    throw new Error(
      'useNodeContext should be used inside a NodeContext.Provider',
    )
  return ctx
}

/**
 * Hook to access the nearest parent TransformNode context.
 * @category Core
 */
export function useTransformNodeContext(): Accessor<TransformNode | null> {
  const ctx = useContext(TransformNodeContext)
  if (!ctx)
    throw new Error(
      'useTransformNodeContext should be used inside a TransformNodeContext.Provider',
    )
  return ctx
}

/**
 * Hook to access the nearest parent AbstractMesh context.
 * @category Meshes
 */
export function useAbstractMeshContext(): Accessor<AbstractMesh | null> {
  const ctx = useContext(AbstractMeshContext)
  if (!ctx)
    throw new Error(
      'useAbstractMeshContext should be used inside a AbstractMeshContext.Provider',
    )
  return ctx
}

/**
 * Hook to access the nearest parent Light context.
 * @category Lights
 */
export function useLightContext(): Accessor<Light | null> {
  const ctx = useContext(LightContext)
  if (!ctx)
    throw new Error(
      'useLightContext should be used inside a LightContext.Provider',
    )
  return ctx
}

// --- Provider Component Helper ---

type ProvidersProps = ParentProps & {
  node?: Accessor<Node | null>
  transformNode?: Accessor<TransformNode | null>
  abstractMesh?: Accessor<AbstractMesh | null>
  light?: Accessor<Light | null>
}

/**
 * A helper component to chain all the context providers.
 * This simplifies components that create BJS objects.
 * @internal
 */
export function BjsNodeProvider(props: ProvidersProps): JSX.Element {
  return (
    <NodeContext.Provider value={props.node }>
      <TransformNodeContext.Provider value={props.transformNode }>
        <AbstractMeshContext.Provider value={props.abstractMesh }>
          <LightContext.Provider value={props.light }>
            {props.children}
          </LightContext.Provider>
        </AbstractMeshContext.Provider>
      </TransformNodeContext.Provider>
    </NodeContext.Provider>
  )
}
