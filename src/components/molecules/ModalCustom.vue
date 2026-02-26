<script setup lang="ts">
const props = defineProps<{
  open: boolean
  closeOnOverlayClick?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 flex items-center justify-center bg-black/40"
    @click="handleOverlayClick"
  >
    <div class="w-[30%] rounded bg-white p-6" @click.stop>
      <slot name="title" />
      <div class="max-h-[80vh] overflow-y-auto">
        <slot name="body" />
      </div>
    </div>
  </div>
</template>
