<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StepLoadingBar from '../atoms/StepLoadingBar.vue'
import OtpStep from '../molecules/OtpForm.vue'
import ButtonBase from '../atoms/ButtonBase.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InputLabel from '../atoms/InputLabel.vue'
import { useAuthStore } from '@/store/auth/auth'
import { isValidEmail } from '@/utility'

enum TotalSteps {
  EMAIL_PROCESS = 1,
  OTP_PROCESS = 2,
  CHANGE_PASSWORD_PROCESS = 3,
}

let timer: number | null = null

const router = useRouter()

const totalSteps = Object.keys(TotalSteps).length / 2
const currentStep = ref<number>(1)
const minutes = ref(0)
const email = ref<string>('')
const otp = ref<string>('')
const password = ref<string>('')
const rePassword = ref<string>('')
const messageError = ref<string>('')
const emailRef = ref<{ validate: () => void } | null>(null)
const passwordRef = ref<{ validate: () => void } | null>(null)
const passwordConfirmRef = ref<{ validate: () => void } | null>(null)

const authStore = useAuthStore()

watch(minutes, (val: number) => {
  if (val > 0) startCountdown()
})

watch([password, rePassword], () => {
  if (password.value != rePassword.value) {
    messageError.value = 'Password is not matched'
  }
  if (password.value.length < 5 || rePassword.value.length < 5) {
    messageError.value = 'Length of password is not short'
  } else {
    messageError.value = ''
  }
})

watch([email], () => {
  if (!isValidEmail(email.value)) {
    messageError.value = 'e-mail is not correct format'
  } else {
    messageError.value = ''
  }
})

const isButtonEnabled = computed(() => otp.value.length === 5)

const onSubmit = async (): Promise<void> => {
  if (currentStep.value === TotalSteps.EMAIL_PROCESS) {
    const res = emailRef.value?.validate()
    if (!res) {
      return
    }

    await authStore.reSendOtp(email.value)
    currentStep.value = TotalSteps.OTP_PROCESS
  } else if (currentStep.value === TotalSteps.OTP_PROCESS) {
    if (!otp.value) {
      return
    }

    const res = await authStore.resetEmail(email.value, otp.value)
    if (!res.isSuccess) {
      return
    }

    currentStep.value = TotalSteps.CHANGE_PASSWORD_PROCESS
  } else {
    const passwordValidate = passwordRef.value?.validate()
    const confirmPasswordValidate = passwordConfirmRef.value?.validate()

    if (!passwordValidate && !confirmPasswordValidate) {
      return
    }

    if (password.value !== rePassword.value) {
      return
    }

    if (password.value.length < 5 || rePassword.value.length < 5) {
      return
    }

    currentStep.value = TotalSteps.CHANGE_PASSWORD_PROCESS
  }
}

const resetOtp = async (email: string): Promise<void> => {
  minutes.value = 60
  await authStore.reSendOtp(email)
}

function startCountdown() {
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

onMounted(() => {
  messageError.value = ''
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
    <StepLoadingBar :steps="totalSteps" :current-step="currentStep" />

    <ButtonBase class="px-3" :is-transparent="true" @click="router.replace('/login')">
      <FontAwesomeIcon icon="arrow-left" />
    </ButtonBase>

    <div v-if="currentStep === TotalSteps.EMAIL_PROCESS">
      <InputLabel
        :required="true"
        ref="emailRef"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
      />

      <div v-if="messageError.length > 0" class="p-0 m-0 mt-2 text-center text-sm text-red-500">
        {{ messageError }}
      </div>
    </div>

    <div class="flex flex-col gap-2" v-if="currentStep === TotalSteps.OTP_PROCESS">
      <OtpStep @complete="($event) => (otp = $event)" />

      <p class="text-center">Resent code ? This code only valid in 10 minutes</p>

      <span v-if="minutes > 0" class="text-center">
        00: {{ minutes < 10 ? `0${minutes}` : minutes }}
      </span>

      <div class="flex flex-row justify-center">
        <ButtonBase class="px-3" :is-transparent="true" :disabled="minutes !== 0" @click="resetOtp">
          Resend
        </ButtonBase>
      </div>
    </div>

    <div v-if="currentStep === TotalSteps.CHANGE_PASSWORD_PROCESS" class="flex flex-col gap-2">
      <InputLabel
        :required="true"
        ref="passwordRef"
        v-model="password"
        type="password"
        label="New Password"
        placeholder="Enter new password"
      />
      <InputLabel
        :required="true"
        ref="passwordConfirmRef"
        v-model="rePassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm new password"
      />

      <div v-if="messageError.length > 0" class="p-0 m-0 mt-2 text-center text-sm text-red-500">
        {{ messageError }}
      </div>
    </div>

    <div class="flex flex-row justify-end">
      <ButtonBase
        class="px-3"
        @click="onSubmit"
        :disabled="(currentStep == 2 && !isButtonEnabled) || messageError.length > 0"
      >
        {{ currentStep === 3 ? 'Submit' : 'Next' }}</ButtonBase
      >
    </div>
  </div>
</template>
