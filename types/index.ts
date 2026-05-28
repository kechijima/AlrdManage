// ===== 共通 =====
export type Status = 'active' | 'inactive'

// ===== 拠点 =====
export interface Branch {
  id: string
  name: string
  address: string
}

// ===== メンバー =====
export type MemberRole = 'admin' | 'staff' | 'viewer'
export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  branchId: string
  status: Status
  createdAt: string
}

// ===== FP =====
export interface FP {
  id: string
  name: string
  company: string
  phone: string
  email: string
  area: string
  branchId: string
  status: Status
  referralFee?: number
  createdAt: string
}

// ===== 顧客 =====
export interface Customer {
  id: string
  name: string
  nameKana: string
  phone: string
  email: string
  address: string
  referredByFpId?: string
  branchId: string
  createdAt: string
}

// ===== 車両 =====
export type VehicleType = 'inventory' | 'order' | 'consignment'
export type VehicleStatus =
  | 'inStock'       // 在庫中
  | 'negotiating'   // 商談中
  | 'ordered'       // 受注済（注文）
  | 'purchasing'    // 仕入れ中
  | 'arrived'       // 入庫済
  | 'consigning'    // 委託中
  | 'contracted'    // 成約
  | 'nameTransfer'  // 名義変更中
  | 'delivered'     // 納車済
  | 'settled'       // 精算済（委託）
  | 'cancelled'     // キャンセル

export interface Vehicle {
  id: string
  type: VehicleType
  maker: string
  model: string
  year: number
  mileage: number
  vin: string
  color: string
  engineCC?: number
  inspectionDate?: string
  purchasePrice: number
  purchaseFrom?: string
  pickupLocation: string   // 引き取り場所（車名と合わせて一意キー）
  purchasedAt?: string
  listPrice: number
  consignmentOwnerId?: string
  assignedMemberId?: string
  referredByFpId?: string
  branchId: string
  status: VehicleStatus
  notes?: string
  createdAt: string
}

// ===== 車両経費 =====
export type ExpenseCategory =
  | 'purchase'     // 仕入れ費
  | 'maintenance'  // 整備・修理
  | 'transport'    // 陸送費（引き取り・納車）
  | 'travel'       // 交通費（担当者交通費）
  | 'labor'        // 人件費
  | 'misc'         // 諸経費
  | 'registration' // 名義変更
  | 'bodywork'     // 板金・塗装
  | 'insurance'    // 保険
  | 'advertising'  // 広告
  | 'other'        // その他

export interface VehicleExpense {
  id: string
  vehicleId: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  receipt?: string
}

// ===== ローン =====
export type LoanStatus = 'applying' | 'reviewing' | 'approved' | 'rejected' | 'cancelled'
export interface LoanApplication {
  id: string
  saleId: string
  company: string
  amount: number
  term: number
  status: LoanStatus
  appliedAt: string
  resultAt?: string
  notes?: string
}

// ===== 販売 =====
export type SaleStatus =
  | 'negotiating'   // 商談中
  | 'contracted'    // 成約
  | 'nameTransfer'  // 名義変更中
  | 'delivering'    // 納車待ち
  | 'delivered'     // 納車済
  | 'settled'       // 精算済（委託）
  | 'cancelled'     // キャンセル

export type PaymentMethod = 'cash' | 'loan' | 'other'

export interface Sale {
  id: string
  vehicleId: string
  customerId: string
  type: VehicleType
  contractPrice: number
  discount: number
  paymentMethod: PaymentMethod
  contractedAt: string
  deliveryScheduledAt?: string
  deliveredAt?: string
  referredByFpId?: string
  assignedMemberId?: string
  branchId: string
  status: SaleStatus
  notes?: string
  loanApplications?: LoanApplication[]
}

// ===== 古物商品 =====
export type GoodsStatus =
  | 'received'    // 受領済
  | 'assessing'   // 査定中
  | 'preparing'   // 出品準備
  | 'listed'      // 出品中
  | 'sold'        // 売却済
  | 'settled'     // 精算済
  | 'withdrawn'   // 取下げ

export type Platform = 'mercari' | 'yahoo_auction' | 'other'

export interface GoodsItem {
  id: string
  name: string
  category: string
  condition: string
  sourceCustomerId: string
  sourceFpId: string
  receivedAt: string
  assessedValue?: number
  platform?: Platform
  listingPrice?: number
  listedAt?: string
  listingUrl?: string
  soldPrice?: number
  soldAt?: string
  platformFee?: number
  shippingCost?: number
  profit?: number
  assignedMemberId?: string
  branchId: string
  status: GoodsStatus
  notes?: string
  attachments?: GoodsAttachment[]
}

export interface GoodsAttachment {
  id: string
  goodsItemId: string
  type: 'receipt' | 'assessment' | 'image' | 'other'
  name: string
  url: string
  uploadedAt: string
}

// ===== タスク =====
export type TaskStatus = 'todo' | 'inProgress' | 'done' | 'cancelled'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskRelatedType = 'vehicle' | 'sale' | 'goods' | 'customer' | 'fp'

export interface Task {
  id: string
  title: string
  description?: string
  relatedType?: TaskRelatedType
  relatedId?: string
  assignedMemberId?: string
  dueDate?: string
  priority: TaskPriority
  status: TaskStatus
  branchId: string
  createdById: string
  createdAt: string
}
