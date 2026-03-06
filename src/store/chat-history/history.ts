import { defineStore } from 'pinia'
import type { ChatMessage, HistoryChatState } from './history.types'
import { externalApi } from '@/api/externalApi'

type HistoryResponse = {
  isSuccess: boolean
  requestId: string | null
  data: ChatMessage[] | null
}

export const useHistoryChatStore = defineStore('history-chat', {
  state: (): HistoryChatState => ({
    messages: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchHistoryChat(userId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const res = await externalApi.get(`/history-chat?id=${userId}`)
        const data = res.data as HistoryResponse

        if (data.isSuccess) {
          this.messages = data.data ?? []
        } else {
          this.error = 'Cannot fetch history chat'
        }
      } catch {
        this.error = 'Cannot GET /api/Permission'
      } finally {
        this.loading = false
      }
    },

    async createChat({ userId, message }: { userId: string; message: string }): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const res = await externalApi.post('/question', {
          sessionId: userId,
          message: message,
        })

        const data = res.data as HistoryResponse

        if (data.isSuccess) {
          await this.fetchHistoryChat(userId)
        }

        // if (data.isSuccess) {
        //   this.messages = data.data ?? []
        // } else {
        //   this.error = 'Cannot create an chat'
        // }
      } catch (error) {
        console.log(error)
        this.error = 'Cannot POST /api/Question'
      } finally {
        this.loading = false
      }
    },
  },
})
