# Minibook Kit

A reusable VitePress kit for small independent books with a Docute-like theme, per-book config, Google Analytics, and GitHub Pages deployment helpers.

## Install From GitHub Release

This kit is versioned with GitHub tags/releases. Book repos should depend on a fixed release tag:

```sh
pnpm add -D github:2BAB/minibook-kit#v0.1.1
```

Use the same tag for the reusable workflow:

```yaml
jobs:
  deploy:
    uses: 2BAB/minibook-kit/.github/workflows/deploy-github-pages.yml@v0.1.1
    with:
      book: my-book
```

For local unpublished development, use `pnpm link` instead of committing a `file:` dependency.

## Consumer Files

Create a tiny VitePress config wrapper:

```ts
// .vitepress/config.ts
export { default } from '@2bab/minibook-kit/vitepress-config'
```

Create a tiny theme wrapper:

```ts
// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import Layout from '@2bab/minibook-kit/theme/Layout.vue'
import ImageZoom from '@2bab/minibook-kit/theme/ImageZoom.vue'
import '@2bab/minibook-kit/theme/styles.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ImageZoom', ImageZoom)
  }
} satisfies Theme
```

Create root-level owner/default config:

```ts
import { defineMinibookKit } from '@2bab/minibook-kit/config'

export default defineMinibookKit({
  owner: {
    name: 'Your Name',
    links: [{ text: 'GitHub', link: 'https://github.com/yourname', icon: 'github' }]
  },
  theme: {
    accentColor: '#d32931',
    darkAccentColor: '#df5f66'
  },
  deployment: {
    domainSuffix: 'example.com'
  }
})
```

Create one `book.config.ts` inside each book folder:

```ts
import { defineMinibook } from '@2bab/minibook-kit/config'

export default defineMinibook({
  id: 'my-book',
  title: 'My Book',
  description: 'A small book.',
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      sidebar: [{ text: 'Introduction', link: '/' }]
    }
  }
})
```

## Scripts

```json
{
  "scripts": {
    "dev": "minibook dev my-book",
    "build": "minibook build my-book",
    "preview": "minibook preview my-book",
    "books:list": "minibook list"
  }
}
```

## Release

Create a GitHub release by tagging the kit repo:

```sh
git tag v0.1.1
git push origin v0.1.1
```

Then create the GitHub Release from that tag. Book repos can consume the release with:

```json
{
  "devDependencies": {
    "@2bab/minibook-kit": "github:2BAB/minibook-kit#v0.1.1"
  }
}
```

When upgrading the kit, bump both the dependency tag in `package.json` and the workflow tag in `.github/workflows/deploy.yml`.

## GitHub Pages Deploy Workflow

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  deploy:
    uses: 2BAB/minibook-kit/.github/workflows/deploy-github-pages.yml@v0.1.1
    with:
      book: my-book
```

If a book needs Cloudflare Pages instead, this kit also includes `.github/workflows/deploy-cloudflare-pages.yml` as an optional workflow.
