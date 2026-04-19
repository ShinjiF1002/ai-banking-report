import type { Tier } from "@clarity-ds/core";

export type TxStatus = "succeeded" | "pending" | "failed" | "disputed";
export type TxMethod = "card" | "wire" | "ach";
export type Region = "US" | "EU" | "APAC" | "LATAM";

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: Tier;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: "USD" | "JPY" | "EUR";
  status: TxStatus;
  method: TxMethod;
  region: Region;
  customerId: string;
  createdAt: string;
  riskScore: number;
  category: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: "CUS-001",
    name: "Atlas Capital LLC",
    email: "ops@atlascap.com",
    tier: "T1",
  },
  {
    id: "CUS-002",
    name: "Meridian Retail",
    email: "pay@meridian.jp",
    tier: "T2",
  },
  {
    id: "CUS-003",
    name: "Northwind Logistics",
    email: "billing@northwind.io",
    tier: "T1",
  },
  {
    id: "CUS-004",
    name: "Stellar Holdings GmbH",
    email: "fin@stellar.de",
    tier: "T3",
  },
  {
    id: "CUS-005",
    name: "Prairie Health Coop",
    email: "ap@prairie-health.org",
    tier: "T2",
  },
  {
    id: "CUS-006",
    name: "Coastal Media Inc",
    email: "cfo@coastal.media",
    tier: "T4",
  },
  {
    id: "CUS-007",
    name: "Summit Ventures",
    email: "treasury@summit.vc",
    tier: "T1",
  },
  {
    id: "CUS-008",
    name: "Bluegrass Textiles",
    email: "billing@bluegrass.us",
    tier: "T3",
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-2401",
    amount: 128500,
    currency: "USD",
    status: "succeeded",
    method: "wire",
    region: "US",
    customerId: "CUS-001",
    createdAt: "2026-04-18T09:12:00Z",
    riskScore: 0.08,
    category: "subscription",
  },
  {
    id: "TXN-2402",
    amount: 4280,
    currency: "USD",
    status: "pending",
    method: "card",
    region: "US",
    customerId: "CUS-002",
    createdAt: "2026-04-18T09:05:00Z",
    riskScore: 0.41,
    category: "one-time",
  },
  {
    id: "TXN-2403",
    amount: 1250000,
    currency: "JPY",
    status: "succeeded",
    method: "wire",
    region: "APAC",
    customerId: "CUS-002",
    createdAt: "2026-04-18T08:52:00Z",
    riskScore: 0.12,
    category: "subscription",
  },
  {
    id: "TXN-2404",
    amount: 89300,
    currency: "USD",
    status: "disputed",
    method: "card",
    region: "US",
    customerId: "CUS-006",
    createdAt: "2026-04-18T08:31:00Z",
    riskScore: 0.82,
    category: "one-time",
  },
  {
    id: "TXN-2405",
    amount: 56800,
    currency: "EUR",
    status: "succeeded",
    method: "ach",
    region: "EU",
    customerId: "CUS-004",
    createdAt: "2026-04-18T08:10:00Z",
    riskScore: 0.22,
    category: "subscription",
  },
  {
    id: "TXN-2406",
    amount: 12750,
    currency: "USD",
    status: "failed",
    method: "card",
    region: "US",
    customerId: "CUS-005",
    createdAt: "2026-04-18T07:58:00Z",
    riskScore: 0.64,
    category: "one-time",
  },
  {
    id: "TXN-2407",
    amount: 340000,
    currency: "USD",
    status: "succeeded",
    method: "wire",
    region: "US",
    customerId: "CUS-003",
    createdAt: "2026-04-18T07:42:00Z",
    riskScore: 0.05,
    category: "subscription",
  },
  {
    id: "TXN-2408",
    amount: 9480,
    currency: "USD",
    status: "pending",
    method: "card",
    region: "LATAM",
    customerId: "CUS-007",
    createdAt: "2026-04-18T07:30:00Z",
    riskScore: 0.55,
    category: "one-time",
  },
  {
    id: "TXN-2409",
    amount: 21000,
    currency: "EUR",
    status: "succeeded",
    method: "ach",
    region: "EU",
    customerId: "CUS-004",
    createdAt: "2026-04-18T07:14:00Z",
    riskScore: 0.18,
    category: "subscription",
  },
  {
    id: "TXN-2410",
    amount: 725000,
    currency: "JPY",
    status: "succeeded",
    method: "wire",
    region: "APAC",
    customerId: "CUS-002",
    createdAt: "2026-04-18T06:58:00Z",
    riskScore: 0.09,
    category: "one-time",
  },
  {
    id: "TXN-2411",
    amount: 3290,
    currency: "USD",
    status: "failed",
    method: "card",
    region: "US",
    customerId: "CUS-008",
    createdAt: "2026-04-18T06:40:00Z",
    riskScore: 0.71,
    category: "one-time",
  },
  {
    id: "TXN-2412",
    amount: 68200,
    currency: "USD",
    status: "succeeded",
    method: "wire",
    region: "US",
    customerId: "CUS-007",
    createdAt: "2026-04-18T06:22:00Z",
    riskScore: 0.14,
    category: "subscription",
  },
];

