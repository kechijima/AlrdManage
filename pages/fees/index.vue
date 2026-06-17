<script setup lang="ts">
import { Plus, Percent, Edit2, ToggleLeft, ToggleRight, Car, Package, Users, Handshake } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { FeePattern, FeeTargetBusiness, FeeTargetRole, FeeAppliedTo } from '~/types'

const store = useAppStore()
const activeTab = ref<'patterns' | 'summary'>('patterns')

const showAddForm = ref(false)
const newPattern = reactive<Omit<FeePattern, 'id' | 'createdAt'>>({
  name: '', targetBusiness: 'vehicle', targetRole: 'fp',
  appliedTo: 'contractPrice', rate: 0, branchId: 'b1', isActive: true, notes: '',
})

const businessLabels: Record<FeeTargetBusiness, string> = { vehicle: '車両', goods: '古物', all: '全事業' }
const roleLabels: Record<FeeTargetRole, string> = { fp: 'FP', member: '担当者' }
const appliedToLabels: Record<FeeAppliedTo, string> = {
  contractPrice: '契約金額',
  grossProfit: '粗利',
  soldPrice: '売却額',
  listPrice: '出品価格',
}

const businessColors: Record<FeeTargetBusiness, string> = {
  vehicle: 'bg-blue-100 text-blue-700',
  goods: 'bg-amber-100 text-amber-700',
  all: 'bg-purple-100 text-purple-700',
}
const roleColors: Record<FeeTargetRole, string> = {
  fp: 'bg-brand-100 text-brand-700',
  member: 'bg-emerald-100 text-emerald-700',
}

const resetNewPattern = () => {
  Object.assign(newPattern, { name: '', targetBusiness: 'vehicle', targetRole: 'fp', appliedTo: 'contractPrice', rate: 0, branchId: 'b1', isActive: true, notes: '' })
  showAddForm.value = false
}

const addPattern = () => {
  if (!newPattern.name || newPattern.rate <= 0) return
  store.addFeePattern({ ...newPattern })
  resetNewPattern()
}

const toggleActive = (p: FeePattern) => { store.updateFeePattern(p.id, { isActive: !p.isActive }) }

// ===== フィー集計 タブ =====
const summaryBusiness = ref<FeeTargetBusiness | 'all'>('all')
const summaryMonth = ref('')  // YYYY-MM or ''
const summaryMember = ref('')

// 車両販売からのFEE計算（mockSales × mockVehicles × activePatterns）
interface FeeRecord {
  id: string
  label: string
  business: string
  role: string
  target: string
  baseAmount: number
  rate: number
  feeAmount: number
  month: string
  memberId?: string
  fpId?: string
}

const computedFees = computed<FeeRecord[]>(() => {
  const records: FeeRecord[] = []
  const activePatterns = store.feePatterns.filter(p => p.isActive)

  // 車両販売
  store.sales.forEach(sale => {
    const vehicle = store.vehicles.find(v => v.id === sale.vehicleId)
    if (!vehicle) return
    const month = sale.contractedAt.slice(0, 7)
    const grossProfit = sale.contractPrice - sale.discount - vehicle.purchasePrice

    activePatterns
      .filter(p => p.targetBusiness === 'vehicle' || p.targetBusiness === 'all')
      .forEach(p => {
        let base = 0
        if (p.appliedTo === 'contractPrice') base = sale.contractPrice - sale.discount
        else if (p.appliedTo === 'grossProfit') base = grossProfit
        if (base <= 0) return

        const target = p.targetRole === 'fp'
          ? (sale.referredByFpId ? store.fps.find(f => f.id === sale.referredByFpId)?.name ?? '不明' : null)
          : (sale.assignedMemberId ? store.members.find(m => m.id === sale.assignedMemberId)?.name ?? '不明' : null)

        if (!target) return
        records.push({
          id: `${sale.id}-${p.id}`,
          label: `${vehicle.maker} ${vehicle.model}（販売）`,
          business: '車両',
          role: roleLabels[p.targetRole],
          target,
          baseAmount: base,
          rate: p.rate,
          feeAmount: Math.round(base * p.rate / 100),
          month,
          memberId: p.targetRole === 'member' ? sale.assignedMemberId : undefined,
          fpId: p.targetRole === 'fp' ? sale.referredByFpId : undefined,
        })
      })
  })

  // 古物販売
  store.goods
    .filter(g => g.soldPrice && g.soldAt)
    .forEach(g => {
      const month = g.soldAt!.slice(0, 7)
      activePatterns
        .filter(p => p.targetBusiness === 'goods' || p.targetBusiness === 'all')
        .forEach(p => {
          let base = 0
          if (p.appliedTo === 'soldPrice') base = g.soldPrice!
          else if (p.appliedTo === 'grossProfit') base = g.profit ?? 0
          if (base <= 0) return

          const target = p.targetRole === 'fp'
            ? (g.sourceFpId ? store.fps.find(f => f.id === g.sourceFpId)?.name ?? '不明' : null)
            : (g.assignedMemberId ? store.members.find(m => m.id === g.assignedMemberId)?.name ?? '不明' : null)

          if (!target) return
          records.push({
            id: `${g.id}-${p.id}`,
            label: `${g.name}（古物）`,
            business: '古物',
            role: roleLabels[p.targetRole],
            target,
            baseAmount: base,
            rate: p.rate,
            feeAmount: Math.round(base * p.rate / 100),
            month,
            memberId: p.targetRole === 'member' ? g.assignedMemberId : undefined,
            fpId: p.targetRole === 'fp' ? g.sourceFpId : undefined,
          })
        })
    })

  return records
})

