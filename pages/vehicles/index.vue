<script setup lang="ts">
import { Plus, Search, LayoutGrid, List, MapPin } from 'lucide-vue-next'
import { mockVehicles, mockMembers, mockFPs } from '~/data/mock'
import type { VehicleType, VehicleStatus } from '~/types'

const searchQuery = ref('')
const filterType = ref<VehicleType | 'all'>('all')
const filterStatus = ref<VehicleStatus | 'all'>('all')
const viewMode = ref<'grid' | 'list'>('grid')

const typeLabels: Record<string, string> = {
  inventory: '在庫販売',
  order: '注文販売',
  consignment: '委託販売',
}
const typeColors: Record<string, string> = {
  inventory: 'bg-blue-100 text-blue-700',
  order: 'bg-purple-100 text-purple-700',
  consignment: 'bg-orange-100 text-orange-700',
}

const statusBorderColors: Record<string, string> = {
  inStock:      'border-l-emerald-400',
  negotiating:  'border-l-amber-400',
  ordered:      'border-l-blue-400',
  purchasing:   'border-l-orange-400',
  arrived:      'border-l-cyan-400',
  consigning:   'border-l-purple-400',
  contracted:   'border-l-red-500',
  nameTransfer: 'border-l-pink-400',
  delivered:    'border-l-gray-300',
  settled:      'border-l-gray-300',
  cancelled:    'border-l-red-300',
}

const filteredVehicles = computed(() => {
  return mockVehicles.filter(v => {
    const matchSearch = !searchQuery.value ||
      `${v.maker} ${v.model} ${v.pickupLocation}`.includes(searchQuery.value)
    const matchType = filterType.value === 'all' || v.type === filterType.value
    const matchStatus = filterStatus.value === 'all' || v.status === filterStatus.value
    return matchSearch && matchType && matchStatus
  })
})

const getMember = (id?: string) => mockMembers.find(m => m.id === id)
const getFP = (id?: string) => mockFPs.find(f => f.id === id)

const totalListPrice = computed(() => filteredVehicles.value.reduce((s, v) => s + v.listPrice, 0))

