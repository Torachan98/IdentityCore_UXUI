<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  firstName: string
  lastName: string
}

const props = defineProps<Props>()

const initials = computed(
  () => `${props.firstName.charAt(0).toUpperCase()}${props.lastName.charAt(0).toUpperCase()}`,
)
</script>

<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
  >
    {{ initials }}
  </div>
</template>
