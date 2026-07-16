/**
 * Admin gate — client-side redirect only (server routes independently
 * enforce admin via requireAdmin). Checks a lightweight endpoint.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { userId } = useAuth()
  if (!userId.value) {
    return navigateTo(`/sign-in?redirect_url=${encodeURIComponent(to.fullPath)}`)
  }
  try {
    await $fetch('/api/admin/ping')
  } catch {
    return navigateTo('/')
  }
})
