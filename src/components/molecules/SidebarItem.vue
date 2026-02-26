<script setup lang="ts">
interface Props {
  label: string
  collapsed: boolean
  active: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
    :class="
      active ? 'bg-blue-200 text-white-700 hover:bg-white-100' : 'text-gray-700 hover:bg-gray-100'
    "
    @click="$emit('click')"
  >
    <slot name="icon" />

    <span v-if="!collapsed" class="truncate" :class="active ? 'text-white-700' : ''">
      {{ label }}
    </span>
  </button>
</template>
