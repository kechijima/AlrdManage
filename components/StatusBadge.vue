<script setup lang="ts">
const props = defineProps<{ status: string }>()

const config: Record<string, { label: string; class: string }> = {
  inStock:      { label: '在庫中',     class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  negotiating:  { label: '商談中',     class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  ordered:      { label: '受注済',     class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  purchasing:   { label: '仕入れ中',   class: 'bg-orange-50 text-orange-700 border border-orange-200' },
  arrived:      { label: '入庫済',     class: 'bg-cyan-50 text-cyan-700 border border-cyan-200' },
  consigning:   { label: '委託中',     class: 'bg-purple-50 text-purple-700 border border-purple-200' },
  contracted:   { label: '成約',       class: 'bg-brand-50 text-brand-700 border border-brand-200' },
  nameTransfer: { label: '名義変更中', class: 'bg-pink-50 text-pink-700 border border-pink-200' },
  delivered:    { label: '納車済',     class: 'bg-gray-100 text-gray-500 border border-gray-200' },
  settled:      { label: '精算済',     class: 'bg-gray-100 text-gray-500 border border-gray-200' },
  cancelled:    { label: 'キャンセル', class: 'bg-red-50 text-red-600 border border-red-200' },
  received:     { label: '受領済',     class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  assessing:    { label: '査定中',     class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  preparing:    { label: '出品準備',   class: 'bg-orange-50 text-orange-700 border border-orange-200' },
  listed:       { label: '出品中',     class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  sold:         { label: '売却済',     class: 'bg-brand-50 text-brand-700 border border-brand-200' },
  withdrawn:    { label: '取下げ',     class: 'bg-red-50 text-red-600 border border-red-200' },
  todo:         { label: '未着手',     class: 'bg-gray-100 text-gray-500 border border-gray-200' },
  inProgress:   { label: '進行中',     class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  done:         { label: '完了',       class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  applying:     { label: '申込中',     class: 'bg-orange-50 text-orange-700 border border-orange-200' },
  reviewing:    { label: '審査中',     class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved:     { label: '承認',       class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected:     { label: '否決',       class: 'bg-red-50 text-red-600 border border-red-200' },
}

const item = computed(() => config[props.status] ?? { label: props.status, class: 'bg-gray-100 text-gray-500' })
</script>

<template>
  <span :class="['badge', item.class]">{{ item.label }}</span>
</template>
