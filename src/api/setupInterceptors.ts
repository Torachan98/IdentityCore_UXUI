import axios from 'axios'

export const setupInterceptors = (
  getAccessToken: () => string | null,
  refreshToken: () => Promise<boolean>,
  onLogout: () => void,
) => {
  axios.interceptors.request.use((config) => {
    const token = getAccessToken()
    const deviceId = localStorage.getItem('device_id')
    config.headers['X-Device-ID'] = deviceId

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config

      if (!error.response || !originalRequest) {
        return Promise.reject(error)
      }

      const status = error.response.status

      if (originalRequest.url?.includes('/auth/refresh')) {
        onLogout()
        return Promise.reject(error)
      }

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const success = await refreshToken()

        if (success) {
          return axios(originalRequest)
        } else {
          onLogout()
        }
      }

      return Promise.reject(error)
    },
  )
}
