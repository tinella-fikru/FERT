<template>
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
