<script setup lang="ts">
import { ArrowLeft, Phone, Mail, MapPin, Car, Package } from 'lucide-vue-next'
import { mockCustomers, mockFPs, mockSales, mockVehicles, mockGoods } from '~/data/mock'

const route = useRoute()
const customer = computed(() => mockCustomers.find(c => c.id === route.params.id))
const fp = computed(() => mockFPs.find(f => f.id === customer.value?.referredByFpId))
const sales = computed(() => mockSales.filter(s => s.customerId === route.params.id))
const goodsProvided = computed(() => mockGoods.filter(g => g.sourceCustomerId === route.params.id))
const getVehicle = (id: string) => mockVehicles.find(v => v.id === id)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader :title="customer?.name ?? '顧客詳細'" />
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!customer" class="text-center py-20 text-gray-400">顧客が見つかりません</div>
      <div v-else class="max-w-3xl mx-auto space-y-4">
        <NuxtLink to="/customers" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft class="w-4 h-4" />戻る
        </NuxtLink>

        <div class="card p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600">
                {{ customer.name[0] }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ customer.name }}</h2>
                <p class="text-gray-500 text-sm">{{ customer.nameKana }}</p>
                <div class="flex flex-wrap gap-4 mt-2">
                  <div class="flex items-center gap-1 text-sm text-gray-500"><Phone class="w-4 h-4" />{{ customer.phone }}</div>
                  <div class="flex items-center gap-1 text-sm text-gray-500"><Mail class="w-4 h-4" />{{ customer.email }}</div>
                  <div class="flex items-center gap-1 text-sm text-gray-500"><MapPin class="w-4 h-4" />{{ customer.address }}</div>
                </div>
              </div>
            </div>
            <div v-if="fp" class="text-right">
              <p class="text-xs text-gray-500">FP紹介</p>
              <p class="font-medium text-sm text-brand-700">{{ fp.name }}</p>
              <p class="text-xs text-gray-400">{{ fp.company }}</p>
            </div>
          </div>
        </div>

        <!-- Sales history -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Car class="w-4 h-4 text-brand-500" />
            <h3 class="text-sm font-semibold text-gray-700">購入履歴</h3>
          </div>
          <div v-if="sales.length" class="divide-y divide-gray-50">
            <div v-for="s in sales" :key="s.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-medium text-sm">{{ getVehicle(s.vehicleId)?.maker }} {{ getVehicle(s.vehicleId)?.model }}</p>
                <p class="text-xs text-gray-500">{{ s.contractedAt }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-sm">¥{{ s.contractPrice.toLocaleString() }}</p>
                <StatusBadge :status="s.status" />
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-gray-400">購入履歴なし</div>
        </div>

        <!-- Goods provided -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package class="w-4 h-4 text-brand-500" />
            <h3 class="text-sm font-semibold text-gray-700">古物提供履歴</h3>
          </div>
          <div v-if="goodsProvided.length" class="divide-y divide-gray-50">
            <div v-for="g in goodsProvided" :key="g.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-medium text-sm">{{ g.name }}</p>
                <p class="text-xs text-gray-500">{{ g.receivedAt }}</p>
              </div>
              <div class="text-right">
                <p v-if="g.soldPrice" class="font-bold text-sm text-green-700">¥{{ g.soldPrice.toLocaleString() }}</p>
                <StatusBadge :status="g.status" />
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-gray-400">古物提供履歴なし</div>
        </div>

      </div>
    </main>
  </div>
</template>
