<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, h } from 'vue'
import Toggle from '@vueform/toggle'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'

import Button from '@/components/atoms/ButtonBase.vue'
import InputLabel from '@/components/atoms/InputLabel.vue'
import DateTimePicker from '@/components/atoms/DateTimePicker.vue'
import ServicesSelector from '@/components/atoms/ServicesSelector.vue'
import { useServiceStore } from '@/store/service/service'
import {
  FileService,
  type AssigningService,
  type RoleResponse,
  type ServiceDTO,
  type UserDTO,
} from '@/api/generated'
import InforRow from '@/components/atoms/InforRow.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import SelectBase from '@/components/atoms/SelectBase.vue'
import { useUserStore } from '@/store/user/user'
import NotificationToast from '@/components/atoms/NotificationToast.vue'
import { useRoleStore } from '@/store/role/role'
import { usePermissionStore } from '@/store/permission/permission'
import { PAGE_TYPE } from '@/store/user/base.types'
import MultipleSelect from '@/components/atoms/MultipleSelect.vue'

const userStore = useUserStore()
const serviceStore = useServiceStore()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

const { roles } = storeToRefs(roleStore)
const { permissions } = storeToRefs(permissionStore)
const { services, pageSize, totalItems } = storeToRefs(serviceStore)

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const form = reactive<UserDTO>({
  avatarUrl: '',
  userName: '',
  fullName: '',
  email: '',
  password: 'Aa@123456',
  phone: '',
  phoneCode: '',
  region: 'VN',
  dateCreated: '',
  dateModified: '',
  firstName: '',
  middleName: '',
  lastName: '',
  isRequiredChangePassword: false,
  isPasswordExpired: false,
  locked: '',
  attemptLogin: 0,
  fcmToken: '',
  expirationDate: '',
  permissions: [] as string[],
  services: [] as AssigningService[],
  roles: [] as RoleResponse[],
})

const pageNum = ref(1)
const keyword = ref('')
const file = ref<File | null>(null)

const serviceOptions = computed(
  () =>
    services.value?.map((s: ServiceDTO) => ({
      id: s.guid ?? '',
      name: s.name ?? '',
    })) ?? [],
)

const selectedServices = computed({
  get: () =>
    form.services?.map((s) => ({
      id: s.guid ?? '',
      name: s.name ?? '',
      activeDate: s.dateActive ?? '',
      expiredDate: s.dateExpired ?? '',
    })) ?? [],
  set: (val) => {
    form.services = val.map((s) => ({
      guid: s.id,
      name: s.name,
      dateActive: s.activeDate,
      dateExpired: s.expiredDate,
    })) as ServiceDTO[]
  },
})

const avatarPreview = computed(() => {
  if (file.value) return URL.createObjectURL(file.value)
  return '/src/assets/default_logo.jpg'
})

const roleOptions = computed(
  () =>
    roles.value?.map((r) => ({
      label: r.name ?? '',
      value: r.guid ?? '',
    })) ?? [],
)

const permissionOptions = computed(
  () =>
    permissions.value?.map((p) => ({
      label: p.name ?? '',
      value: p.guid?.toUpperCase() ?? '',
    })) ?? [],
)

const selectedRoleIds = computed({
  get: () => form.roles?.map((r) => r.guid ?? '') ?? [],
  set: (ids: string[]) => {
    if (!roles.value) return

    form.roles = ids.map((id) => {
      const role = roles.value?.find((r) => r.guid === id)
      return {
        guid: role?.guid ?? '',
        role: role?.name ?? '',
        value: role?.role ?? '',
        permissions: [],
      } as RoleResponse
    })
  },
})

onMounted(() => {
  roleStore.fetchRoles({ pageSize: PAGE_TYPE.MAX })
  permissionStore.fetchPermissions({ pageSize: PAGE_TYPE.MAX })
  serviceStore.fetchServices({
    pageNum: '1',
    pageSize: '5',
    keyword: '',
  })
})

watch([pageNum, keyword], () => {
  serviceStore.fetchServices({
    pageNum: pageNum.value.toString(),
    pageSize: pageSize.value.toString(),
    keyword: keyword.value,
  })
})

function handleSelect(service: { id: string; name: string }) {
  if (!form.services?.some((s) => s.guid === service.id)) {
    form.services?.push({
      guid: service.id,
      name: service.name,
      dateActive: '',
      dateExpired: '',
    })
  }
}

function handleRemove(id: string) {
  form.services = form.services?.filter((s) => s.guid !== id)
}

function handlePageChange(p: number) {
  pageNum.value = p
}

function handleSearch(k: string) {
  keyword.value = k
  pageNum.value = 1
}

function handleUpdateDate(id: string, field: 'dateActive' | 'dateExpired', value: string) {
  const service = form.services?.find((s) => s.guid === id)
  if (!service) return

  if (field === 'dateActive') service.dateActive = value
  if (field === 'dateExpired') service.dateExpired = value
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    file.value = input.files[0]
  }
}

