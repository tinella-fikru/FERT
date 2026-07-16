/**
 * Requires a signed-in Clerk user; redirects to sign-in preserving the target.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { userId } = useAuth()
  if (!userId.value) {
    return navigateTo(`/sign-in?redirect_url=${encodeURIComponent(to.fullPath)}`)
  }
})
