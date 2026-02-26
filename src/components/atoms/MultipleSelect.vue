<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type Option = {
  label: string
  value: string
}

type Props = {
  options: Option[]
  value: string[]
  placeholder?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'change', values: string[]): void
}>()

const open = ref(false)
const search = ref('')

const containerRef = ref<HTMLElement | null>(null)

const optionMap = computed(() => {
  const map = new Map<string, Option>()
  props.options.forEach((o) => map.set(o.value, o))
  return map
})

const filteredOptions = computed(() => {
  const keyword = search.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(keyword))
})

function toggleOpen() {
  if (!props.disabled) {
    open.value = !open.value
  }
}

function close() {
  open.value = false
}

function toggleValue(val: string) {
  if (props.disabled) return

  const next = props.value.includes(val)
    ? props.value.filter((v) => v !== val)
    : [...props.value, val]

  emit('change', next)
}

function removeValue(val: string, e: MouseEvent) {
  e.stopPropagation()
  toggleValue(val)
}

function onSearchChange(e: Event) {
  search.value = (e.target as HTMLInputElement).value
}

function handleOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <div
      @click="toggleOpen"
      class="min-h-[42px] rounded border px-3 py-2 flex flex-wrap gap-2 items-center"
      :class="disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'"
    >
      <span v-if="value.length === 0" class="text-gray-400">
        {{ placeholder ?? 'Select...' }}
      </span>

      <span
        v-for="v in value"
        :key="v"
        class="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded flex items-center gap-1"
      >
        {{ optionMap.get(v)?.label }}

        <button
          v-if="!disabled"
          @click="removeValue(v, $event)"
          class="text-blue-500 hover:text-blue-700"
        >
          <FontAwesomeIcon icon="circle-xmark" />
        </button>
      </span>
    </div>

    <div v-if="open" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
      <input
        class="w-full border-b px-3 py-2 outline-none"
        placeholder="Search..."
        :value="search"
        @input="onSearchChange"
      />

      <ul class="max-h-48 overflow-y-auto">
        <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-400">No results</li>

        <li
          v-for="o in filteredOptions"
          :key="o.value"
          @click="toggleValue(o.value)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
          :class="value.includes(o.value) ? 'bg-blue-100 font-medium' : ''"
        >
          {{ o.label }}
          <FontAwesomeIcon v-if="value.includes(o.value)" icon="check" />
        </li>
      </ul>
    </div>
  </div>
</template>
