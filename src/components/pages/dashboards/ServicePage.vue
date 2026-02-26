<script setup lang="ts">
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/atoms/ButtonBase.vue'
import DataTable from '@/components/organisms/Table/DataTable.vue'
import { useServiceStore } from '@/store/service/service'
import type { ServiceDTO } from '@/api/generated'

const serviceStore = useServiceStore()

const pageNumSelected = ref(1)
const pageSizeSelected = ref(10)

watch(
  [pageNumSelected, pageSizeSelected],
  () => {
    serviceStore.fetchServices({
      pageNum: pageNumSelected.value.toString(),
      pageSize: pageSizeSelected.value.toString(),
    })
  },
  { immediate: true },
)

const handleView = (guid: string) => {
  console.log(guid)
}

const handleEdit = (service: ServiceDTO) => {
  console.log(service)
}

const handleDelete = (guid: string) => {
  console.log(guid)
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex justify-between">
      <h1 class="text-xl font-bold">Services</h1>
    </div>

    <DataTable
      :data="serviceStore.services ?? []"
      row-key="guid"
      :columns="[
        { key: 'name', header: 'Name', align: 'center' },
        { key: 'signatureKey', header: 'Key', align: 'center' },
      ]"
      :total-pages="serviceStore.totalPages"
      :page-num="serviceStore.pageNum"
      :page-size="serviceStore.pageSize"
      @change-page-num="pageNumSelected = $event"
      @change-page-size="pageSizeSelected = $event"
    >
      <template #actions="{ row }: { row: ServiceDTO }">
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-center lg:gap-2"
        >
          <Button class="w-full bg-blue-600 hover:bg-blue-400" @click="handleView(row.guid ?? '')">
            <FontAwesomeIcon icon="eye" />
          </Button>

          <Button class="w-full bg-yellow-600 hover:bg-yellow-400" @click="handleEdit(row)">
            <FontAwesomeIcon icon="edit" />
          </Button>

          <Button class="w-full bg-red-600 hover:bg-red-400" @click="handleDelete(row.guid ?? '')">
            <FontAwesomeIcon icon="trash" />
          </Button>
        </div>
      </template>
    </DataTable>
  </div>
</template>
