import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { loadConfigFromFile } from 'vite'
import { reflectSource } from '@vgpu/wgsl/reflect-source'

const root = fileURLToPath(new URL('../', import.meta.url))
const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, undefined, root)
const plugin = loaded?.config.plugins.flat(Infinity).find((item) => item?.name === '@vgpu/wgsl')
assert.ok(plugin, 'The production build must use the WGSL loader')
const transform = typeof plugin.transform === 'function' ? plugin.transform : plugin.transform.handler

const shaders = [
  ['pipelines/shared/glass/glass.wgsl', ['position', 'normal']],
  ['pipelines/shared/glass/glass-back.wgsl', ['position', 'normal']],
  ['pipelines/light/passes/glass-accent/glass-accent.wgsl', ['position', 'normal']],
  ['pipelines/light/passes/shadow/shadow.wgsl', ['position', 'coverage', 'travel']],
  ['pipelines/shared/wireframe/wireframe.wgsl', ['position', 'normal']],
]

for (const [path, attributes] of shaders) {
  test(`production shader preserves geometry attribute names: ${path}`, async () => {
    const file = fileURLToPath(new URL(`../vendor/vgpu-prism/${path}`, import.meta.url))
    const result = await transform.call({ addWatchFile() {} }, await readFile(file, 'utf8'), file)
    const { default: shader } = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`)
    const vertex = reflectSource(shader.wgsl).entryPoints.find((entry) => entry.name === 'vs_main')
    assert.ok(vertex, 'The vertex entry point must remain available')
    assert.deepEqual(
      vertex.inputs.filter((input) => input.location !== undefined).map(({ name, location }) => ({ name, location })),
      attributes.map((name, location) => ({ name, location })),
    )
  })
}
