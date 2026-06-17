<script setup lang="ts">
import { Plus, AlertCircle, Clock, CheckCircle, Car, ShoppingCart, Package, X, Check, Pencil, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import type { TaskPriority, TaskStatus } from '~/types'

const store = useAppStore()

// ===== タスク追加モーダル =====
const showAdd = ref(false)
const addForm = reactive({ title: '', description: '', priority: 'medium' as TaskPriority, assignedMemberId: '', dueDate: '', status: 'todo' as TaskStatus })
const submitAdd = () => {
  if (!addForm.title) return
  store.addTask({
    title: addForm.title,
    description: addForm.description || undefined,
    priority: addForm.priority,
    status: addForm.status,
    assignedMemberId: addForm.assignedMemberId || undefined,
    dueDate: addForm.dueDate || undefined,
    branchId: 'b1',
    createdById: 'm1',
  })
  Object.assign(addForm, { title: '', description: '', priority: 'medium', assignedMemberId: '', dueDate: '', status: 'todo' })
  showAdd.value = false
}

// ===== タスク詳細モーダル =====
const selectedTask = ref<typeof store.tasks[0] | null>(null)
const openDetail = (t: typeof store.tasks[0]) => { selectedTask.value = t }
const closeDetail = () => { selectedTask.value = null }

// ===== タスク編集モーダル =====
const showEdit = ref(false)
const editForm = reactive({ title: '', description: '', priority: 'medium' as TaskPriority, assignedMemberId: '', dueDate: '', status: 'todo' as TaskStatus })
const openEdit = (t: typeof store.tasks[0]) => {
  Object.assign(editForm, {
    title: t.title,
    description: t.description ?? '',
    priority: t.priority,
    assignedMemberId: t.assignedMemberId ?? '',
    dueDate: t.dueDate ?? '',
    status: t.status,
  })
  showEdit.value = true
}
const saveEdit = () => {
  if (!selectedTask.value || !editForm.title) return
  store.updateTask(selectedTask.value.id, {
    title: editForm.title,
    description: editForm.description || undefined,
    priority: editForm.priority,
    assignedMemberId: editForm.assignedMemberId || undefined,
    dueDate: editForm.dueDate || undefined,
    status: editForm.status,
  })
  selectedTask.value = store.tasks.find(t => t.id === selectedTask.value?.id) ?? null
  showEdit.value = false
}

// ===== タスク削除 =====
const deleteTask = (id: string) => {
  store.removeTask(id)
  selectedTask.value = null
}

const filterStatus = ref<TaskStatus | 'all'>('all')
const filterMember = ref('all')
const viewMode = ref<'board' | 'list'>('board')

const getMember = (id?: string) => store.members.find(m => m.id === id)

const getRelatedLabel = (type?: string, id?: string) => {
  if (!type || !id) return null
  if (type === 'vehicle') { const v = store.vehicles.find(v => v.id === id); return v ? `${v.maker} ${v.model}` : null }
  if (type === 'sale') return `販売#${id}`
  if (type === 'goods') { const g = store.goods.find(g => g.id === id); return g?.name ?? null }
  return null
}

const relatedIcon: Record<string, any> = { vehicle: Car, sale: ShoppingCart, goods: Package }

const priorityColors: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}
const priorityLabels: Record<TaskPriority, string> = { high: '高', medium: '中', low: '低' }
const statusLabels: Record<TaskStatus, string> = { todo: '未着手', inProgress: '進行中', done: '完了', cancelled: 'キャンセル' }

const filtered = computed(() => store.tasks.filter(t => {
  const matchStatus = filterStatus.value === 'all' || t.status === filterStatus.value
  const matchMember = filterMember.value === 'all' || t.assignedMemberId === filterMember.value
  return matchStatus && matchMember
}))

