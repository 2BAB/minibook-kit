import type { MinibookConfig, MinibookKitConfig } from './types'

export function defineMinibook(config: MinibookConfig): MinibookConfig
export function defineMinibookKit(config: MinibookKitConfig): MinibookKitConfig
export function normalizeMinibook(config: MinibookConfig, kit?: MinibookKitConfig): MinibookConfig
