<script setup lang="ts">
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from './ButtonBase.vue'
import { isInvalidDateRange } from '@/helpers'

export type ServiceOption = {
  id: string
  name: string
}

export type SelectedService = {
  id: string
  name: string
  activeDate?: string
  expiredDate?: string
}

const props = defineProps<{
  services: ServiceOption[]
  pageNum: number
  pageSize: number
  total: number
  selected: SelectedService[]
}>()

const emit = defineEmits<{
  (e: 'select', service: ServiceOption): void
  (e: 'remove', id: string): void
  (e: 'pageChange', page: number): void
  (e: 'search', keyword: string): void
  (e: 'updateDate', id: string, field: 'dateActive' | 'dateExpired', value: string): void
}>()

const keyword = ref('')

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-lg border bg-white p-4">
      <div class="mb-3 flex items-center gap-3">
        <input
          v-model="keyword"
          placeholder="Search services..."
          class="w-full rounded border px-3 py-2 text-sm"
        />

        <Button class="px-3" @click="emit('search', keyword)">
          <FontAwesomeIcon icon="search" />
        </Button>
      </div>

      <div class="max-h-64 space-y-2 overflow-auto">
        <div
          v-for="s in services"
          :key="s.id"
          class="flex items-center justify-between rounded border p-2"
        >
          <span>{{ s.name }}</span>

          <button
            v-if="selected.some((x) => x.id === s.id)"
            class="text-sm text-red-600 cursor-pointer hover:text-red-400"
            @click="emit('remove', s.id)"
          >
            Remove
          </button>

          <button
            v-else
            class="text-sm text-blue-600 cursor-pointer hover:text-blue-400"
            @click="emit('select', s)"
          >
            Add
          </button>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-3 text-sm">
        <Button class="px-2" :disabled="pageNum === 1" @click="emit('pageChange', pageNum - 1)">
          <FontAwesomeIcon icon="arrow-left" />
        </Button>

        <span>{{ pageNum }} / {{ totalPages }}</span>

        <Button
          class="px-2"
          :disabled="pageNum >= totalPages"
          @click="emit('pageChange', pageNum + 1)"
        >
          <FontAwesomeIcon icon="arrow-right" />
        </Button>
      </div>

      <div v-if="selected.length" class="space-y-3 py-4">
        <div v-for="s in selected" :key="s.id" class="rounded-lg border bg-white p-4">
          <div class="mb-2 flex items-center justify-between">
            <strong>{{ s.name }}</strong>
            <button
              class="text-sm text-red-600 cursor-pointer hover:text-red-400"
              @click="emit('remove', s.id)"
            >
              Remove
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600"> Date active </label>

              <slot
                name="date-picker-start"
                :value="s.activeDate"
                :onChange="(v: string) => emit('updateDate', s.id, 'dateActive', v)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600"> Date expired </label>

              <slot
                name="date-picker-end"
                :value="s.expiredDate"
                :onChange="(v: string) => emit('updateDate', s.id, 'dateExpired', v)"
              />
            </div>
          </div>

          <p
            v-if="isInvalidDateRange(s.activeDate, s.expiredDate)"
            class="mt-2 text-sm text-red-600"
          >
            Date active must be earlier than date expired
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
