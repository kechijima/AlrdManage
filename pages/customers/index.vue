<script setup lang="ts">
import { Plus, Search, User } from 'lucide-vue-next'
import { mockCustomers, mockFPs } from '~/data/mock'

const search = ref('')
const filtered = computed(() =>
  mockCustomers.filter(c => !search.value || `${c.name} ${c.nameKana}`.includes(search.value))
)
const getFP = (id?: string) => mockFPs.find(f => f.id === id)
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <AppHeader title="顧客管理" />
    <main class="flex-1 overflow-y-auto p-6 space-y-4">

      <div class="card p-4 flex items-center gap-3">
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
          <Search class="w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="氏名・フリガナで検索..." class="bg-transparent text-sm focus:outline-none w-full" />
        </div>
        <button class="btn-primary"><Plus class="w-4 h-4" />顧客登録</button>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="table-header">氏名</th>
                <th class="table-header">電話番号</th>
                <th class="table-header">メールアドレス</th>
                <th class="table-header">FP紹介</th>
                <th class="table-header">住所</th>
                <th class="table-header">登録日</th>
                <th class="table-header"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in filtered" :key="c.id" class="hover:bg-gray-50">
                <td class="table-cell">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User class="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p class="font-medium">{{ c.name }}</p>
                      <p class="text-xs text-gray-400">{{ c.nameKana }}</p>
                    </div>
                  </div>
                </td>
                <td class="table-cell text-sm">{{ c.phone }}</td>
                <td class="table-cell text-sm text-gray-500">{{ c.email }}</td>
                <td class="table-cell text-sm">
                  <span v-if="getFP(c.referredByFpId)" class="badge bg-purple-100 text-purple-700">
                    {{ getFP(c.referredByFpId)?.name }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="table-cell text-sm text-gray-500 truncate max-w-40">{{ c.address }}</td>
                <td class="table-cell text-sm text-gray-400">{{ c.createdAt }}</td>
                <td class="table-cell">
                  <NuxtLink :to="`/customers/${c.id}`" class="text-brand-600 hover:underline text-sm">詳細</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          {{ filtered.length }}件
        </div>
      </div>
    </main>
  </div>
</template>
