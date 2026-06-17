<script setup lang="ts">
import { Plus, UserCog, Mail, Shield, Car, Package, LayoutGrid, X, Check } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { MemberDivision, MemberRole } from '~/types'

const store = useAppStore()

const roleLabels: Record<MemberRole, string> = { admin: '管理者', staff: 'スタッフ', viewer: '閲覧のみ' }
const roleColors: Record<MemberRole, string> = {
  admin: 'bg-red-100 text-red-700',
  staff: 'bg-brand-100 text-brand-700',
  viewer: 'bg-gray-100 text-gray-600',
}
const divisionLabels: Record<MemberDivision, string> = { vehicle: '車担当', goods: '古物担当', both: '両方' }
const divisionColors: Record<MemberDivision, string> = {
  vehicle: 'bg-blue-100 text-blue-700',
  goods: 'bg-amber-100 text-amber-700',
  both: 'bg-purple-100 text-purple-700',
}
const divisionIcons: Record<MemberDivision, any> = { vehicle: Car, goods: Package, both: LayoutGrid }

const memberStats = computed(() => store.members.map(m => ({
  ...m,
  taskCount: store.tasks.filter(t => t.assignedMemberId === m.id && t.status !== 'done').length,
  doneCount: store.tasks.filter(t => t.assignedMemberId === m.id && t.status === 'done').length,
})))

// ===== 編集モーダル =====
const editTarget = ref<string | null>(null)
const editForm = reactive({ division: 'both' as MemberDivision, role: 'staff' as MemberRole })

const openEdit = (m: typeof memberStats.value[0]) => {
  editTarget.value = m.id
  editForm.division = m.division
  editForm.role = m.role
}
const saveEdit = () => {
  if (!editTarget.value) return
  store.updateMember(editTarget.value, { division: editForm.division, role: editForm.role })
  editTarget.value = null
}

// ===== 新規追加モーダル =====
const showAddModal = ref(false)
const addForm = reactive({ name: '', email: '', role: 'staff' as MemberRole, division: 'both' as MemberDivision })
const addMember = () => {
  if (!addForm.name || !addForm.email) return
  store.addMember({ ...addForm, branchId: 'b1', status: 'active' })
  Object.assign(addForm, { name: '', email: '', role: 'staff', division: 'both' })
  showAddModal.value = false
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="メンバー管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <div class="card p-4 flex justify-between items-center">
        <div>
          <h2 class="text-sm font-semibold text-gray-700">メンバー一覧</h2>
          <p class="text-xs text-gray-400 mt-0.5">{{ store.members.length }}名</p>
        </div>
        <button class="btn-primary" @click="showAddModal = true"><Plus class="w-4 h-4" />メンバー追加</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="m in memberStats" :key="m.id" class="card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold">
                {{ m.name[0] }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ m.name }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <Mail class="w-3.5 h-3.5 text-gray-400" />
                  <span class="text-xs text-gray-500">{{ m.email }}</span>
                </div>
              </div>
            </div>
            <span :class="['badge', roleColors[m.role]]">{{ roleLabels[m.role] }}</span>
          </div>

          <div class="mb-4">
            <span :class="['badge gap-1.5', divisionColors[m.division]]">
              <component :is="divisionIcons[m.division]" class="w-3 h-3" />
              {{ divisionLabels[m.division] }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-3 bg-blue-50 rounded-lg text-center">
              <p class="text-xl font-bold text-blue-700">{{ m.taskCount }}</p>
              <p class="text-xs text-blue-600 mt-0.5">進行中タスク</p>
            </div>
            <div class="p-3 bg-green-50 rounded-lg text-center">
              <p class="text-xl font-bold text-green-700">{{ m.doneCount }}</p>
              <p class="text-xs text-green-600 mt-0.5">完了タスク</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn-secondary flex-1 text-xs py-1.5 justify-center" @click="openEdit(m)">
              <UserCog class="w-3.5 h-3.5" />編集
            </button>
            <button class="btn-secondary flex-1 text-xs py-1.5 justify-center">
              <Shield class="w-3.5 h-3.5" />権限変更
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- 編集モーダル -->
    <div v-if="editTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">メンバー編集</h3>
          <button @click="editTarget = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">担当区分</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            <button v-for="(label, key) in divisionLabels" :key="key"
              :class="['p-2.5 rounded-lg border-2 text-xs font-medium transition-all text-center',
                editForm.division === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600']"
              @click="editForm.division = key as MemberDivision">
              {{ label }}
            </button>
          </div>
        </div>
        <div>
          <label class="label">権限</label>
          <select v-model="editForm.role" class="input">
            <option v-for="(label, key) in roleLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="editTarget = null">キャンセル</button>
          <button class="btn-primary" @click="saveEdit"><Check class="w-4 h-4" />保存</button>
        </div>
      </div>
    </div>

    <!-- 新規追加モーダル -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">メンバー追加</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">氏名 <span class="text-red-500">*</span></label>
          <input v-model="addForm.name" class="input" placeholder="田中 太郎" />
        </div>
        <div>
          <label class="label">メールアドレス <span class="text-red-500">*</span></label>
          <input v-model="addForm.email" type="email" class="input" placeholder="tanaka@alrd.co.jp" />
        </div>
        <div>
          <label class="label">担当区分</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            <button v-for="(label, key) in divisionLabels" :key="key"
              :class="['p-2.5 rounded-lg border-2 text-xs font-medium transition-all text-center',
                addForm.division === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600']"
              @click="addForm.division = key as MemberDivision">
              {{ label }}
            </button>
          </div>
        </div>
        <div>
          <label class="label">権限</label>
          <select v-model="addForm.role" class="input">
            <option v-for="(label, key) in roleLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showAddModal = false">キャンセル</button>
          <button class="btn-primary" @click="addMember" :disabled="!addForm.name || !addForm.email">
            <Check class="w-4 h-4" />追加
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
