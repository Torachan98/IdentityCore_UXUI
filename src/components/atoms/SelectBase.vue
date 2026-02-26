<script setup lang="ts">
import { useAttrs } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type Option = {
  label: string
  value: string | number
}

const props = defineProps<{
  options: Option[]
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onChange = (event: Event) => {
  const $event = event.target as HTMLSelectElement
  emit('update:modelValue', $event.value)
}

const attrs = useAttrs()
</script>

<template>
  <div :class="['relative inline-block', attrs.class]">
    <select
      v-bind="attrs"
      :class="[
        'w-full appearance-none border p-2 pr-10 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
      ]"
      :value="props.modelValue"
      @change="onChange"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">
        {{ o.label }}
      </option>
    </select>

    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
      <FontAwesomeIcon icon="caret-down" />
    </span>
  </div>
</template>
