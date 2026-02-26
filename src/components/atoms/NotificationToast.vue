<script setup lang="ts">
import { toast } from 'vue3-toastify'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  title: string
  message: string
  icon: string
  toastId?: string | number
}>()

const dismiss = () => {
  if (props.toastId) {
    toast.remove(props.toastId)
  }
}
</script>

<template>
  <div
    class="flex items-center w-[320px] gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5"
  >
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <FontAwesomeIcon :icon="icon" />
        <p class="text-sm font-semibold">
          {{ title }}
        </p>
      </div>

      <p class="mt-1 text-sm text-gray-600">
        {{ message }}
      </p>
    </div>

    <button class="text-sm text-blue-600 hover:underline" @click="dismiss">Dismiss</button>
  </div>
</template>
