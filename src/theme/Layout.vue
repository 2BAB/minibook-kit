<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import SocialIcon from './components/SocialIcon.vue'
import type { MinibookConfig, MinibookNavItem, MinibookSidebarItem } from '../types'

const { page, theme } = useData()
const route = useRoute()

const sidebarOpen = ref(false)
const isDark = ref(false)
const contentHeaders = ref<Array<{ slug: string; title: string }>>([])

const book = computed(() => theme.value.book as MinibookConfig)
const localeKeys = computed(() => Object.keys(book.value.locales))

const currentLocaleKey = computed(() => {
  const path = route.path
  const matched = localeKeys.value
    .filter((key) => key !== 'root')
    .sort((a, b) => b.length - a.length)
    .find((key) => path === `/${key}/` || path.startsWith(`/${key}/`))

  return matched ?? 'root'
})

const currentLocale = computed(() => book.value.locales[currentLocaleKey.value] ?? book.value.locales.root)
const sidebar = computed(() => currentLocale.value.sidebar)
const navItems = computed<MinibookNavItem[]>(() => currentLocale.value.nav ?? book.value.nav ?? [])
const pageHeaders = computed(() => contentHeaders.value)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  redirectLegacyHash()
  window.addEventListener('hashchange', redirectLegacyHash)
  collectHeaders()
})

onUnmounted(() => {
  window.removeEventListener('hashchange', redirectLegacyHash)
})

watch(
  () => route.path,
  () => {
    nextTick(() => collectHeaders())
  }
)

function collectHeaders() {
  contentHeaders.value = Array.from(document.querySelectorAll<HTMLElement>('.book-content h2[id]')).map((heading) => ({
    slug: heading.id,
    title: heading.textContent?.replace(/\s*​\s*$/, '').trim() ?? ''
  }))
}

function localeHome(key: string): string {
  if (key === 'root') return '/'
  return book.value.locales[key]?.link ?? `/${key}/`
}

function normalizePath(path?: string): string {
  if (!path) return ''

  const withoutHash = path.split('#')[0].replace(/\.html$/, '')
  if (withoutHash === '' || withoutHash === '/index') return '/'

  return withoutHash.length > 1 && withoutHash.endsWith('/') ? withoutHash.slice(0, -1) : withoutHash
}

function isActive(link?: string): boolean {
  return normalizePath(route.path) === normalizePath(link)
}

function isSectionActive(item: MinibookSidebarItem): boolean {
  return isActive(item.link) || Boolean(item.items?.some((child) => isSectionActive(child)))
}

function linkHref(link?: string): string {
  return withBase(link ?? '#')
}

function headerHref(slug: string): string {
  const basePath = normalizePath(route.path)
  return withBase(`${basePath === '/' ? '/' : basePath}#${slug}`)
}

function navigateLocale(event: Event) {
  const key = (event.target as HTMLSelectElement).value
  window.location.href = withBase(localeHome(key))
}

function redirectLegacyHash() {
  if (window.location.hash.startsWith('#/')) {
    window.location.href = withBase(window.location.hash.slice(1))
  }
}

function toggleDark() {
  const next = !document.documentElement.classList.contains('dark')
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('vitepress-theme-appearance', next ? 'dark' : 'light')
  isDark.value = next
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="minibook-app" :class="{ 'sidebar-open': sidebarOpen }">
    <header class="book-header">
      <div class="book-header-inner">
        <button class="menu-button" type="button" aria-label="Open navigation" @click="sidebarOpen = !sidebarOpen">
          <span />
          <span />
          <span />
        </button>

        <a class="site-title" :href="withBase(localeHome(currentLocaleKey))">{{ book.title }}</a>

        <nav v-if="navItems.length" class="top-nav" aria-label="Primary navigation">
          <a
            v-for="item in navItems"
            :key="item.text"
            class="top-nav-link"
            :class="{ 'has-icon': item.icon }"
            :data-icon="item.icon"
            :href="item.link"
            :aria-label="item.text"
            :title="item.text"
            :target="item.link.startsWith('http') ? '_blank' : undefined"
            :rel="item.link.startsWith('http') ? 'noreferrer' : undefined"
          >
            <SocialIcon v-if="item.icon" :name="item.icon" />
            <span v-else>{{ item.text }}</span>
          </a>
        </nav>
      </div>
    </header>

    <div class="book-shell">
      <aside class="book-sidebar" :class="{ open: sidebarOpen }">
        <label v-if="localeKeys.length > 1" class="language-switcher">
          <span class="visually-hidden">Language</span>
          <select :value="currentLocaleKey" @change="navigateLocale">
            <option v-for="key in localeKeys" :key="key" :value="key">
              {{ book.locales[key].label }}
            </option>
          </select>
        </label>

        <nav class="sidebar-nav" aria-label="Book navigation">
          <template v-for="item in sidebar" :key="item.text">
            <a
              v-if="!item.items?.length"
              class="sidebar-link"
              :class="{ active: isActive(item.link) }"
              :href="linkHref(item.link)"
              @click="closeSidebar"
            >
              <span class="sidebar-marker">›</span>
              {{ item.text }}
            </a>

            <div v-else class="sidebar-section" :class="{ active: isSectionActive(item) }">
              <div class="sidebar-section-title">
                <span class="sidebar-marker">›</span>
                {{ item.text }}
              </div>
              <template v-for="child in item.items" :key="child.text">
                <a
                  class="sidebar-child"
                  :class="{ active: isActive(child.link) }"
                  :href="linkHref(child.link)"
                  @click="closeSidebar"
                >
                  {{ child.text }}
                </a>
                <div v-if="isActive(child.link) && pageHeaders.length" class="sidebar-page-toc child-toc">
                  <a v-for="header in pageHeaders" :key="header.slug" :href="headerHref(header.slug)" @click="closeSidebar">
                    {{ header.title }}
                  </a>
                </div>
              </template>
            </div>

            <div v-if="isActive(item.link) && pageHeaders.length" class="sidebar-page-toc">
              <a v-for="header in pageHeaders" :key="header.slug" :href="headerHref(header.slug)" @click="closeSidebar">
                {{ header.title }}
              </a>
            </div>
          </template>
        </nav>

        <div class="sidebar-actions">
          <button class="theme-toggle" type="button" :aria-pressed="isDark" aria-label="Toggle dark theme" @click="toggleDark">
            <span />
          </button>

          <nav v-if="navItems.length" class="sidebar-social" aria-label="External links">
            <a
              v-for="item in navItems"
              :key="item.text"
              class="sidebar-social-link"
              :data-icon="item.icon"
              :href="item.link"
              :aria-label="item.text"
              :title="item.text"
              :target="item.link.startsWith('http') ? '_blank' : undefined"
              :rel="item.link.startsWith('http') ? 'noreferrer' : undefined"
            >
              <SocialIcon v-if="item.icon" :name="item.icon" />
              <span v-else>{{ item.text }}</span>
            </a>
          </nav>
        </div>

        <button class="sidebar-close" type="button" aria-label="Close navigation" @click="closeSidebar">
          <span />
        </button>
      </aside>

      <button class="sidebar-backdrop" type="button" aria-label="Close navigation" @click="closeSidebar" />

      <main class="book-main" @click="closeSidebar">
        <article v-if="!page.isNotFound" class="book-content">
          <Content />
        </article>
        <article v-else class="book-content not-found">
          <h1>404</h1>
          <p>Page not found.</p>
        </article>
      </main>
    </div>
  </div>
</template>
