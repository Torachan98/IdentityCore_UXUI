<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

const props = withDefaults(defineProps<{ length?: number }>(), { length: 5 })

const emit = defineEmits<{
  (e: 'complete', code: string): void
}>()

const otp = ref<string[]>(Array(props.length).fill(''))
const inputsRef = ref<HTMLInputElement[]>([])

const setInputRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el && el instanceof HTMLInputElement) {
    inputsRef.value[index] = el
  }
}

const focusInput = (index: number) => {
  inputsRef.value[index]?.focus()
}

const handleChange = (value: string, index: number) => {
  if (!/^\d?$/.test(value)) return

  otp.value[index] = value

  if (value && index < props.length - 1) {
    focusInput(index + 1)
  }
}

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    focusInput(index - 1)
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()

  const pasted =
    e.clipboardData
      ?.getData('text')
      .slice(0, props.length)
      .split('')
      .filter((c) => /^\d$/.test(c)) ?? []

  if (!pasted.length) return

  otp.value = Array(props.length).fill('')
  pasted.forEach((c, i) => (otp.value[i] = c))

  focusInput(Math.min(pasted.length, props.length) - 1)
}

watch(otp, () => emit('complete', otp.value.join('')), { deep: true })
</script>

<template>
  <div class="flex justify-center gap-3">
    <input
      v-for="(_, index) in otp"
      :key="index"
      :ref="(el) => setInputRef(el, index)"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :value="otp[index]"
      @input="(e) => handleChange((e.target as HTMLInputElement).value, index)"
      @keydown="(e) => handleKeyDown(e, index)"
      @paste="handlePaste"
      class="h-14 w-12 rounded-lg border text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
    />
  </div>
</template>
