<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Input from '@/components/atoms/InputBase.vue'
import Button from '@/components/atoms/ButtonBase.vue'
import { useAuthStore } from '@/store/auth/auth'
import { Step } from '@/store/user/user.types'
import { DEVICE_ID_KEY } from '@/variable.type'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const error = computed(() => authStore.error)

onMounted(() => {
  const deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    localStorage.setItem(
      DEVICE_ID_KEY,
      `device_${navigator.userAgentData?.platform}_${crypto.randomUUID().slice(0, 8).toString().toUpperCase()}`,
    )
  }
})

const handleLogin = async (): Promise<void> => {
  const res = await authStore.signIn({
    userName: username.value,
    password: password.value,
  })

  if (res.isSuccess && res.data?.item?.step === Step.Waiting) {
    await router.replace({
      path: '/otp-confirm',
      query: { email: encodeURIComponent(username.value) },
    })
  }

  if (res.isSuccess && res.data?.item?.accessToken) {
    await router.replace('/')
  }
}

const goForgotPassword = (): void => {
  router.push('/forgot-password')
}

const goSignUp = (): void => {
  router.push('/sign-up')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="mx-auto px-2 py-2 sm:px-6 lg:px-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
      <img
        class="w-full h-auto object-contain"
        alt="Identity Service Logo"
        src="/src/assets/identity_service_logo.png?w=150"
      />
    </div>

    <div class="space-y-4">
      <Input
        class="border border-gray-600 p-1"
        icon="user"
        @keyup.enter="handleLogin"
        placeholder="User name or Email"
        v-model="username"
      />

      <Input
        class="border border-gray-600 p-1"
        @keyup.enter="handleLogin"
        icon="lock"
        type="password"
        placeholder="Password"
        v-model="password"
      />

      <Button class="w-full" @click="handleLogin"> Login </Button>

      <div
        class="text-center text-sm text-bold text-black cursor-pointer hover:underline underline-offset-1"
        @click="goForgotPassword"
      >
        Forgot password ?
      </div>

      <hr class="h-px my-8 bg-gray-300 border-0" />

      <Button class="w-full" @click="goSignUp"> Sign Up </Button>

      <p class="text-center text-red-500">{{ error }}</p>
    </div>
  </div>
</template>
