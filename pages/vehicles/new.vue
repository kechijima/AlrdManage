<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { mockMembers, mockFPs, mockCustomers } from '~/data/mock'

const type = ref<'inventory' | 'order' | 'consignment'>('inventory')
const form = reactive({
  maker: '', model: '', pickupLocation: '',
  year: new Date().getFullYear(), mileage: 0,
  vin: '', color: '', engineCC: undefined as number | undefined,
  inspectionDate: '', purchasePrice: 0, purchaseFrom: '', purchasedAt: '',
  listPrice: 0, consignmentOwnerId: '', assignedMemberId: '', referredByFpId: '',
  notes: '',
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="車両登録" />
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto space-y-5">
        <NuxtLink to="/vehicles" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft class="w-4 h-4" />戻る
        </NuxtLink>

        <!-- Type selector -->
        <div class="card p-5">
          <label class="label">販売タイプ <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-3 gap-3 mt-1">
            <button
              v-for="t in [{ key: 'inventory', label: '在庫販売', desc: '仕入れて在庫' }, { key: 'order', label: '注文販売', desc: '受注後仕入れ' }, { key: 'consignment', label: '委託販売', desc: '在庫を持たない' }]"
              :key="t.key"
              :class="['p-3 rounded-xl border-2 text-left transition-all', type === t.key ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300']"
              @click="type = t.key as any"
            >
              <p :class="['text-sm font-semibold', type === t.key ? 'text-brand-700' : 'text-gray-700']">{{ t.label }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ t.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">基本情報</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">メーカー <span class="text-red-500">*</span></label>
              <input v-model="form.maker" class="input" placeholder="トヨタ" />
            </div>
            <div>
              <label class="label">車種 <span class="text-red-500">*</span></label>
              <input v-model="form.model" class="input" placeholder="アルファード" />
            </div>
            <!-- pickupLocation spans full width — it's the unique key with maker+model -->
            <div class="col-span-2">
              <label class="label">
                引き取り場所 <span class="text-red-500">*</span>
                <span class="ml-1 text-xs text-gray-400 font-normal">(車名との組み合わせで一意に管理)</span>
              </label>
              <input v-model="form.pickupLocation" class="input" placeholder="例: 東京オートオークション（足立）" />
            </div>
            <div>
              <label class="label">年式 <span class="text-red-500">*</span></label>
              <input v-model.number="form.year" type="number" class="input" />
            </div>
            <div>
              <label class="label">走行距離 (km) <span class="text-red-500">*</span></label>
              <input v-model.number="form.mileage" type="number" class="input" />
            </div>
            <div>
              <label class="label">カラー</label>
              <input v-model="form.color" class="input" placeholder="パールホワイト" />
            </div>
            <div>
              <label class="label">排気量 (cc)</label>
              <input v-model.number="form.engineCC" type="number" class="input" />
            </div>
            <div class="col-span-2">
              <label class="label">車台番号 (VIN)</label>
              <input v-model="form.vin" class="input" placeholder="JTXXX..." />
            </div>
            <div>
              <label class="label">車検満了日</label>
              <input v-model="form.inspectionDate" type="date" class="input" />
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">価格情報</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="type !== 'consignment'">
              <label class="label">仕入れ価格 (円) <span class="text-red-500">*</span></label>
              <input v-model.number="form.purchasePrice" type="number" class="input" />
            </div>
            <div>
              <label class="label">販売予定価格 (円) <span class="text-red-500">*</span></label>
              <input v-model.number="form.listPrice" type="number" class="input" />
            </div>
            <div v-if="type !== 'consignment'">
              <label class="label">仕入れ先</label>
              <input v-model="form.purchaseFrom" class="input" placeholder="東京オートオークション" />
            </div>
            <div v-if="type !== 'consignment'">
              <label class="label">仕入れ日</label>
              <input v-model="form.purchasedAt" type="date" class="input" />
            </div>
            <div v-if="type === 'consignment'" class="col-span-2">
              <label class="label">委託オーナー</label>
              <select v-model="form.consignmentOwnerId" class="input">
                <option value="">選択してください</option>
                <option v-for="c in mockCustomers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Assignment -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">担当・紹介</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">担当メンバー</label>
              <select v-model="form.assignedMemberId" class="input">
                <option value="">選択してください</option>
                <option v-for="m in mockMembers" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">FP紹介</label>
              <select v-model="form.referredByFpId" class="input">
                <option value="">なし</option>
                <option v-for="fp in mockFPs" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label">備考</label>
            <textarea v-model="form.notes" class="input" rows="3" placeholder="特記事項があれば入力..."></textarea>
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <NuxtLink to="/vehicles" class="btn-secondary">キャンセル</NuxtLink>
          <button class="btn-primary">登録する</button>
        </div>

      </div>
    </main>
  </div>
</template>
