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
export type MemberDivision = 'vehicle' | 'goods' | 'both'

export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  division: MemberDivision  // 車担当・古物担当・両方
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
  pickupLocation: string
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

// ===== メルカリカテゴリ =====
export const MERCARI_CATEGORIES: Record<string, string[]> = {
  'レディース': ['バッグ', '財布・ケース', '時計', 'アクセサリー・ジュエリー', 'ファッション小物', '衣類', 'シューズ'],
  'メンズ': ['バッグ', '財布・ケース', '時計', 'アクセサリー', 'ファッション小物', '衣類', 'シューズ'],
  '家電・スマホ・カメラ': ['スマートフォン', 'カメラ', '生活家電', 'PC・周辺機器', 'オーディオ機器'],
  'インテリア・住まい・小物': ['食器・グラス', 'アート・美術品', 'アンティーク・コレクタブル', '家具', 'インテリア雑貨'],
  'おもちゃ・ホビー・グッズ': ['フィギュア', 'コレクション', 'トレーディングカード', 'ゲーム機本体'],
  'スポーツ・レジャー': ['ゴルフ', 'アウトドア用品', 'フィットネス・トレーニング', 'スポーツ用品'],
  '音楽・楽器': ['楽器', 'CD・レコード', '音響機材'],
  '本・雑誌・漫画': ['本・書籍', '雑誌', 'コミック・漫画'],
  'チケット': ['コンサート・音楽', 'スポーツ観戦', 'その他チケット'],
  'ゲーム・ソフト': ['ゲームソフト', 'ゲーム機本体', 'ゲームグッズ'],
  'ベビー・キッズ': ['おもちゃ', 'キッズファッション', 'ベビー用品'],
  'コスメ・香水・美容': ['コスメ・メイクアップ', '香水', 'スキンケア・基礎化粧品'],
  'その他': ['その他'],
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
  mainCategory: string   // メルカリ大カテゴリ
  subCategory: string    // メルカリ小カテゴリ
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
  feeMode?: 'default' | 'custom'
  feeDist?: { alrd: number; union: number; technical: number; planner: number }
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

// ===== フィーパターン =====
export type FeeTargetBusiness = 'vehicle' | 'goods' | 'all'
export type FeeTargetRole = 'fp' | 'member'
export type FeeAppliedTo = 'contractPrice' | 'grossProfit' | 'soldPrice' | 'listPrice'

export interface FeePattern {
  id: string
  name: string
  targetBusiness: FeeTargetBusiness
  targetRole: FeeTargetRole
  appliedTo: FeeAppliedTo
  rate: number         // % (例: 2.5 → 2.5%)
  branchId: string
  isActive: boolean
  notes?: string
  createdAt: string
}

// ===== 見込管理 =====
export type ProspectType = 'sale' | 'purchase'
export type ProspectStatus = 'open' | 'negotiating' | 'contracted' | 'lost'

export interface Prospect {
  id: string
  title: string
  type: ProspectType           // 販売・買取
  vehicleMaker?: string        // メーカー
  vehicleModel?: string        // 車種
  estimatedPrice: number       // 想定金額
  estimatedCost?: number       // 想定原価（粗利 = estimatedPrice - estimatedCost）
  deadline?: string            // 期限
  status: ProspectStatus
  assignedMemberId?: string
  referredByFpId?: string
  branchId: string
  notes?: string
  createdAt: string
}

// ===== タスク =====
export type TaskStatus = 'todo' | 'inProgress' | 'done' | 'cancelled'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskRelatedType = 'vehicle' | 'sale' | 'goods' | 'customer' | 'fp' | 'prospect'

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
