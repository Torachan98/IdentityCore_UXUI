import type { BaseState } from '../user/base.types'

export interface Response {
  isSuccess: boolean
  requestId: string
  code: number
  data: unknown
  message: string
  loading: boolean
}

export interface AuthState extends BaseState {
  token: string
  step: number
  userToken: AuthInformation | null
}

export interface AuthInformation {
  firstName: string
  lastName: string
  email: string
  phone: string
  userId: string
  permissions: string
  roles: RoleToken[]
}

export interface RoleToken {
  guid: string
  value: number
  role: string
  permissions: string[]
}
