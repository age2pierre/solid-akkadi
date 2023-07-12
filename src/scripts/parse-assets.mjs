import { readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NullEngine, SceneLoader } from '@babylonjs/core'
import '@babylonjs/loaders'
import { readFile } from 'node:fs/promises'
import { default as prettier } from 'prettier'
import prettierrc from '../../.prettierrc.json' assert { type: 'json' }

// There is an issue with draco compression on nodejs (and with other extension that needs to load wasm)
// cf  https://github.com/BabylonJS/Babylon.js/issues/13422
// and https://forum.babylonjs.com/t/importasyncmesh-on-server-side-without-scene/34151/42

const META_FILE = 'metadata.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const assetsDirPath = resolve(__dirname, '../assets')
const files = readdirSync(assetsDirPath)

console.log(
  `found ${files.length} file(s) to parse :\n${files.map((f) => ` => ${f}\n`)}`,
)

const engine = new NullEngine()

const record_meta = await files
  .filter((f) => f !== META_FILE)
  .reduce(async (acc, file) => {
    const _acc = await acc
    console.log(`loading ${file} ...`)
    const b64 = await readFile(resolve(assetsDirPath, file), {
      encoding: 'base64',
    })
    const file_extension = extname(file)
    const scene = await SceneLoader.LoadAsync(
      '',
      'data:;base64,' + b64,
      engine,
      undefined,
      file_extension,
    )
    const meta = {
      file_extension,
      meshes: scene.meshes.map((m) => m.name),
      animationGroups: scene.animationGroups.map((a) => a.name),
      materials: scene.materials.map((m) => m.name),
      skeletons: scene.skeletons.map((s) => s.name),
      cameras: scene.cameras.map((c) => c.name),
      textures: scene.textures.map((t) => t.name),
    }
    console.debug(meta)
    console.log(`loaded ${file}`)

    return {
      ..._acc,
      [file]: meta,
    }
  }, Promise.resolve({}))

writeFileSync(
  resolve(assetsDirPath, META_FILE),
  prettier.format(`export default ${JSON.stringify(record_meta)} as const`, {
    parser: 'typescript',
    ...prettierrc,
  }),
)
