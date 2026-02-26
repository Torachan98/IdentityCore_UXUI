<script setup lang="ts">
import { onMounted, watch, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useRoleStore } from '@/store/role/role'
import { usePermissionStore } from '@/store/permission/permission'

import InputLabel from '@/components/atoms/InputLabel.vue'
import ParagraphLabel from '@/components/atoms/ParagraphLabel.vue'
import MultiSelect from '@/components/atoms/MultipleSelect.vue'
import Button from '@/components/atoms/ButtonBase.vue'

import { PAGE_TYPE, STATUS_ACTION_TYPE } from '@/store/user/base.types'
import { type PermissionDTO, type Role, type RoleDTO } from '@/api/generated'

type WithGuid = {
  guid?: string
}

const route = useRoute()
const router = useRouter()

const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

const { role, error } = storeToRefs(roleStore)
const { permissions } = storeToRefs(permissionStore)
const form = reactive<RoleDTO>({
  guid: '',
  name: '',
  isLock: false,
  description: '',
  role: {} as Role,
  permissions: [] as PermissionDTO[],
} as RoleDTO)

const id = computed(() => route.params.id as string)

const isViewMode = computed(() => route.query.type === STATUS_ACTION_TYPE.VIEW)

const selectedPermissionIds = computed({
  get: () => form.permissions?.map((r) => r.guid ?? '') ?? [],
  set: (ids: string[]) => {
    if (!permissions.value) return

    form.permissions = ids.map((id) => {
      const role = permissions.value?.find((r) => r.guid === id)
      return {
        guid: role?.guid ?? '',
        role: role?.name ?? '',
        value: role?.role ?? '',
        permissions: [],
      } as PermissionDTO
    })
  },
})

const fetchListNonUndefined = <T extends WithGuid>(array: T[] | undefined) => {
  if (!array) return []

  return array.reduce<string[]>((acc, item) => {
    if (item.guid) acc.push(item.guid)
    return acc
  }, [])
}

onMounted(async () => {
  await roleStore.fetchRoleById(id.value)
  await permissionStore.fetchPermissions({ pageSize: PAGE_TYPE.MAX })

  if (error.value && error.value !== 'Successfully') {
    router.replace('/404')
  }
})

watch(
  () => route.params.id,
  async (newId) => {
    if (!newId) return
    await roleStore.fetchRoleById(newId as string)
  },
)

watch(
  () => roleStore.role,
  (val) => {
    if (val) Object.assign(form, val)
  },
  {
    immediate: true,
  },
)

const handleUpdate = async () => {
  console.log(role.value?.permissions)
  await roleStore.updateRole({
    guid: role.value?.guid ?? '',
    name: role.value?.name ?? '',
    description: role.value?.description ?? '',
    isLock: false,
    permissions: fetchListNonUndefined<PermissionDTO>(form.permissions),
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <Button class="px-2" @click="router.push('/roles')"> Back </Button>

      <div>
        <h2 class="text-lg font-semibold text-gray-800">Role Information</h2>
        <p class="text-sm text-gray-500">Define role details and assign permissions</p>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-6 px-6 py-6">
        <div class="flex flex-col gap-1">
          <InputLabel label="Role name" v-model="form.name" :disabled="isViewMode" />
        </div>

        <div class="flex flex-col gap-1">
          <InputLabel
            label="Level"
            v-model="form.value"
            type="number"
            min="1"
            max="999"
            :disabled="isViewMode"
          />
        </div>

        <div class="flex flex-col gap-1">
          <ParagraphLabel label="Description" v-model="form.description" :disabled="isViewMode" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700"> Permissions </label>

          <p class="text-xs text-gray-500">Select permissions assigned to this role</p>

          <MultiSelect
            :disabled="isViewMode"
            :options="
              permissions?.map((p) => ({
                label: p.name ?? '',
                value: p.guid ?? '',
              })) ?? []
            "
            :value="selectedPermissionIds"
            @change="selectedPermissionIds = $event"
          />
        </div>

        <div v-if="!isViewMode" class="flex justify-end gap-3 mt-8">
          <Button class="px-2" @click="router.replace('/roles')"> Cancel </Button>

          <Button class="px-2" @click="handleUpdate"> Update </Button>
        </div>
      </div>
    </div>
  </div>
</template>
