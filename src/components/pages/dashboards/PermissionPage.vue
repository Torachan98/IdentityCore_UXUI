<script setup lang="ts">
import { ref, watch } from 'vue'
import DataTable from '@/components/organisms/Table/DataTable.vue'

import { usePermissionStore } from '@/store/permission/permission'
import { storeToRefs } from 'pinia'

const pageNumSelected = ref(1)
const pageSizeSelected = ref(10)

const permissionStore = usePermissionStore()

const { permissions, pageNum, pageSize, totalPages } = storeToRefs(permissionStore)

watch(
  [pageNumSelected, pageSizeSelected],
  () => {
    permissionStore.fetchPermissions({
      pageNum: pageNumSelected.value.toString(),
      pageSize: pageSizeSelected.value.toString(),
    })
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-4">
      <h1 class="text-xl font-bold">Permissions</h1>
    </div>

    <DataTable
      :data="permissions ?? []"
      row-key="guid"
      :columns="[
        { key: 'name', header: 'Name', align: 'center', width: '45%' },
        { key: 'description', header: 'Description', width: '45%' },
      ]"
      :total-pages="totalPages"
      :page-num="pageNum"
      :page-size="pageSize"
      @change-page-num="(p) => (pageNumSelected = p)"
      @change-page-size="(p) => (pageSizeSelected = p)"
    >
      <!-- <template #actions="{ row }">
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-center lg:gap-3"
        >
          <Button
            class="w-full bg-blue-600 hover:bg-blue-400"
            @click="() => console.log(row.guid ?? '')"
          >
            <FontAwesomeIcon icon="eye" />
          </Button>

          <Button class="w-full bg-yellow-600 hover:bg-yellow-400" @click="() => console.log(row)">
            <FontAwesomeIcon icon="edit" />
          </Button>

          <Button
            class="w-full bg-red-600 hover:bg-red-400"
            @click="() => console.log(row.guid ?? '')"
          >
            <FontAwesomeIcon icon="trash" />
          </Button>
        </div>
      </template> -->
    </DataTable>
  </div>
</template>
