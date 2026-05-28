import type { Vehicle, Sale, Customer, FP, GoodsItem, Task, Member, VehicleExpense } from '~/types'

export const mockMembers: Member[] = [
  { id: 'm1', name: '田中 太郎', email: 'tanaka@alrd.co.jp', role: 'admin', branchId: 'b1', status: 'active', createdAt: '2024-01-01' },
  { id: 'm2', name: '鈴木 花子', email: 'suzuki@alrd.co.jp', role: 'staff', branchId: 'b1', status: 'active', createdAt: '2024-02-01' },
  { id: 'm3', name: '佐藤 次郎', email: 'sato@alrd.co.jp', role: 'staff', branchId: 'b1', status: 'active', createdAt: '2024-03-01' },
]

export const mockFPs: FP[] = [
  { id: 'fp1', name: '山田 健一', company: '山田FPオフィス', phone: '090-1234-5678', email: 'yamada@fp.jp', area: '東京都', branchId: 'b1', status: 'active', createdAt: '2024-01-10' },
  { id: 'fp2', name: '伊藤 美咲', company: 'ライフプランニング伊藤', phone: '090-2345-6789', email: 'ito@fp.jp', area: '神奈川県', branchId: 'b1', status: 'active', createdAt: '2024-02-15' },
  { id: 'fp3', name: '渡辺 誠', company: 'ウェルスFP', phone: '090-3456-7890', email: 'watanabe@fp.jp', area: '埼玉県', branchId: 'b1', status: 'active', createdAt: '2024-03-20' },
]

export const mockCustomers: Customer[] = [
  { id: 'c1', name: '高橋 一郎', nameKana: 'タカハシ イチロウ', phone: '090-1111-2222', email: 'takahashi@email.com', address: '東京都新宿区1-1-1', referredByFpId: 'fp1', branchId: 'b1', createdAt: '2024-03-01' },
  { id: 'c2', name: '中村 麻衣', nameKana: 'ナカムラ マイ', phone: '090-2222-3333', email: 'nakamura@email.com', address: '神奈川県横浜市2-2-2', referredByFpId: 'fp2', branchId: 'b1', createdAt: '2024-04-01' },
  { id: 'c3', name: '小林 健太', nameKana: 'コバヤシ ケンタ', phone: '090-3333-4444', email: 'kobayashi@email.com', address: '埼玉県さいたま市3-3-3', branchId: 'b1', createdAt: '2024-04-15' },
  { id: 'c4', name: '加藤 由美', nameKana: 'カトウ ユミ', phone: '090-4444-5555', email: 'kato@email.com', address: '東京都渋谷区4-4-4', referredByFpId: 'fp1', branchId: 'b1', createdAt: '2024-05-01' },
]

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1', type: 'inventory', maker: 'トヨタ', model: 'アルファード', year: 2021,
    mileage: 32000, vin: 'JTEBU5JR8K5200001', color: 'パールホワイト', engineCC: 2500,
    inspectionDate: '2025-11-30', purchasePrice: 3800000,
    purchaseFrom: '東京オートオークション', pickupLocation: '東京オートオークション（足立）',
    purchasedAt: '2024-10-01', listPrice: 4500000, assignedMemberId: 'm1',
    branchId: 'b1', status: 'inStock', createdAt: '2024-10-01',
  },
  {
    id: 'v2', type: 'inventory', maker: 'ホンダ', model: 'ステップワゴン', year: 2022,
    mileage: 18000, vin: 'JHMRK1850NX000002', color: 'シルバー', engineCC: 1500,
    inspectionDate: '2026-03-31', purchasePrice: 2200000,
    purchaseFrom: '大阪オートオークション', pickupLocation: '大阪オートオークション（住之江）',
    purchasedAt: '2024-10-15', listPrice: 2650000, assignedMemberId: 'm2', referredByFpId: 'fp1',
    branchId: 'b1', status: 'negotiating', createdAt: '2024-10-15',
  },
  {
    id: 'v3', type: 'order', maker: 'BMW', model: '3シリーズ', year: 2023,
    mileage: 5000, vin: 'WBA8E9C52ND000003', color: 'ブラック', engineCC: 2000,
    inspectionDate: '2026-01-31', purchasePrice: 4200000,
    purchaseFrom: 'ヤナセ大阪', pickupLocation: 'ヤナセ大阪（都島）',
    listPrice: 5100000, assignedMemberId: 'm1', referredByFpId: 'fp2',
    branchId: 'b1', status: 'arrived', createdAt: '2024-11-01',
  },
  {
    id: 'v4', type: 'consignment', maker: 'メルセデスベンツ', model: 'Eクラス', year: 2020,
    mileage: 45000, vin: 'W1K2131E9LF000004', color: 'ガンメタ', engineCC: 2000,
    inspectionDate: '2025-08-31', purchasePrice: 0,
    purchaseFrom: '', pickupLocation: '小林様自宅（さいたま市）',
    listPrice: 3200000, consignmentOwnerId: 'c3', assignedMemberId: 'm2',
    branchId: 'b1', status: 'consigning', createdAt: '2024-09-01',
  },
  {
    id: 'v5', type: 'inventory', maker: 'レクサス', model: 'RX', year: 2022,
    mileage: 22000, vin: 'JTJHZMDA4P2000005', color: 'ホワイト', engineCC: 2500,
    inspectionDate: '2026-06-30', purchasePrice: 5500000,
    purchaseFrom: '名古屋オートオークション', pickupLocation: '名古屋オートオークション（天白）',
    purchasedAt: '2024-11-10', listPrice: 6800000, assignedMemberId: 'm3', referredByFpId: 'fp3',
    branchId: 'b1', status: 'contracted', createdAt: '2024-11-10',
  },
  {
    id: 'v6', type: 'inventory', maker: 'トヨタ', model: 'プリウス', year: 2023,
    mileage: 8000, vin: 'JTDL9RFU0P3000006', color: 'ブルー', engineCC: 1800,
    inspectionDate: '2026-09-30', purchasePrice: 2600000,
    purchaseFrom: '東京オートオークション', pickupLocation: '東京オートオークション（足立）',
    purchasedAt: '2024-11-20', listPrice: 3100000, assignedMemberId: 'm2',
    branchId: 'b1', status: 'delivered', createdAt: '2024-11-20',
  },
]

