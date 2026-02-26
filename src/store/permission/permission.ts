import { defineStore } from 'pinia'
import { PermissionService } from '@/api/generated'

import type {
  PermissionDTOPaginationItemsApiResponse,
  PermissionDTOApiResponse,
  CreateOrUpdatePermissionRequest,
} from '@/api/generated'
import type { FetchParams } from '@/store/user/base.types'
import type { PermissionState } from './permission.types'

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    permissions: null,
    loading: false,
    error: null,
    pageSize: 10,
    pageNum: 1,
    totalItems: 0,
    totalPages: 0,
  }),

  actions: {
    async fetchPermissions(query: FetchParams): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const res: PermissionDTOPaginationItemsApiResponse =
          await PermissionService.getApiPermission(query)

        if (res.isSuccess) {
          this.permissions = res.data?.items ?? []
          this.pageNum = res.data?.pageNum ?? 1
          this.pageSize = res.data?.pageSize ?? 10
          this.totalPages = res.data?.totalPage ?? 0
          this.totalItems = res.data?.totalCount ?? 0
        } else {
          this.error = res.message ?? ''
        }
      } catch {
        this.error = 'Cannot GET /api/Permission'
      } finally {
        this.loading = false
      }
    },

    async createPermission(
      payload: CreateOrUpdatePermissionRequest,
    ): Promise<PermissionDTOApiResponse> {
      return PermissionService.postApiPermission({
        requestBody: payload,
      })
    },

    async updatePermission(
      payload: CreateOrUpdatePermissionRequest,
    ): Promise<PermissionDTOApiResponse> {
      return PermissionService.putApiPermission({
        requestBody: payload,
      })
    },

    async removePermission(id: string): Promise<void> {
      await PermissionService.deleteApiPermission({ guid: id })
    },
  },
})
