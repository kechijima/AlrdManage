import { defineStore } from 'pinia'
import {
  mockVehicles, mockExpenses, mockMembers, mockFPs, mockCustomers,
  mockSales, mockGoods, mockTasks, mockFeePatterns, mockProspects,
} from '~/data/mock'
import type {
  Vehicle, VehicleExpense, Member, FP, Customer, Sale,
  GoodsItem, Task, FeePattern, Prospect,
} from '~/types'

export const useAppStore = defineStore('app', () => {
  const vehicles   = ref<Vehicle[]>([...mockVehicles])
  const expenses   = ref<VehicleExpense[]>([...mockExpenses])
  const members    = ref<Member[]>([...mockMembers])
  const fps        = ref<FP[]>([...mockFPs])
  const customers  = ref<Customer[]>([...mockCustomers])
  const sales      = ref<Sale[]>([...mockSales])
  const goods      = ref<GoodsItem[]>([...mockGoods])
  const tasks      = ref<Task[]>([...mockTasks])
  const feePatterns = ref<FeePattern[]>([...mockFeePatterns])
  const prospects  = ref<Prospect[]>([...mockProspects])

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const today = () => new Date().toISOString().slice(0, 10)

  // ===== Vehicle =====
  function addVehicle(data: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle {
    const v: Vehicle = { ...data, id: `v${uid()}`, createdAt: today() }
    vehicles.value.push(v)
    return v
  }
  function updateVehicle(id: string, patch: Partial<Vehicle>) {
    const i = vehicles.value.findIndex(v => v.id === id)
    if (i >= 0) Object.assign(vehicles.value[i], patch)
  }
  function addExpense(data: Omit<VehicleExpense, 'id'>): VehicleExpense {
    const e: VehicleExpense = { ...data, id: `e${uid()}` }
    expenses.value.push(e)
    return e
  }
  function removeExpense(id: string) {
    expenses.value = expenses.value.filter(e => e.id !== id)
  }

  // ===== Member =====
  function addMember(data: Omit<Member, 'id' | 'createdAt'>): Member {
    const m: Member = { ...data, id: `m${uid()}`, createdAt: today() }
    members.value.push(m)
    return m
  }
  function updateMember(id: string, patch: Partial<Member>) {
    const i = members.value.findIndex(m => m.id === id)
    if (i >= 0) Object.assign(members.value[i], patch)
  }

  // ===== FP =====
  function addFP(data: Omit<FP, 'id' | 'createdAt'>): FP {
    const f: FP = { ...data, id: `fp${uid()}`, createdAt: today() }
    fps.value.push(f)
    return f
  }
  function updateFP(id: string, patch: Partial<FP>) {
    const i = fps.value.findIndex(f => f.id === id)
    if (i >= 0) Object.assign(fps.value[i], patch)
  }

  // ===== Customer =====
  function addCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const c: Customer = { ...data, id: `c${uid()}`, createdAt: today() }
    customers.value.push(c)
    return c
  }
  function updateCustomer(id: string, patch: Partial<Customer>) {
    const i = customers.value.findIndex(c => c.id === id)
    if (i >= 0) Object.assign(customers.value[i], patch)
  }

  // ===== GoodsItem =====
  function addGoods(data: Omit<GoodsItem, 'id'>): GoodsItem {
    const g: GoodsItem = { ...data, id: `g${uid()}` }
    goods.value.push(g)
    return g
  }
  function updateGoods(id: string, patch: Partial<GoodsItem>) {
    const i = goods.value.findIndex(g => g.id === id)
    if (i >= 0) Object.assign(goods.value[i], patch)
  }

  // ===== Sale =====
  function addSale(data: Omit<Sale, 'id'>): Sale {
    const s: Sale = { ...data, id: `s${uid()}` }
    sales.value.push(s)
    return s
  }
  function updateSale(id: string, patch: Partial<Sale>) {
    const i = sales.value.findIndex(s => s.id === id)
    if (i >= 0) Object.assign(sales.value[i], patch)
  }

  // ===== Task =====
  function addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const t: Task = { ...data, id: `t${uid()}`, createdAt: today() }
    tasks.value.push(t)
    return t
  }
  function updateTask(id: string, patch: Partial<Task>) {
    const i = tasks.value.findIndex(t => t.id === id)
    if (i >= 0) Object.assign(tasks.value[i], patch)
  }

  // ===== FeePattern =====
  function addFeePattern(data: Omit<FeePattern, 'id' | 'createdAt'>): FeePattern {
    const f: FeePattern = { ...data, id: `fee${uid()}`, createdAt: today() }
    feePatterns.value.push(f)
    return f
  }
  function updateFeePattern(id: string, patch: Partial<FeePattern>) {
    const i = feePatterns.value.findIndex(f => f.id === id)
    if (i >= 0) Object.assign(feePatterns.value[i], patch)
  }

  // ===== Prospect =====
  function addProspect(data: Omit<Prospect, 'id' | 'createdAt'>): Prospect {
    const p: Prospect = { ...data, id: `p${uid()}`, createdAt: today() }
    prospects.value.push(p)
    return p
  }
  function updateProspect(id: string, patch: Partial<Prospect>) {
    const i = prospects.value.findIndex(p => p.id === id)
    if (i >= 0) Object.assign(prospects.value[i], patch)
  }
  function removeProspect(id: string) {
    prospects.value = prospects.value.filter(p => p.id !== id)
  }

  return {
    vehicles, expenses, members, fps, customers, sales, goods, tasks, feePatterns, prospects,
    addVehicle, updateVehicle, addExpense, removeExpense,
    addMember, updateMember,
    addFP, updateFP,
    addCustomer, updateCustomer,
    addGoods, updateGoods,
    addSale, updateSale,
    addTask, updateTask,
    addFeePattern, updateFeePattern,
    addProspect, updateProspect, removeProspect,
  }
})
