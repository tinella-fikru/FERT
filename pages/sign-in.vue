<script setup lang="ts">
useHead({ title: 'Sign in — FERT' })
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 py-16">
    <p class="label-caps mb-8 text-gold-deep">FERT — Addis Ababa</p>
    <SignIn
      :appearance="{
        variables: {
          colorPrimary: '#0A0A0A',
          colorText: '#0A0A0A',
          borderRadius: '0px',
          fontFamily: '\'Source Serif 4\', Georgia, serif',
        },
      }"
    />
  </div>
</template>