export const mockExpenses: VehicleExpense[] = [
  // v1 アルファード
  { id: 'e1', vehicleId: 'v1', category: 'maintenance', description: 'エンジンオイル交換・フィルター', amount: 25000, date: '2024-10-05' },
  { id: 'e2', vehicleId: 'v1', category: 'transport', description: '足立→埼玉 陸送費', amount: 35000, date: '2024-10-03' },
  { id: 'e3', vehicleId: 'v1', category: 'registration', description: '名義変更手続き費用', amount: 15000, date: '2024-10-08' },
  { id: 'e4', vehicleId: 'v1', category: 'travel', description: '引き取り交通費（新幹線往復）', amount: 12000, date: '2024-10-01' },
  { id: 'e5', vehicleId: 'v1', category: 'labor', description: '引き取り・整備 人件費', amount: 20000, date: '2024-10-05' },
  // v2 ステップワゴン
  { id: 'e6', vehicleId: 'v2', category: 'maintenance', description: 'タイヤ4本交換', amount: 80000, date: '2024-10-20' },
  { id: 'e7', vehicleId: 'v2', category: 'bodywork', description: 'バンパー修繕', amount: 45000, date: '2024-10-22' },
  { id: 'e8', vehicleId: 'v2', category: 'transport', description: '住之江→横浜 陸送費', amount: 55000, date: '2024-10-16' },
  { id: 'e9', vehicleId: 'v2', category: 'travel', description: '引き取り交通費（高速・駐車場）', amount: 8500, date: '2024-10-15' },
  { id: 'e10', vehicleId: 'v2', category: 'misc', description: '書類取得・印紙代等', amount: 5000, date: '2024-10-17' },
  // v3 BMW
  { id: 'e11', vehicleId: 'v3', category: 'transport', description: '都島→東京 陸送費', amount: 55000, date: '2024-11-05' },
  { id: 'e12', vehicleId: 'v3', category: 'travel', description: '引き取り交通費（飛行機）', amount: 28000, date: '2024-11-01' },
  { id: 'e13', vehicleId: 'v3', category: 'labor', description: '検査・確認 人件費', amount: 15000, date: '2024-11-05' },
  // v5 レクサス
  { id: 'e14', vehicleId: 'v5', category: 'maintenance', description: '車検整備', amount: 120000, date: '2024-11-15' },
  { id: 'e15', vehicleId: 'v5', category: 'transport', description: '天白→東京 陸送費', amount: 65000, date: '2024-11-12' },
  { id: 'e16', vehicleId: 'v5', category: 'travel', description: '引き取り交通費（新幹線往復）', amount: 22000, date: '2024-11-10' },
  { id: 'e17', vehicleId: 'v5', category: 'labor', description: '引き取り・書類 人件費', amount: 30000, date: '2024-11-12' },
  { id: 'e18', vehicleId: 'v5', category: 'misc', description: '諸経費（名義変更・印紙等）', amount: 18000, date: '2024-11-15' },
  // v6 プリウス
  { id: 'e19', vehicleId: 'v6', category: 'maintenance', description: 'エンジンオイル交換', amount: 12000, date: '2024-11-25' },
  { id: 'e20', vehicleId: 'v6', category: 'registration', description: '名義変更', amount: 15000, date: '2024-12-01' },
  { id: 'e21', vehicleId: 'v6', category: 'travel', description: '引き取り交通費', amount: 6000, date: '2024-11-20' },
  { id: 'e22', vehicleId: 'v6', category: 'labor', description: '納車 人件費', amount: 10000, date: '2024-12-05' },
]