export function findCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export function findTransaction(id: string): Transaction | undefined {
  return TRANSACTIONS.find((t) => t.id === id);
}

export function formatAmount(
  value: number,
  currency: Transaction["currency"],
): string {
  const formatter = new Intl.NumberFormat(
    currency === "JPY" ? "ja-JP" : "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
    },
  );
  return formatter.format(value);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// KPI time-series (last 14 days, USD thousands)
export const KPI_TRENDS = {
  volume: [
    142, 156, 148, 162, 178, 184, 172, 195, 210, 198, 224, 238, 252, 276,
  ],
  count: [182, 195, 203, 199, 218, 224, 230, 241, 258, 265, 272, 288, 301, 318],
  dispute: [4, 3, 5, 3, 4, 2, 3, 5, 7, 6, 8, 6, 9, 11],
  success: [
    97.2, 97.8, 97.5, 98.1, 98.3, 98.6, 98.4, 98.1, 97.9, 98.2, 98.5, 98.8,
    98.6, 98.9,
  ],
} as const;

// Category mix (for ImpactRow)
export const CATEGORY_MIX = [
  { label: "サブスクリプション", auto: 62, augment: 14, total: 76 },
  { label: "ワンタイム決済", auto: 38, augment: 8, total: 46 },
  { label: "国際送金", auto: 22, augment: 18, total: 40 },
  { label: "返金 / 調整", auto: 8, augment: 4, total: 12 },
  { label: "ディスピュート", auto: 3, augment: 9, total: 12 },
  { label: "定期請求", auto: 54, augment: 6, total: 60 },
] as const;

// AI fraud analysis (used in Detail page for disputed TXN)
export const AI_FRAUD_ANALYSIS = `このトランザクション (TXN-2404) は通常パターンから逸脱しています。Coastal Media Inc の過去 90 日間平均は $8,400 / 取引でしたが、本件は $89,300 と 10 倍超。IP geolocation は登録住所 (US) と一致するものの、deviceFingerprint が初見 (過去 30 日で同一 device 未検出) かつ 処理時刻が休日早朝で、同社の通常 business hour 外です。Velocity check では過去 1 時間に同一 customer から 3 件の連続試行 (1 件 failed) が観測され、card testing pattern の可能性があります。推奨: 顧客への確認連絡 + temporary hold (48h) + 同 BIN 他 customer の追加監視。`;

export const AI_RISK_FACTORS = [
  { label: "金額の逸脱 (平均比)", value: 92, weight: "high" as const },
  { label: "Device fingerprint 新規", value: 78, weight: "high" as const },
  { label: "処理時刻 (営業外)", value: 64, weight: "medium" as const },
  { label: "Velocity (1h 内連続)", value: 71, weight: "high" as const },
  { label: "IP-住所一致", value: 18, weight: "low" as const },
  { label: "カード BIN 履歴", value: 28, weight: "low" as const },
];
