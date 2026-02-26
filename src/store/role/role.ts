import { defineStore } from 'pinia'
import {
  RoleService,
  type CreateOrUpdateRoleRequest,
  type RoleDTOApiResponse,
  type RoleDTOPaginationItemsApiResponse,
} from '@/api/generated'
import type { RoleState } from './role.type'
import type { FetchParams } from '../user/base.types'
import type { RoleDTO } from '@/api/generated'
import { onToast } from '../toast-generic'

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: null,
    role: null,
    loading: false,
    error: null,
    pageSize: 1,
    pageNum: 10,
    totalItems: 0,
    totalPages: 0,
  }),

  actions: {
    setRole(role: RoleDTO) {
      this.role = role
    },

    async fetchRoles(query: FetchParams) {
      this.loading = true
      this.error = null

      try {
        const res: RoleDTOPaginationItemsApiResponse = await RoleService.getApiRole(query)

        if (res.isSuccess) {
          this.roles = res.data?.items ?? []
          this.pageNum = res.data?.pageNum ?? 1
          this.pageSize = res.data?.pageSize ?? 10
          this.totalPages = res.data?.totalPage ?? 0
          this.totalItems = res.data?.totalCount ?? 0
        }

        this.error = res.message ?? ''
      } catch {
        this.error = 'Cannot GET /api/Role'
      } finally {
        this.loading = false
      }
    },

    async fetchRoleById(id: string) {
      this.loading = true
      this.error = null

      try {
        const res: RoleDTOApiResponse = await RoleService.getRoleById({ id })

        if (res.isSuccess) {
          this.role = res.data ?? null
        }

        this.error = res.message ?? ''
      } catch {
        this.error = 'Cannot GET /api/GetRoleById'
      } finally {
        this.loading = false
      }
    },

    async createRole(payload: CreateOrUpdateRoleRequest) {
      this.loading = true
      this.error = null

      try {
        const res: RoleDTOApiResponse = await RoleService.postApiRole({ requestBody: payload })

        if (res.isSuccess) {
          this.role = res.data ?? null
        }

        this.error = res.message ?? ''

        onToast({
          title: 'Created Notification',
          message: 'Created Successfully',
          icon: 'circle-info',
        })

        return res
      } catch {
        this.error = 'Cannot POST /api/Role'

        onToast({
          title: 'Created Error Notification',
          message: 'Cannot POST /api/Role',
          icon: 'circle-info',
        })

        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },

    async updateRole(payload: CreateOrUpdateRoleRequest) {
      this.loading = true
      this.error = null

      try {
        const res: RoleDTOApiResponse = await RoleService.putApiRole({ requestBody: payload })

        if (res.isSuccess) {
          this.role = res.data ?? null
        }

        this.error = res.message ?? ''

        onToast({
          title: 'Updated Notification',
          message: 'Updated Successfully',
          icon: 'circle-info',
        })

        return res
      } catch {
        this.error = 'Cannot PUT /api/Role'

        onToast({
          title: 'Updated Error Notification',
          message: 'Cannot PUT /api/Role',
          icon: 'circle-info',
        })

        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },

    async deleteRole(id: string) {
      this.loading = true
      this.error = null

      try {
        await RoleService.deleteApiRole({ guid: id })

        onToast({
          title: 'Deleted Notification',
          message: 'Removed Successfully',
          icon: 'circle-info',
        })
      } catch {
        this.error = 'Cannot DELETE /api/Role'

        onToast({
          title: 'Deleted Error Notification',
          message: 'Cannot DELETE /api/Role',
          icon: 'circle-info',
        })

        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
