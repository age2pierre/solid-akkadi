import { readdirSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { LoadSceneAsync, NullEngine } from '@babylonjs/core'
import { registerBuiltInLoaders } from '@babylonjs/loaders/dynamic'
import { default as prettier, type RequiredOptions } from 'prettier'

import prettierrc from '../../.prettierrc.json' assert { type: 'json' }

registerBuiltInLoaders()

// There is an issue with draco compression on nodejs (and with other extension that needs to load wasm)
// cf  https://github.com/BabylonJS/Babylon.js/issues/13422
// and https://forum.babylonjs.com/t/importasyncmesh-on-server-side-without-scene/34151/42

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const assetsDirPath = resolve(__dirname, '../public/assets')
const outFilePath = resolve(__dirname, '../src/metadata.ts')

const files = readdirSync(assetsDirPath, { withFileTypes: true })
  .filter((f) => f.isFile())
  .map((f) => f.name)

console.log(
  `found ${files.length} file(s) to parse :\n${files.map((f) => ` => ${f}`).join('\n')}`,
)

const engine = new NullEngine()

const record_meta = await files.reduce(async (acc, file) => {
  const _acc = await acc
  console.log(`loading ${file} ...`)
  const b64 = await readFile(resolve(assetsDirPath, file), {
    encoding: 'base64',
  })
  const file_extension = extname(file)
  const scene = await LoadSceneAsync('data:;base64,' + b64, engine, {
    pluginExtension: file_extension,
  })
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
  outFilePath,
  await prettier.format(
    `export {}
    declare global {
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace SolidAkkadi {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface AssetRecord ${JSON.stringify(record_meta)} } }`,
    {
      parser: 'typescript',
      ...(prettierrc as Partial<RequiredOptions>),
    },
  ),
)
