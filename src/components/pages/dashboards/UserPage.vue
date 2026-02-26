<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Button from '@/components/atoms/ButtonBase.vue'
import Modal from '@/components/molecules/ModalCustom.vue'
import DataTable from '@/components/organisms/Table/DataTable.vue'
import InitialUser from './initials/InitialUser.vue'

import { useUserStore } from '@/store/user/user'
import { useRoleStore } from '@/store/role/role'
import { usePermissionStore } from '@/store/permission/permission'
import { useServiceStore } from '@/store/service/service'

import { PAGE_TYPE, STATUS_ACTION_TYPE } from '@/store/user/base.types'
import { Step } from '@/store/user/user.types'
import type { UserDTO } from '@/api/generated'

const router = useRouter()

const userStore = useUserStore()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()
const serviceStore = useServiceStore()

const open = ref(false)
const pageNumSelected = ref(1)
const pageSizeSelected = ref(10)
const pageNumService = ref(1)

watch(
  [pageNumSelected, pageSizeSelected, open],
  () => {
    userStore.fetchUsers({
      pageNum: pageNumSelected.value.toString(),
      pageSize: pageSizeSelected.value.toString(),
    })

    roleStore.fetchRoles({ pageSize: PAGE_TYPE.MAX })
    permissionStore.fetchPermissions({ pageSize: PAGE_TYPE.MAX })
  },
  { immediate: true },
)

watch(open, () => {
  userStore.setUser({})
})

watch(
  pageNumService,
  () => {
    serviceStore.fetchServices({
      pageSize: '5',
      pageNum: pageNumService.value.toString(),
    })
  },
  {
    immediate: true,
    deep: true,
  },
)

const goEdit = (u: UserDTO) => {
  router.replace(`/user-detail/${u.guid}?type=${STATUS_ACTION_TYPE.EDIT}`)
}

const goView = (u: UserDTO) => {
  router.push(`/user-detail/${u.guid}?type=${STATUS_ACTION_TYPE.VIEW}`)
}

const removeUser = async (u: UserDTO) => {
  await userStore.deleteUser(u.guid ?? '')
  await userStore.fetchUsers({
    pageNum: pageNumSelected.value.toString(),
    pageSize: pageSizeSelected.value.toString(),
  })
}

const unlockUser = async (u: UserDTO) => {
  await userStore.updateUser({ ...u, locked: '' })
  await userStore.fetchUsers({
    pageNum: pageNumSelected.value.toString(),
    pageSize: pageSizeSelected.value.toString(),
  })
}

const lockUser = async (u: UserDTO) => {
  await userStore.updateUser({
    ...u,
    locked: new Date(new Date().setDate(new Date().getDate() + 3)).toUTCString(),
    isLock: true,
  })

  await userStore.fetchUsers({
    pageNum: pageNumSelected.value.toString(),
    pageSize: pageSizeSelected.value.toString(),
  })
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex justify-between">
      <h1 class="text-xl font-bold">Users</h1>

      <Button class="w-[5%]" @click="open = true">
        <FontAwesomeIcon icon="add" />
      </Button>
    </div>

    <DataTable
      :data="userStore.users ?? []"
      row-key="guid"
      :columns="[
        { key: 'fullName', header: 'Name', width: '15%' },
        { key: 'avatarUrl', header: 'Avatar', align: 'center', width: '10%' },
        { key: 'email', header: 'Email', width: '15%' },
        { key: 'userName', header: 'User Name', align: 'center', width: '10%' },
        { key: 'phone', header: 'Phone', align: 'center', width: '10%' },
        { key: 'step', header: 'Status', align: 'center' },
        { key: 'dateCreated', header: 'Created At', align: 'left' },
        { key: 'region', header: 'Region', align: 'center' },
      ]"
      :total-pages="userStore.totalPages"
      :page-num="userStore.pageNum"
      :page-size="userStore.pageSize"
      @change-page-num="pageNumSelected = $event"
      @change-page-size="pageSizeSelected = $event"
    >
      <template #cell-avatarUrl="{ row }: { row: UserDTO }">
        <img
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover border"
          :src="
            row.avatarUrl
              ? `https://drive.google.com/thumbnail?id=${row.avatarUrl}&sz=w500`
              : '/src/assets/default_logo.jpg'
          "
          alt="User avatar"
        />
      </template>

      <template #cell-step="{ row }: { row: UserDTO }">
        <span
          v-if="row.step === Step.Confirmed"
          class="rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white"
        >
          Active
        </span>

        <span
          v-else-if="row.step === Step.Waiting"
          class="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white"
        >
          Waiting
        </span>
      </template>

      <template #cell-dateCreated="{ row }: { row: UserDTO }">
        {{ new Date(row.dateCreated ?? '').toLocaleDateString() }}
      </template>

      <template #actions="{ row }: { row: UserDTO }">
        <div
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-center lg:gap-3"
        >
          <Button class="w-full bg-green-600 hover:bg-green-500" @click="goEdit(row)">
            <FontAwesomeIcon icon="edit" />
          </Button>

          <Button class="w-full bg-blue-600 hover:bg-blue-500" @click="goView(row)">
            <FontAwesomeIcon icon="eye" />
          </Button>

          <Button class="w-full bg-red-600 hover:bg-red-500" @click="removeUser(row)">
            <FontAwesomeIcon icon="trash" />
          </Button>

          <Button
            v-if="row.locked !== null"
            class="w-full bg-yellow-600 hover:bg-yellow-500"
            @click="unlockUser(row)"
          >
            <FontAwesomeIcon icon="lock-open" />
          </Button>

          <Button v-else class="w-full bg-yellow-600 hover:bg-yellow-500" @click="lockUser(row)">
            <FontAwesomeIcon icon="lock" />
          </Button>
        </div>
      </template>
    </DataTable>

    <Modal :open="open" :close-on-overlay-click="false" @close="open = false">
      <template #title>
        <div class="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Create New User</h2>
            <p class="text-sm text-gray-500">
              Fill in the information below to create a user account
            </p>
          </div>

          <button class="text-gray-400 cursor-pointer hover:text-gray-600" @click="open = false">
            <FontAwesomeIcon icon="x" />
          </button>
        </div>
      </template>

      <template #body>
        <InitialUser v-model="open" />
      </template>
    </Modal>
  </div>
</template>
