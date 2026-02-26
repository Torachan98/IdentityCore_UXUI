<script setup lang="ts">
const props = defineProps<{
  steps: number
  currentStep: number
}>()
</script>

<template>
  <div class="flex w-full gap-2">
    <div
      v-for="(_, index) in props.steps"
      :key="index"
      :class="[
        'h-2 flex-1 rounded transition-colors duration-300',
        index < props.currentStep ? 'bg-blue-500' : 'bg-gray-200',
      ]"
    />
  </div>
</template>