const statGroups = [
  { label: '在庫中',   statuses: ['inStock'],                              color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '商談中',   statuses: ['negotiating'],                          color: 'text-amber-600',   bg: 'bg-amber-50' },
  { label: '委託中',   statuses: ['consigning'],                           color: 'text-purple-600',  bg: 'bg-purple-50' },
  { label: '成約・納車', statuses: ['contracted','nameTransfer','delivered'], color: 'text-brand-600',   bg: 'bg-brand-50' },
]
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="車両管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="item in statGroups" :key="item.label"
          class="card p-4 flex items-center gap-3"
        >
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', item.bg]">
            <span :class="['text-lg font-bold', item.color]">
              {{ mockVehicles.filter(v => item.statuses.includes(v.status)).length }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">{{ item.label }}</p>
            <p :class="['text-sm font-semibold', item.color]">台</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 min-w-48">
            <Search class="w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="車種・引き取り場所で検索..." class="bg-transparent text-sm focus:outline-none w-full" />
          </div>
          <select v-model="filterType" class="input w-auto text-sm">
            <option value="all">全タイプ</option>
            <option value="inventory">在庫販売</option>
            <option value="order">注文販売</option>
            <option value="consignment">委託販売</option>
          </select>
          <select v-model="filterStatus" class="input w-auto text-sm">
            <option value="all">全ステータス</option>
            <option value="inStock">在庫中</option>
            <option value="negotiating">商談中</option>
            <option value="consigning">委託中</option>
            <option value="contracted">成約</option>
            <option value="delivered">納車済</option>
          </select>
          <!-- View toggle -->
          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              :class="['p-2 transition-colors', viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50']"
              @click="viewMode = 'grid'"
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
            <button
              :class="['p-2 transition-colors', viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50']"
              @click="viewMode = 'list'"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
          <NuxtLink to="/vehicles/new" class="btn-primary">
            <Plus class="w-4 h-4" />
            車両登録
          </NuxtLink>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <NuxtLink
          v-for="v in filteredVehicles" :key="v.id"
          :to="`/vehicles/${v.id}`"
          :class="['card border-l-4 p-4 hover:shadow-md transition-shadow block', statusBorderColors[v.status] ?? 'border-l-gray-200']"
        >
          <div class="flex items-start justify-between mb-2">
            <span :class="['badge text-xs', typeColors[v.type]]">{{ typeLabels[v.type] }}</span>
            <StatusBadge :status="v.status" />
          </div>
          <p class="font-semibold text-gray-900 mt-1">{{ v.maker }} {{ v.model }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ v.year }}年式 · {{ v.mileage.toLocaleString() }}km · {{ v.color }}</p>
          <div class="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <MapPin class="w-3 h-3 flex-shrink-0" />
            <span class="truncate">{{ v.pickupLocation }}</span>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-500">販売価格</span>
            <span class="text-sm font-bold text-gray-900">¥{{ v.listPrice.toLocaleString() }}</span>
          </div>
          <div v-if="getMember(v.assignedMemberId)" class="mt-2 flex items-center gap-1.5">
            <div class="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
              {{ getMember(v.assignedMemberId)?.name[0] }}
            </div>
            <span class="text-xs text-gray-500">{{ getMember(v.assignedMemberId)?.name }}</span>
          </div>
        </NuxtLink>
        <div v-if="filteredVehicles.length === 0" class="col-span-full text-center py-16 text-gray-400">
          該当する車両がありません
        </div>
      </div>

      <!-- List View -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="table-header">車両 / 引き取り場所</th>
                <th class="table-header">タイプ</th>
                <th class="table-header">仕入価格</th>
                <th class="table-header">販売価格</th>
                <th class="table-header">FP紹介</th>
                <th class="table-header">担当</th>
                <th class="table-header">ステータス</th>
                <th class="table-header"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="v in filteredVehicles" :key="v.id" class="hover:bg-gray-50 transition-colors">
                <td class="table-cell">
                  <div>
                    <p class="font-medium text-gray-900">{{ v.maker }} {{ v.model }}</p>
                    <p class="text-xs text-gray-500">{{ v.year }}年式 / {{ v.mileage.toLocaleString() }}km</p>
                    <div class="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <MapPin class="w-3 h-3" />
                      <span>{{ v.pickupLocation }}</span>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <span :class="['badge', typeColors[v.type]]">{{ typeLabels[v.type] }}</span>
                </td>
                <td class="table-cell font-mono">
                  {{ v.purchasePrice > 0 ? `¥${v.purchasePrice.toLocaleString()}` : '—' }}
                </td>
                <td class="table-cell font-mono font-medium">¥{{ v.listPrice.toLocaleString() }}</td>
                <td class="table-cell text-sm text-gray-600">
                  {{ getFP(v.referredByFpId)?.name ?? '—' }}
                </td>
                <td class="table-cell">
                  <div v-if="getMember(v.assignedMemberId)" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                      {{ getMember(v.assignedMemberId)?.name[0] }}
                    </div>
                    <span class="text-sm">{{ getMember(v.assignedMemberId)?.name }}</span>
                  </div>
                  <span v-else class="text-gray-400 text-sm">—</span>
                </td>
                <td class="table-cell"><StatusBadge :status="v.status" /></td>
                <td class="table-cell">
                  <NuxtLink :to="`/vehicles/${v.id}`" class="text-brand-600 hover:underline text-sm">詳細</NuxtLink>
                </td>
              </tr>
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="8" class="table-cell text-center text-gray-400 py-10">該当する車両がありません</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50">
          <span>{{ filteredVehicles.length }}件 表示</span>
          <span>販売価格合計: <span class="font-bold text-gray-900">¥{{ totalListPrice.toLocaleString() }}</span></span>
        </div>
      </div>

    </main>
  </div>
</template>