const columns = [
  { key: 'todo', label: '未着手', icon: Clock, color: 'text-gray-500' },
  { key: 'inProgress', label: '進行中', icon: AlertCircle, color: 'text-blue-500' },
  { key: 'done', label: '完了', icon: CheckCircle, color: 'text-green-500' },
]
const getColumnTasks = (status: string) => filtered.value.filter(t => t.status === status)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="タスク管理" />
    <main class="flex-1 overflow-hidden flex flex-col p-6 gap-4">

      <!-- Toolbar -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="filterMember" class="input w-auto text-sm">
            <option value="all">全メンバー</option>
            <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <div class="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              v-for="view in [{ key: 'board', label: 'ボード' }, { key: 'list', label: 'リスト' }]"
              :key="view.key"
              :class="['px-3 py-1.5 text-sm transition-colors', viewMode === view.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
              @click="viewMode = view.key as any"
            >{{ view.label }}</button>
          </div>
          <button class="btn-primary ml-auto" @click="showAdd = true"><Plus class="w-4 h-4" />タスク追加</button>
        </div>
      </div>

      <!-- Board View -->
      <div v-if="viewMode === 'board'" class="flex-1 overflow-x-auto">
        <div class="flex gap-4 h-full min-w-max">
          <div v-for="col in columns" :key="col.key" class="w-72 flex flex-col bg-gray-100/60 rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60">
              <component :is="col.icon" :class="['w-4 h-4', col.color]" />
              <span class="text-sm font-semibold text-gray-700">{{ col.label }}</span>
              <span class="ml-auto text-xs bg-white rounded-full px-2 py-0.5 text-gray-500 font-medium">{{ getColumnTasks(col.key).length }}</span>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-3">
              <div
                v-for="t in getColumnTasks(col.key)"
                :key="t.id"
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                @click="openDetail(t)"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <p class="text-sm font-medium text-gray-900 leading-snug">{{ t.title }}</p>
                  <span :class="['badge flex-shrink-0', priorityColors[t.priority]]">{{ priorityLabels[t.priority] }}</span>
                </div>
                <div v-if="t.description" class="text-xs text-gray-400 mb-2 line-clamp-2">{{ t.description }}</div>
                <div v-if="t.relatedType && t.relatedId" class="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
                  <component :is="relatedIcon[t.relatedType]" class="w-3.5 h-3.5" />
                  <span>{{ getRelatedLabel(t.relatedType, t.relatedId) }}</span>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <div v-if="t.dueDate" class="flex items-center gap-1 text-xs text-gray-400">
                    <Clock class="w-3 h-3" />{{ t.dueDate }}
                  </div>
                  <div v-if="getMember(t.assignedMemberId)" class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold ml-auto">
                    {{ getMember(t.assignedMemberId)?.name[0] }}
                  </div>
                </div>
              </div>
              <div v-if="getColumnTasks(col.key).length === 0" class="text-center py-6 text-xs text-gray-400">
                タスクなし
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="card overflow-hidden flex-1 overflow-y-auto">
        <table class="w-full">
          <thead class="sticky top-0">
            <tr class="border-b border-gray-200">
              <th class="table-header">タスク</th>
              <th class="table-header">優先度</th>
              <th class="table-header">関連</th>
              <th class="table-header">担当</th>
              <th class="table-header">期日</th>
              <th class="table-header">ステータス</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in filtered" :key="t.id" class="hover:bg-gray-50 cursor-pointer" @click="openDetail(t)">
              <td class="table-cell font-medium">{{ t.title }}</td>
              <td class="table-cell">
                <span :class="['badge', priorityColors[t.priority]]">{{ priorityLabels[t.priority] }}</span>
              </td>
              <td class="table-cell text-sm text-gray-500">
                <span v-if="t.relatedType">{{ getRelatedLabel(t.relatedType, t.relatedId) }}</span>
                <span v-else>—</span>
              </td>
              <td class="table-cell">
                <div v-if="getMember(t.assignedMemberId)" class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {{ getMember(t.assignedMemberId)?.name[0] }}
                  </div>
                  <span class="text-sm">{{ getMember(t.assignedMemberId)?.name }}</span>
                </div>
              </td>
              <td class="table-cell text-sm text-gray-500">{{ t.dueDate ?? '—' }}</td>
              <td class="table-cell"><StatusBadge :status="t.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- タスク追加モーダル -->
    <div v-if="showAdd" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">タスク追加</h3>
          <button @click="showAdd = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">タイトル <span class="text-red-500">*</span></label>
          <input v-model="addForm.title" class="input" placeholder="名義変更書類を確認する" />
        </div>
        <div>
          <label class="label">詳細</label>
          <textarea v-model="addForm.description" class="input" rows="2" placeholder="詳細メモ..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">優先度</label>
            <select v-model="addForm.priority" class="input">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="addForm.status" class="input">
              <option value="todo">未着手</option>
              <option value="inProgress">進行中</option>
              <option value="done">完了</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">担当者</label>
          <select v-model="addForm.assignedMemberId" class="input">
            <option value="">未割当</option>
            <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">期日</label>
          <input v-model="addForm.dueDate" type="date" class="input" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showAdd = false">キャンセル</button>
          <button class="btn-primary" @click="submitAdd" :disabled="!addForm.title">
            <Check class="w-4 h-4" />追加
          </button>
        </div>
      </div>
    </div>

    <!-- タスク詳細モーダル -->
    <div v-if="selectedTask && !showEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span :class="['badge', priorityColors[selectedTask.priority]]">{{ priorityLabels[selectedTask.priority] }}</span>
            <StatusBadge :status="selectedTask.status" />
          </div>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600 flex-shrink-0"><X class="w-5 h-5" /></button>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{{ selectedTask.title }}</h3>
        <p v-if="selectedTask.description" class="text-sm text-gray-600">{{ selectedTask.description }}</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">担当者</span>
            <span class="font-medium">{{ getMember(selectedTask.assignedMemberId)?.name ?? '未割当' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">期日</span>
            <span>{{ selectedTask.dueDate ?? '—' }}</span>
          </div>
          <div v-if="selectedTask.relatedType && selectedTask.relatedId" class="flex justify-between">
            <span class="text-gray-500">関連</span>
            <span>{{ getRelatedLabel(selectedTask.relatedType, selectedTask.relatedId) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">作成日</span>
            <span>{{ selectedTask.createdAt }}</span>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-gray-100">
          <button class="btn-secondary flex-1 justify-center text-sm" @click="openEdit(selectedTask)">
            <Pencil class="w-4 h-4" />編集
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" @click="deleteTask(selectedTask.id)">
            <Trash2 class="w-4 h-4" />削除
          </button>
        </div>
      </div>
    </div>

    <!-- タスク編集モーダル -->
    <div v-if="showEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">タスクを編集</h3>
          <button @click="showEdit = false; selectedTask = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div>
          <label class="label">タイトル <span class="text-red-500">*</span></label>
          <input v-model="editForm.title" class="input" />
        </div>
        <div>
          <label class="label">詳細</label>
          <textarea v-model="editForm.description" class="input" rows="2"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">優先度</label>
            <select v-model="editForm.priority" class="input">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label class="label">ステータス</label>
            <select v-model="editForm.status" class="input">
              <option value="todo">未着手</option>
              <option value="inProgress">進行中</option>
              <option value="done">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">担当者</label>
          <select v-model="editForm.assignedMemberId" class="input">
            <option value="">未割当</option>
            <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">期日</label>
          <input v-model="editForm.dueDate" type="date" class="input" />
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-secondary" @click="showEdit = false">キャンセル</button>
          <button class="btn-primary" @click="saveEdit" :disabled="!editForm.title">
            <Check class="w-4 h-4" />保存
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