export const mockSales: Sale[] = [
  {
    id: 's1', vehicleId: 'v6', customerId: 'c1', type: 'inventory',
    contractPrice: 3050000, discount: 50000, paymentMethod: 'loan',
    contractedAt: '2024-11-25', deliveryScheduledAt: '2024-12-05', deliveredAt: '2024-12-05',
    referredByFpId: 'fp1', assignedMemberId: 'm1', branchId: 'b1', status: 'delivered',
    loanApplications: [
      { id: 'l1', saleId: 's1', company: 'オリコ', amount: 3050000, term: 60, status: 'approved', appliedAt: '2024-11-26', resultAt: '2024-11-28' }
    ]
  },
  {
    id: 's2', vehicleId: 'v5', customerId: 'c4', type: 'inventory',
    contractPrice: 6700000, discount: 100000, paymentMethod: 'cash',
    contractedAt: '2024-11-28', deliveryScheduledAt: '2024-12-15',
    referredByFpId: 'fp3', assignedMemberId: 'm3', branchId: 'b1', status: 'nameTransfer',
  },
  {
    id: 's3', vehicleId: 'v2', customerId: 'c2', type: 'inventory',
    contractPrice: 2600000, discount: 50000, paymentMethod: 'loan',
    contractedAt: '2024-12-01',
    referredByFpId: 'fp2', assignedMemberId: 'm2', branchId: 'b1', status: 'contracted',
    loanApplications: [
      { id: 'l2', saleId: 's3', company: 'アプラス', amount: 2600000, term: 48, status: 'reviewing', appliedAt: '2024-12-02' }
    ]
  },
]

export const mockGoods: GoodsItem[] = [
  {
    id: 'g1', name: 'ルイヴィトン ショルダーバッグ', category: 'バッグ', condition: 'AB',
    sourceCustomerId: 'c1', sourceFpId: 'fp1', receivedAt: '2024-11-01',
    assessedValue: 85000, platform: 'mercari', listingPrice: 98000,
    listedAt: '2024-11-05', soldPrice: 92000, soldAt: '2024-11-20',
    platformFee: 9200, shippingCost: 1500, profit: 81300,
    assignedMemberId: 'm2', branchId: 'b1', status: 'settled',
  },
  {
    id: 'g2', name: 'ロレックス デイトジャスト', category: '時計', condition: 'A',
    sourceCustomerId: 'c2', sourceFpId: 'fp2', receivedAt: '2024-11-10',
    assessedValue: 650000, platform: 'yahoo_auction', listingPrice: 720000,
    listedAt: '2024-11-15', listingUrl: 'https://auctions.yahoo.co.jp/xxx',
    assignedMemberId: 'm1', branchId: 'b1', status: 'listed',
  },
  {
    id: 'g3', name: 'ゴヤール トートバッグ', category: 'バッグ', condition: 'B',
    sourceCustomerId: 'c3', sourceFpId: 'fp1', receivedAt: '2024-11-25',
    assessedValue: 45000, assignedMemberId: 'm2', branchId: 'b1', status: 'assessing',
  },
  {
    id: 'g4', name: 'ブルガリ ネックレス', category: 'ジュエリー', condition: 'S',
    sourceCustomerId: 'c4', sourceFpId: 'fp3', receivedAt: '2024-12-01',
    assignedMemberId: 'm3', branchId: 'b1', status: 'received',
  },
]

export const mockTasks: Task[] = [
  { id: 't1', title: 'アルファード 車検証確認・書類準備', relatedType: 'vehicle', relatedId: 'v1', assignedMemberId: 'm1', dueDate: '2024-12-10', priority: 'high', status: 'inProgress', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-01' },
  { id: 't2', title: 'ステップワゴン ローン審査フォロー（中村様）', relatedType: 'sale', relatedId: 's3', assignedMemberId: 'm2', dueDate: '2024-12-08', priority: 'high', status: 'todo', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-02' },
  { id: 't3', title: 'レクサスRX 名義変更書類収集', relatedType: 'sale', relatedId: 's2', assignedMemberId: 'm3', dueDate: '2024-12-12', priority: 'medium', status: 'inProgress', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-01' },
  { id: 't4', title: 'ロレックス 出品状況確認', relatedType: 'goods', relatedId: 'g2', assignedMemberId: 'm1', dueDate: '2024-12-09', priority: 'medium', status: 'todo', branchId: 'b1', createdById: 'm2', createdAt: '2024-12-02' },
  { id: 't5', title: 'ゴヤールバッグ 査定完了', relatedType: 'goods', relatedId: 'g3', assignedMemberId: 'm2', dueDate: '2024-12-07', priority: 'low', status: 'todo', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-02' },
  { id: 't6', title: 'BMW 3シリーズ 納車前点検', relatedType: 'vehicle', relatedId: 'v3', assignedMemberId: 'm1', dueDate: '2024-12-15', priority: 'medium', status: 'todo', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-03' },
  { id: 't7', title: 'プリウス 納車完了確認', relatedType: 'sale', relatedId: 's1', assignedMemberId: 'm1', dueDate: '2024-12-06', priority: 'low', status: 'done', branchId: 'b1', createdById: 'm1', createdAt: '2024-12-01' },
]
