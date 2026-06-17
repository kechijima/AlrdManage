<script setup lang="ts">
import { Plus, Handshake, TrendingUp, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'

const store = useAppStore()

// ===== FP登録モーダル =====
const showAddFP = ref(false)
const addFPForm = reactive({ name: '', company: '', area: '', phone: '', email: '', status: 'active' as 'active' | 'inactive' })
const submitAddFP = () => {
  if (!addFPForm.name || !addFPForm.company) return
  store.addFP({ ...addFPForm, branchId: 'b1', notes: '' })
  Object.assign(addFPForm, { name: '', company: '', area: '', phone: '', email: '', status: 'active' })
  showAddFP.value = false
}

const fpStats = computed(() => store.fps.map(fp => {
  const fpSales = store.sales.filter(s => s.referredByFpId === fp.id)
  const fpGoods = store.goods.filter(g => g.sourceFpId === fp.id)
  const salesAmount = fpSales.reduce((s, sale) => s + sale.contractPrice, 0)
  return {
    ...fp,
    referralCount: fpSales.length + fpGoods.length,
    contractCount: fpSales.length,
    salesAmount,
    goodsCount: fpGoods.length,
  }
}))
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="FP管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Summary -->
      <div class="grid grid-cols-3 gap-3">
        <div class="card p-4">
          <p class="text-xs text-gray-500">提携FP数</p>
          <p class="text-2xl font-bold text-brand-600 mt-1">{{ store.fps.length }}名</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">FP経由 成約件数</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ store.sales.filter(s=>s.referredByFpId).length }}件</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">FP経由 売上合計</p>
          <p class="text-2xl font-bold text-indigo-600 mt-1">¥{{ store.sales.filter(s=>s.referredByFpId).reduce((s,sale)=>s+sale.contractPrice,0).toLocaleString() }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card p-4 flex justify-between items-center">
        <h2 class="text-sm font-semibold text-gray-700">FP一覧</h2>
        <button class="btn-primary" @click="showAddFP = true"><Plus class="w-4 h-4" />FP登録</button>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="fp in fpStats" :key="fp.id" class="card p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-lg font-bold">
                {{ fp.name[0] }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ fp.name }}</p>
                <p class="text-xs text-gray-500">{{ fp.company }}</p>
                <p class="text-xs text-gray-400">{{ fp.area }}</p>
              </div>
            </div>
            <span :class="['badge', fp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
              {{ fp.status === 'active' ? '有効' : '休止' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="text-center p-2 bg-gray-50 rounded-lg">
              <p class="text-lg font-bold text-gray-900">{{ fp.referralCount }}</p>
              <p class="text-xs text-gray-500">紹介数</p>
            </div>
            <div class="text-center p-2 bg-gray-50 rounded-lg">
              <p class="text-lg font-bold text-green-700">{{ fp.contractCount }}</p>
              <p class="text-xs text-gray-500">成約数</p>
            </div>
            <div class="text-center p-2 bg-gray-50 rounded-lg">
              <p class="text-lg font-bold text-purple-700">{{ fp.goodsCount }}</p>
              <p class="text-xs text-gray-500">古物取次</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500">売上貢献</p>
              <p class="font-bold text-brand-700">¥{{ fp.salesAmount.toLocaleString() }}</p>
            </div>
            <NuxtLink :to="`/fps/${fp.id}`" class="btn-secondary text-xs py-1.5">詳細</NuxtLink>
          </div>
        </div>
      </div>

    </main>

    <!-- FP登録モーダル -->
    <div v-if="showAddFP" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">FP登録</h3>
          <button @click="showAddFP = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">氏名 <span class="text-red-500">*</span></label>
          <input v-model="addFPForm.name" class="input" placeholder="山田 健一" />
        </div>
        <div>
          <label class="label">会社名 <span class="text-red-500">*</span></label>
          <input v-model="addFPForm.company" class="input" placeholder="山田FPオフィス" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">エリア</label>
            <input v-model="addFPForm.area" class="input" placeholder="東京都" />
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="addFPForm.status" class="input">
              <option value="active">有効</option>
              <option value="inactive">休止</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">電話番号</label>
          <input v-model="addFPForm.phone" class="input" placeholder="090-0000-0000" />
        </div>
        <div>
          <label class="label">メールアドレス</label>
          <input v-model="addFPForm.email" type="email" class="input" placeholder="fp@example.com" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showAddFP = false">キャンセル</button>
          <button class="btn-primary" @click="submitAddFP" :disabled="!addFPForm.name || !addFPForm.company">
            <Check class="w-4 h-4" />登録
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
