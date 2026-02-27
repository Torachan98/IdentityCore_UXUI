<script setup lang="ts">
import ForgotPasswordStepper from '@/components/organisms/ForgotPasswordStepper.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
    <div class="mx-auto px-2 py-2 sm:px-6 lg:px-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
      <img
        class="w-full h-auto object-contain"
        alt="Identity Service Logo"
        src="/src/assets/identity_service_logo.png?w=150"
      />
    </div>

    <ForgotPasswordStepper />
  </div>
</template>
