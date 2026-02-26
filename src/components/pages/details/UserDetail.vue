<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toggle from '@vueform/toggle'
import { storeToRefs } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { useUserStore } from '@/store/user/user'
import { useRoleStore } from '@/store/role/role'
import { usePermissionStore } from '@/store/permission/permission'
import { useServiceStore } from '@/store/service/service'

import { FileService } from '@/api/generated'
import { Step } from '@/store/user/user.types'
import type { RoleResponse, ServiceDTO, UserDTO } from '@/api/generated'
import { PAGE_TYPE, STATUS_ACTION_TYPE } from '@/store/user/base.types'
import { useAuthStore } from '@/store/auth/auth'
import Button from '@/components/atoms/ButtonBase.vue'
import InputLabel from '@/components/atoms/InputLabel.vue'
import DateTimePicker from '@/components/atoms/DateTimePicker.vue'
import ServicesSelector from '@/components/atoms/ServicesSelector.vue'
import InfoRow from '@/components/atoms/InforRow.vue'
import MultiSelect from '@/components/atoms/MultipleSelect.vue'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const userStore = useUserStore()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()
const serviceStore = useServiceStore()

const { roles } = storeToRefs(roleStore)
const { permissions } = storeToRefs(permissionStore)
const { services, pageSize, totalItems } = storeToRefs(serviceStore)

const user = computed<UserDTO | null>(() => userStore.user)

const form = reactive<UserDTO>({} as UserDTO)

const file = ref<File | null>(null)
const minutes = ref<number>(0)
const page = ref(1)
const keyword = ref('')

const isView = computed(() => route.query.type === STATUS_ACTION_TYPE.VIEW)

let timer: number | null = null

const avatarPreview = computed(() => {
  if (file.value) return URL.createObjectURL(file.value)
  if (form.avatarUrl) return `https://drive.google.com/thumbnail?id=${form.avatarUrl}&sz=w500`
  return '/src/assets/default_logo.jpg'
})

const formattedLastLogin = computed(() =>
  form.lastLogin ? new Date(form.lastLogin).toLocaleString() : 'None',
)

const formattedExpiration = computed(() =>
  form.expirationDate ? new Date(form.expirationDate).toLocaleString() : 'None',
)

const passwordExpired = computed({
  get: () => form.isPasswordExpired ?? false,
  set: (v: boolean) => (form.isPasswordExpired = v),
})

