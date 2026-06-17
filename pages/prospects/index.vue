<script setup lang="ts">
import { Plus, Target, TrendingUp, TrendingDown, Car, Calendar, ChevronRight, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { ProspectStatus, ProspectType } from '~/types'

const store = useAppStore()

const statusFilter = ref<ProspectStatus | 'all'>('all')
const typeFilter = ref<ProspectType | 'all'>('all')

const statusLabels: Record<ProspectStatus, string> = {
  open: '検討中', negotiating: '商談中', contracted: '成約', lost: '失注',
}
const statusColors: Record<ProspectStatus, string> = {
  open: 'bg-sky-100 text-sky-700',
  negotiating: 'bg-amber-100 text-amber-700',
  contracted: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
}
const typeLabels: Record<ProspectType, string> = { sale: '販売', purchase: '買取' }
const typeColors: Record<ProspectType, string> = {
  sale: 'bg-brand-100 text-brand-700',
  purchase: 'bg-violet-100 text-violet-700',
}

const memberName = (id?: string) => store.members.find(m => m.id === id)?.name ?? '未割当'
const fpName = (id?: string) => id ? store.fps.find(f => f.id === id)?.name : undefined

const filtered = computed(() => store.prospects.filter(p => {
  if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false
  if (typeFilter.value !== 'all' && p.type !== typeFilter.value) return false
  return true
}))

const grossProfit = (p: typeof store.prospects[0]) => {
  if (p.estimatedCost == null) return null
  return p.estimatedPrice - p.estimatedCost
}
const grossProfitRate = (p: typeof store.prospects[0]) => {
  const gp = grossProfit(p)
  if (gp == null || p.estimatedPrice === 0) return null
  return ((gp / p.estimatedPrice) * 100).toFixed(1)
}
const fmt = (n: number) => `¥${n.toLocaleString()}`

const summaryStats = computed(() => {
  const active = store.prospects.filter(p => p.status !== 'lost')
  const totalGp = active.reduce((s, p) => s + (grossProfit(p) ?? 0), 0)
  return {
    total: store.prospects.length,
    open: store.prospects.filter(p => p.status === 'open').length,
    negotiating: store.prospects.filter(p => p.status === 'negotiating').length,
    contracted: store.prospects.filter(p => p.status === 'contracted').length,
    totalGp,
  }
})

const deadlineBadge = (deadline?: string) => {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: `${Math.abs(days)}日超過`, cls: 'text-red-600 bg-red-50' }
  if (days <= 7) return { label: `あと${days}日`, cls: 'text-amber-600 bg-amber-50' }
  return { label: `あと${days}日`, cls: 'text-gray-500 bg-gray-50' }
}

// ===== 追加モーダル =====
const showAdd = ref(false)
const addForm = reactive({
  title: '', type: 'sale' as ProspectType,
  vehicleMaker: '', vehicleModel: '',
  estimatedPrice: 0, estimatedCost: undefined as number | undefined,
  deadline: '', status: 'open' as ProspectStatus,
  assignedMemberId: '', referredByFpId: '', notes: '',
})
const submitAdd = () => {
  if (!addForm.title || !addForm.estimatedPrice) return
  store.addProspect({
    title: addForm.title,
    type: addForm.type,
    vehicleMaker: addForm.vehicleMaker || undefined,
    vehicleModel: addForm.vehicleModel || undefined,
    estimatedPrice: addForm.estimatedPrice,
    estimatedCost: addForm.estimatedCost,
    deadline: addForm.deadline || undefined,
    status: addForm.status,
    assignedMemberId: addForm.assignedMemberId || undefined,
    referredByFpId: addForm.referredByFpId || undefined,
    notes: addForm.notes || undefined,
    branchId: 'b1',
  })
  Object.assign(addForm, {
    title: '', type: 'sale', vehicleMaker: '', vehicleModel: '',
    estimatedPrice: 0, estimatedCost: undefined,
    deadline: '', status: 'open', assignedMemberId: '', referredByFpId: '', notes: '',
  })
  showAdd.value = false
}

