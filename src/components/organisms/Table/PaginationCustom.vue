<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type PaginationProps = {
  pageNum: number
  totalPages: number
  onChange: (page: number) => void
}

const props = defineProps<PaginationProps>()

function getPaginationRange(current: number, total: number, delta = 1): Array<number | '...'> {
  const range: Array<number | '...'> = []
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)

  range.push(1)

  if (left > 2) range.push('...')

  for (let i = left; i <= right; i += 1) {
    range.push(i)
  }

  if (right < total - 1) range.push('...')

  if (total > 1) range.push(total)

  return range
}

const pages = computed(() => getPaginationRange(props.pageNum, props.totalPages))

function goPrev(): void {
  if (props.pageNum > 1) {
    props.onChange(props.pageNum - 1)
  }
}

function goNext(): void {
  if (props.pageNum < props.totalPages) {
    props.onChange(props.pageNum + 1)
  }
}

function goPage(page: number | '...'): void {
  if (page !== '...') {
    props.onChange(page)
  }
}
</script>

<template>
  <div class="pt-2 flex items-center gap-2">
    <button
      :disabled="pageNum === 1"
      class="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
      @click="goPrev"
    >
      <FontAwesomeIcon icon="angles-left" />
    </button>

    <button
      v-for="(p, i) in pages"
      :key="i"
      :disabled="p === '...'"
      class="px-3 py-1 text-sm"
      :class="{
        'rounded-lg border': p !== '...',
        'bg-blue-600 text-white border-blue-600': p === pageNum,
        'hover:bg-gray-100': p !== '...' && p !== pageNum,
      }"
      @click="goPage(p)"
    >
      {{ p }}
    </button>

    <button
      :disabled="pageNum >= totalPages"
      class="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
      @click="goNext"
    >
      <FontAwesomeIcon icon="angles-right" />
    </button>
  </div>
</template>
