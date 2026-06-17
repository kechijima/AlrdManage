<script setup lang="ts">
import { Plus, CreditCard, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'

const store = useAppStore()

// ===== 販売登録モーダル =====
const showAdd = ref(false)
const addForm = reactive({
  vehicleId: '', customerId: '',
  contractPrice: 0, discount: 0,
  paymentMethod: 'cash' as 'cash' | 'loan' | 'other',
  assignedMemberId: '', referredByFpId: '',
  contractedAt: new Date().toISOString().slice(0, 10),
  status: 'contracted' as 'contracted' | 'nameTransfer' | 'delivered' | 'settled',
})
const submitAdd = () => {
  if (!addForm.vehicleId || !addForm.customerId || addForm.contractPrice <= 0) return
  store.addSale({
    vehicleId: addForm.vehicleId,
    customerId: addForm.customerId,
    contractPrice: addForm.contractPrice,
    discount: addForm.discount,
    paymentMethod: addForm.paymentMethod,
    assignedMemberId: addForm.assignedMemberId || undefined,
    referredByFpId: addForm.referredByFpId || undefined,
    contractedAt: addForm.contractedAt,
    status: addForm.status,
    branchId: 'b1',
  })
  Object.assign(addForm, {
    vehicleId: '', customerId: '', contractPrice: 0, discount: 0,
    paymentMethod: 'cash', assignedMemberId: '', referredByFpId: '',
    contractedAt: new Date().toISOString().slice(0, 10), status: 'contracted',
  })
  showAdd.value = false
}
const getVehicle = (id: string) => store.vehicles.find(v => v.id === id)
const getCustomer = (id: string) => store.customers.find(c => c.id === id)
const getMember = (id?: string) => store.members.find(m => m.id === id)
const getFP = (id?: string) => store.fps.find(f => f.id === id)

const paymentLabels: Record<string, string> = { cash: '現金', loan: 'ローン', other: 'その他' }

const totalSales = computed(() => store.sales.reduce((s, sale) => s + sale.contractPrice, 0))
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="販売管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="item in [
          { label: '今月成約', count: store.sales.length, sub: '件', color: 'text-brand-600' },
          { label: '売上合計', count: `¥${totalSales.toLocaleString()}`, sub: '', color: 'text-green-600' },
          { label: 'ローン申込', count: store.sales.filter(s=>s.loanApplications?.length).length, sub: '件', color: 'text-orange-600' },
          { label: '納車待ち', count: store.sales.filter(s=>['contracted','nameTransfer'].includes(s.status)).length, sub: '件', color: 'text-purple-600' },
        ]" :key="item.label" class="card p-4">
          <p class="text-xs text-gray-500">{{ item.label }}</p>
          <p :class="['text-xl font-bold mt-1', item.color]">{{ item.count }}{{ item.sub }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card p-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">販売一覧</h2>
        <button class="btn-primary" @click="showAdd = true">
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
              <tr v-for="s in store.sales" :key="s.id" class="hover:bg-gray-50">
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

    <!-- 販売登録モーダル -->
    <div v-if="showAdd" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">販売登録</h3>
          <button @click="showAdd = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">車両 <span class="text-red-500">*</span></label>
          <select v-model="addForm.vehicleId" class="input">
            <option value="">選択してください</option>
            <option v-for="v in store.vehicles" :key="v.id" :value="v.id">{{ v.maker }} {{ v.model }} ({{ v.year }}年式)</option>
          </select>
        </div>
        <div>
          <label class="label">顧客 <span class="text-red-500">*</span></label>
          <select v-model="addForm.customerId" class="input">
            <option value="">選択してください</option>
            <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">成約価格（円）<span class="text-red-500">*</span></label>
            <input v-model.number="addForm.contractPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">値引（円）</label>
            <input v-model.number="addForm.discount" type="number" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">支払方法</label>
            <select v-model="addForm.paymentMethod" class="input">
              <option value="cash">現金</option>
              <option value="loan">ローン</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="addForm.status" class="input">
              <option value="contracted">成約</option>
              <option value="nameTransfer">名義変更中</option>
              <option value="delivered">納車済</option>
              <option value="settled">精算済</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">担当メンバー</label>
            <select v-model="addForm.assignedMemberId" class="input">
              <option value="">未割当</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">FP紹介</label>
            <select v-model="addForm.referredByFpId" class="input">
              <option value="">なし</option>
              <option v-for="fp in store.fps" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">成約日</label>
          <input v-model="addForm.contractedAt" type="date" class="input" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showAdd = false">キャンセル</button>
          <button class="btn-primary" @click="submitAdd" :disabled="!addForm.vehicleId || !addForm.customerId || addForm.contractPrice <= 0">
            <Check class="w-4 h-4" />登録
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
