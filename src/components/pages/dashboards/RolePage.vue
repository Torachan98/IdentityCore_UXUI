<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleStore } from '@/store/role/role'
import Button from '@/components/atoms/ButtonBase.vue'
import DataTable from '@/components/organisms/Table/DataTable.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { STATUS_ACTION_TYPE } from '@/store/user/base.types'
import type { RoleDTO } from '@/api/generated'
import ModalCustom from '@/components/molecules/ModalCustom.vue'
import InitialRole from './initials/InitialRole.vue'

const router = useRouter()
const roleStore = useRoleStore()

const open = ref(false)
const pageNumSelected = ref(1)
const pageSizeSelected = ref(10)

watch(
  [pageNumSelected, pageSizeSelected],
  () => {
    roleStore.fetchRoles({
      pageNum: pageNumSelected.value.toString(),
      pageSize: pageSizeSelected.value.toString(),
    })
  },
  { immediate: true },
)

watch(open, () => {
  roleStore.setRole({})
})

const handleView = (guid: string) => {
  router.replace(`/role-detail/${guid}?type=${STATUS_ACTION_TYPE.VIEW}`)
}

const handleEdit = (guid: string) => {
  router.replace(`/role-detail/${guid}?type=${STATUS_ACTION_TYPE.EDIT}`)
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex justify-between">
      <h1 class="text-xl font-bold">Roles</h1>
      <Button class="w-[5%]" @click="open = true">
        <FontAwesomeIcon icon="add" />
      </Button>
    </div>

    <DataTable
      :data="roleStore.roles ?? []"
      row-key="guid"
      :columns="[
        { key: 'name', header: 'Name', align: 'center', width: '40%' },
        { key: 'description', header: 'Description', width: '30%' },
        { key: 'permissions', header: 'Permissions Available', width: '15%' },
        { key: 'isLock', header: 'Status' },
      ]"
      :total-pages="roleStore.totalPages"
      :page-num="roleStore.pageNum"
      :page-size="roleStore.pageSize"
      @change-page-num="pageNumSelected = $event"
      @change-page-size="pageSizeSelected = $event"
    >
      <template #cell-permissions="{ row }: { row: RoleDTO }">
        <span class="rounded-full bg-green-300 px-3 py-2">
          {{ row.permissions?.length ?? 0 }}
        </span>
      </template>

      <template #cell-status="{ row }: { row: RoleDTO }">
        <span :class="row.isLock ? 'bg-red-300' : 'bg-green-300'" class="rounded-full px-3 py-2">
          {{ row.isLock ? 'Locked' : 'Ready' }}
        </span>
      </template>

      <template #actions="{ row }: { row: RoleDTO }">
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-center lg:gap-3"
        >
          <Button class="w-full bg-blue-600 hover:bg-blue-400" @click="handleView(row.guid ?? '')">
            <FontAwesomeIcon icon="eye" />
          </Button>

          <Button
            class="w-full bg-yellow-600 hover:bg-yellow-400"
            @click="handleEdit(row.guid ?? '')"
          >
            <FontAwesomeIcon icon="edit" />
          </Button>

          <Button class="w-full bg-red-600 hover:bg-red-400" @click="() => {}">
            <FontAwesomeIcon icon="trash" />
          </Button>
        </div>
      </template>
    </DataTable>

    <ModalCustom :open="open" :close-on-overlay-click="false" @close="open = false">
      <template #title>
        <div class="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Create New Role</h2>
            <p class="text-sm text-gray-500">Fill in the information below to create a role</p>
          </div>

          <button class="text-gray-400 cursor-pointer hover:text-gray-600" @click="open = false">
            <FontAwesomeIcon icon="x" />
          </button>
        </div>
      </template>

      <template #body>
        <InitialRole />
      </template>
    </ModalCustom>
  </div>
</template>
