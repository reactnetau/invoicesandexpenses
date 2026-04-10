export function getAppUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawUrl) {
    return 'http://localhost:3000'
  }

  const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  return normalizedUrl.replace(/\/+$/, '')
}
