<script setup lang="ts">
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-vue-next'
import { mockFPs, mockSales, mockGoods, mockVehicles, mockCustomers } from '~/data/mock'

const route = useRoute()
const fp = computed(() => mockFPs.find(f => f.id === route.params.id))
const fpSales = computed(() => mockSales.filter(s => s.referredByFpId === route.params.id))
const fpGoods = computed(() => mockGoods.filter(g => g.sourceFpId === route.params.id))

const totalSalesAmount = computed(() => fpSales.value.reduce((s, sale) => s + sale.contractPrice, 0))
const getVehicle = (id: string) => mockVehicles.find(v => v.id === id)
const getCustomer = (id: string) => mockCustomers.find(c => c.id === id)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader :title="fp?.name ?? 'FP詳細'" />
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!fp" class="text-center py-20 text-gray-400">FPが見つかりません</div>
      <div v-else class="max-w-4xl mx-auto space-y-4">
        <NuxtLink to="/fps" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft class="w-4 h-4" />戻る
        </NuxtLink>

        <!-- Profile -->
        <div class="card p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
                {{ fp.name[0] }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ fp.name }}</h2>
                <p class="text-gray-500">{{ fp.company }}</p>
                <div class="flex flex-wrap gap-4 mt-2">
                  <div class="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone class="w-4 h-4" />{{ fp.phone }}
                  </div>
                  <div class="flex items-center gap-1.5 text-sm text-gray-500">
                    <Mail class="w-4 h-4" />{{ fp.email }}
                  </div>
                  <div class="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin class="w-4 h-4" />{{ fp.area }}
                  </div>
                </div>
              </div>
            </div>
            <span :class="['badge', fp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
              {{ fp.status === 'active' ? '有効' : '休止' }}
            </span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3">
          <div class="card p-4 text-center">
            <p class="text-2xl font-bold text-brand-600">{{ fpSales.length }}</p>
            <p class="text-xs text-gray-500 mt-1">車両紹介成約数</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-2xl font-bold text-green-600">¥{{ totalSalesAmount.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-1">車両売上貢献額</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-2xl font-bold text-purple-600">{{ fpGoods.length }}</p>
            <p class="text-xs text-gray-500 mt-1">古物取次件数</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-2xl font-bold text-orange-600">—</p>
            <p class="text-xs text-gray-500 mt-1">紹介料（確認中）</p>
          </div>
        </div>

        <!-- Referred Sales -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700">紹介 成約一覧</h3>
          </div>
          <div v-if="fpSales.length" class="divide-y divide-gray-50">
            <div v-for="s in fpSales" :key="s.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-medium text-sm">{{ getVehicle(s.vehicleId)?.maker }} {{ getVehicle(s.vehicleId)?.model }}</p>
                <p class="text-xs text-gray-500">{{ getCustomer(s.customerId)?.name }} / {{ s.contractedAt }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-sm">¥{{ s.contractPrice.toLocaleString() }}</p>
                <StatusBadge :status="s.status" />
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-gray-400">成約なし</div>
        </div>

        <!-- Goods -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700">取次 古物商品一覧</h3>
          </div>
          <div v-if="fpGoods.length" class="divide-y divide-gray-50">
            <div v-for="g in fpGoods" :key="g.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-medium text-sm">{{ g.name }}</p>
                <p class="text-xs text-gray-500">{{ getCustomer(g.sourceCustomerId)?.name }} / {{ g.receivedAt }}</p>
              </div>
              <div class="text-right">
                <p v-if="g.soldPrice" class="font-bold text-sm text-green-700">¥{{ g.soldPrice.toLocaleString() }}</p>
                <p v-else class="text-sm text-gray-400">未売却</p>
                <StatusBadge :status="g.status" />
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-gray-400">取次なし</div>
        </div>

      </div>
    </main>
  </div>
</template>
