export {}

declare global {
  interface NavigatorUAData {
    brands: { brand: string; version: string }[]
    mobile: boolean
    platform: string
    getHighEntropyValues: (hints: string[]) => Promise<Record<string, unknown>>
  }

  interface Navigator {
    userAgentData?: NavigatorUAData
  }
}
