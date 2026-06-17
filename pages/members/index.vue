<script setup lang="ts">
import { Plus, UserCog, Mail, Shield, Car, Package, LayoutGrid } from 'lucide-vue-next'
import { mockMembers, mockTasks } from '~/data/mock'
import type { MemberDivision } from '~/types'

const roleLabels: Record<string, string> = { admin: '管理者', staff: 'スタッフ', viewer: '閲覧のみ' }
const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  staff: 'bg-brand-100 text-brand-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const divisionLabels: Record<MemberDivision, string> = {
  vehicle: '車担当',
  goods: '古物担当',
  both: '両方',
}
const divisionColors: Record<MemberDivision, string> = {
  vehicle: 'bg-blue-100 text-blue-700',
  goods: 'bg-amber-100 text-amber-700',
  both: 'bg-purple-100 text-purple-700',
}
const divisionIcons: Record<MemberDivision, any> = {
  vehicle: Car,
  goods: Package,
  both: LayoutGrid,
}

const memberStats = computed(() => mockMembers.map(m => ({
  ...m,
  taskCount: mockTasks.filter(t => t.assignedMemberId === m.id && t.status !== 'done').length,
  doneCount: mockTasks.filter(t => t.assignedMemberId === m.id && t.status === 'done').length,
})))
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="メンバー管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <div class="card p-4 flex justify-between items-center">
        <div>
          <h2 class="text-sm font-semibold text-gray-700">メンバー一覧</h2>
          <p class="text-xs text-gray-400 mt-0.5">{{ mockMembers.length }}名</p>
        </div>
        <button class="btn-primary"><Plus class="w-4 h-4" />メンバー追加</button>
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

          <!-- 担当区分バッジ -->
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
            <button class="btn-secondary flex-1 text-xs py-1.5 justify-center">
              <UserCog class="w-3.5 h-3.5" />編集
            </button>
            <button class="btn-secondary flex-1 text-xs py-1.5 justify-center">
              <Shield class="w-3.5 h-3.5" />権限変更
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>
