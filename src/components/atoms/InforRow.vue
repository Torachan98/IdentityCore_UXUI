<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-4 px-4 py-3">
    <dt class="flex self-center text-sm font-medium text-gray-500">
      {{ label }}
    </dt>

    <dd class="col-span-2">
      <slot />
    </dd>
  </div>
</template>
