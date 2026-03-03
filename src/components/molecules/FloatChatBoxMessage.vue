<script setup lang="ts">
import { useAuthStore } from '@/store/auth/auth'
import { useHistoryChatStore } from '@/store/chat-history/history'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, onMounted } from 'vue'

const open = ref<boolean>(false)
const input = ref<string>('')
const loading = ref<boolean>(false)
const sending = ref<boolean>(false)
const messagesContainer = ref<HTMLElement | null>(null)

const historyChatStore = useHistoryChatStore()
const authStore = useAuthStore()

onMounted(() => {
  historyChatStore.fetchHistoryChat()
})

const toggleChat = async (): Promise<void> => {
  open.value = !open.value
  //   if (open.value && historyChatStore.messages?.length === 0) {
  //     await historyChatStore.fetchHistoryChat()
  //   }
}

// const loadMessages = async (): Promise<void> => {
//   loading.value = true
//   try {
//     messages.value = historyChatStore.messages ?? []
//     await scrollToBottom()
//   } catch (e) {
//     console.error(e)
//   } finally {
//     loading.value = false
//   }
// }

const sendMessage = async (): Promise<void> => {
  if (!input.value.trim()) return
  const question = input.value
  input.value = ''
  sending.value = true
  try {
    await historyChatStore.createChat({
      userId: authStore.userToken?.userId ?? '',
      message: question,
    })

    //await scrollToBottom()
  } catch (e) {
    console.error(e)
  } finally {
    sending.value = false
  }
}

// const scrollToBottom = async (): Promise<void> => {
//   await nextTick()
//   if (messagesContainer.value) {
//     messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
//   }
// }
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <button
      @click="toggleChat"
      class="rounded-full bg-blue-600 text-white w-14 h-14 shadow-lg flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
    >
      <FontAwesomeIcon icon="message" />
    </button>

    <transition name="fade">
      <div
        v-if="open"
        class="fixed bottom-24 right-6 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
      >
        <div
          class="bg-blue-600 text-white px-4 py-3 font-semibold flex justify-between items-center"
        >
          <span>Chat Assistant</span>
          <button @click="toggleChat" class="text-white text-lg">×</button>
        </div>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <div
            v-for="(msg, index) in historyChatStore.messages"
            :key="index"
            class="flex flex-col space-y-2"
          >
            <div class="flex justify-end">
              <div
                class="bg-blue-600 text-white px-3 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-line"
              >
                <p>{{ msg.user_request }}</p>
              </div>
            </div>
            <div class="flex justify-start">
              <div
                class="bg-white border px-3 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-line"
              >
                <p>{{ msg.ai_response }}</p>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center text-sm text-gray-400">Loading...</div>
        </div>

        <div class="p-3 border-t bg-white flex gap-2">
          <input
            v-model="input"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="sendMessage"
            :disabled="sending || !input.trim()"
            class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
