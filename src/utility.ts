export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(trimmed)
}
