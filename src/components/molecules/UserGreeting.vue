<script setup lang="ts">
import AvatarBase from '@/components/atoms/AvatarBase.vue'

type Props = {
  firstName: string
  lastName: string
  collapsed: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-3 px-3 py-4">
    <AvatarBase :firstName="firstName" :lastName="lastName" />

    <div v-if="!collapsed" class="text-sm">
      <p class="text-gray-500">Hello</p>
      <p class="font-semibold truncate">{{ firstName }} {{ lastName }}</p>
    </div>
  </div>
</template>
