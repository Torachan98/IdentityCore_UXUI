<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.renewToken()
})
</script>

<template>
  <slot />
</template>