// ===== ステータス更新 =====
const updateStatus = (id: string, status: ProspectStatus) => {
  store.updateProspect(id, { status })
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="見込管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="card p-4"><p class="text-xs text-gray-400 mb-1">全件</p><p class="text-2xl font-bold text-gray-900">{{ summaryStats.total }}</p></div>
        <div class="card p-4"><p class="text-xs text-gray-400 mb-1">検討中</p><p class="text-2xl font-bold text-sky-600">{{ summaryStats.open }}</p></div>
        <div class="card p-4"><p class="text-xs text-gray-400 mb-1">商談中</p><p class="text-2xl font-bold text-amber-600">{{ summaryStats.negotiating }}</p></div>
        <div class="card p-4"><p class="text-xs text-gray-400 mb-1">成約済粗利見込（合計）</p><p class="text-lg font-bold text-emerald-600">{{ fmt(summaryStats.totalGp) }}</p></div>
      </div>

      <!-- Controls -->
      <div class="card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div class="flex gap-2">
          <select v-model="statusFilter" class="input text-xs py-1.5 w-auto">
            <option value="all">全ステータス</option>
            <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
          </select>
          <select v-model="typeFilter" class="input text-xs py-1.5 w-auto">
            <option value="all">販売・買取</option>
            <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <button class="btn-primary" @click="showAdd = true"><Plus class="w-4 h-4" />見込追加</button>
      </div>

      <!-- List -->
      <div class="space-y-3">
        <div v-for="p in filtered" :key="p.id"
          class="card p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex items-center gap-2 md:w-32 flex-shrink-0">
            <span :class="['badge', typeColors[p.type]]">{{ typeLabels[p.type] }}</span>
            <select
              :value="p.status"
              @change="updateStatus(p.id, ($event.target as HTMLSelectElement).value as ProspectStatus)"
              :class="['badge border-0 cursor-pointer text-xs', statusColors[p.status]]"
              style="appearance:none; padding-right:0.5rem"
            >
              <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ p.title }}</p>
            <div class="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Car class="w-3.5 h-3.5 flex-shrink-0" />
              <span v-if="p.vehicleMaker || p.vehicleModel">{{ p.vehicleMaker }} {{ p.vehicleModel }}</span>
              <span v-else class="text-gray-300">車種未定</span>
              <span v-if="fpName(p.referredByFpId)" class="ml-2 text-brand-500">FP: {{ fpName(p.referredByFpId) }}</span>
            </div>
          </div>
          <div class="flex gap-6 flex-shrink-0">
            <div class="text-right">
              <p class="text-xs text-gray-400">想定金額</p>
              <p class="text-sm font-bold text-gray-800">{{ fmt(p.estimatedPrice) }}</p>
            </div>
            <div v-if="grossProfit(p) != null" class="text-right">
              <p class="text-xs text-gray-400">粗利目安</p>
              <div class="flex items-center gap-1 justify-end">
                <TrendingUp v-if="(grossProfit(p) ?? 0) > 0" class="w-3.5 h-3.5 text-emerald-500" />
                <TrendingDown v-else class="w-3.5 h-3.5 text-red-500" />
                <p :class="['text-sm font-bold', (grossProfit(p) ?? 0) > 0 ? 'text-emerald-600' : 'text-red-600']">
                  {{ fmt(grossProfit(p)!) }}
                </p>
              </div>
              <p class="text-xs text-gray-400 text-right">{{ grossProfitRate(p) }}%</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <div v-if="p.deadline" class="flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5 text-gray-400" />
              <span :class="['text-xs px-1.5 py-0.5 rounded font-medium', deadlineBadge(p.deadline)?.cls]">
                {{ deadlineBadge(p.deadline)?.label }}
              </span>
            </div>
            <div class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" :title="memberName(p.assignedMemberId)">
              {{ memberName(p.assignedMemberId)[0] }}
            </div>
          </div>
        </div>
        <div v-if="filtered.length === 0" class="card p-12 text-center text-gray-400">
          <Target class="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p class="text-sm">該当する見込案件はありません</p>
        </div>
      </div>

    </main>

    <!-- 見込追加モーダル -->
    <div v-if="showAdd" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">見込案件追加</h3>
          <button @click="showAdd = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">タイトル <span class="text-red-500">*</span></label>
          <input v-model="addForm.title" class="input" placeholder="アルファード 買取見込み" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">種別</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="(label, key) in typeLabels" :key="key"
                :class="['p-2 rounded-lg border-2 text-xs font-medium text-center',
                  addForm.type === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600']"
                @click="addForm.type = key as ProspectType">{{ label }}</button>
            </div>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="addForm.status" class="input">
              <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">メーカー</label>
            <input v-model="addForm.vehicleMaker" class="input" placeholder="トヨタ" />
          </div>
          <div>
            <label class="label">車種</label>
            <input v-model="addForm.vehicleModel" class="input" placeholder="アルファード" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">想定金額（円）<span class="text-red-500">*</span></label>
            <input v-model.number="addForm.estimatedPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">想定原価（円）</label>
            <input v-model.number="addForm.estimatedCost" type="number" class="input" />
          </div>
        </div>
        <div v-if="addForm.estimatedCost" class="p-3 bg-emerald-50 rounded-lg text-sm">
          粗利目安: <span class="font-bold text-emerald-700">{{ fmt(addForm.estimatedPrice - (addForm.estimatedCost ?? 0)) }}</span>
          （{{ ((addForm.estimatedPrice - (addForm.estimatedCost ?? 0)) / addForm.estimatedPrice * 100).toFixed(1) }}%）
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">期限</label>
            <input v-model="addForm.deadline" type="date" class="input" />
          </div>
          <div>
            <label class="label">担当メンバー</label>
            <select v-model="addForm.assignedMemberId" class="input">
              <option value="">未割当</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">FP紹介</label>
          <select v-model="addForm.referredByFpId" class="input">
            <option value="">なし</option>
            <option v-for="fp in store.fps" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">備考</label>
          <textarea v-model="addForm.notes" class="input" rows="2" placeholder="特記事項..."></textarea>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showAdd = false">キャンセル</button>
          <button class="btn-primary" @click="submitAdd" :disabled="!addForm.title || !addForm.estimatedPrice">
            <Check class="w-4 h-4" />追加
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
