<script setup lang="ts">
import { Plus, Search, Upload, Package } from 'lucide-vue-next'
import { mockGoods, mockFPs, mockCustomers, mockMembers } from '~/data/mock'

const search = ref('')
const filterStatus = ref('all')

const filtered = computed(() => mockGoods.filter(g => {
  const matchSearch = !search.value || g.name.includes(search.value) || g.category.includes(search.value)
  const matchStatus = filterStatus.value === 'all' || g.status === filterStatus.value
  return matchSearch && matchStatus
}))

const getFP = (id: string) => mockFPs.find(f => f.id === id)
const getCustomer = (id: string) => mockCustomers.find(c => c.id === id)
const getMember = (id?: string) => mockMembers.find(m => m.id === id)

const platformLabels: Record<string, string> = { mercari: 'メルカリ', yahoo_auction: 'ヤフオク', other: 'その他' }
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="古物商品管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div v-for="item in [
          { label: '受領済', count: mockGoods.filter(g=>g.status==='received').length, color: 'text-blue-600' },
          { label: '査定中', count: mockGoods.filter(g=>g.status==='assessing').length, color: 'text-yellow-600' },
          { label: '出品中', count: mockGoods.filter(g=>g.status==='listed').length, color: 'text-green-600' },
          { label: '売却済', count: mockGoods.filter(g=>g.status==='sold').length, color: 'text-indigo-600' },
          { label: '精算済', count: mockGoods.filter(g=>g.status==='settled').length, color: 'text-gray-600' },
        ]" :key="item.label" class="card p-4 text-center">
          <p class="text-xs text-gray-500">{{ item.label }}</p>
          <p :class="['text-2xl font-bold mt-1', item.color]">{{ item.count }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 min-w-48">
            <Search class="w-4 h-4 text-gray-400" />
            <input v-model="search" type="text" placeholder="商品名・カテゴリで検索..." class="bg-transparent text-sm focus:outline-none w-full" />
          </div>
          <select v-model="filterStatus" class="input w-auto text-sm">
            <option value="all">全ステータス</option>
            <option value="received">受領済</option>
            <option value="assessing">査定中</option>
            <option value="preparing">出品準備</option>
            <option value="listed">出品中</option>
            <option value="sold">売却済</option>
            <option value="settled">精算済</option>
          </select>
          <NuxtLink to="/goods/new" class="btn-primary ml-auto">
            <Plus class="w-4 h-4" />商品登録
          </NuxtLink>
        </div>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="g in filtered" :key="g.id" class="card p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package class="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ g.name }}</p>
                <p class="text-xs text-gray-500">{{ g.category }} / 状態: {{ g.condition }}</p>
              </div>
            </div>
            <StatusBadge :status="g.status" />
          </div>

          <div class="space-y-1.5 text-xs text-gray-500 mb-3">
            <div class="flex justify-between">
              <span>FP取次</span>
              <span class="font-medium text-gray-700">{{ getFP(g.sourceFpId)?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>提供者</span>
              <span class="font-medium text-gray-700">{{ getCustomer(g.sourceCustomerId)?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>受領日</span>
              <span>{{ g.receivedAt }}</span>
            </div>
            <div v-if="g.platform" class="flex justify-between">
              <span>プラットフォーム</span>
              <span class="font-medium text-gray-700">{{ platformLabels[g.platform] }}</span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-3 flex justify-between items-center">
            <div>
              <div v-if="g.soldPrice" class="text-sm">
                <span class="text-gray-500 text-xs">売却額: </span>
                <span class="font-bold text-green-700">¥{{ g.soldPrice.toLocaleString() }}</span>
              </div>
              <div v-else-if="g.listingPrice">
                <span class="text-gray-500 text-xs">出品額: </span>
                <span class="font-medium">¥{{ g.listingPrice.toLocaleString() }}</span>
              </div>
              <div v-else-if="g.assessedValue">
                <span class="text-gray-500 text-xs">査定額: </span>
                <span class="font-medium">¥{{ g.assessedValue.toLocaleString() }}</span>
              </div>
              <div v-if="g.profit">
                <span class="text-xs text-gray-400">純利益: </span>
                <span class="text-xs font-bold text-brand-700">¥{{ g.profit.toLocaleString() }}</span>
              </div>
            </div>
            <NuxtLink :to="`/goods/${g.id}`" class="btn-secondary text-xs py-1.5">詳細</NuxtLink>
          </div>
        </div>
        <div v-if="filtered.length === 0" class="col-span-full text-center py-12 text-gray-400">
          該当する商品がありません
        </div>
      </div>

    </main>
  </div>
</template>
