import type { BaseState } from '../user/base.types'

export interface HistoryChatState extends BaseState {
  messages: ChatMessage[] | null
}

export interface ChatMessage {
  user_id: string
  user_request: string
  ai_response: string
  is_deleted?: boolean
}
