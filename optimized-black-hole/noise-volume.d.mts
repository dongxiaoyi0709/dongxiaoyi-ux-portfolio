import type { Gpu, Texture } from 'vgpu'

export const NOISE_VOLUME_SIZE: number

export function createNoiseVolume(gpu: Gpu, size?: number, label?: string): Texture

export function noiseVolumeSampler(vgpu: typeof import('vgpu'), gpu: Gpu): GPUSampler
