<template>
  <div>
    <NuxtPage />
    </div>
  </template>
  
  <script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})
  </script>