<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label?: string
  modelValue?: string | number
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()
const isInvalid = ref<boolean>(false)

const validate = (): boolean => {
  if (!props.required) {
    isInvalid.value = false
    return true
  }

  const value = props.modelValue?.toString().trim() ?? ''
  const valid = value.length > 0
  isInvalid.value = !valid
  return valid
}

defineExpose({
  validate,
})

const externalClass = computed<string>(() => {
  const cls = attrs.class
  return typeof cls === 'string' ? cls : ''
})

const inputClass = computed<string>(() =>
  [
    'w-full rounded-md border px-3 py-2 text-sm transition focus:outline-none focus:ring-1',
    isInvalid.value
      ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    externalClass.value,
  ].join(' '),
)

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)

  if (isInvalid.value) {
    validate()
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-1">
    <label
      v-if="props.label"
      class="text-xs font-medium"
      :class="isInvalid ? 'text-red-500' : 'text-gray-500'"
    >
      {{ props.label }} <span v-if="props.required" class="text-red-500">*</span>
    </label>

    <input v-bind="attrs" :class="inputClass" :value="props.modelValue" @input="handleInput" />
    <div v-if="isInvalid" class="text-[12px] text-red-500">{{ props.label }} is required</div>
  </div>
</template>
