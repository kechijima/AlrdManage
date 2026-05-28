<script setup lang="ts">
import { Bell, Search } from 'lucide-vue-next'

defineProps<{ title: string }>()
</script>

<template>
  <header class="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
    <h1 class="text-base font-semibold text-gray-800 tracking-wide">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <div class="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 w-52">
        <Search class="w-3.5 h-3.5 text-gray-300" />
        <input type="text" placeholder="検索..." class="bg-transparent text-sm focus:outline-none w-full text-gray-600 placeholder-gray-300" />
      </div>
      <button class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
        <Bell class="w-4 h-4" />
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style="background-color:#EA0000;"></span>
      </button>
    </div>
  </header>
</template>
