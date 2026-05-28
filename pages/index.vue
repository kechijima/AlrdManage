<script setup lang="ts">
import { TrendingUp, Car, AlertCircle, ArrowUp, ChevronRight } from 'lucide-vue-next'
import { mockVehicles, mockSales, mockGoods, mockTasks, mockExpenses, mockFPs } from '~/data/mock'

// ---- 利益計算ヘルパー ----
const calcProfit = (vehicleId: string) => {
  const v = mockVehicles.find(x => x.id === vehicleId)
  if (!v) return null
  const expenses = mockExpenses.filter(e => e.vehicleId === vehicleId).reduce((s, e) => s + e.amount, 0)
  const gross = v.listPrice - v.purchasePrice
  const net = gross - expenses
  return { gross, expenses, net, margin: v.listPrice > 0 ? ((net / v.listPrice) * 100) : 0 }
}

// ---- KPI ----
const deliveredSales = mockSales.filter(s => s.status === 'delivered')
const thisMonthRevenue = deliveredSales.reduce((s, sale) => s + sale.contractPrice, 0)
const thisMonthProfit = deliveredSales.reduce((s, sale) => {
  const p = calcProfit(sale.vehicleId)
  return s + (p?.net ?? 0)
}, 0)
const profitMargin = thisMonthRevenue > 0 ? ((thisMonthProfit / thisMonthRevenue) * 100).toFixed(1) : '0'

// ---- 見込売上（在庫中・商談中・受注・成約・名義変更中） ----
const prospectStatuses = ['inStock', 'negotiating', 'ordered', 'arrived', 'consigning', 'contracted', 'nameTransfer']
const prospectVehicles = mockVehicles.filter(v => prospectStatuses.includes(v.status))
const prospectRevenue = prospectVehicles.reduce((s, v) => s + v.listPrice, 0)
const prospectProfit = prospectVehicles.reduce((s, v) => {
  const p = calcProfit(v.id)
  return s + (p?.net ?? 0)
}, 0)

// 商談中の車のみの見込
const negotiatingVehicles = mockVehicles.filter(v => ['negotiating', 'contracted', 'nameTransfer'].includes(v.status))
const negotiatingRevenue = negotiatingVehicles.reduce((s, v) => s + v.listPrice, 0)

// ---- 月次チャートデータ ----
const monthlyData = [
  { month: '7月',  sales: 6200000, profit: 980000 },
  { month: '8月',  sales: 7800000, profit: 1240000 },
  { month: '9月',  sales: 5400000, profit: 820000 },
  { month: '10月', sales: 8900000, profit: 1580000 },
  { month: '11月', sales: 7200000, profit: 1320000 },
  { month: '12月', sales: thisMonthRevenue, profit: thisMonthProfit },
]
const maxSales = Math.max(...monthlyData.map(d => d.sales), 1)

// ---- 在庫サマリ ----
const inventoryByStatus = [
  { label: '在庫中',     status: 'inStock',      vehicles: mockVehicles.filter(v => v.status === 'inStock'), color: '#10B981', bg: '#ECFDF5' },
  { label: '商談中',     status: 'negotiating',  vehicles: mockVehicles.filter(v => v.status === 'negotiating'), color: '#F59E0B', bg: '#FFFBEB' },
  { label: '委託中',     status: 'consigning',   vehicles: mockVehicles.filter(v => v.status === 'consigning'), color: '#8B5CF6', bg: '#F5F3FF' },
  { label: '入庫済/受注', status: 'arrived',      vehicles: mockVehicles.filter(v => ['arrived', 'ordered'].includes(v.status)), color: '#06B6D4', bg: '#ECFEFF' },
  { label: '成約・名義変更', status: 'contracted', vehicles: mockVehicles.filter(v => ['contracted', 'nameTransfer'].includes(v.status)), color: '#EA0000', bg: '#FFF0F0' },
]

const urgentTasks = mockTasks.filter(t => t.status !== 'done' && t.priority === 'high')
const recentSales = mockSales.slice().sort((a, b) => b.contractedAt.localeCompare(a.contractedAt)).slice(0, 4).map(s => {
  const v = mockVehicles.find(v => v.id === s.vehicleId)
  return { ...s, vehicleName: v ? `${v.maker} ${v.model}` : '-' }
})

