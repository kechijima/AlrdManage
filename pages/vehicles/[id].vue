<script setup lang="ts">
import { ArrowLeft, Pencil, Plus, Trash2, Car, MapPin, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { VehicleStatus, VehicleType } from '~/types'

const store = useAppStore()
const route = useRoute()
const vehicle = computed(() => store.vehicles.find(v => v.id === route.params.id))
const expenses = computed(() => store.expenses.filter(e => e.vehicleId === route.params.id))

const typeLabels: Record<string, string> = {
  inventory: '在庫販売', order: '注文販売', consignment: '委託販売',
}
const typeColors: Record<string, string> = {
  inventory: 'bg-blue-100 text-blue-700',
  order: 'bg-purple-100 text-purple-700',
  consignment: 'bg-orange-100 text-orange-700',
}

const expenseCategoryLabels: Record<string, string> = {
  purchase:     '仕入れ費',
  maintenance:  '整備・修理',
  transport:    '陸送費',
  travel:       '交通費',
  labor:        '人件費',
  misc:         '諸経費',
  registration: '名義変更',
  bodywork:     '板金・塗装',
  insurance:    '保険',
  advertising:  '広告',
  other:        'その他',
}

const expenseCategoryColors: Record<string, string> = {
  purchase:     'bg-gray-100 text-gray-600',
  maintenance:  'bg-orange-50 text-orange-700',
  transport:    'bg-cyan-50 text-cyan-700',
  travel:       'bg-blue-50 text-blue-700',
  labor:        'bg-purple-50 text-purple-700',
  misc:         'bg-amber-50 text-amber-700',
  registration: 'bg-pink-50 text-pink-700',
  bodywork:     'bg-red-50 text-red-700',
  insurance:    'bg-green-50 text-green-700',
  advertising:  'bg-indigo-50 text-indigo-700',
  other:        'bg-gray-100 text-gray-600',
}

const getMember = (id?: string) => store.members.find(m => m.id === id)
const getFP = (id?: string) => store.fps.find(f => f.id === id)
const getCustomer = (id?: string) => store.customers.find(c => c.id === id)

const vehicleStatusLabels: Record<VehicleStatus, string> = {
  inStock: '在庫中', negotiating: '商談中', ordered: '受注済', purchasing: '仕入れ中',
  arrived: '入庫済', consigning: '委託中', contracted: '成約',
  nameTransfer: '名義変更中', delivered: '納車済', settled: '精算済', cancelled: 'キャンセル',
}

// ===== 車両編集 =====
const showEditForm = ref(false)
const editForm = reactive({
  maker: '', model: '', year: 0, mileage: 0, color: '', vin: '',
  engineCC: undefined as number | undefined,
  inspectionDate: '',
  purchasePrice: 0, listPrice: 0,
  purchaseFrom: '', pickupLocation: '', purchasedAt: '',
  type: 'inventory' as VehicleType,
  status: 'inStock' as VehicleStatus,
  assignedMemberId: '', referredByFpId: '', notes: '',
})

const openEdit = () => {
  if (!vehicle.value) return
  const v = vehicle.value
  Object.assign(editForm, {
    maker: v.maker, model: v.model, year: v.year, mileage: v.mileage,
    color: v.color, vin: v.vin, engineCC: v.engineCC,
    inspectionDate: v.inspectionDate ?? '',
    purchasePrice: v.purchasePrice, listPrice: v.listPrice,
    purchaseFrom: v.purchaseFrom ?? '', pickupLocation: v.pickupLocation,
    purchasedAt: v.purchasedAt ?? '', type: v.type, status: v.status,
    assignedMemberId: v.assignedMemberId ?? '',
    referredByFpId: v.referredByFpId ?? '',
    notes: v.notes ?? '',
  })
  showEditForm.value = true
}

const saveEdit = () => {
  if (!vehicle.value || !editForm.maker || !editForm.model) return
  store.updateVehicle(vehicle.value.id, {
    maker: editForm.maker, model: editForm.model, year: editForm.year,
    mileage: editForm.mileage, color: editForm.color, vin: editForm.vin,
    engineCC: editForm.engineCC || undefined,
    inspectionDate: editForm.inspectionDate || undefined,
    purchasePrice: editForm.purchasePrice, listPrice: editForm.listPrice,
    purchaseFrom: editForm.purchaseFrom || undefined,
    pickupLocation: editForm.pickupLocation,
    purchasedAt: editForm.purchasedAt || undefined,
    type: editForm.type, status: editForm.status,
    assignedMemberId: editForm.assignedMemberId || undefined,
    referredByFpId: editForm.referredByFpId || undefined,
    notes: editForm.notes || undefined,
  })
  showEditForm.value = false
}

// ===== 経費追加 =====
const showExpenseForm = ref(false)
const expenseForm = reactive({ category: 'maintenance', description: '', amount: 0, date: new Date().toISOString().slice(0, 10) })
const expenseCategories = [
  { key: 'maintenance', label: '整備・修理' }, { key: 'transport', label: '陸送費' },
  { key: 'travel', label: '交通費' }, { key: 'labor', label: '人件費' },
  { key: 'registration', label: '名義変更' }, { key: 'bodywork', label: '板金・塗装' },
  { key: 'insurance', label: '保険' }, { key: 'advertising', label: '広告' },
  { key: 'misc', label: '諸経費' }, { key: 'other', label: 'その他' },
]
const submitExpense = () => {
  if (!expenseForm.description || expenseForm.amount <= 0 || !vehicle.value) return
  store.addExpense({
    vehicleId: vehicle.value.id,
    category: expenseForm.category as any,
    description: expenseForm.description,
    amount: expenseForm.amount,
    date: expenseForm.date,
  })
  Object.assign(expenseForm, { category: 'maintenance', description: '', amount: 0, date: new Date().toISOString().slice(0, 10) })
  showExpenseForm.value = false
}

const totalExpenses = computed(() => expenses.value.reduce((s, e) => s + e.amount, 0))
const grossProfit = computed(() => (vehicle.value?.listPrice ?? 0) - (vehicle.value?.purchasePrice ?? 0))
const netProfit = computed(() => grossProfit.value - totalExpenses.value)
const profitMargin = computed(() => vehicle.value?.listPrice ? ((netProfit.value / vehicle.value.listPrice) * 100).toFixed(1) : '0')

// Expense breakdown by category for profit tab
const expenseByCategory = computed(() => {
  const map: Record<string, number> = {}
  expenses.value.forEach(e => {
    map[e.category] = (map[e.category] ?? 0) + e.amount
  })
  return Object.entries(map).map(([cat, amt]) => ({ cat, amt }))
})

const activeTab = ref<'info' | 'expenses' | 'profit'>('info')
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader :title="vehicle ? `${vehicle.maker} ${vehicle.model}` : '車両詳細'" />
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!vehicle" class="text-center py-20 text-gray-400">車両が見つかりません</div>
      <div v-else class="max-w-4xl mx-auto space-y-4">

        <!-- Back + Actions -->
        <div class="flex items-center justify-between">
          <NuxtLink to="/vehicles" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft class="w-4 h-4" />戻る
          </NuxtLink>
          <div class="flex gap-2">
            <button class="btn-secondary" @click="openEdit"><Pencil class="w-4 h-4" />編集</button>
          </div>
        </div>

        <!-- Header Card -->
        <div class="card p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car class="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span :class="['badge', typeColors[vehicle.type]]">{{ typeLabels[vehicle.type] }}</span>
                  <StatusBadge :status="vehicle.status" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">{{ vehicle.maker }} {{ vehicle.model }}</h2>
                <p class="text-gray-500 text-sm mt-0.5">{{ vehicle.year }}年式 · {{ vehicle.color }} · {{ vehicle.mileage.toLocaleString() }}km</p>
                <!-- Unique key: maker+model / pickupLocation -->
                <div class="flex items-center gap-1.5 mt-2 text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-1 w-fit">
                  <MapPin class="w-3 h-3 text-brand-500 flex-shrink-0" />
                  <span class="font-medium text-gray-700">引き取り場所:</span>
                  <span>{{ vehicle.pickupLocation }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">販売価格</p>
              <p class="text-3xl font-bold text-gray-900">¥{{ vehicle.listPrice.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-1">仕入: ¥{{ vehicle.purchasePrice.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Profit Summary -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">粗利</p>
            <p :class="['text-xl font-bold', grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600']">
              ¥{{ grossProfit.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">販売 − 仕入</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">経費合計</p>
            <p class="text-xl font-bold text-orange-500">¥{{ totalExpenses.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ expenses.length }}件</p>
          </div>
          <div class="card p-4 text-center border-2" :class="netProfit >= 0 ? 'border-brand-200' : 'border-red-200'">
            <p class="text-xs text-gray-500 mb-1">純利益</p>
            <p :class="['text-xl font-bold', netProfit >= 0 ? 'text-brand-600' : 'text-red-600']">
              ¥{{ netProfit.toLocaleString() }}
            </p>
            <p :class="['text-xs mt-0.5 font-medium', netProfit >= 0 ? 'text-brand-500' : 'text-red-400']">
              利益率 {{ profitMargin }}%
            </p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card overflow-hidden">
          <div class="flex border-b border-gray-200">
            <button
              v-for="tab in [
                { key: 'info', label: '車両情報' },
                { key: 'expenses', label: `経費 (${expenses.length}件)` },
                { key: 'profit', label: '利益詳細' }
              ]"
              :key="tab.key"
              :class="['px-5 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
              @click="activeTab = tab.key as any"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Info Tab -->
          <div v-if="activeTab === 'info'" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div v-for="item in [
              { label: '車台番号 (VIN)', value: vehicle.vin },
              { label: '排気量', value: vehicle.engineCC ? `${vehicle.engineCC}cc` : '—' },
              { label: '車検満了日', value: vehicle.inspectionDate ?? '—' },
              { label: '仕入れ先', value: vehicle.purchaseFrom ?? '—' },
              { label: '仕入れ日', value: vehicle.purchasedAt ?? '—' },
              { label: '仕入れ価格', value: vehicle.purchasePrice > 0 ? `¥${vehicle.purchasePrice.toLocaleString()}` : '—' },
              { label: '引き取り場所', value: vehicle.pickupLocation },
              { label: '担当メンバー', value: getMember(vehicle.assignedMemberId)?.name ?? '—' },
              { label: 'FP紹介', value: getFP(vehicle.referredByFpId)?.name ?? '—' },
              ...(vehicle.type === 'consignment' ? [{ label: '委託オーナー', value: getCustomer(vehicle.consignmentOwnerId)?.name ?? '—' }] : []),
            ]" :key="item.label" class="flex flex-col">
              <span class="text-xs text-gray-500">{{ item.label }}</span>
              <span class="text-sm font-medium text-gray-900 mt-0.5">{{ item.value }}</span>
            </div>
            <div v-if="vehicle.notes" class="col-span-2 flex flex-col">
              <span class="text-xs text-gray-500">備考</span>
              <span class="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{{ vehicle.notes }}</span>
            </div>
          </div>

          <!-- Expenses Tab -->
          <div v-if="activeTab === 'expenses'" class="p-4">
            <div class="flex justify-between items-center mb-3">
              <p class="text-sm text-gray-600">経費 {{ expenses.length }}件 / 合計 <span class="font-semibold text-orange-500">¥{{ totalExpenses.toLocaleString() }}</span></p>
              <button class="btn-primary text-xs py-1.5" @click="showExpenseForm = true">
                <Plus class="w-3.5 h-3.5" />経費追加
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="table-header">カテゴリ</th>
                    <th class="table-header">内容</th>
                    <th class="table-header">日付</th>
                    <th class="table-header text-right">金額</th>
                    <th class="table-header"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="e in expenses" :key="e.id" class="hover:bg-gray-50">
                    <td class="table-cell">
                      <span :class="['badge', expenseCategoryColors[e.category] ?? 'bg-gray-100 text-gray-600']">
                        {{ expenseCategoryLabels[e.category] ?? e.category }}
                      </span>
                    </td>
                    <td class="table-cell text-gray-700">{{ e.description }}</td>
                    <td class="table-cell text-gray-500">{{ e.date }}</td>
                    <td class="table-cell text-right font-mono font-medium">¥{{ e.amount.toLocaleString() }}</td>
                    <td class="table-cell">
                      <button class="text-gray-300 hover:text-red-500 transition-colors" @click="store.removeExpense(e.id)"><Trash2 class="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr v-if="expenses.length === 0">
                    <td colspan="5" class="table-cell text-center text-gray-400 py-8">経費が登録されていません</td>
                  </tr>
                </tbody>
                <tfoot v-if="expenses.length > 0">
                  <tr class="border-t-2 border-gray-200 bg-gray-50">
                    <td colspan="3" class="table-cell font-medium text-gray-700">合計</td>
                    <td class="table-cell text-right font-bold font-mono text-orange-600">¥{{ totalExpenses.toLocaleString() }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Profit Tab -->
          <div v-if="activeTab === 'profit'" class="p-6">
            <div class="max-w-md mx-auto space-y-1">
              <!-- Revenue -->
              <div class="flex justify-between py-2.5 border-b border-gray-100">
                <span class="text-gray-600">販売価格</span>
                <span class="font-mono font-semibold text-gray-900">¥{{ vehicle.listPrice.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between py-2.5 border-b border-gray-100">
                <span class="text-gray-600">仕入れ価格</span>
                <span class="font-mono text-red-500">− ¥{{ vehicle.purchasePrice.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between py-2.5 border-b-2 border-gray-200 font-medium">
                <span class="text-gray-700">粗利</span>
                <span :class="['font-mono font-bold', grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600']">
                  ¥{{ grossProfit.toLocaleString() }}
                </span>
              </div>

              <!-- Expense breakdown by category -->
              <div v-if="expenseByCategory.length > 0" class="pt-2 pb-1">
                <p class="text-xs text-gray-400 font-medium mb-1">経費内訳</p>
                <div v-for="item in expenseByCategory" :key="item.cat" class="flex justify-between py-1.5 pl-4 text-sm">
                  <div class="flex items-center gap-2">
                    <span :class="['badge text-xs', expenseCategoryColors[item.cat] ?? 'bg-gray-100 text-gray-600']">
                      {{ expenseCategoryLabels[item.cat] ?? item.cat }}
                    </span>
                  </div>
                  <span class="font-mono text-orange-500">− ¥{{ item.amt.toLocaleString() }}</span>
                </div>
              </div>

              <div class="flex justify-between py-2.5 border-b-2 border-gray-200">
                <span class="text-gray-600">経費合計</span>
                <span class="font-mono text-orange-500">− ¥{{ totalExpenses.toLocaleString() }}</span>
              </div>

              <!-- Net profit -->
              <div :class="['flex justify-between py-4 rounded-xl px-4 mt-3', netProfit >= 0 ? 'bg-brand-50' : 'bg-red-50']">
                <span :class="['font-bold text-base', netProfit >= 0 ? 'text-brand-800' : 'text-red-800']">純利益</span>
                <span :class="['font-mono font-bold text-2xl', netProfit >= 0 ? 'text-brand-700' : 'text-red-600']">
                  ¥{{ netProfit.toLocaleString() }}
                </span>
              </div>
              <div :class="['text-center text-sm font-medium py-1', netProfit >= 0 ? 'text-brand-600' : 'text-red-500']">
                利益率: {{ profitMargin }}%
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- 車両編集モーダル -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">車両情報を編集</h3>
          <button @click="showEditForm = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">メーカー <span class="text-red-500">*</span></label>
            <input v-model="editForm.maker" class="input" placeholder="トヨタ" />
          </div>
          <div>
            <label class="label">車種 <span class="text-red-500">*</span></label>
            <input v-model="editForm.model" class="input" placeholder="アルファード" />
          </div>
          <div>
            <label class="label">年式</label>
            <input v-model.number="editForm.year" type="number" class="input" />
          </div>
          <div>
            <label class="label">走行距離（km）</label>
            <input v-model.number="editForm.mileage" type="number" class="input" />
          </div>
          <div>
            <label class="label">カラー</label>
            <input v-model="editForm.color" class="input" />
          </div>
          <div>
            <label class="label">車台番号（VIN）</label>
            <input v-model="editForm.vin" class="input" />
          </div>
          <div>
            <label class="label">販売価格（円）</label>
            <input v-model.number="editForm.listPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">仕入れ価格（円）</label>
            <input v-model.number="editForm.purchasePrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">引き取り場所</label>
            <input v-model="editForm.pickupLocation" class="input" />
          </div>
          <div>
            <label class="label">仕入れ先</label>
            <input v-model="editForm.purchaseFrom" class="input" />
          </div>
          <div>
            <label class="label">仕入れ日</label>
            <input v-model="editForm.purchasedAt" type="date" class="input" />
          </div>
          <div>
            <label class="label">車検満了日</label>
            <input v-model="editForm.inspectionDate" type="date" class="input" />
          </div>
          <div>
            <label class="label">種別</label>
            <select v-model="editForm.type" class="input">
              <option value="inventory">在庫販売</option>
              <option value="order">注文販売</option>
              <option value="consignment">委託販売</option>
            </select>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="editForm.status" class="input">
              <option v-for="(label, key) in vehicleStatusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="label">担当メンバー</label>
            <select v-model="editForm.assignedMemberId" class="input">
              <option value="">未割当</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">FP紹介</label>
            <select v-model="editForm.referredByFpId" class="input">
              <option value="">なし</option>
              <option v-for="fp in store.fps" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">備考</label>
          <textarea v-model="editForm.notes" class="input" rows="2"></textarea>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showEditForm = false">キャンセル</button>
          <button class="btn-primary" @click="saveEdit" :disabled="!editForm.maker || !editForm.model">
            <Check class="w-4 h-4" />保存
          </button>
        </div>
      </div>
    </div>

    <!-- 経費追加モーダル -->
    <div v-if="showExpenseForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">経費追加</h3>
          <button @click="showExpenseForm = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">カテゴリ</label>
          <select v-model="expenseForm.category" class="input">
            <option v-for="c in expenseCategories" :key="c.key" :value="c.key">{{ c.label }}</option>
          </select>
        </div>
        <div>
          <label class="label">内容 <span class="text-red-500">*</span></label>
          <input v-model="expenseForm.description" class="input" placeholder="エンジンオイル交換" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">金額（円）<span class="text-red-500">*</span></label>
            <input v-model.number="expenseForm.amount" type="number" class="input" />
          </div>
          <div>
            <label class="label">日付</label>
            <input v-model="expenseForm.date" type="date" class="input" />
          </div>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showExpenseForm = false">キャンセル</button>
          <button class="btn-primary" @click="submitExpense" :disabled="!expenseForm.description || expenseForm.amount <= 0">
            <Check class="w-4 h-4" />追加
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
