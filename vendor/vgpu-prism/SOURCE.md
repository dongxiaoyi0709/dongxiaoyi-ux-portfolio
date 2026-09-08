# vgpu.sh prism background

This directory contains the prism-background source copied from the official
`vercel-labs/vgpu` repository at commit `993d6db`.

- Source: https://github.com/vercel-labs/vgpu/tree/main/apps/docs/app/%5Blang%5D/%28home%29/components/prism-background
- License: MIT (see `LICENSE` in this directory)
- Local adaptation: the two `@/lib/example-renderer` imports were changed to
  the colocated `./example-renderer` module, and the readonly feature list is
  copied before calling the browser's `requestDevice` API so the renderer is
  compatible with this project's WebGPU type definitions. Rendering,
  interaction, quality selection and cleanup behavior are otherwise preserved.
