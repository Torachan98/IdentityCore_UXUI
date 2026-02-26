<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  icon: IconProp
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const inputClass = computed(() => {
  const base = 'input w-full pl-10'
  const extra = (attrs.class as string) || ''
  return `${base} ${extra}`
})

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="relative">
    <FontAwesomeIcon
      :icon="props.icon"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <input v-bind="attrs" :value="props.modelValue" :class="inputClass" @input="handleInput" />
  </div>
</template>
