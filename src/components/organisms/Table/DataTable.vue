<script setup lang="ts">
import Select from '@/components/atoms/SelectBase.vue'
import Pagination from './PaginationCustom.vue'

export type Column = {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

type Props = {
  data: Record<string, unknown>[]
  columns: Column[]
  rowKey?: string

  pageNum: number
  pageSize: number
  totalPages: number

  onChangePageNum: (page: number) => void
  onChangePageSize: (size: number) => void
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <div class="hidden md:block overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table class="w-full border-collapse table-fixed">
        <thead class="sticky top-0 bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th class="w-[60px] px-4 py-3 text-center">#</th>

            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="{
                'text-center': col.align === 'center',
                'text-right': col.align === 'right',
                'text-left': !col.align || col.align === 'left',
              }"
              :style="{ width: col.width }"
            >
              {{ col.header }}
            </th>

            <th v-if="$slots.actions" class="px-4 py-3 text-center w-[15%]">Actions</th>
          </tr>
        </thead>

        <tbody class="text-sm text-gray-700">
          <tr v-if="data.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 2 : 1)"
              class="py-10 text-center text-gray-400"
            >
              No data available
            </td>
          </tr>

          <tr
            v-for="(row, index) in data"
            :key="rowKey ? String(row[rowKey]) : index"
            class="border-t transition hover:bg-gray-50"
          >
            <td class="px-4 py-3 text-center">
              {{ index + 1 }}
            </td>

            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 truncate"
              :class="{
                'text-center': col.align === 'center',
                'text-right': col.align === 'right',
                'text-left': !col.align || col.align === 'left',
              }"
            >
              <slot :name="`cell-${col.key}`" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>

            <td v-if="$slots.actions" class="px-4 py-3">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-4">
      <div v-if="data.length === 0" class="py-10 text-center text-gray-400">No data available</div>

      <div
        v-for="(row, index) in data"
        :key="rowKey ? String(row[rowKey]) : index"
        class="space-y-3 rounded-lg border bg-white p-4 shadow-sm"
      >
        <div class="text-xs text-gray-500">#{{ index + 1 }}</div>

        <div v-for="col in columns" :key="col.key" class="flex items-start justify-between gap-4">
          <span class="text-sm font-medium text-gray-500">
            {{ col.header }}
          </span>

          <span class="text-sm text-gray-800 text-right">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </span>
        </div>

        <div v-if="$slots.actions" class="pt-2">
          <slot name="actions" :row="row" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <Select
          :value="pageSize"
          :options="[
            { value: 10, label: '10 items of page' },
            { value: 25, label: '25 items of page' },
            { value: 50, label: '50 items of page' },
            { value: 100, label: '100 items of page' },
          ]"
          @change="onChangePageSize(Number($event.target.value))"
        />

        <span class="text-sm text-gray-500"> Page {{ pageNum }} of {{ totalPages }} </span>
      </div>

      <Pagination :page-num="pageNum" :total-pages="totalPages" @change="onChangePageNum" />
    </div>
  </div>
</template>
