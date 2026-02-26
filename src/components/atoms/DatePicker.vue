<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type Props = {
  label?: string
  value?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const open = ref(false)
const view = ref<'month' | 'year'>('month')
const current = ref(props.value ? new Date(props.value) : new Date())

const position = ref({ top: 0, left: 0 })
const yearBase = ref(current.value.getFullYear() - 6)

const containerRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)

const year = computed(() => current.value.getFullYear())
const month = computed(() => current.value.getMonth())

const firstDay = computed(() => new Date(year.value, month.value, 1).getDay())
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())

const selected = computed(() => (props.value ? new Date(props.value).toDateString() : null))

const years = computed(() => Array.from({ length: 12 }, (_, i) => yearBase.value + i))

function toggleOpen() {
  open.value = !open.value
}

function prevMonth() {
  current.value = new Date(year.value, month.value - 1, 1)
}

function nextMonth() {
  current.value = new Date(year.value, month.value + 1, 1)
}

function switchToYearView() {
  view.value = 'year'
}

function selectYear(y: number) {
  current.value = new Date(y, month.value, 1)
  view.value = 'month'
}

function selectDate(day: number) {
  const date = new Date(year.value, month.value, day)
  emit('change', date.toUTCString())
  open.value = false
}

function handleOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

async function updatePosition() {
  await nextTick()
  if (!buttonRef.value || !popupRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const height = popupRef.value.offsetHeight

  position.value = {
    top: rect.bottom + 8,
    left: rect.left,
  }

  if (window.innerHeight - rect.bottom < height) {
    position.value.top = rect.top - height - 8
  }
}

watch(open, (val) => {
  if (val) {
    document.addEventListener('mousedown', handleOutsideClick)
    updatePosition()
  } else {
    document.removeEventListener('mousedown', handleOutsideClick)
  }
})

watch(view, () => {
  if (open.value) updatePosition()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<template>
  <div ref="containerRef" class="w-full">
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-600">
      {{ label }}
    </label>

    <button
      ref="buttonRef"
      type="button"
      :disabled="disabled"
      @click="toggleOpen"
      class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm"
      :class="
        disabled
          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
          : 'bg-white text-gray-700 hover:border-blue-500 focus:ring-2 focus:ring-blue-500'
      "
    >
      <span>
        {{ value ? new Date(value).toLocaleDateString() : 'Select date' }}
      </span>
      <FontAwesomeIcon icon="calendar-days" class="text-gray-400" />
    </button>

    <div
      v-if="open && !disabled"
      ref="popupRef"
      :style="{ top: position.top + 'px', left: position.left + 'px' }"
      class="fixed z-[9999] w-72 rounded-xl border bg-white p-4 shadow-xl"
    >
      <div v-if="view === 'month'" class="mb-3 flex items-center justify-between">
        <button @click="prevMonth" class="rounded px-2 py-1 hover:bg-gray-100">‹</button>

        <button @click="switchToYearView" class="text-sm font-semibold hover:underline">
          {{ current.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
        </button>

        <button @click="nextMonth" class="rounded px-2 py-1 hover:bg-gray-100">›</button>
      </div>

      <div v-if="view === 'month'">
        <div class="grid grid-cols-7 text-center text-xs text-gray-500">
          <div v-for="d in days" :key="d">{{ d }}</div>
        </div>

        <div class="mt-2 grid grid-cols-7 gap-1">
          <div v-for="i in firstDay" :key="'e' + i" />

          <button
            v-for="d in daysInMonth"
            :key="d"
            @click="selectDate(d)"
            class="rounded-md py-1 text-sm"
            :class="
              selected === new Date(year, month, d).toDateString()
                ? 'bg-blue-600 text-white'
                : 'hover:bg-blue-50'
            "
          >
            {{ d }}
          </button>
        </div>
      </div>

      <div v-if="view === 'year'" class="grid max-h-64 grid-cols-4 gap-2 overflow-auto">
        <button
          v-for="y in years"
          :key="y"
          @click="selectYear(y)"
          class="rounded-md py-2 text-sm"
          :class="y === year ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'"
        >
          {{ y }}
        </button>
      </div>
    </div>
  </div>
</template>
