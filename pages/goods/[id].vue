<script setup lang="ts">
import { ArrowLeft, Pencil, Upload, FileText, Image as ImageIcon, ExternalLink, Package } from 'lucide-vue-next'
import { mockGoods, mockFPs, mockCustomers, mockMembers } from '~/data/mock'

const route = useRoute()
const item = computed(() => mockGoods.find(g => g.id === route.params.id))
const fp = computed(() => mockFPs.find(f => f.id === item.value?.sourceFpId))
const customer = computed(() => mockCustomers.find(c => c.id === item.value?.sourceCustomerId))
const member = computed(() => mockMembers.find(m => m.id === item.value?.assignedMemberId))

const platformLabels: Record<string, string> = { mercari: 'メルカリ', yahoo_auction: 'ヤフオク', other: 'その他' }

const statusFlow = [
  { key: 'received', label: '受領済' },
  { key: 'assessing', label: '査定中' },
  { key: 'preparing', label: '出品準備' },
  { key: 'listed', label: '出品中' },
  { key: 'sold', label: '売却済' },
  { key: 'settled', label: '精算済' },
]

const currentStep = computed(() => statusFlow.findIndex(s => s.key === item.value?.status))
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
          <button class="btn-secondary"><Pencil class="w-4 h-4" />編集</button>
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
                <p class="text-sm text-gray-500">{{ item.category }} / 状態: {{ item.condition }}</p>
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
              <span class="text-gray-600">手数料 ({{ item.platform === 'mercari' ? '10%' : '—' }})</span>
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
  </div>
</template>