async function handleCreate() {
  userStore.setLoading()

  let avatarId: string | null = null

  if (file.value) {
    const res = await FileService.postApiFile({
      formData: {
        File: file.value,
        FileType: 0,
      },
    })
    avatarId = res.data ?? null
  }

  await userStore.createUser({
    ...form,
    avatarUrl: avatarId ?? form.avatarUrl,
  })

  emit('update:modelValue', false)
}

function updatePermissions(selected: string[]) {
  form.permissions = selected
}
</script>

<template>
  <div class="w-full max-w-3xl bg-white shadow-xl">
    <div class="px-6 py-6 space-y-6">
      <div class="flex items-center gap-6">
        <div class="relative">
          <img :src="avatarPreview" class="h-24 w-24 rounded-full border object-cover" />
          <label
            class="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon="pen" />
            <input type="file" hidden accept="image/*" @change="handleFileChange" />
          </label>
        </div>
        <div class="text-sm text-gray-500">Upload avatar (JPG, PNG, max 2MB)</div>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase">
          <FontAwesomeIcon icon="user" /> Basic Information
        </h3>

        <div class="w-full flex flex-row gap-3 mb-3">
          <InputLabel label="First Name" v-model="form.firstName" />

          <InputLabel label="Middle Name" v-model="form.middleName" />

          <InputLabel label="Last Name" v-model="form.lastName" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputLabel label="Username" v-model="form.userName" />

          <InputLabel label="Email" v-model="form.email" />

          <div class="flex flex-row gap-2">
            <InputLabel label="Code" placeholder="+84" v-model="form.phoneCode" />

            <InputLabel label="Phone" placeholder="xxxxxxxx" v-model="form.phone" />
          </div>

          <div class="flex flex-col justify-between">
            <label class="text-xs font-medium text-gray-500">Country</label>
            <SelectBase
              class="text-sm"
              :options="[
                { value: 'VN', label: 'Viet Nam' },
                { value: 'US', label: 'United States' },
                { value: 'JP', label: 'Japan' },
                { value: 'PH', label: 'Philipines' },
                { value: 'TH', label: 'Thai Lan' },
                { value: 'SG', label: 'Singapore' },
                { value: 'HK', label: 'Hong Kong' },
                { value: 'CA', label: 'Canada' },
                { value: 'TW', label: 'Taiwan' },
              ]"
              v-model="form.region"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase">
          <FontAwesomeIcon icon="sliders" /> Config
        </h3>

        <div class="overflow-hidden rounded-lg border bg-white">
          <div class="divide-y">
            <InforRow label="Change Password ?">
              <Toggle
                class="!shadow-none focus:!shadow-none"
                v-model="form.isRequiredChangePassword"
              />
            </InforRow>

            <InforRow label="Password">
              <div class="flex flex-row items-center">
                <InputLabel
                  :disabled="!form.isRequiredChangePassword"
                  label="Password"
                  v-model="form.password"
                  type="password"
                />
              </div>
            </InforRow>

            <InforRow label="Password Expired ?">
              <Toggle
                class="!shadow-none focus:!shadow-none"
                v-model="form.isPasswordExpired"
                @change="
                  (val: boolean) => {
                    if (!val) {
                      form.expirationDate = ''
                    }
                  }
                "
              />
              <DateTimePicker
                class="mt-4"
                v-if="form.isPasswordExpired"
                :value="form.expirationDate"
                @change="(val) => (form.expirationDate = val)"
              />
            </InforRow>

            <InforRow label="Date Expired">
              {{ form.expirationDate === '' ? 'None' : form.expirationDate }}
            </InforRow>
          </div>
        </div>
      </div>

      <!-- <div>
        <h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase">
          <FontAwesomeIcon icon="gears" /> Access Control
        </h3>

        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-600">Roles</label>
            <MultipleSelect
              :options="roleOptions"
              :value="selectedRoleIds"
              @change="selectedRoleIds = $event"
              placeholder="Select roles"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Permissions</label>
            <MultipleSelect
              :options="permissionOptions"
              :value="form.permissions ?? []"
              @change="updatePermissions"
              placeholder="Select permissions"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Services</label>
            <ServicesSelector
              :services="serviceOptions"
              :pageNum="pageNum"
              :pageSize="pageSize"
              :total="totalItems"
              :selected="selectedServices"
              @select="handleSelect"
              @remove="handleRemove"
              @pageChange="handlePageChange"
              @search="handleSearch"
              @updateDate="handleUpdateDate"
            >
              <template #date-picker-start="{ value, onChange }">
                <DateTimePicker :value="value" @change="(val) => onChange(val)" />
              </template>

              <template #date-picker-end="{ value, onChange }">
                <DateTimePicker :value="value" @change="(val) => onChange(val)" />
              </template>
            </ServicesSelector>
          </div>
        </div>
      </div> -->
    </div>

    <div class="flex justify-end">
      <Button class="px-4 bg-blue-600 text-white" @click="handleCreate">Create</Button>
    </div>
  </div>
</template>
