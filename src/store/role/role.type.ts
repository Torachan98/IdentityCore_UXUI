import type { RoleDTO } from '@/api/generated'
import type { BaseState } from '../user/base.types'

export interface RoleState extends BaseState {
  roles: RoleDTO[] | null
  role: RoleDTO | null
  pageSize: number
  pageNum: number
  totalItems: number
  totalPages: number
}
