<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth/auth'
import Sidebar from '@/components/organisms/SidebarCustom.vue'
import NotificationPermissionFloat from '@/components/organisms/NotificationPermissionFloat.vue'

const collapsed = ref(false)

const authStore = useAuthStore()

const firstName = computed(() => authStore.userToken?.firstName ?? '')
const lastName = computed(() => authStore.userToken?.lastName ?? '')

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar
      :first-name="firstName"
      :last-name="lastName"
      :collapsed="collapsed"
      @toggle="toggleSidebar"
    />

    <main class="flex-1 overflow-y-auto p-6">
      <RouterView />
    </main>

    <NotificationPermissionFloat />
  </div>
</template>
