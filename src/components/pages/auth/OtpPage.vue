<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import ButtonBase from '@/components/atoms/ButtonBase.vue'
import OtpForm from '@/components/molecules/OtpForm.vue'
import { useAuthStore } from '@/store/auth/auth'
import { useRoute, useRouter } from 'vue-router'
import { onToast } from '@/store/toast-generic'

const otp = ref('')
const minutes = ref<number>(0)
let timer: number | null = null

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isButtonEnabled = computed(() => otp.value.length === 5)

const email = computed(() => {
  const value = route.query.email

  if (Array.isArray(value)) {
    return value[0] // take first if multiple
  }

  return typeof value === 'string' ? value : null
})

watch(minutes, (val: number) => {
  if (val > 0) startCountdown()
})

const handle = (otpCode: string) => {
  otp.value = otpCode
}

const startCountdown = () => {
  if (timer) clearInterval(timer)

  timer = window.setInterval(() => {
    if (minutes.value <= 1) {
      minutes.value = 0
      clearInterval(timer!)
      return
    }
    minutes.value -= 1
  }, 1000)
}

const onSubmit = async () => {
  const res = await authStore.confirmOtp(otp.value)
  if (res.isSuccess) {
    await router.replace('/login')
  } else {
    message.value = res.message ?? ''
  }
}

const message = ref('')

const onResent = async () => {
  minutes.value = 60
  message.value = ''
  const res = await authStore.resendOtp(decodeURIComponent(email.value ?? ''))
  if (res.isSuccess) {
    onToast({ title: 'Notification', message: 'New otp has been sent', icon: 'shield' })
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="px-5 py-35 flex flex-col items-center gap-6">
    <OtpForm @complete="handle($event)" />

    <p class="text-center">
      There is an code has been send to your email.<br />
      Please check it in spam as need. This code only valid in 10 minutes
    </p>

    <ButtonBase class="px-3" :disabled="minutes !== 0" @click="onResent"> Resend </ButtonBase>
    <span v-if="minutes > 0">00: {{ minutes < 10 ? `0${minutes}` : minutes }}</span>

    <div class="py-10">
      <ButtonBase class="px-3" :disabled="!isButtonEnabled" @click="onSubmit"> Submit </ButtonBase>
    </div>

    <p v-if="message.length > 0" class="text-center text-red-600">{{ message }}</p>
  </div>
</template>
