<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()

const goBack = (): void => {
  router.back()
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center px-6 py-6">
    <div class="text-center max-w-md">
      <h1 class="text-7xl font-extrabold text-blue-600">404</h1>

      <p class="mt-4 text-2xl font-semibold text-gray-800">Oops! Page not found</p>

      <p class="mt-2 text-gray-500">The page you’re looking for doesn’t exist or has been moved.</p>

      <div class="mt-6 flex justify-center gap-4">
        <button
          type="button"
          class="rounded-lg border px-5 py-2 text-gray-600 hover:bg-gray-100"
          @click="goBack"
        >
          <FontAwesomeIcon icon="arrow-left" />
          Go back
        </button>

        <RouterLink
          to="/"
          replace
          class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Go to home
        </RouterLink>
      </div>

      <p class="mt-6 text-sm text-gray-400">
        If you think this is a mistake, please contact support.
      </p>
    </div>
  </div>
</template>
