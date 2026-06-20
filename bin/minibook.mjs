#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { normalizeMinibook } from '../src/config.js'

const rootDir = process.cwd()
const command = process.argv[2] ?? 'help'
const bookArg = process.env.BOOK || process.env.npm_config_book || process.argv[3]

async function discoverBookIds() {
  const entries = await readdir(rootDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(rootDir, name, 'book.config.ts')))
    .sort()
}

async function loadKitConfig() {
  const configPath = resolve(rootDir, 'minibook-kit.config.ts')
  if (!existsSync(configPath)) return {}

  const module = await import(pathToFileURL(configPath).href)
  return module.default ?? {}
}

async function loadBookConfig(bookId, kit) {
  const configPath = resolve(rootDir, bookId, 'book.config.ts')
  const module = await import(pathToFileURL(configPath).href)
  return normalizeMinibook(module.default, kit)
}

async function resolveBookId() {
  if (bookArg) return bookArg

  const books = await discoverBookIds()
  if (books.length === 1) return books[0]
  if (books.length > 1) {
    throw new Error(`Set BOOK=<book> or pass a book id. Available books: ${books.join(', ')}`)
  }

  throw new Error('No book.config.ts found in top-level book folders.')
}

function runVitePress(bookId, mode) {
  const commandArgs = {
    dev: ['exec', 'vitepress', 'dev', '.', '--host', '0.0.0.0'],
    build: ['exec', 'vitepress', 'build', '.'],
    preview: ['exec', 'vitepress', 'preview', '.', '--host', '0.0.0.0']
  }[mode]

  return new Promise((resolvePromise, reject) => {
    const child = spawn('pnpm', commandArgs, {
      cwd: rootDir,
      env: {
        ...process.env,
        BOOK: bookId
      },
      stdio: 'inherit'
    })

    child.on('exit', (code) => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${mode} failed for ${bookId}`))
    })
  })
}

async function listBooks() {
  const kit = await loadKitConfig()
  const books = []

  for (const id of await discoverBookIds()) {
    const config = await loadBookConfig(id, kit)
    books.push({
      id: config.id,
      cloudflareProject: config.deployment.cloudflareProject,
      productionBranch: config.deployment.productionBranch ?? 'main',
      domains: config.deployment.domains ?? []
    })
  }

  console.log(JSON.stringify(books))
}

async function buildAll() {
  const books = await discoverBookIds()

  for (const book of books) {
    console.log(`\nBuilding ${book}...`)
    await runVitePress(book, 'build')
  }
}

function printHelp() {
  console.log(`Usage: minibook <command> [book]

Commands:
  dev [book]       Start VitePress dev server for a book
  build [book]     Build one book
  preview [book]   Preview one built book
  list             Print deployment metadata for discovered books as JSON
  build-all        Build every discovered book
`)
}

try {
  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp()
  } else if (command === 'list') {
    await listBooks()
  } else if (command === 'build-all') {
    await buildAll()
  } else if (['dev', 'build', 'preview'].includes(command)) {
    await runVitePress(await resolveBookId(), command)
  } else {
    throw new Error(`Unknown command "${command}".`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
