<script setup lang="ts">
import { computed, h, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue3-toastify'
import { RouterView } from 'vue-router'
import { VueSpinner } from 'vue3-spinners'

import { listenToMessages } from '@/fcmService'
import NotificationToast from '@/components/atoms/NotificationToast.vue'

import { useAuthStore } from '@/store/auth/auth'
import { useUserStore } from '@/store/user/user'
import { usePermissionStore } from '@/store/permission/permission'
import type { MessagePayload } from 'firebase/messaging'
import { useRoleStore } from './store/role/role'
import { useServiceStore } from './store/service/service'

const authStore = useAuthStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const roleStore = useRoleStore()
const serviceStore = useServiceStore()

const isLoading = computed<boolean>(() => {
  return (
    authStore.loading ||
    userStore.loading ||
    permissionStore.loading ||
    roleStore.loading ||
    serviceStore.loading
  )
})

let unsubscribe: (() => void) | undefined

onMounted(async () => {
  unsubscribe = await listenToMessages((payload: MessagePayload) => {
    const id = toast(
      h(NotificationToast, {
        icon: 'signal',
        title: payload.notification?.title ?? '',
        message: payload.notification?.body ?? '',
      }),
      {
        autoClose: 5000,
        closeButton: false,
        hideProgressBar: false,
        position: toast.POSITION.BOTTOM_RIGHT,
      },
    )

    toast.update(id, {
      render: h(NotificationToast, {
        icon: 'signal',
        title: payload.notification?.title ?? '',
        message: payload.notification?.body ?? '',
      }),
    })
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <VueSpinner :size="80" color="#3e6ae4" />
  </div>

  <RouterView />
</template>