const requiredChangePassword = computed({
  get: () => form.isRequiredChangePassword ?? false,
  set: (v: boolean) => (form.isRequiredChangePassword = v),
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

const serviceOptions = computed(
  () =>
    services.value?.map((s: ServiceDTO) => ({
      id: s.guid ?? '',
      name: s.name ?? '',
    })) ?? [],
)

const resendLabel = computed(() =>
  minutes.value > 0 ? `Resend in ${minutes.value}s` : 'Resend OTP',
)

function handleSelect(service: { id: string; name: string }) {
  if (!form.services) form.services = []

  if (!form.services.some((s) => s.guid === service.id)) {
    form.services.push({
      guid: service.id,
      name: service.name,
      dateActive: '',
      dateExpired: '',
    } as ServiceDTO)
  }
}

function handleRemove(id: string) {
  form.services = form.services?.filter((s) => s.guid !== id)
}

function handlePageChange(newPage: number) {
  page.value = newPage
}

function handleSearch(k: string) {
  keyword.value = k
  page.value = 1
}

function handleUpdateDate(id: string, field: 'dateActive' | 'dateExpired', value: string) {
  const service = form.services?.find((s) => s.guid === id)
  if (!service) return

  if (field === 'dateActive') {
    service.dateActive = value
  } else {
    service.dateExpired = value
  }
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    file.value = input.files[0]
  }
}

function updateField<K extends keyof UserDTO>(key: K, value: UserDTO[K]) {
  form[key] = value
}

function updatePermissions(selected: string[]) {
  form.permissions = selected
}

function startCountdown() {
  if (timer) clearInterval(timer)

  timer = window.setInterval(() => {
    if (minutes.value <= 1) {
      minutes.value = 0
      clearInterval(timer!)
      return
    }
    minutes.value -= 1
  }, 1000)
}

async function resendOtpAction() {
  if (!form.guid) return
  await authStore.resendOtp(form.guid)
  minutes.value = 50
}

async function handleUpdate() {
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

  await userStore.updateUser({
    ...form,
    avatarUrl: avatarId ?? form.avatarUrl,
  })
}

function goBack() {
  router.replace('/users')
}

onMounted(() => {
  roleStore.fetchRoles({ pageSize: PAGE_TYPE.MAX })
  permissionStore.fetchPermissions({ pageSize: PAGE_TYPE.MAX })

  serviceStore.fetchServices({
    pageNum: '1',
    pageSize: '3',
    keyword: '',
  })
})

watchEffect(() => {
  const id = route.params.id as string
  userStore.fetchUserById(id)
})

watch([page, keyword], () => {
  serviceStore.fetchServices({
    pageNum: page.value.toString(),
    pageSize: '3',
    keyword: keyword.value,
  })
})

watch(minutes, (val: number) => {
  if (val > 0) startCountdown()
})

watch(
  () => userStore.user,
  (val) => {
    if (val) Object.assign(form, val)
  },
  {
    immediate: true,
  },
)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <Button class="px-2" @click="goBack"> Back </Button>
      <h1 class="text-xl font-semibold">User Details</h1>
    </div>

    <div class="bg-white rounded-2xl shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex flex-col items-center gap-4">
          <div class="relative" :class="isView ? 'cursor-not-allowed' : 'cursor-pointer'">
            <img :src="avatarPreview" class="w-32 h-32 rounded-full object-cover border" />

            <label
              class="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white"
              :class="isView ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-700'"
            >
              <FontAwesomeIcon icon="pen" />
              <input
                v-if="!isView"
                type="file"
                hidden
                accept="image/*"
                @change="handleFileChange"
              />
            </label>
          </div>
          <span class="text-sm text-gray-500">JPG, PNG up to 2MB</span>
        </div>

        <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-2">
            <InputLabel
              label="Full name"
              disabled
              v-model="form.fullName"
              :class="{ 'cursor-not-allowed': isView }"
            />
          </div>

          <div class="col-span-2 flex gap-3 justify-between">
            <InputLabel
              label="First Name"
              :disabled="isView"
              v-model="form.firstName"
              :class="{ 'cursor-not-allowed': isView }"
            />
            <InputLabel
              label="Middle Name"
              :disabled="isView"
              v-model="form.middleName"
              :class="{ 'cursor-not-allowed': isView }"
            />
            <InputLabel
              label="Last Name"
              :disabled="isView"
              v-model="form.lastName"
              :class="{ 'cursor-not-allowed': isView }"
            />
          </div>

          <InputLabel
            label="Username"
            :disabled="isView"
            v-model="form.userName"
            :class="{ 'cursor-not-allowed': isView }"
          />

          <InputLabel
            label="Email"
            :disabled="isView"
            v-model="form.email"
            :class="{ 'cursor-not-allowed': isView }"
          />

          <div class="flex gap-2">
            <InputLabel
              label="Code"
              :disabled="isView"
              v-model="form.phoneCode"
              :class="{ 'cursor-not-allowed': isView }"
            />
            <InputLabel
              label="Phone"
              :disabled="isView"
              v-model="form.phone"
              :class="{ 'cursor-not-allowed': isView }"
            />
          </div>

          <InputLabel
            label="Country"
            :disabled="isView"
            v-model="form.region"
            :class="{ 'cursor-not-allowed': isView }"
          />

          <div class="col-span-2">
            <label class="text-sm text-gray-400 italic">Info</label>

            <div class="overflow-hidden rounded-lg border bg-white divide-y">
              <InfoRow label="Login status?">
                <div v-if="user?.isLogin">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    Login
                  </span>
                </div>
                <div v-if="!user?.isLogin">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                    Logout
                  </span>
                </div>
              </InfoRow>

              <InfoRow label="Latest Login:">
                {{ formattedLastLogin }}
              </InfoRow>

              <InfoRow label="Number of retry:">
                <div class="flex justify-between items-center">
                  <div>{{ user?.attemptLogin }}</div>
                  <Button v-if="!isView" class="px-2" @click="updateField('attemptLogin', 0)">
                    <FontAwesomeIcon icon="arrow-rotate-left" />
                  </Button>
                </div>
              </InfoRow>

              <InfoRow label="Status">
                <div class="flex justify-between items-center">
                  <div v-if="user?.step === Step.Confirmed">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Active
                    </span>
                  </div>

                  <div v-if="user?.step === Step.Waiting">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                      Waiting
                    </span>
                  </div>

                  <Button
                    v-if="user?.step === Step.Waiting"
                    :disabled="minutes > 0"
                    class="px-2"
                    @click="resendOtpAction"
                  >
                    {{ resendLabel }}
                  </Button>
                </div>
              </InfoRow>

              <InfoRow label="Expiration Date">
                {{ form.isPasswordExpired ? formattedExpiration : 'None' }}
              </InfoRow>

              <InfoRow label="Password Expired?">
                <div class="flex items-center gap-2 py-2">
                  <Toggle
                    class="!shadow-none focus:!shadow-none"
                    v-model="passwordExpired"
                    :disabled="isView"
                    @change="
                      (val: boolean) => {
                        if (!val) {
                          form.expirationDate = ''
                        }
                      }
                    "
                  />

                  <DateTimePicker
                    v-if="passwordExpired"
                    :value="form.expirationDate"
                    @change="(val) => (form.expirationDate = val)"
                  />
                </div>
              </InfoRow>

              <InfoRow label="Change Password?">
                <Toggle
                  class="!shadow-none focus:!shadow-none"
                  v-model="requiredChangePassword"
                  :disabled="isView"
                />
              </InfoRow>

              <InfoRow label="Lock Until:">
                <DateTimePicker v-if="user?.locked" v-model="user.locked" />
                <span v-else>None</span>
              </InfoRow>
            </div>
          </div>

          <div class="col-span-2">
            <label class="text-sm text-gray-400 italic">Access Controls</label>

            <div class="mb-3">
              <label class="text-sm font-medium text-gray-500"> Roles </label>

              <MultiSelect
                :disabled="isView"
                :options="roleOptions"
                :value="selectedRoleIds"
                @change="selectedRoleIds = $event"
                placeholder="Select roles"
              />
            </div>

            <div class="mb-3">
              <label class="text-sm font-medium text-gray-500"> Permissions </label>

              <MultiSelect
                :disabled="isView"
                :options="permissionOptions"
                :value="form.permissions ?? []"
                @change="updatePermissions"
                placeholder="Select permissions"
              />
            </div>

            <div class="mb-3">
              <label class="text-sm font-medium text-gray-500"> Services </label>

              <ServicesSelector
                :services="serviceOptions"
                :pageNum="page"
                :pageSize="Number(pageSize)"
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
        </div>
      </div>

      <div v-if="!isView" class="flex justify-end gap-3 mt-8">
        <Button class="px-2" @click="goBack">Cancel</Button>
        <Button class="px-2" @click="handleUpdate"> Update </Button>
      </div>
    </div>
  </div>
</template>