const filteredFees = computed(() => {
  return computedFees.value.filter(r => {
    if (summaryBusiness.value !== 'all') {
      const biz = summaryBusiness.value === 'vehicle' ? '車両' : summaryBusiness.value === 'goods' ? '古物' : ''
      if (biz && r.business !== biz) return false
    }
    if (summaryMonth.value && r.month !== summaryMonth.value) return false
    if (summaryMember.value) {
      const name = store.members.find(m => m.id === summaryMember.value)?.name
      if (name && r.target !== name) return false
    }
    return true
  })
})

const totalFee = computed(() => filteredFees.value.reduce((s, r) => s + r.feeAmount, 0))

const fmt = (n: number) => `¥${n.toLocaleString()}`

// 月選択肢（既存データから）
const availableMonths = computed(() => {
  const months = [...new Set(computedFees.value.map(r => r.month))].sort().reverse()
  return months
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="フィー管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Tabs -->
      <div class="card p-1 flex gap-1 w-fit">
        <button
          v-for="t in [{ key: 'patterns', label: 'パターン登録' }, { key: 'summary', label: 'フィー集計' }]"
          :key="t.key"
          :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-700']"
          :style="activeTab === t.key ? 'background-color:#EA0000;' : ''"
          @click="activeTab = t.key as any"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- ===== パターン登録 ===== -->
      <template v-if="activeTab === 'patterns'">
        <div class="card p-4 flex justify-between items-center">
          <div>
            <h2 class="text-sm font-semibold text-gray-700">フィーパターン一覧</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ store.feePatterns.length }}件 / 有効 {{ store.feePatterns.filter(p => p.isActive).length }}件</p>
          </div>
          <button class="btn-primary" @click="showAddForm = !showAddForm">
            <Plus class="w-4 h-4" />パターン追加
          </button>
        </div>

        <!-- 追加フォーム -->
        <div v-if="showAddForm" class="card p-5 space-y-4 border-2 border-brand-200">
          <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Percent class="w-4 h-4 text-brand-500" />新規パターン
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="label">パターン名 <span class="text-red-500">*</span></label>
              <input v-model="newPattern.name" class="input" placeholder="例：FP紹介料（車両）" />
            </div>
            <div>
              <label class="label">対象事業</label>
              <select v-model="newPattern.targetBusiness" class="input">
                <option v-for="(label, key) in businessLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="label">対象者</label>
              <select v-model="newPattern.targetRole" class="input">
                <option v-for="(label, key) in roleLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="label">計算基準</label>
              <select v-model="newPattern.appliedTo" class="input">
                <option v-for="(label, key) in appliedToLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="label">料率（%）<span class="text-red-500">*</span></label>
              <div class="relative">
                <input v-model.number="newPattern.rate" type="number" step="0.1" min="0" max="100" class="input pr-8" placeholder="2.5" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <p v-if="newPattern.rate > 0" class="text-xs text-brand-600 mt-1">
                基準額100万円の場合 → {{ fmt(Math.round(1000000 * newPattern.rate / 100)) }}
              </p>
            </div>
            <div class="col-span-2">
              <label class="label">備考</label>
              <input v-model="newPattern.notes" class="input" placeholder="補足説明..." />
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn-secondary" @click="resetNewPattern">キャンセル</button>
            <button class="btn-primary" @click="addPattern" :disabled="!newPattern.name || newPattern.rate <= 0">登録する</button>
          </div>
        </div>

        <!-- パターンリスト -->
        <div class="space-y-2">
          <div v-for="p in store.feePatterns" :key="p.id" :class="['card p-4 flex flex-col md:flex-row md:items-center gap-3', !p.isActive && 'opacity-50']">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="font-semibold text-gray-900 text-sm">{{ p.name }}</span>
                <span :class="['badge', businessColors[p.targetBusiness]]">{{ businessLabels[p.targetBusiness] }}</span>
                <span :class="['badge', roleColors[p.targetRole]]">{{ roleLabels[p.targetRole] }}</span>
              </div>
              <p class="text-xs text-gray-500">
                {{ appliedToLabels[p.appliedTo] }} ×
                <span class="font-bold text-gray-800">{{ p.rate }}%</span>
                <span v-if="p.notes" class="ml-2 text-gray-400">— {{ p.notes }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="text-right">
                <p class="text-xs text-gray-400">100万の場合</p>
                <p class="text-sm font-bold text-gray-700">{{ fmt(Math.round(1000000 * p.rate / 100)) }}</p>
              </div>
              <button @click="toggleActive(p)" class="text-gray-400 hover:text-brand-500 transition-colors">
                <ToggleRight v-if="p.isActive" class="w-6 h-6 text-emerald-500" />
                <ToggleLeft v-else class="w-6 h-6" />
              </button>
              <button class="text-gray-400 hover:text-gray-600">
                <Edit2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== フィー集計 ===== -->
      <template v-if="activeTab === 'summary'">
        <!-- フィルター -->
        <div class="card p-4 flex flex-wrap gap-3 items-center">
          <select v-model="summaryBusiness" class="input text-xs py-1.5 w-auto">
            <option value="all">全事業</option>
            <option value="vehicle">車両</option>
            <option value="goods">古物</option>
          </select>
          <select v-model="summaryMonth" class="input text-xs py-1.5 w-auto">
            <option value="">全月</option>
            <option v-for="m in availableMonths" :key="m" :value="m">{{ m }}</option>
          </select>
          <select v-model="summaryMember" class="input text-xs py-1.5 w-auto">
            <option value="">全担当者・FP</option>
            <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <div class="ml-auto text-right">
            <p class="text-xs text-gray-400">合計フィー</p>
            <p class="text-xl font-bold text-brand-600">{{ fmt(totalFee) }}</p>
          </div>
        </div>

        <!-- テーブル -->
        <div class="card overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="table-header">案件</th>
                <th class="table-header">事業</th>
                <th class="table-header">対象者</th>
                <th class="table-header">種別</th>
                <th class="table-header text-right">基準額</th>
                <th class="table-header text-right">料率</th>
                <th class="table-header text-right">フィー額</th>
                <th class="table-header">月</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredFees" :key="r.id" class="border-b border-gray-50 hover:bg-gray-50/50">
                <td class="table-cell font-medium max-w-xs truncate">{{ r.label }}</td>
                <td class="table-cell">
                  <span :class="['badge', r.business === '車両' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700']">
                    {{ r.business }}
                  </span>
                </td>
                <td class="table-cell text-gray-800 font-medium">{{ r.target }}</td>
                <td class="table-cell">
                  <span :class="['badge', r.role === 'FP' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700']">
                    {{ r.role }}
                  </span>
                </td>
                <td class="table-cell text-right text-gray-600">{{ fmt(r.baseAmount) }}</td>
                <td class="table-cell text-right text-gray-600">{{ r.rate }}%</td>
                <td class="table-cell text-right font-bold text-brand-600">{{ fmt(r.feeAmount) }}</td>
                <td class="table-cell text-gray-400 text-xs">{{ r.month }}</td>
              </tr>
              <tr v-if="filteredFees.length === 0">
                <td colspan="8" class="table-cell text-center text-gray-400 py-8">
                  <Percent class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p class="text-sm">フィーデータがありません</p>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="filteredFees.length > 0">
              <tr class="bg-gray-50 border-t border-gray-200">
                <td colspan="6" class="table-cell font-semibold text-gray-700">合計</td>
                <td class="table-cell text-right font-bold text-brand-700 text-base">{{ fmt(totalFee) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>

    </main>
  </div>
</template>
