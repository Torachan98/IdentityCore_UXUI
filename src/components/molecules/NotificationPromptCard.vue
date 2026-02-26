<script setup lang="ts">
import Button from '@/components/atoms/ButtonBase.vue'

const emit = defineEmits<{
  (e: 'allow'): void
  (e: 'dismiss'): void
}>()
</script>

<template>
  <div class="w-[360px] rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-900">Enable notifications?</h3>

    <p class="mt-2 text-sm text-gray-600">Stay updated with important activity and messages.</p>

    <div class="mt-4 flex justify-end gap-2">
      <Button class="px-2" @click="emit('dismiss')"> Maybe later </Button>
      <Button class="px-2" @click="emit('allow')"> Allow </Button>
    </div>
  </div>
</template>
