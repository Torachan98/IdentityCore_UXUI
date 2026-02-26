import { type PermissionDTO } from '@/api/generated'
import type { BaseState } from '../user/base.types'

export interface PermissionState extends BaseState {
  permissions: PermissionDTO[] | null
  pageSize: number
  pageNum: number
  totalItems: number
  totalPages: number
}
