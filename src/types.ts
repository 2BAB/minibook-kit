import type { HeadConfig } from 'vitepress'

export interface MinibookNavItem {
  text: string
  link: string
  icon?: 'person' | 'github' | 'x' | 'linkedin'
}

export interface MinibookSidebarItem {
  text: string
  link?: string
  items?: MinibookSidebarItem[]
}

export interface MinibookLocaleConfig {
  label: string
  lang: string
  title?: string
  description?: string
  link?: string
  nav?: MinibookNavItem[]
  sidebar: MinibookSidebarItem[]
}

export interface MinibookAnalyticsConfig {
  googleTagId?: string
  googleTagIds?: Record<string, string | undefined>
}

export interface MinibookDeploymentConfig {
  cloudflareProject?: string
  productionBranch?: string
  domains?: string[]
}

export interface MinibookOwnerConfig {
  name?: string
  author?: string
  homepage?: string
  links?: MinibookNavItem[]
}

export interface MinibookThemeConfig {
  accentColor?: string
  darkAccentColor?: string
  cssVars?: Record<string, string>
  darkCssVars?: Record<string, string>
}

export interface MinibookKitDeploymentConfig {
  productionBranch?: string
  domainSuffix?: string
  cloudflareProjectPrefix?: string
  cloudflareProjects?: Record<string, string | undefined>
  domains?: Record<string, string[] | undefined>
}

export interface MinibookKitConfig {
  owner?: MinibookOwnerConfig
  repository?: string
  favicon?: string
  theme?: MinibookThemeConfig
  analytics?: MinibookAnalyticsConfig
  deployment?: MinibookKitDeploymentConfig
}

export interface MinibookConfig {
  id: string
  title: string
  description: string
  author?: string
  base?: string
  srcDir?: string
  outDir?: string
  domain?: string
  repository?: string
  favicon?: string
  accentColor?: string
  theme?: MinibookThemeConfig
  appearance?: boolean | 'dark' | 'force-dark' | 'force-auto'
  cleanUrls?: boolean
  ignoreDeadLinks?: boolean | Array<string | RegExp>
  head?: HeadConfig[]
  nav?: MinibookNavItem[]
  locales: Record<string, MinibookLocaleConfig>
  analytics?: MinibookAnalyticsConfig
  deployment?: MinibookDeploymentConfig
}
