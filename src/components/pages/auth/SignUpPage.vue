<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoadingBar from '@/components/atoms/StepLoadingBar.vue'
import OtpForm from '@/components/molecules/OtpForm.vue'
import SignUpForm from '@/components/molecules/SignUpForm.vue'
import Button from '@/components/atoms/ButtonBase.vue'
import type { UserDTO } from '@/api/generated'
import { useAuthStore } from '@/store/auth/auth'
import ButtonBase from '@/components/atoms/ButtonBase.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

enum StepForm {
  FORGOT_PASSWORD = 'forgot-password',
  SIGN_UP = 'sign-up',
  OTP_PROCESS = 'otp-process',
}
const authStore = useAuthStore()
const router = useRouter()

const step = ref<StepForm>(StepForm.SIGN_UP)
const stepProcess = ref(1)
const minutes = ref(0)
const otpCode = ref('')
const errorMessage = ref('')

const signUpRef = ref<{ isValid: () => boolean; submit: () => UserDTO } | null>(null)

let intervalId: number | null = null

watch(step, () => {
  minutes.value = import.meta.env.VITE_TIME_COUNT_DOWN_UI
  startCountdown()
})

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(minutes.value / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

onMounted(() => {
  minutes.value = import.meta.env.VITE_TIME_COUNT_DOWN_UI
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})

const startCountdown = (): void => {
  stopCountdown()

  intervalId = window.setInterval(() => {
    if (minutes.value <= 1000) {
      minutes.value = 0
      stopCountdown()
      return
    }

    minutes.value -= 1000
  }, 1000)
}

const stopCountdown = (): void => {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const handleSubmit = async (): Promise<void> => {
  if (step.value === StepForm.SIGN_UP) {
    const isSuccess = signUpRef.value?.isValid()

    if (isSuccess) {
      const payload = signUpRef.value?.submit()
      const res = await authStore.signUp({ ...payload })

      if (res.isSuccess) {
        stepProcess.value += 1
        step.value = StepForm.OTP_PROCESS
      }
    }
  }

  if (step.value === StepForm.OTP_PROCESS) {
    if (otpCode.value) {
      const res = await authStore.confirmOtp(otpCode.value)
      if (!res.isSuccess) {
        errorMessage.value = res.message ?? ''
      }

      await router.replace('/login')
    }
  }
}

const handleResend = (): void => {
  minutes.value = 50
  startCountdown()
}

const handleOtpComplete = (val: string): void => {
  otpCode.value = val
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-lg p-4 space-y-6">
      <div class="space-y-2">
        <LoadingBar :steps="2" :current-step="stepProcess" />
        <p class="text-sm text-gray-500 text-right">Step {{ stepProcess }} of 2</p>
      </div>

      <div>
        <ButtonBase class="px-3" :is-transparent="true" @click="router.replace('/login')">
          <FontAwesomeIcon icon="arrow-left"
        /></ButtonBase>
      </div>

      <div class="relative">
        <div v-if="step === StepForm.SIGN_UP" class="animate-fadeIn">
          <SignUpForm ref="signUpRef" />
        </div>

        <div v-else-if="step === StepForm.OTP_PROCESS">
          <div class="text-center py-3">
            <p>
              Enter your code which already sent from email
              <br />
              Your code only valid at: {{ formattedTime }}
            </p>
          </div>

          <div class="animate-fadeIn">
            <OtpForm @complete="handleOtpComplete" />
          </div>
        </div>
      </div>

      <div v-if="errorMessage.length > 0" class="text-center text-red-500">{{ errorMessage }}</div>

      <div class="flex flex-row gap-2 justify-end">
        <Button
          class="px-2"
          :disabled="step === StepForm.OTP_PROCESS && otpCode === ''"
          @click="handleSubmit"
        >
          {{ step === StepForm.SIGN_UP ? 'Submit' : 'Active' }}
        </Button>

        <Button
          v-if="step === StepForm.OTP_PROCESS"
          class="px-2"
          :disabled="minutes > 0"
          @click="handleResend"
        >
          Resent email
        </Button>
      </div>
    </div>
  </div>
</template>
