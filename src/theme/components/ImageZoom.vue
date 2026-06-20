<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    border?: boolean
    width?: string | number
  }>(),
  {
    alt: '',
    border: true,
    width: '100%'
  }
)

const open = ref(false)

const imageSrc = computed(() => withBase(props.src))
const imageWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`
  if (/^\d+(\.\d+)?$/.test(props.width)) return `${props.width}px`
  return props.width
})
</script>

<template>
  <span class="image-zoom" :style="{ '--image-width': imageWidth }">
    <img
      :src="imageSrc"
      :alt="alt"
      :class="{ bordered: border }"
      loading="lazy"
      decoding="async"
      @click="open = true"
    >
  </span>

  <Teleport to="body">
    <button v-if="open" class="image-zoom-overlay" type="button" aria-label="Close image preview" @click="open = false">
      <img :src="imageSrc" :alt="alt">
    </button>
  </Teleport>
</template>
