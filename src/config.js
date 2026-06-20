const defaultTheme = {
  accentColor: '#2563eb',
  darkAccentColor: '#60a5fa'
}

export function defineMinibook(config) {
  return config
}

export function defineMinibookKit(config) {
  return config
}

function defaultDomain(bookId, suffix) {
  if (!suffix) return undefined
  return `${bookId}.${suffix.replace(/^\./, '')}`
}

function defaultCloudflareProject(bookId, kit) {
  const configuredProject = kit?.deployment?.cloudflareProjects?.[bookId]
  if (configuredProject) return configuredProject

  const prefix = kit?.deployment?.cloudflareProjectPrefix
  return prefix ? `${prefix}-${bookId}` : bookId
}

export function normalizeMinibook(config, kit = {}) {
  if (!config.locales?.root) {
    throw new Error(`Minibook "${config.id}" must define locales.root.`)
  }

  const theme = {
    ...defaultTheme,
    ...(kit.theme ?? {}),
    ...(config.theme ?? {}),
    ...(config.accentColor ? { accentColor: config.accentColor } : {})
  }
  const domain = config.domain ?? defaultDomain(config.id, kit.deployment?.domainSuffix)
  const deploymentDomains = config.deployment?.domains ?? kit.deployment?.domains?.[config.id] ?? (domain ? [domain] : [])
  const googleTagId = config.analytics?.googleTagId ?? kit.analytics?.googleTagIds?.[config.id] ?? kit.analytics?.googleTagId
  const analytics = googleTagId ? { googleTagId } : undefined

  return {
    author: kit.owner?.author ?? kit.owner?.name,
    domain,
    repository: kit.repository,
    favicon: kit.favicon,
    nav: kit.owner?.links,
    accentColor: theme.accentColor,
    theme,
    appearance: true,
    cleanUrls: true,
    ...config,
    srcDir: config.srcDir ?? config.id,
    outDir: config.outDir ?? `.dist/${config.id}`,
    analytics,
    deployment: {
      cloudflareProject: defaultCloudflareProject(config.id, kit),
      productionBranch: kit.deployment?.productionBranch ?? 'main',
      domains: deploymentDomains,
      ...config.deployment
    }
  }
}
