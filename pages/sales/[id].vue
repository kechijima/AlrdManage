<script setup lang="ts">
import { ArrowLeft, Car, User, Handshake, CreditCard, Pencil } from 'lucide-vue-next'
import { mockSales, mockVehicles, mockCustomers, mockFPs, mockMembers } from '~/data/mock'

const route = useRoute()
const sale = computed(() => mockSales.find(s => s.id === route.params.id))
const vehicle = computed(() => mockVehicles.find(v => v.id === sale.value?.vehicleId))
const customer = computed(() => mockCustomers.find(c => c.id === sale.value?.customerId))
const fp = computed(() => mockFPs.find(f => f.id === sale.value?.referredByFpId))
const member = computed(() => mockMembers.find(m => m.id === sale.value?.assignedMemberId))

const paymentLabels: Record<string, string> = { cash: '現金', loan: 'ローン', other: 'その他' }
const loanStatusLabels: Record<string, string> = {
  applying: '申込中', reviewing: '審査中', approved: '承認', rejected: '否決', cancelled: 'キャンセル',
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="販売詳細" />
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!sale" class="text-center py-20 text-gray-400">販売情報が見つかりません</div>
      <div v-else class="max-w-3xl mx-auto space-y-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/sales" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft class="w-4 h-4" />戻る
          </NuxtLink>
          <button class="btn-secondary"><Pencil class="w-4 h-4" />編集</button>
        </div>

        <!-- Status Header -->
        <div class="card p-6 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <StatusBadge :status="sale.status" />
            </div>
            <h2 class="text-xl font-bold">{{ vehicle?.maker }} {{ vehicle?.model }}</h2>
            <p class="text-gray-500 text-sm">成約日: {{ sale.contractedAt }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500">成約価格</p>
            <p class="text-3xl font-bold text-gray-900">¥{{ sale.contractPrice.toLocaleString() }}</p>
            <p class="text-xs text-gray-400">値引: -¥{{ sale.discount.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Vehicle -->
          <div class="card p-5">
            <div class="flex items-center gap-2 mb-3">
              <Car class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">車両情報</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">車種</span>
                <span class="font-medium">{{ vehicle?.maker }} {{ vehicle?.model }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">年式</span>
                <span>{{ vehicle?.year }}年式</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">走行距離</span>
                <span>{{ vehicle?.mileage.toLocaleString() }}km</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">カラー</span>
                <span>{{ vehicle?.color }}</span>
              </div>
            </div>
          </div>

          <!-- Customer -->
          <div class="card p-5">
            <div class="flex items-center gap-2 mb-3">
              <User class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">顧客情報</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">氏名</span>
                <span class="font-medium">{{ customer?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">電話</span>
                <span>{{ customer?.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">FP紹介</span>
                <span>{{ fp?.name ?? '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">担当</span>
                <span>{{ member?.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment & Schedule -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-3">
            <CreditCard class="w-4 h-4 text-brand-500" />
            <h3 class="text-sm font-semibold text-gray-700">支払い・納車スケジュール</h3>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500">支払方法</p>
              <p class="font-medium mt-1">{{ paymentLabels[sale.paymentMethod] }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">成約日</p>
              <p class="font-medium mt-1">{{ sale.contractedAt }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">納車予定日</p>
              <p class="font-medium mt-1">{{ sale.deliveryScheduledAt ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">実納車日</p>
              <p class="font-medium mt-1">{{ sale.deliveredAt ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Loan -->
        <div v-if="sale.loanApplications?.length" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700">ローン申込状況</h3>
          </div>
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="table-header">会社名</th>
                <th class="table-header text-right">申込金額</th>
                <th class="table-header text-right">期間</th>
                <th class="table-header">申込日</th>
                <th class="table-header">結果日</th>
                <th class="table-header">ステータス</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in sale.loanApplications" :key="loan.id" class="border-b border-gray-50">
                <td class="table-cell font-medium">{{ loan.company }}</td>
                <td class="table-cell text-right font-mono">¥{{ loan.amount.toLocaleString() }}</td>
                <td class="table-cell text-right">{{ loan.term }}回払</td>
                <td class="table-cell text-gray-500">{{ loan.appliedAt }}</td>
                <td class="table-cell text-gray-500">{{ loan.resultAt ?? '—' }}</td>
                <td class="table-cell"><StatusBadge :status="loan.status" /></td>
              </tr>
            </tbody>
          </table>
          <div class="p-4">
            <button class="btn-secondary text-sm"><CreditCard class="w-4 h-4" />ローン追加申込</button>
          </div>
        </div>
        <div v-else-if="sale.paymentMethod === 'loan'" class="card p-5">
          <button class="btn-primary"><CreditCard class="w-4 h-4" />ローン申込を登録</button>
        </div>

      </div>
    </main>
  </div>
</template>
