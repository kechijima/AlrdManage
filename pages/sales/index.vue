<script setup lang="ts">
import { Plus, CreditCard } from 'lucide-vue-next'
import { mockSales, mockVehicles, mockCustomers, mockMembers, mockFPs } from '~/data/mock'

const getVehicle = (id: string) => mockVehicles.find(v => v.id === id)
const getCustomer = (id: string) => mockCustomers.find(c => c.id === id)
const getMember = (id?: string) => mockMembers.find(m => m.id === id)
const getFP = (id?: string) => mockFPs.find(f => f.id === id)

const paymentLabels: Record<string, string> = { cash: '現金', loan: 'ローン', other: 'その他' }

const totalSales = computed(() => mockSales.reduce((s, sale) => s + sale.contractPrice, 0))
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="販売管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="item in [
          { label: '今月成約', count: mockSales.length, sub: '件', color: 'text-brand-600' },
          { label: '売上合計', count: `¥${totalSales.toLocaleString()}`, sub: '', color: 'text-green-600' },
          { label: 'ローン申込', count: mockSales.filter(s=>s.loanApplications?.length).length, sub: '件', color: 'text-orange-600' },
          { label: '納車待ち', count: mockSales.filter(s=>['contracted','nameTransfer'].includes(s.status)).length, sub: '件', color: 'text-purple-600' },
        ]" :key="item.label" class="card p-4">
          <p class="text-xs text-gray-500">{{ item.label }}</p>
          <p :class="['text-xl font-bold mt-1', item.color]">{{ item.count }}{{ item.sub }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card p-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">販売一覧</h2>
        <button class="btn-primary">
          <Plus class="w-4 h-4" />新規登録
        </button>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="table-header">車両</th>
                <th class="table-header">顧客</th>
                <th class="table-header">成約日</th>
                <th class="table-header text-right">成約価格</th>
                <th class="table-header">支払</th>
                <th class="table-header">FP紹介</th>
                <th class="table-header">担当</th>
                <th class="table-header">ステータス</th>
                <th class="table-header"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in mockSales" :key="s.id" class="hover:bg-gray-50">
                <td class="table-cell">
                  <div>
                    <p class="font-medium">{{ getVehicle(s.vehicleId)?.maker }} {{ getVehicle(s.vehicleId)?.model }}</p>
                    <p class="text-xs text-gray-500">{{ getVehicle(s.vehicleId)?.year }}年式</p>
                  </div>
                </td>
                <td class="table-cell">{{ getCustomer(s.customerId)?.name }}</td>
                <td class="table-cell text-gray-600">{{ s.contractedAt }}</td>
                <td class="table-cell text-right font-mono font-bold">¥{{ s.contractPrice.toLocaleString() }}</td>
                <td class="table-cell">
                  <div class="flex items-center gap-1">
                    <CreditCard v-if="s.paymentMethod === 'loan'" class="w-3.5 h-3.5 text-orange-500" />
                    <span class="text-sm">{{ paymentLabels[s.paymentMethod] }}</span>
                  </div>
                  <div v-if="s.loanApplications?.length" class="mt-0.5">
                    <StatusBadge :status="s.loanApplications[0].status" />
                  </div>
                </td>
                <td class="table-cell text-sm">{{ getFP(s.referredByFpId)?.name ?? '—' }}</td>
                <td class="table-cell">
                  <div v-if="getMember(s.assignedMemberId)" class="flex items-center gap-1.5">
                    <div class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                      {{ getMember(s.assignedMemberId)?.name[0] }}
                    </div>
                    <span class="text-sm">{{ getMember(s.assignedMemberId)?.name }}</span>
                  </div>
                </td>
                <td class="table-cell"><StatusBadge :status="s.status" /></td>
                <td class="table-cell">
                  <NuxtLink :to="`/sales/${s.id}`" class="text-brand-600 hover:underline text-sm">詳細</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>
