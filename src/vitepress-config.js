import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig } from 'vitepress'
import { normalizeMinibook } from './config.js'

const repoRoot = process.cwd()
const bookId = resolveBookId()
const bookConfigPath = resolve(repoRoot, bookId, 'book.config.ts')
const kitConfigPath = resolve(repoRoot, 'minibook-kit.config.ts')

if (!existsSync(bookConfigPath)) {
  throw new Error(`Cannot find book config: ${bookConfigPath}. Set BOOK=<book-folder> before running VitePress.`)
}

function resolveBookId() {
  const configuredBookId = process.env.BOOK || process.env.npm_config_book
  if (configuredBookId) return configuredBookId

  const books = readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(repoRoot, name, 'book.config.ts')))
    .sort()

  if (books.length === 1) return books[0]

  throw new Error(`Set BOOK=<book-folder> before running VitePress. Discovered books: ${books.join(', ') || 'none'}.`)
}

const kitModule = existsSync(kitConfigPath) ? await import(pathToFileURL(kitConfigPath).href) : { default: {} }
const module = await import(pathToFileURL(bookConfigPath).href)
const book = normalizeMinibook(module.default, kitModule.default)
const rootLocale = book.locales.root

function analyticsHead(tagId) {
  if (!tagId) return []

  return [
    ['script', { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${tagId}` }],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${tagId}');`
    ]
  ]
}

function legacyHashRedirect() {
  return [
    'script',
    {},
    `;(() => {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    const target = hash.slice(1);
    window.history.replaceState(null, '', target + window.location.search);
  }
})();`
  ]
}

function cssVars(vars = {}) {
  return Object.entries(vars)
    .filter(([, value]) => value)
    .map(([name, value]) => `  --${name.replace(/^--/, '')}: ${value};`)
    .join('\n')
}

function themeHead(theme) {
  if (!theme) return undefined

  const light = cssVars({
    'book-accent': theme.accentColor,
    ...(theme.cssVars ?? {})
  })
  const dark = cssVars({
    'book-accent': theme.darkAccentColor ?? theme.accentColor,
    ...(theme.darkCssVars ?? {})
  })

  return [
    'style',
    { id: 'minibook-theme-vars' },
    `:root {
${light}
}
.dark {
${dark}
}`
  ]
}

const localeConfig = Object.fromEntries(
  Object.entries(book.locales).map(([key, locale]) => [
    key,
    {
      label: locale.label,
      lang: locale.lang,
      title: locale.title ?? book.title,
      description: locale.description ?? book.description,
      link: locale.link
    }
  ])
)

const authorHead = book.author ? [['meta', { name: 'author', content: book.author }]] : []
const themeStyle = themeHead(book.theme)
const head = [
  ...authorHead,
  ['meta', { property: 'og:site_name', content: book.title }],
  ['meta', { property: 'og:type', content: 'website' }],
  legacyHashRedirect(),
  ...(themeStyle ? [themeStyle] : []),
  ...(book.favicon ? [['link', { rel: 'icon', href: book.favicon }]] : []),
  ...analyticsHead(book.analytics?.googleTagId),
  ...(book.head ?? [])
]

export default defineConfig({
  title: book.title,
  description: book.description,
  lang: rootLocale.lang,
  base: process.env.BASE || book.base || '/',
  srcDir: book.srcDir,
  outDir: process.env.OUT_DIR || book.outDir,
  cacheDir: `.vitepress/cache/${book.id}`,
  cleanUrls: book.cleanUrls,
  appearance: book.appearance,
  head,
  locales: localeConfig,
  ignoreDeadLinks: book.ignoreDeadLinks ?? [/^https?:\/\//],
  themeConfig: {
    book
  }
})
