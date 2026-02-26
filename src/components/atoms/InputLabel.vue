<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label?: string
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const inputClass = computed(() => {
  const base =
    'input w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const extra = (attrs.class as string) || ''
  return `${base} ${extra}`
})

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full flex flex-col gap-1">
    <label v-if="props.label" class="text-xs font-medium text-gray-500">
      {{ props.label }}
    </label>

    <div class="flex flex-row gap-3">
      <input v-bind="attrs" :class="inputClass" :value="props.modelValue" @input="handleInput" />
    </div>
  </div>
</template>
