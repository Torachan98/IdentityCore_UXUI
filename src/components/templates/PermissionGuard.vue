<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = computed(() => authStore.loading)
const hasUserToken = computed(() => Boolean(authStore.userToken))

if (!isLoading.value && !hasUserToken.value) {
  router.replace('/404')
}
</script>

<template>
  <div v-if="isLoading">loading...</div>

  <router-view v-else-if="hasUserToken" />
</template>

<!--
AI Suggest using this best-practice Vue

If you later need:

- role-based permission
- async permission fetch

{
  path: '/admin',
  component: PermissionGuard,
  beforeEnter: (to, from, next) => {
    const auth = useAuthStore()

    if (!auth.userToken) {
      next('/404')
    } else {
      next()
    }
  },
}


-->
