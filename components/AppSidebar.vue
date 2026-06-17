<script setup lang="ts">
import { BarChart3, Car, ShoppingCart, Users, Handshake, Package, CheckSquare, UserCog, ChevronDown, Menu, X, Building2, Target } from 'lucide-vue-next'

const route = useRoute()
const isMobileOpen = ref(false)

const navItems = [
  { label: 'ダッシュボード', icon: BarChart3, href: '/' },
  { label: '車両管理', icon: Car, href: '/vehicles' },
  { label: '販売管理', icon: ShoppingCart, href: '/sales' },
  { label: '顧客管理', icon: Users, href: '/customers' },
  { label: 'FP管理', icon: Handshake, href: '/fps' },
  { label: '古物商品', icon: Package, href: '/goods' },
  { label: '見込管理', icon: Target, href: '/prospects' },
  { label: 'タスク', icon: CheckSquare, href: '/tasks' },
  { label: 'メンバー管理', icon: UserCog, href: '/members' },
]

const isActive = (href: string) => {
  if (href === '/') return route.path === '/'
  return route.path.startsWith(href)
}
</script>

<template>
  <!-- Mobile overlay -->
  <div v-if="isMobileOpen" class="fixed inset-0 bg-black/60 z-20 lg:hidden" @click="isMobileOpen = false" />

  <!-- Mobile toggle -->
  <button
    class="fixed top-4 left-4 z-30 lg:hidden bg-white rounded-lg p-2 shadow-md border border-gray-200"
    @click="isMobileOpen = !isMobileOpen"
  >
    <Menu v-if="!isMobileOpen" class="w-5 h-5 text-gray-600" />
    <X v-else class="w-5 h-5 text-gray-600" />
  </button>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full w-60 z-20 flex flex-col transition-transform duration-200',
      'lg:translate-x-0 lg:static lg:z-auto',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
    style="background-color: #111111;"
  >
    <!-- Logo -->
    <div class="px-5 py-5 border-b border-white/10">
      <div class="flex items-center gap-3">
        <!-- ALRD ロゴマーク（赤い円形） -->
        <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style="background-color:#EA0000;">
          <svg viewBox="0 0 40 40" class="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="8" r="3.5" fill="white"/>
            <path d="M20 13 C12 18 8 26 8 32 C12 28 16 26 20 26 C24 26 28 28 32 32 C32 26 28 18 20 13Z" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <div>
          <div class="text-white font-bold text-base tracking-widest" style="font-family: 'Noto Serif JP', serif; letter-spacing: 0.15em;">ALRD</div>
          <div class="text-white/40 text-xs tracking-wide">Management</div>
        </div>
      </div>
    </div>

    <!-- Branch selector -->
    <div class="px-3 py-3 border-b border-white/10">
      <button class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/60 text-sm hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-2">
          <Building2 class="w-4 h-4 text-white/40" />
          <span>本店</span>
        </div>
        <ChevronDown class="w-3.5 h-3.5 text-white/30" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      <NuxtLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive(item.href)
            ? 'text-white'
            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
        ]"
        :style="isActive(item.href) ? 'background-color: #EA0000;' : ''"
        @click="isMobileOpen = false"
      >
        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- User -->
    <div class="px-3 py-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-3 py-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color:#EA0000;">田</div>
        <div class="flex-1 min-w-0">
          <div class="text-white/80 text-sm font-medium truncate">田中 太郎</div>
          <div class="text-white/30 text-xs truncate">管理者</div>
        </div>
      </div>
    </div>
  </aside>
</template>
