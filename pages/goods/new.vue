<script setup lang="ts">
import { ArrowLeft, Upload, X, FileText, ImageIcon } from 'lucide-vue-next'
import { MERCARI_CATEGORIES } from '~/types'
import { useAppStore } from '~/stores/app'

const store = useAppStore()
const router = useRouter()

const form = reactive({
  name: '', mainCategory: '', subCategory: '', condition: '',
  sourceFpId: '', sourceCustomerId: '',
  receivedAt: '', assessedValue: undefined as number | undefined,
  platform: '', listingPrice: undefined as number | undefined,
  assignedMemberId: '', notes: '',
})

const subCategories = computed(() => {
  return form.mainCategory ? MERCARI_CATEGORIES[form.mainCategory] ?? [] : []
})

watch(() => form.mainCategory, () => {
  form.subCategory = ''
})

const attachments = ref<{ name: string; type: string }[]>([])

const submit = () => {
  if (!form.name || !form.mainCategory || !form.sourceFpId || !form.sourceCustomerId) return
  store.addGoods({
    name: form.name,
    mainCategory: form.mainCategory,
    subCategory: form.subCategory,
    condition: form.condition,
    sourceFpId: form.sourceFpId,
    sourceCustomerId: form.sourceCustomerId,
    receivedAt: form.receivedAt || new Date().toISOString().slice(0, 10),
    assessedValue: form.assessedValue,
    platform: (form.platform as any) || undefined,
    listingPrice: form.listingPrice,
    assignedMemberId: form.assignedMemberId || undefined,
    notes: form.notes || undefined,
    branchId: 'b1',
    status: 'received',
  })
  router.push('/goods')
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(f => {
    attachments.value.push({ name: f.name, type: f.type.startsWith('image') ? 'image' : 'pdf' })
  })
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="古物商品登録" />
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto space-y-5">
        <NuxtLink to="/goods" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft class="w-4 h-4" />戻る
        </NuxtLink>

        <!-- Basic -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">商品情報</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="label">商品名 <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="input" placeholder="ルイヴィトン ショルダーバッグ" />
            </div>
            <!-- メルカリカテゴリ（大カテゴリ → 小カテゴリ） -->
            <div>
              <label class="label">大カテゴリ <span class="text-red-500">*</span></label>
              <select v-model="form.mainCategory" class="input">
                <option value="">選択してください</option>
                <option v-for="cat in Object.keys(MERCARI_CATEGORIES)" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="label">小カテゴリ <span class="text-red-500">*</span></label>
              <select v-model="form.subCategory" class="input" :disabled="!form.mainCategory">
                <option value="">{{ form.mainCategory ? '選択してください' : '大カテゴリを先に選択' }}</option>
                <option v-for="sub in subCategories" :key="sub" :value="sub">{{ sub }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="label">状態</label>
              <select v-model="form.condition" class="input">
                <option value="">選択してください</option>
                <option value="S">S（未使用）</option>
                <option value="A">A（良好）</option>
                <option value="AB">AB（やや良）</option>
                <option value="B">B（使用感あり）</option>
                <option value="C">C（傷あり）</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Source -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">受領情報</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">取次FP <span class="text-red-500">*</span></label>
              <select v-model="form.sourceFpId" class="input">
                <option value="">選択してください</option>
                <option v-for="fp in store.fps" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">提供者（FP顧客）<span class="text-red-500">*</span></label>
              <select v-model="form.sourceCustomerId" class="input">
                <option value="">選択してください</option>
                <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">受領日 <span class="text-red-500">*</span></label>
              <input v-model="form.receivedAt" type="date" class="input" />
            </div>
            <div>
              <label class="label">査定額（円）</label>
              <input v-model.number="form.assessedValue" type="number" class="input" />
            </div>
          </div>
        </div>

        <!-- Sales -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">販売予定</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">出品プラットフォーム</label>
              <select v-model="form.platform" class="input">
                <option value="">未定</option>
                <option value="mercari">メルカリ</option>
                <option value="yahoo_auction">ヤフオク</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label class="label">出品予定価格（円）</label>
              <input v-model.number="form.listingPrice" type="number" class="input" />
            </div>
            <div>
              <label class="label">担当メンバー</label>
              <select v-model="form.assignedMemberId" class="input">
                <option value="">選択してください</option>
                <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">添付ファイル（受領証・査定書など）</h3>
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors">
            <Upload class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">PDF・画像ファイルをドロップ、または</p>
            <label class="mt-2 inline-block">
              <span class="btn-secondary text-xs cursor-pointer">ファイルを選択</span>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handleFileChange" />
            </label>
            <p class="text-xs text-gray-400 mt-1">PDF, JPG, PNG 対応</p>
          </div>
          <div v-if="attachments.length" class="space-y-2">
            <div v-for="(f, i) in attachments" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText v-if="f.type === 'pdf'" class="w-5 h-5 text-red-500" />
              <ImageIcon v-else class="w-5 h-5 text-blue-500" />
              <span class="text-sm text-gray-700 flex-1">{{ f.name }}</span>
              <button @click="attachments.splice(i, 1)" class="text-gray-400 hover:text-red-500">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card p-5">
          <label class="label">備考</label>
          <textarea v-model="form.notes" class="input" rows="3" placeholder="特記事項があれば入力..."></textarea>
        </div>

        <div class="flex gap-3 justify-end">
          <NuxtLink to="/goods" class="btn-secondary">キャンセル</NuxtLink>
          <button class="btn-primary" @click="submit">登録する</button>
        </div>

      </div>
    </main>
  </div>
</template>
