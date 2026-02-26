import { defineStore } from 'pinia'
import { ServiceService } from '@/api/generated'

import type {
  CreateOrUpdateServiceRequest,
  ServiceDTOApiResponse,
  ServiceDTOPaginationItemsApiResponse,
} from '@/api/generated'
import type { FetchParams } from '@/store/user/base.types'
import type { ServiceState } from './service.type'

export const useServiceStore = defineStore('service', {
  state: (): ServiceState => ({
    services: null,
    loading: false,
    error: null,
    pageSize: 10,
    pageNum: 1,
    totalItems: 0,
    totalPages: 0,
  }),

  actions: {
    async fetchServices(query: FetchParams): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const res: ServiceDTOPaginationItemsApiResponse = await ServiceService.getApiService(query)

        if (res.isSuccess) {
          this.services = res.data?.items ?? []
          this.pageNum = res.data?.pageNum ?? 1
          this.pageSize = res.data?.pageSize ?? 10
          this.totalPages = res.data?.totalPage ?? 0
          this.totalItems = res.data?.totalCount ?? 0
        } else {
          this.error = res.message ?? ''
        }
      } catch {
        this.error = 'Cannot GET /api/Service'
      } finally {
        this.loading = false
      }
    },

    async createService(payload: CreateOrUpdateServiceRequest): Promise<ServiceDTOApiResponse> {
      return ServiceService.postApiService({
        requestBody: payload,
      })
    },

    async updateService(payload: CreateOrUpdateServiceRequest): Promise<ServiceDTOApiResponse> {
      return ServiceService.putApiService({
        requestBody: payload,
      })
    },

    async deleteService(id: string): Promise<void> {
      await ServiceService.deleteApiService({ guid: id })
    },
  },
})
