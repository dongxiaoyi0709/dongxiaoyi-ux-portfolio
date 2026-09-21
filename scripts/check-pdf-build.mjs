import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const paths = [...app.matchAll(/pdf: '(\/sharing\/[^']+\.pdf)(?:\?v=[a-f0-9]+)?'/g)].map((match) => match[1])
assert.equal(paths.length, 5, 'All five design sharing PDFs must be linked')
for (const path of paths) {
  const data = await readFile(new URL(`../dist/client${path}`, import.meta.url))
  assert.equal(data.subarray(0, 5).toString(), '%PDF-', `Valid published PDF: ${path}`)
}
const assets = await readdir(new URL('../dist/client/assets/', import.meta.url))
assert.ok(!assets.some((name) => name.startsWith('PdfReader-') || name.startsWith('pdf.worker-')), 'Native PDF links must not ship the custom reader or Worker')
console.log('Verified five native PDF files; no custom reader or Worker shipped')
