<script setup lang="ts">
import { Plus, Target, TrendingUp, TrendingDown, Car, Calendar, X, Check, Pencil, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { ProspectStatus, ProspectType, Prospect } from '~/types'

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

const grossProfit = (p: Prospect) => {
  if (p.estimatedCost == null) return null
  return p.estimatedPrice - p.estimatedCost
}
const grossProfitRate = (p: Prospect) => {
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

// ===== 詳細モーダル =====
const selectedProspect = ref<Prospect | null>(null)
const openDetail = (p: Prospect) => { selectedProspect.value = p }
const closeDetail = () => { selectedProspect.value = null }

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

// ===== 編集モーダル =====
const showEdit = ref(false)
const editForm = reactive({
  title: '', type: 'sale' as ProspectType,
  vehicleMaker: '', vehicleModel: '',
  estimatedPrice: 0, estimatedCost: undefined as number | undefined,
  deadline: '', status: 'open' as ProspectStatus,
  assignedMemberId: '', referredByFpId: '', notes: '',
})
const openEdit = (p: Prospect) => {
  Object.assign(editForm, {
    title: p.title, type: p.type,
    vehicleMaker: p.vehicleMaker ?? '', vehicleModel: p.vehicleModel ?? '',
    estimatedPrice: p.estimatedPrice, estimatedCost: p.estimatedCost,
    deadline: p.deadline ?? '', status: p.status,
    assignedMemberId: p.assignedMemberId ?? '',
    referredByFpId: p.referredByFpId ?? '',
    notes: p.notes ?? '',
  })
  showEdit.value = true
}
const saveEdit = () => {
  if (!selectedProspect.value || !editForm.title) return
  store.updateProspect(selectedProspect.value.id, {
    title: editForm.title, type: editForm.type,
    vehicleMaker: editForm.vehicleMaker || undefined,
    vehicleModel: editForm.vehicleModel || undefined,
    estimatedPrice: editForm.estimatedPrice,
    estimatedCost: editForm.estimatedCost,
    deadline: editForm.deadline || undefined,
    status: editForm.status,
    assignedMemberId: editForm.assignedMemberId || undefined,
    referredByFpId: editForm.referredByFpId || undefined,
    notes: editForm.notes || undefined,
  })
  selectedProspect.value = store.prospects.find(p => p.id === selectedProspect.value?.id) ?? null
  showEdit.value = false
}

// ===== 削除 =====
const deleteProspect = (id: string) => {
  store.removeProspect(id)
  selectedProspect.value = null
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
        <div class="card p-4"><p class="text-xs text-gray-400 mb-1">成約済粗利見込</p><p class="text-lg font-bold text-emerald-600">{{ fmt(summaryStats.totalGp) }}</p></div>
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

      <!-- Card Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="p in filtered" :key="p.id"
          class="card p-5 cursor-pointer hover:shadow-md transition-shadow"
          @click="openDetail(p)"
        >
          <!-- Header badges -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span :class="['badge', typeColors[p.type]]">{{ typeLabels[p.type] }}</span>
              <span :class="['badge', statusColors[p.status]]">{{ statusLabels[p.status] }}</span>
            </div>
            <span v-if="deadlineBadge(p.deadline)" :class="['text-xs px-1.5 py-0.5 rounded font-medium', deadlineBadge(p.deadline)?.cls]">
              {{ deadlineBadge(p.deadline)?.label }}
            </span>
          </div>

          <!-- Title -->
          <h3 class="font-semibold text-gray-900 mb-1 leading-snug">{{ p.title }}</h3>

          <!-- Vehicle -->
          <div class="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Car class="w-3.5 h-3.5 flex-shrink-0" />
            <span v-if="p.vehicleMaker || p.vehicleModel">{{ p.vehicleMaker }} {{ p.vehicleModel }}</span>
            <span v-else class="text-gray-300">車種未定</span>
          </div>

          <!-- Price / Profit -->
          <div class="flex items-start justify-between pt-3 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-400">想定金額</p>
              <p class="font-bold text-gray-800">{{ fmt(p.estimatedPrice) }}</p>
            </div>
            <div v-if="grossProfit(p) != null" class="text-right">
              <p class="text-xs text-gray-400">粗利目安</p>
              <div class="flex items-center gap-1 justify-end">
                <TrendingUp v-if="(grossProfit(p) ?? 0) > 0" class="w-3.5 h-3.5 text-emerald-500" />
                <TrendingDown v-else class="w-3.5 h-3.5 text-red-500" />
                <p :class="['font-bold text-sm', (grossProfit(p) ?? 0) > 0 ? 'text-emerald-600' : 'text-red-600']">
                  {{ fmt(grossProfit(p)!) }}
                </p>
              </div>
              <p class="text-xs text-gray-400">{{ grossProfitRate(p) }}%</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3">
            <span v-if="fpName(p.referredByFpId)" class="text-xs text-brand-500">FP: {{ fpName(p.referredByFpId) }}</span>
            <span v-else></span>
            <div class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold" :title="memberName(p.assignedMemberId)">
              {{ memberName(p.assignedMemberId)[0] }}
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="col-span-full card p-12 text-center text-gray-400">
          <Target class="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p class="text-sm">該当する見込案件はありません</p>
        </div>
      </div>

    </main>

    <!-- 詳細モーダル -->
    <div v-if="selectedProspect && !showEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 my-auto">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <span :class="['badge', typeColors[selectedProspect.type]]">{{ typeLabels[selectedProspect.type] }}</span>
            <span :class="['badge', statusColors[selectedProspect.status]]">{{ statusLabels[selectedProspect.status] }}</span>
          </div>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600 flex-shrink-0"><X class="w-5 h-5" /></button>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{{ selectedProspect.title }}</h3>
        <div class="space-y-2 text-sm">
          <div v-if="selectedProspect.vehicleMaker || selectedProspect.vehicleModel" class="flex justify-between">
            <span class="text-gray-500">車両</span>
            <span class="font-medium">{{ selectedProspect.vehicleMaker }} {{ selectedProspect.vehicleModel }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">想定金額</span>
            <span class="font-bold">{{ fmt(selectedProspect.estimatedPrice) }}</span>
          </div>
          <div v-if="grossProfit(selectedProspect) != null" class="flex justify-between">
            <span class="text-gray-500">粗利目安</span>
            <span :class="['font-bold', (grossProfit(selectedProspect) ?? 0) > 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ fmt(grossProfit(selectedProspect)!) }}（{{ grossProfitRate(selectedProspect) }}%）
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">担当メンバー</span>
            <span>{{ memberName(selectedProspect.assignedMemberId) }}</span>
          </div>
          <div v-if="fpName(selectedProspect.referredByFpId)" class="flex justify-between">
            <span class="text-gray-500">FP紹介</span>
            <span>{{ fpName(selectedProspect.referredByFpId) }}</span>
          </div>
          <div v-if="selectedProspect.deadline" class="flex justify-between">
            <span class="text-gray-500">期限</span>
            <span :class="deadlineBadge(selectedProspect.deadline)?.cls" class="px-1.5 py-0.5 rounded text-xs font-medium">
              {{ selectedProspect.deadline }}（{{ deadlineBadge(selectedProspect.deadline)?.label }}）
            </span>
          </div>
          <div v-if="selectedProspect.notes" class="pt-2 border-t border-gray-100">
            <p class="text-gray-500 mb-1">備考</p>
            <p class="text-gray-700">{{ selectedProspect.notes }}</p>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-gray-100">
          <button class="btn-secondary flex-1 justify-center text-sm" @click="openEdit(selectedProspect)">
            <Pencil class="w-4 h-4" />編集
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" @click="deleteProspect(selectedProspect.id)">
            <Trash2 class="w-4 h-4" />削除
          </button>
        </div>
      </div>
    </div>

    <!-- 追加モーダル -->
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

    <!-- 編集モーダル -->
    <div v-if="showEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">見込案件を編集</h3>
          <button @click="showEdit = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">タイトル <span class="text-red-500">*</span></label>
          <input v-model="editForm.title" class="input" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">種別</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="(label, key) in typeLabels" :key="key"
                :class="['p-2 rounded-lg border-2 text-xs font-medium text-center',
                  editForm.type === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600']"
                @click="editForm.type = key as ProspectType">{{ label }}</button>
            </div>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="editForm.status" class="input">
              <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">メーカー</label>
            <input v-model="editForm.vehicleMaker" class="input" />
          </div>
          <div>
            <label class="label">車種</label>
            <input v-model="editForm.vehicleModel" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">想定金額（円）<span class="text-red-500">*</span></label>
            <input v-model.number="editForm.estimatedPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">想定原価（円）</label>
            <input v-model.number="editForm.estimatedCost" type="number" class="input" />
          </div>
        </div>
        <div v-if="editForm.estimatedCost" class="p-3 bg-emerald-50 rounded-lg text-sm">
          粗利目安: <span class="font-bold text-emerald-700">{{ fmt(editForm.estimatedPrice - (editForm.estimatedCost ?? 0)) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">期限</label>
            <input v-model="editForm.deadline" type="date" class="input" />
          </div>
          <div>
            <label class="label">担当メンバー</label>
            <select v-model="editForm.assignedMemberId" class="input">
              <option value="">未割当</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">FP紹介</label>
          <select v-model="editForm.referredByFpId" class="input">
            <option value="">なし</option>
            <option v-for="fp in store.fps" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">備考</label>
          <textarea v-model="editForm.notes" class="input" rows="2"></textarea>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showEdit = false">キャンセル</button>
          <button class="btn-primary" @click="saveEdit" :disabled="!editForm.title || !editForm.estimatedPrice">
            <Check class="w-4 h-4" />保存
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
