<script setup lang="ts">
import { ArrowLeft, Pencil, Upload, FileText, ExternalLink, Package, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import { MERCARI_CATEGORIES } from '~/types'
import type { GoodsStatus, Platform } from '~/types'

const store = useAppStore()
const route = useRoute()
const item = computed(() => store.goods.find(g => g.id === route.params.id))
const fp = computed(() => store.fps.find(f => f.id === item.value?.sourceFpId))
const customer = computed(() => store.customers.find(c => c.id === item.value?.sourceCustomerId))
const member = computed(() => store.members.find(m => m.id === item.value?.assignedMemberId))

const platformLabels: Record<string, string> = { mercari: 'メルカリ', yahoo_auction: 'ヤフオク', other: 'その他' }

const goodsStatusLabels: Record<GoodsStatus, string> = {
  received: '受領済', assessing: '査定中', preparing: '出品準備',
  listed: '出品中', sold: '売却済', settled: '精算済', withdrawn: '取下げ',
}

const DEFAULT_FEE_DIST = { alrd: 10, union: 15, technical: 35, planner: 40 }

// ===== 古物編集 =====
const showEditForm = ref(false)
const editForm = reactive({
  name: '', mainCategory: '', subCategory: '', condition: '',
  status: 'received' as GoodsStatus,
  assessedValue: undefined as number | undefined,
  platform: '' as Platform | '',
  listingPrice: undefined as number | undefined,
  listedAt: '', listingUrl: '',
  soldPrice: undefined as number | undefined,
  soldAt: '', platformFee: undefined as number | undefined,
  shippingCost: undefined as number | undefined,
  assignedMemberId: '', notes: '',
  feeMode: 'default' as 'default' | 'custom',
  feeDist: { ...DEFAULT_FEE_DIST },
})

const editSubCategories = computed(() => MERCARI_CATEGORIES[editForm.mainCategory] ?? [])
watch(() => editForm.mainCategory, () => { editForm.subCategory = '' })

const editNetProfit = computed(() => {
  if (!editForm.soldPrice) return 0
  return editForm.soldPrice - (editForm.platformFee ?? 0) - (editForm.shippingCost ?? 0)
})

const activeDist = computed(() =>
  editForm.feeMode === 'default' ? DEFAULT_FEE_DIST : editForm.feeDist
)

const feeDistTotal = computed(() =>
  editForm.feeMode === 'custom'
    ? editForm.feeDist.alrd + editForm.feeDist.union + editForm.feeDist.technical + editForm.feeDist.planner
    : 100
)

const openEdit = () => {
  if (!item.value) return
  const g = item.value
  Object.assign(editForm, {
    name: g.name, mainCategory: g.mainCategory, subCategory: g.subCategory,
    condition: g.condition, status: g.status,
    assessedValue: g.assessedValue, platform: g.platform ?? '',
    listingPrice: g.listingPrice, listedAt: g.listedAt ?? '',
    listingUrl: g.listingUrl ?? '',
    soldPrice: g.soldPrice, soldAt: g.soldAt ?? '',
    platformFee: g.platformFee, shippingCost: g.shippingCost,
    assignedMemberId: g.assignedMemberId ?? '',
    notes: g.notes ?? '',
    feeMode: g.feeMode ?? 'default',
    feeDist: g.feeDist ? { ...g.feeDist } : { ...DEFAULT_FEE_DIST },
  })
  showEditForm.value = true
}

const saveEdit = () => {
  if (!item.value || !editForm.name) return
  const profit = (editForm.soldPrice && editForm.platform !== '')
    ? (editForm.soldPrice - (editForm.platformFee ?? 0) - (editForm.shippingCost ?? 0))
    : item.value.profit
  store.updateGoods(item.value.id, {
    name: editForm.name, mainCategory: editForm.mainCategory,
    subCategory: editForm.subCategory, condition: editForm.condition,
    status: editForm.status,
    assessedValue: editForm.assessedValue || undefined,
    platform: (editForm.platform as Platform) || undefined,
    listingPrice: editForm.listingPrice || undefined,
    listedAt: editForm.listedAt || undefined,
    listingUrl: editForm.listingUrl || undefined,
    soldPrice: editForm.soldPrice || undefined,
    soldAt: editForm.soldAt || undefined,
    platformFee: editForm.platformFee || undefined,
    shippingCost: editForm.shippingCost || undefined,
    profit: profit || undefined,
    feeMode: editForm.feeMode,
    feeDist: editForm.feeMode === 'custom' ? { ...editForm.feeDist } : undefined,
    assignedMemberId: editForm.assignedMemberId || undefined,
    notes: editForm.notes || undefined,
  })
  showEditForm.value = false
}

const statusFlow = [
  { key: 'received', label: '受領済' },
  { key: 'assessing', label: '査定中' },
  { key: 'preparing', label: '出品準備' },
  { key: 'listed', label: '出品中' },
  { key: 'sold', label: '売却済' },
  { key: 'settled', label: '精算済' },
]

const currentStep = computed(() => statusFlow.findIndex(s => s.key === item.value?.status))

// 詳細ページの利益内訳用
const detailFeeDist = computed(() => {
  if (!item.value) return DEFAULT_FEE_DIST
  return item.value.feeMode === 'custom' && item.value.feeDist
    ? item.value.feeDist
    : DEFAULT_FEE_DIST
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader :title="item?.name ?? '古物商品詳細'" />
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!item" class="text-center py-20 text-gray-400">商品が見つかりません</div>
      <div v-else class="max-w-3xl mx-auto space-y-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/goods" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft class="w-4 h-4" />戻る
          </NuxtLink>
          <button class="btn-secondary" @click="openEdit"><Pencil class="w-4 h-4" />編集</button>
        </div>

        <!-- Header -->
        <div class="card p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <Package class="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <StatusBadge :status="item.status" />
                <h2 class="text-xl font-bold text-gray-900 mt-1">{{ item.name }}</h2>
                <p class="text-sm text-gray-500">{{ item.mainCategory }} / {{ item.subCategory }} / 状態: {{ item.condition }}</p>
              </div>
            </div>
            <div class="text-right">
              <div v-if="item.soldPrice">
                <p class="text-xs text-gray-500">売却額</p>
                <p class="text-2xl font-bold text-green-700">¥{{ item.soldPrice.toLocaleString() }}</p>
              </div>
              <div v-else-if="item.listingPrice">
                <p class="text-xs text-gray-500">出品額</p>
                <p class="text-2xl font-bold text-gray-900">¥{{ item.listingPrice.toLocaleString() }}</p>
              </div>
              <div v-else-if="item.assessedValue">
                <p class="text-xs text-gray-500">査定額</p>
                <p class="text-2xl font-bold text-gray-900">¥{{ item.assessedValue.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Flow -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">進捗ステータス</h3>
          <div class="flex items-center">
            <template v-for="(step, i) in statusFlow" :key="step.key">
              <div class="flex flex-col items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  i <= currentStep ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-400'
                ]">{{ i + 1 }}</div>
                <span class="text-xs text-gray-500 mt-1 text-center whitespace-nowrap">{{ step.label }}</span>
              </div>
              <div v-if="i < statusFlow.length - 1" :class="['flex-1 h-0.5 mb-4 mx-1', i < currentStep ? 'bg-brand-600' : 'bg-gray-200']" />
            </template>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-700">受領情報</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">取次FP</span>
                <span class="font-medium">{{ fp?.name }} ({{ fp?.company }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">提供者</span>
                <span class="font-medium">{{ customer?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">受領日</span>
                <span>{{ item.receivedAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">担当メンバー</span>
                <span>{{ member?.name ?? '—' }}</span>
              </div>
            </div>
          </div>

          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-700">販売情報</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">プラットフォーム</span>
                <span>{{ item.platform ? platformLabels[item.platform] : '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">出品日</span>
                <span>{{ item.listedAt ?? '—' }}</span>
              </div>
              <div v-if="item.listingUrl" class="flex justify-between">
                <span class="text-gray-500">出品URL</span>
                <a :href="item.listingUrl" target="_blank" class="text-brand-600 hover:underline flex items-center gap-1">
                  リンク <ExternalLink class="w-3 h-3" />
                </a>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">売却日</span>
                <span>{{ item.soldAt ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profit -->
        <div v-if="item.soldPrice" class="card p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">利益計算</h3>
          <div class="max-w-xs space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">売却額</span>
              <span class="font-mono">¥{{ item.soldPrice.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">手数料</span>
              <span class="font-mono text-red-500">- ¥{{ (item.platformFee ?? 0).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">送料</span>
              <span class="font-mono text-red-500">- ¥{{ (item.shippingCost ?? 0).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 font-bold">
              <span class="text-brand-700">純利益</span>
              <span class="font-mono text-brand-700">¥{{ (item.profit ?? 0).toLocaleString() }}</span>
            </div>
          </div>
          <!-- フィー内訳 -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs font-semibold text-gray-500 mb-2">利益配分（{{ item.feeMode === 'custom' ? '自由設定' : 'デフォルト' }}）</p>
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ALRD（{{ detailFeeDist.alrd }}%）</span>
                <span class="font-mono text-gray-800">¥{{ Math.round((item.profit ?? 0) * detailFeeDist.alrd / 100).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">組合費（{{ detailFeeDist.union }}%）</span>
                <span class="font-mono text-gray-800">¥{{ Math.round((item.profit ?? 0) * detailFeeDist.union / 100).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">テクニカルフィー（{{ detailFeeDist.technical }}%）</span>
                <span class="font-mono text-gray-800">¥{{ Math.round((item.profit ?? 0) * detailFeeDist.technical / 100).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">プランナーフィー（{{ detailFeeDist.planner }}%）</span>
                <span class="font-mono text-gray-800">¥{{ Math.round((item.profit ?? 0) * detailFeeDist.planner / 100).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-700">添付ファイル</h3>
            <button class="btn-secondary text-xs py-1.5"><Upload class="w-3.5 h-3.5" />追加</button>
          </div>
          <div v-if="item.attachments?.length" class="space-y-2">
            <div v-for="a in item.attachments" :key="a.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText class="w-5 h-5 text-red-500" />
              <span class="text-sm flex-1">{{ a.name }}</span>
              <span class="text-xs text-gray-400">{{ a.uploadedAt }}</span>
            </div>
          </div>
          <div v-else class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload class="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p class="text-xs text-gray-400">ファイルをアップロードしてください</p>
          </div>
        </div>

      </div>
    </main>

    <!-- 古物編集モーダル -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">古物商品を編集</h3>
          <button @click="showEditForm = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <div>
          <label class="label">商品名 <span class="text-red-500">*</span></label>
          <input v-model="editForm.name" class="input" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">大カテゴリ</label>
            <select v-model="editForm.mainCategory" class="input">
              <option v-for="cat in Object.keys(MERCARI_CATEGORIES)" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="label">小カテゴリ</label>
            <select v-model="editForm.subCategory" class="input">
              <option v-for="sub in editSubCategories" :key="sub" :value="sub">{{ sub }}</option>
            </select>
          </div>
          <div>
            <label class="label">状態</label>
            <input v-model="editForm.condition" class="input" placeholder="未使用・美品・傷あり..." />
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="editForm.status" class="input">
              <option v-for="(label, key) in goodsStatusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="label">査定額（円）</label>
            <input v-model.number="editForm.assessedValue" type="number" class="input" />
          </div>
          <div>
            <label class="label">プラットフォーム</label>
            <select v-model="editForm.platform" class="input">
              <option value="">未定</option>
              <option value="mercari">メルカリ</option>
              <option value="yahoo_auction">ヤフオク</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label class="label">出品価格（円）</label>
            <input v-model.number="editForm.listingPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">出品日</label>
            <input v-model="editForm.listedAt" type="date" class="input" />
          </div>
          <div>
            <label class="label">売却額（円）</label>
            <input v-model.number="editForm.soldPrice" type="number" class="input" />
          </div>
          <div>
            <label class="label">売却日</label>
            <input v-model="editForm.soldAt" type="date" class="input" />
          </div>
          <div>
            <label class="label">手数料（円）</label>
            <input v-model.number="editForm.platformFee" type="number" class="input" />
          </div>
          <div>
            <label class="label">送料（円）</label>
            <input v-model.number="editForm.shippingCost" type="number" class="input" />
          </div>
        </div>

        <!-- フィー計算パターン -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="label mb-0">利益配分パターン</label>
            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button
                :class="['px-3 py-1.5 font-medium transition-colors', editForm.feeMode === 'default' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
                @click="editForm.feeMode = 'default'"
              >デフォルト</button>
              <button
                :class="['px-3 py-1.5 font-medium transition-colors', editForm.feeMode === 'custom' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
                @click="editForm.feeMode = 'custom'"
              >自由設定</button>
            </div>
          </div>

          <!-- デフォルト表示 -->
          <div v-if="editForm.feeMode === 'default'" class="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div class="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>ALRD</span><span class="font-bold">10%</span>
            </div>
            <div class="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>組合費</span><span class="font-bold">15%</span>
            </div>
            <div class="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>テクニカルフィー</span><span class="font-bold">35%</span>
            </div>
            <div class="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>プランナーフィー</span><span class="font-bold">40%</span>
            </div>
          </div>

          <!-- 自由設定 -->
          <div v-else class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="label text-xs">ALRD（%）</label>
                <input v-model.number="editForm.feeDist.alrd" type="number" min="0" max="100" class="input text-sm" />
              </div>
              <div>
                <label class="label text-xs">組合費（%）</label>
                <input v-model.number="editForm.feeDist.union" type="number" min="0" max="100" class="input text-sm" />
              </div>
              <div>
                <label class="label text-xs">テクニカルフィー（%）</label>
                <input v-model.number="editForm.feeDist.technical" type="number" min="0" max="100" class="input text-sm" />
              </div>
              <div>
                <label class="label text-xs">プランナーフィー（%）</label>
                <input v-model.number="editForm.feeDist.planner" type="number" min="0" max="100" class="input text-sm" />
              </div>
            </div>
            <div :class="['text-xs text-right font-medium', feeDistTotal === 100 ? 'text-emerald-600' : 'text-red-500']">
              合計: {{ feeDistTotal }}%{{ feeDistTotal === 100 ? ' ✓' : '（100%になるよう調整してください）' }}
            </div>
          </div>
        </div>

        <!-- 純利益プレビュー -->
        <div v-if="editForm.soldPrice && editForm.soldPrice > 0" class="p-3 bg-emerald-50 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="font-medium text-emerald-800">純利益目安</span>
            <span class="font-bold text-emerald-700 text-base">¥{{ editNetProfit.toLocaleString() }}</span>
          </div>
          <div class="space-y-1 text-xs text-emerald-700 border-t border-emerald-200 pt-2">
            <div class="flex justify-between">
              <span>ALRD（{{ activeDist.alrd }}%）</span>
              <span class="font-mono">¥{{ Math.round(editNetProfit * activeDist.alrd / 100).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>組合費（{{ activeDist.union }}%）</span>
              <span class="font-mono">¥{{ Math.round(editNetProfit * activeDist.union / 100).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>テクニカルフィー（{{ activeDist.technical }}%）</span>
              <span class="font-mono">¥{{ Math.round(editNetProfit * activeDist.technical / 100).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>プランナーフィー（{{ activeDist.planner }}%）</span>
              <span class="font-mono">¥{{ Math.round(editNetProfit * activeDist.planner / 100).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="label">出品URL</label>
          <input v-model="editForm.listingUrl" class="input" placeholder="https://..." />
        </div>
        <div>
          <label class="label">担当メンバー</label>
          <select v-model="editForm.assignedMemberId" class="input">
            <option value="">未割当</option>
            <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">備考</label>
          <textarea v-model="editForm.notes" class="input" rows="2"></textarea>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showEditForm = false">キャンセル</button>
          <button class="btn-primary" @click="saveEdit"
            :disabled="!editForm.name || (editForm.feeMode === 'custom' && feeDistTotal !== 100)">
            <Check class="w-4 h-4" />保存
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