const getFP = (id?: string) => mockFPs.find(f => f.id === id)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="ダッシュボード" />
    <main class="flex-1 overflow-y-auto p-5 space-y-5 bg-alrd-cream">

      <!-- ===== 見込売上バナー（目立つ表示） ===== -->
      <div class="rounded-xl p-5 text-white flex flex-wrap items-center justify-between gap-4" style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);">
        <div>
          <p class="text-white/50 text-xs font-medium tracking-wider uppercase mb-1">売上見込み（在庫・商談・受注 合計）</p>
          <p class="text-4xl font-bold tracking-tight">¥{{ prospectRevenue.toLocaleString() }}</p>
          <p class="text-white/60 text-sm mt-1">
            うち 商談中・成約: <span class="text-white font-semibold">¥{{ negotiatingRevenue.toLocaleString() }}</span>
            ／ 見込利益: <span class="font-semibold" style="color:#EA0000;">¥{{ prospectProfit.toLocaleString() }}</span>
          </p>
        </div>
        <div class="flex gap-3">
          <div v-for="g in inventoryByStatus.filter(i => i.vehicles.length > 0)" :key="g.label" class="text-center px-4 py-2 rounded-lg bg-white/10">
            <p class="text-2xl font-bold text-white">{{ g.vehicles.length }}</p>
            <p class="text-white/50 text-xs mt-0.5">{{ g.label }}</p>
          </div>
        </div>
      </div>

      <!-- ===== KPI カード ===== -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-gray-400 font-medium">今月売上</p>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#FFF0F0;">
              <TrendingUp class="w-4 h-4" style="color:#EA0000;" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">¥{{ thisMonthRevenue.toLocaleString() }}</p>
          <div class="flex items-center gap-1 mt-1">
            <ArrowUp class="w-3 h-3 text-emerald-500" />
            <span class="text-xs text-gray-400">前月比 +12.3%</span>
          </div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-gray-400 font-medium">今月純利益</p>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
              <TrendingUp class="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">¥{{ thisMonthProfit.toLocaleString() }}</p>
          <p class="text-xs text-gray-400 mt-1">利益率 {{ profitMargin }}%</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-gray-400 font-medium">在庫台数</p>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
              <Car class="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ mockVehicles.filter(v => !['delivered','settled','cancelled'].includes(v.status)).length }}台</p>
          <p class="text-xs text-gray-400 mt-1">商談中 {{ mockVehicles.filter(v=>v.status==='negotiating').length }}台 含む</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-gray-400 font-medium">要対応タスク</p>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#FFF0F0;">
              <AlertCircle class="w-4 h-4" style="color:#EA0000;" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ urgentTasks.length }}件</p>
          <p class="text-xs text-gray-400 mt-1">高優先度</p>
        </div>
      </div>

      <!-- ===== 在庫ステータス ビジュアル ===== -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-700">在庫ステータス一覧</h2>
          <NuxtLink to="/vehicles" class="text-xs flex items-center gap-1 hover:underline" style="color:#EA0000;">すべて見る <ChevronRight class="w-3 h-3" /></NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-for="group in inventoryByStatus" :key="group.label">
            <div v-if="group.vehicles.length > 0">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-2 h-2 rounded-full flex-shrink-0" :style="`background:${group.color};`"></span>
                <span class="text-xs font-medium text-gray-500">{{ group.label }}</span>
                <span class="text-xs font-bold text-gray-700">{{ group.vehicles.length }}台</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pl-4">
                <div
                  v-for="v in group.vehicles"
                  :key="v.id"
                  class="rounded-lg px-3 py-2.5 border flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
                  :style="`background:${group.bg}; border-color:${group.color}30;`"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ v.maker }} {{ v.model }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ v.year }}年式 / {{ v.pickupLocation }}</p>
                  </div>
                  <div class="text-right flex-shrink-0 ml-2">
                    <p class="text-sm font-bold text-gray-700">¥{{ (v.listPrice / 10000).toFixed(0) }}万</p>
                    <p class="text-xs text-gray-400">{{ v.mileage.toLocaleString() }}km</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== チャート + パイプライン ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-5 lg:col-span-2">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">月次売上・利益推移</h2>
          <div class="flex items-end gap-2 h-36">
            <div v-for="d in monthlyData" :key="d.month" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full flex flex-col-reverse gap-px">
                <div class="w-full rounded-sm" :style="`height:${(d.sales/maxSales)*120}px; background:#FECACA;`" />
                <div class="w-full rounded-sm" :style="`height:${(d.profit/maxSales)*120}px; background:#EA0000;`" />
              </div>
              <span class="text-xs text-gray-400">{{ d.month }}</span>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-3">
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm block" style="background:#FECACA;"></span><span class="text-xs text-gray-400">売上</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm block" style="background:#EA0000;"></span><span class="text-xs text-gray-400">純利益</span></div>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">販売パイプライン</h2>
          <div class="space-y-3">
            <div v-for="p in [
              { label: '商談中', count: mockVehicles.filter(v=>v.status==='negotiating').length, amount: mockVehicles.filter(v=>v.status==='negotiating').reduce((s,v)=>s+v.listPrice,0), color:'#F59E0B' },
              { label: '成約',   count: mockVehicles.filter(v=>v.status==='contracted').length,  amount: mockVehicles.filter(v=>v.status==='contracted').reduce((s,v)=>s+v.listPrice,0), color:'#EA0000' },
              { label: '名義変更中', count: mockVehicles.filter(v=>v.status==='nameTransfer').length, amount: mockVehicles.filter(v=>v.status==='nameTransfer').reduce((s,v)=>s+v.listPrice,0), color:'#EC4899' },
              { label: '納車済', count: mockVehicles.filter(v=>v.status==='delivered').length, amount: mockVehicles.filter(v=>v.status==='delivered').reduce((s,v)=>s+v.listPrice,0), color:'#9CA3AF' },
            ]" :key="p.label" class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="`background:${p.color};`"></span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">{{ p.label }}</span>
                  <span class="font-semibold text-gray-800">{{ p.count }}件</span>
                </div>
                <p class="text-xs text-gray-400">¥{{ p.amount.toLocaleString() }}</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">見込合計</span>
              <span class="font-bold text-sm" style="color:#EA0000;">¥{{ negotiatingRevenue.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 最近の成約 + 要対応タスク ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-700">最近の成約</h2>
            <NuxtLink to="/sales" class="text-xs flex items-center gap-0.5 hover:underline" style="color:#EA0000;">すべて見る <ChevronRight class="w-3 h-3" /></NuxtLink>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="s in recentSales" :key="s.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ s.vehicleName }}</p>
                <p class="text-xs text-gray-400">{{ s.contractedAt }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-800">¥{{ s.contractPrice.toLocaleString() }}</p>
                <StatusBadge :status="s.status" />
              </div>
            </div>
          </div>
        </div>

        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-700">要対応タスク</h2>
            <NuxtLink to="/tasks" class="text-xs flex items-center gap-0.5 hover:underline" style="color:#EA0000;">すべて見る <ChevronRight class="w-3 h-3" /></NuxtLink>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="t in urgentTasks" :key="t.id" class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
              <AlertCircle class="w-4 h-4 flex-shrink-0" style="color:#EA0000;" />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 truncate">{{ t.title }}</p>
                <p class="text-xs text-gray-400">期日: {{ t.dueDate }}</p>
              </div>
              <StatusBadge :status="t.status" />
            </div>
            <div v-if="urgentTasks.length === 0" class="px-5 py-8 text-center text-sm text-gray-400">
              要対応タスクはありません
            </div>
          </div>
        </div>
      </div>

      <!-- ===== FP実績 + 古物 ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">FP別紹介実績（今月）</h2>
          <div class="space-y-3">
            <div v-for="fp in [
              { name: '山田 健一', company: '山田FPオフィス', count: 2, sales: '¥5,650,000' },
              { name: '渡辺 誠', company: 'ウェルスFP', count: 1, sales: '¥6,700,000' },
              { name: '伊藤 美咲', company: 'ライフプランニング伊藤', count: 1, sales: '¥2,600,000' },
            ]" :key="fp.name" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background:#EA0000;">{{ fp.name[0] }}</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ fp.name }}</p>
                  <p class="text-xs text-gray-400">{{ fp.company }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-800">{{ fp.sales }}</p>
                <p class="text-xs text-gray-400">紹介 {{ fp.count }}件</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">古物商品 状況</h2>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p class="text-2xl font-bold text-blue-700">1</p>
              <p class="text-xs text-blue-500 mt-0.5">出品中</p>
            </div>
            <div class="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p class="text-2xl font-bold text-amber-700">2</p>
              <p class="text-xs text-amber-500 mt-0.5">査定・準備</p>
            </div>
            <div class="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p class="text-2xl font-bold text-emerald-700">1</p>
              <p class="text-xs text-emerald-500 mt-0.5">精算済</p>
            </div>
          </div>
          <div class="space-y-1.5 text-sm border-t border-gray-100 pt-3">
            <div class="flex justify-between"><span class="text-gray-400">今月売上</span><span class="font-semibold text-gray-800">¥92,000</span></div>
            <div class="flex justify-between"><span class="text-gray-400">今月純利益</span><span class="font-semibold text-emerald-600">¥81,300</span></div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>
