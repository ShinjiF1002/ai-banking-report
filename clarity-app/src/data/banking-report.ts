/**
 * Banking report content data — structured derivation of
 * ../../../ai_banking_landscape_analysis_jp.md (891 行、2026-04-17 snapshot).
 *
 * Scope (S1 compression per plan v1.1 Risks L3):
 * - Hero key stats: 4
 * - Industry impact: full WEF table (6 rows)
 * - Top 10 players: 10 banks
 * - ROI matrix: 3 primary domains (不正検知 / カスタマーサービス / 書類処理) with full rows;
 *   remaining 4 summarized in text
 * - Consulting: 4 firms prioritized (McKinsey / Accenture / Deloitte / 世銀-IMF-BIS)
 * - Timeline: 5 entries
 * - Principles: 7
 * - Sources: all 25
 *
 * Refresh pattern: when ../../../ai_banking_landscape_analysis_jp.md updates,
 * re-derive this file by hand or by running a conversion script (none yet).
 * Auto-sync is NOT implemented (per C5 content-coupling decision).
 */

export type Tier = "T1" | "T2" | "T3" | "T4" | "T5";

export interface Source {
  id: number;
  title: string;
  publisher: string;
  date: string;
  tier: Tier;
  summary: string;
  url: string;
}

export interface IndustryImpact {
  industry: string;
  automation: number;
  augmentation: number;
}

export interface PlayerKpi {
  bank: string;
  scaleIndicator: string;
  metrics: string[];
  evidentRank?: number;
  tier: Tier;
  citationIds: number[];
}

export interface UseCaseRoi {
  bank: string;
  useCase: string;
  result: string;
  tier: Tier;
  citationIds: number[];
}

export interface RoiDomain {
  id: string;
  name: string;
  emoji: string;
  benchmark: string;
  maturity: "proven" | "scaling" | "early";
  rows: UseCaseRoi[];
}

export interface ConsultingBenchmark {
  firm: string;
  indicator: string;
  value: string;
  note?: string;
  citationId: number;
}

export interface TimelineEntry {
  period: string;
  developments: string[];
  confidence: "確認済" | "高" | "中";
}

export interface StrategicPrinciple {
  n: number;
  title: string;
  rationale: string;
  citationIds: number[];
}

export interface HeroStat {
  label: string;
  value: string;
  delta?: { from: string; to: string };
  tier: Tier;
  hint?: string;
}

export const hero = {
  title: "米国大手グローバル銀行における AI 動向",
  subtitle: "Executive 向け統合レポート",
  summary:
    "米国を中心とした大手グローバル銀行における AI 活用の現状・ROI・将来展望を、25 情報源 (企業公式 / 国際機関 / コンサル / 第三者ランキング / Tier 1 通信社) から統合した分析。",
  keyStats: [
    {
      label: "業界 AI 影響度",
      value: "73%",
      tier: "T2",
      hint: "全産業中最高 (WEF 白書)",
    },
    {
      label: "世界の実装率",
      value: "47%",
      delta: { from: "24%", to: "47%" },
      tier: "T2",
      hint: "2025 → 2026 年、1 年で倍増",
    },
    {
      label: "JPMC テック予算",
      value: "$198B",
      delta: { from: "$180B", to: "$198B" },
      tier: "T1",
      hint: "2026 年 (前年比 +10%)",
    },
    {
      label: "利益侵食リスク",
      value: "$170B",
      tier: "T2",
      hint: "McKinsey エージェント AI 警告",
    },
  ] satisfies HeroStat[],
};

export const industryImpact: IndustryImpact[] = [
  { industry: "銀行", automation: 39, augmentation: 34 },
  { industry: "保険", automation: 33, augmentation: 37 },
  { industry: "資本市場", automation: 32, augmentation: 37 },
  { industry: "ソフトウェア", automation: 42, augmentation: 25 },
  { industry: "ヘルスケア", automation: 34, augmentation: 31 },
  { industry: "小売", automation: 36, augmentation: 28 },
];

export const players: PlayerKpi[] = [
  {
    bank: "JPMC",
    scaleIndicator: "450 超の AI ユースケース本番稼働",
    metrics: [
      "年間 AI ビジネス価値 $20 億",
      "AI 専用投資 年間 $20 億 (1:1 ROI)",
      "LLM Suite 20 万人超展開",
      "テック予算 $198 億 (2026)",
    ],
    evidentRank: 1,
    tier: "T1",
    citationIds: [5, 6],
  },
  {
    bank: "BofA",
    scaleIndicator: "Erica (消費者向け VA) + M365 Copilot 20 万人",
    metrics: [
      "累計 32 億回対話",
      "利用者 2,060 万人",
      "消費者対応 98% 自己完結",
      "テック支出 $130 億 (2025)",
    ],
    evidentRank: 10,
    tier: "T1",
    citationIds: [7, 8],
  },
  {
    bank: "WF",
    scaleIndicator: "Fargo (LLM アップグレード進行中)",
    metrics: [
      "3 年未満で 10 億回超対話",
      "モバイル 3,300 万超",
      "開発者効率 30-35% 向上",
    ],
    evidentRank: 6,
    tier: "T1",
    citationIds: [9],
  },
  {
    bank: "Citi",
    scaleIndicator: "50 重要プロセス自動化 / 10,000 超エンジニア",
    metrics: [
      "口座開設 75 分 → 15 分",
      "Markets 月間 1,700 時間創出",
      "コンプラ誤検知 30-40% 削減",
    ],
    tier: "T3",
    citationIds: [10, 11],
  },
  {
    bank: "GS",
    scaleIndicator: "Anthropic 共同開発 / Devin 導入",
    metrics: [
      "開発者生産性 3-4 倍",
      "テック支出 約 $60 億",
      "Expert AI で M&A 先取り",
    ],
    evidentRank: 9,
    tier: "T3",
    citationIds: [12],
  },
  {
    bank: "MS",
    scaleIndicator: "3,500 超機能 AI エコシステム",
    metrics: [
      "FA 98% が日常利用",
      "内部 AI ツールで 28 万時間節約",
      "Debrief AI で会議要約",
    ],
    evidentRank: 5,
    tier: "T3",
    citationIds: [13],
  },
  {
    bank: "HSBC",
    scaleIndicator: "DRA + 600 超 AI ユースケース",
    metrics: [
      "AML 誤検知 60% 削減",
      "検知率 2-4 倍向上",
      "月間 9-10 億件監視",
    ],
    evidentRank: 8,
    tier: "T1",
    citationIds: [14],
  },
  {
    bank: "DBS",
    scaleIndicator: "2,000 超モデル / 430 超 UC",
    metrics: [
      "監査済 AI 経済価値 S$10 億 (+33% YoY)",
      "システムインシデント 81% 削減",
      "顧客満足度 23% 向上",
    ],
    tier: "T1",
    citationIds: [15],
  },
  {
    bank: "SC",
    scaleIndicator: "SC GPT エンタープライズ / 80,000 人対象",
    metrics: [
      "規制違反 40% 削減",
      "リスク分析工数 30% 削減",
      "モデル配備速度 4 倍",
    ],
    tier: "T3",
    citationIds: [16],
  },
  {
    bank: "COF",
    scaleIndicator: "ProtectID + Chat Concierge",
    metrics: [
      "AI 推論コスト 1,000 倍超削減 (22 ヶ月)",
      "検索精度 84% → 93%",
    ],
    evidentRank: 2,
    tier: "T1",
    citationIds: [17],
  },
];

export const evidentTop10 = [
  { rank: 1, bank: "JPMC", note: "Innovation / Leadership / Transparency 3 ピラー首位" },
  { rank: 2, bank: "COF", note: "Talent ピラー首位、+9.6pt 上昇 (Top 10 最大)" },
  { rank: 3, bank: "Royal Bank of Canada" },
  { rank: 4, bank: "CommBank", note: "オーストラリア" },
  { rank: 5, bank: "MS" },
  { rank: 6, bank: "WF", note: "順位下降" },
  { rank: 7, bank: "UBS", note: "欧州勢" },
  { rank: 8, bank: "HSBC", note: "順位下降" },
  { rank: 9, bank: "GS", note: "急速上昇" },
  { rank: 10, bank: "BofA", note: "急速上昇" },
];

export const roiDomains: RoiDomain[] = [
  {
    id: "fraud",
    name: "不正検知・AML",
    emoji: "🔴",
    benchmark: "AI 搭載不正検知精度は 90% 超 (一部 94.7%) — 世銀/IMF",
    maturity: "proven",
    rows: [
      {
        bank: "JPMC",
        useCase: "リアルタイム不正取引監視",
        result: "検知精度 40% 向上 / 誤検知 50% 削減 / 累計 $15 億超防止 / 日次 10 億件監視",
        tier: "T1",
        citationIds: [5],
      },
      {
        bank: "HSBC",
        useCase: "Dynamic Risk Assessment (Google Cloud 提携)",
        result: "検知 2-4 倍 / 誤検知 60% 削減 / 調査完了数週間→ 8 日",
        tier: "T1",
        citationIds: [14],
      },
      {
        bank: "DBS",
        useCase: "リスクスコアリング",
        result: "全技術変更 100% AI 審査 / システムインシデント 81% 削減",
        tier: "T1",
        citationIds: [15],
      },
      {
        bank: "SC",
        useCase: "AI 文書検証",
        result: "規制違反 40% 削減",
        tier: "T3",
        citationIds: [16],
      },
      {
        bank: "Citi",
        useCase: "トランザクション監視",
        result: "コンプラ誤検知 30-40% 削減 / 新規制解釈 数週間→数時間",
        tier: "T3",
        citationIds: [11],
      },
      {
        bank: "COF",
        useCase: "ProtectID (CNN/LSTM/グラフ ML)",
        result: "2026 FinTech Breakthrough Award / リアルタイム合成詐欺検知",
        tier: "T1",
        citationIds: [17],
      },
    ],
  },
  {
    id: "cs",
    name: "カスタマーサービス",
    emoji: "🟠",
    benchmark: "自動化対応 $1-2/件 vs 人間 $6-14 / 応答 65% 高速化 / コンテイメント 60-80%",
    maturity: "proven",
    rows: [
      {
        bank: "BofA",
        useCase: "Erica (消費者向け VA)",
        result: "累計 32 億回対話 / 2025 年 7 億回 / 利用者 2,060 万人",
        tier: "T1",
        citationIds: [7],
      },
      {
        bank: "BofA",
        useCase: "消費者対応完結率",
        result: "98% が人間介入なしで完結",
        tier: "T3",
        citationIds: [8],
      },
      {
        bank: "WF",
        useCase: "Fargo (LLM アップグレード)",
        result: "3 年未満で 10 億回超 / スペイン語 300 万人 / アプリ評価 4.9",
        tier: "T1",
        citationIds: [9],
      },
      {
        bank: "DBS",
        useCase: "DBS Joy (法人向けチャットボット)",
        result: "6 ヶ月で 20,000 超 SME 顧客 / 顧客満足度 23% 向上",
        tier: "T1",
        citationIds: [15],
      },
      {
        bank: "DBS",
        useCase: "GenAI 通話支援",
        result: "コール対応時間 20% 短縮",
        tier: "T1",
        citationIds: [15],
      },
    ],
  },
  {
    id: "docops",
    name: "書類処理・オペレーション",
    emoji: "🟣",
    benchmark: "最も実証済み規模効果 — Citi 80%短縮 / JPMC 360K 時間→秒",
    maturity: "proven",
    rows: [
      {
        bank: "Citi",
        useCase: "口座開設書類審査",
        result: "75 分 → 15 分 (80% 短縮)",
        tier: "T3",
        citationIds: [10],
      },
      {
        bank: "Citi",
        useCase: "Markets 部門書類処理",
        result: "月間 1,700 時間以上の常時創出",
        tier: "T1",
        citationIds: [11],
      },
      {
        bank: "Citi",
        useCase: "レガシーコード移行",
        result: "30 年超のレガシーを 2 日で完了",
        tier: "T3",
        citationIds: [10],
      },
      {
        bank: "JPMC",
        useCase: "COiN 契約レビュー",
        result: "年間 360,000 時間 → 数秒",
        tier: "T1",
        citationIds: [5],
      },
      {
        bank: "JPMC",
        useCase: "IB 業務",
        result: "プレゼン 30 秒 / リサーチ 40% 自動化 / 調査時間 83% 削減",
        tier: "T1",
        citationIds: [5],
      },
      {
        bank: "SC",
        useCase: "リスク分析",
        result: "工数 30% 削減 / モデル配備 4 倍",
        tier: "T3",
        citationIds: [16],
      },
    ],
  },
];

// Summary of remaining 4 ROI domains (compressed per plan L3)
export const roiDomainsSummary: { id: string; name: string; emoji: string; note: string; citationIds: number[] }[] = [
  {
    id: "wealth",
    name: "ウェルスマネジメント",
    emoji: "🟡",
    note: "JPMC Coach AI: 情報検索 95% 高速化 / 売上 20% 増 / 担当数 50% 拡大見込み。業界ベンチマーク: パーソナライゼーションで CLV 25-35% 改善 (Forrester)。",
    citationIds: [5, 18],
  },
  {
    id: "credit",
    name: "信用判断・融資",
    emoji: "🟢",
    note: "JPMC AI 信用引受: 精度 40% 向上 / デフォルト 30% 削減 / 承認 20-30% 向上。COF: 推論コスト 1,000 倍削減。業界: AI 融資で処理時間 最大 78% 短縮 (世銀)。",
    citationIds: [5, 17, 2],
  },
  {
    id: "swdev",
    name: "ソフトウェア開発・内部生産性",
    emoji: "🔵",
    note: "JPMC デプロイ 70% 増 / GS Devin 3-4 倍 / MS 28 万時間節約 / WF コード効率 30-35% / BofA Erica for Employees IT 問合せ 50%+ 削減。業界: 生産性 40% 向上 (McKinsey)。",
    citationIds: [5, 12, 13, 9, 8, 4],
  },
  {
    id: "algo",
    name: "アルゴリズム取引・投資",
    emoji: "⚫",
    note: "JPMC 深層強化学習: 勝率 52% → 60% 超 (日次取引量 $2,600 億)。Proxy IQ: 株主投票を AI で完全代替。T1 × 1 行のみで追随少、成熟度 early。",
    citationIds: [5],
  },
];

export const consulting: ConsultingBenchmark[] = [
  { firm: "McKinsey", indicator: "GenAI 年間価値 (銀行業界)", value: "$2,000-3,400 億", citationId: 4 },
  { firm: "McKinsey", indicator: "AI + 高度アナリティクス 年間価値", value: "$2 兆", note: "銀行全体", citationId: 4 },
  { firm: "McKinsey", indicator: "エージェント型 AI コスト削減", value: "15-20%", note: "ミドル・バック", citationId: 4 },
  { firm: "McKinsey", indicator: "未対応時の利益侵食", value: "$1,700 億", note: "世界銀行利益の約 9%", citationId: 4 },
  { firm: "McKinsey", indicator: "AI 先行者 ROTE 優位", value: "4pp", citationId: 4 },
  { firm: "Accenture", indicator: "早期導入行の 3 年収益増", value: "4.9%", citationId: 3 },
  { firm: "Accenture", indicator: "早期導入行の 3 年コスト減", value: "7.7%", citationId: 3 },
  { firm: "Accenture", indicator: "早期導入行の税引前利益成長", value: "29%", citationId: 3 },
  { firm: "Accenture", indicator: "AI 規模化成功率", value: "34%", citationId: 3 },
  { firm: "Deloitte", indicator: "営業利益率改善 (2-3 年)", value: "5-7%", citationId: 20 },
  { firm: "Deloitte", indicator: "営業利益率改善 (5-7 年)", value: "10-15%", citationId: 20 },
  { firm: "Deloitte", indicator: "AI/ML 運用銀行比率", value: "67%", note: "2025 年", citationId: 20 },
  { firm: "世銀/IMF/BIS", indicator: "AI 不正検知精度", value: "90% 超", citationId: 2 },
  { firm: "世銀/IMF/BIS", indicator: "AI 運用リスク削減", value: "35%", citationId: 2 },
  { firm: "世銀/IMF/BIS", indicator: "AI ローン処理時間短縮", value: "最大 78%", citationId: 2 },
];

export const timeline: TimelineEntry[] = [
  {
    period: "2026 年 (現在)",
    developments: [
      "GenAI コパイロット定着",
      "世界 47% がコア AI 実装",
      "AI 規模化成功 34%",
      "JPMC テック予算 $198 億",
    ],
    confidence: "確認済",
  },
  {
    period: "2026-2027 年",
    developments: [
      "エージェント型 AI エンドツーエンド展開",
      "業界 AI 支出 $970 億",
      "オペレーション人員 10%+ 削減",
      "営業利益率 5-7% 改善 (Deloitte)",
    ],
    confidence: "高",
  },
  {
    period: "2027-2028 年",
    developments: [
      "自律的不正解決",
      "効率性比率 10-15pt 改善",
      "先行者 ROTE 4pp 優位確立",
      "営業利益率 10-15% 改善の入口",
    ],
    confidence: "高",
  },
  {
    period: "2028-2030 年",
    developments: [
      "マルチエージェントオーケストレーション",
      "量子コンピューティング統合開始",
      "先進国労働生産性 15% 向上 (GS)",
    ],
    confidence: "中",
  },
  {
    period: "2030 年以降",
    developments: [
      "AI が年間最大 $1 兆の追加価値を創出",
      "テーブルステークス完全化",
    ],
    confidence: "中",
  },
];

export const principles: StrategicPrinciple[] = [
  {
    n: 1,
    title: "「地味なことから始めよ」",
    rationale:
      "JPMC: バックオフィスで $20 億。Citi: 書類 80% 短縮。ING: 顧客便益のない GenAI は優先度低下。",
    citationIds: [5, 10],
  },
  {
    n: 2,
    title: "執拗に計測せよ",
    rationale:
      "JPMC: 1:1 ROI。DBS: 監査済み S$10 億。Gartner: ROI 証明まで投資据え置き。",
    citationIds: [5, 15, 18],
  },
  {
    n: 3,
    title: "社内能力を構築せよ",
    rationale:
      "Citi 外部委託 50%→20%。JPMC AI 専門家 2,000 人超。Accenture: 人×テクノロジーバランス企業は成長確率 4 倍。",
    citationIds: [10, 5, 3],
  },
  {
    n: 4,
    title: "リターンに先行して投資せよ",
    rationale:
      "JPMC: $198 億。ABA: AI 不採用リスクが採用リスクを上回る。",
    citationIds: [5, 23],
  },
  {
    n: 5,
    title: "信頼こそが堀",
    rationale:
      "WEF: 84% がガバナンス FW 導入/計画。Forrester/Gartner: ガバナンス≒ROI。HSBC: AI Review Council。",
    citationIds: [1, 18, 14],
  },
  {
    n: 6,
    title: "一時的な優位に備えよ",
    rationale:
      "McKinsey: コスト削減は競争で侵食。先行者 ROTE 4pp vs 遅れれば $1,700 億侵食。",
    citationIds: [4],
  },
  {
    n: 7,
    title: "ハンドオフを設計せよ",
    rationale:
      "WEF: 人間・AI 協業。Deloitte: 「AI エージェント中心」への移行だが重大判断は人間が監督。",
    citationIds: [1, 20],
  },
];

export const sources: Source[] = [
  {
    id: 1,
    title: "Artificial Intelligence in Financial Services (白書)",
    publisher: "WEF / Accenture",
    date: "2025 年 1 月",
    tier: "T2",
    summary: "業界別 AI インパクト表 (銀行 73%) / ガバナンス FW 導入率 84% / 業界 AI 支出 $350億→$970億 等の数値ソース。",
    url: "https://reports.weforum.org/docs/WEF_Artificial_Intelligence_in_Financial_Services_2025.pdf",
  },
  {
    id: 2,
    title: "金融 AI 採用国際動向 (実装率 47% / AML 90%+ / ローン 78%短縮 等)",
    publisher: "World Bank / IMF / BIS / FSB",
    date: "2024-2026",
    tier: "T1",
    summary: "FSB/IMF/BIS の 5 一次情報を統合。IMF ヘルド行動警告・BIS 自律時代を含む。",
    url: "https://www.fsb.org/uploads/P14112024.pdf",
  },
  {
    id: 3,
    title: "Top Banking Trends FY26 — Unconstrained Banking (公式 PDF)",
    publisher: "Accenture",
    date: "2025 年 12 月",
    tier: "T2",
    summary: "早期 AI 導入行 3 年収益 +4.9% / コスト -7.7% / 税引前利益 +29% / ROE +125bps / CIR +452bps。",
    url: "https://www.accenture.com/content/dam/accenture/final/industry/banking/document/Banking-Top-Trends-FY26-Report-Final.pdf",
  },
  {
    id: 4,
    title: "Agentic AI Will Shake Up Banking, Shrinking Global Profit Pools",
    publisher: "McKinsey & Company",
    date: "2025-11-21",
    tier: "T2",
    summary: "エージェント型 AI が低金利預金を移動させる $1,700 億利益侵食 / GenAI 年間価値 $2,000-3,400 億 / 先行者 ROTE +4pp。",
    url: "https://www.mckinsey.com/industries/financial-services/our-insights/banking-matters/agentic-ai-will-shake-up-banking-shrinking-global-profit-pools",
  },
  {
    id: 5,
    title: "Jamie Dimon 2025 CEO Letter / JPMC 2025 Investor Day",
    publisher: "JPMorgan Chase",
    date: "2025-2026",
    tier: "T1",
    summary: "$20 億 AI ビジネス価値、$198 億 テック予算、1:1 ROI、ROTCE、LLM Suite 20 万人展開、450+ ユースケース等。",
    url: "https://www.jpmorganchase.com/ir/annual-report/2025/ar-ceo-letters",
  },
  {
    id: 6,
    title: "Operating Leaders: How JP Morgan Chase Showed the Rest of Us",
    publisher: "Brewton, R. (LinkedIn Pulse 分析記事)",
    date: "2026-01-27",
    tier: "T3",
    summary: "JPMC 公式開示 (T1) から AI ビジネス価値 $20 億、ユースケース数、テック予算等を整理。",
    url: "https://www.linkedin.com/pulse/operating-leaders-how-jp-morgan-chase-showed-rest-us-what-brewton-qveyf/",
  },
  {
    id: 7,
    title: "BofA AI and Digital Innovations Fuel 30 Billion Client Interactions",
    publisher: "Bank of America Newsroom",
    date: "2026-03-10",
    tier: "T1",
    summary: "累計 32 億回 Erica 対話 / 年間 300 億回デジタルインタラクション (前年比 14% 増)。",
    url: "https://newsroom.bankofamerica.com/content/newsroom/press-releases/2026/03/bofa-ai-and-digital-innovations-fuel-30-billion-client-interacti.html",
  },
  {
    id: 8,
    title: "How Bank of America's Erica Does the Work of 11,000 People",
    publisher: "American Banker",
    date: "2025-2026",
    tier: "T3",
    summary: "BofA Erica 消費者対応完結率 98% / 11,000 人相当の work 代替。",
    url: "https://www.americanbanker.com/news/how-bank-of-americas-erica-does-the-work-of-11-000-people",
  },
  {
    id: 9,
    title: "Wells Fargo Reaches Major Digital Milestones",
    publisher: "Wells Fargo Newsroom",
    date: "2026-03-26",
    tier: "T1",
    summary: "Fargo 対話回数 10 億回超、モバイル 3,300 万人、スペイン語 300 万人超、アプリ評価 4.9。",
    url: "https://newsroom.wf.com/news-releases/news-details/2026/Wells-Fargo-Reaches-Major-Digital-Milestones/default.aspx",
  },
  {
    id: 10,
    title: "Citigroup says AI helps speed account openings, systems upgrades",
    publisher: "Reuters",
    date: "2026-04-08",
    tier: "T3",
    summary: "口座開設 75→15 分、テック人材 50,000 人、外部委託 50%→20% 削減。",
    url: "https://www.reuters.com/business/finance/citigroup-says-ai-helps-speed-account-openings-systems-upgrades-2026-04-08/",
  },
  {
    id: 11,
    title: "Q1 2026 Earnings Presentation (公式 PDF)",
    publisher: "Citigroup",
    date: "2026-04-14",
    tier: "T1",
    summary: "Markets 月間 1,700 時間創出、コンプラ誤検知 30-40% 削減、レガシー 30 年→2 日。",
    url: "https://www.citigroup.com/rcs/citigpa/storage/public/Earnings/Q12026/2026psqtr1rslt.pdf",
  },
  {
    id: 12,
    title: "Goldman Sachs Taps Anthropic's Claude to Automate Accounting",
    publisher: "CNBC",
    date: "2026-02-06",
    tier: "T3",
    summary: "GS CIO Marco Argenti: Devin (Anthropic 共同開発)、Expert AI、開発者生産性 3-4 倍、GenAI 労働生産性 +15%。",
    url: "https://www.cnbc.com/2026/02/06/anthropic-goldman-sachs-ai-model-accounting.html",
  },
  {
    id: 13,
    title: "AI @ Morgan Stanley Debrief Launch / AI Adoption Accelerates",
    publisher: "Morgan Stanley",
    date: "2025-2026",
    tier: "T3",
    summary: "Debrief 会議要約 AI / FA 98% 日常利用 / AI 導入 1 年以上企業 生産性 +11.5% / ヘッドカウント -4%。",
    url: "https://www.morganstanley.com/press-releases/ai-at-morgan-stanley-debrief-launch",
  },
  {
    id: 14,
    title: "How HSBC fights money launderers with AI (DRA)",
    publisher: "Google Cloud + HSBC",
    date: "2025-2026",
    tier: "T1",
    summary: "DRA 誤検知 60% 削減、検知 2-4 倍、月間 9-10 億件監視、調査完了数週間→数日。",
    url: "https://cloud.google.com/blog/topics/financial-services/how-hsbc-fights-money-launderers-with-artificial-intelligence",
  },
  {
    id: 15,
    title: "DBS named World's Best AI Bank / DBS 2025 Annual Report",
    publisher: "DBS Bank",
    date: "2025",
    tier: "T1",
    summary: "AI 経済価値 S$1B 監査済み、2,000+ モデル / 430+ UC / 顧客満足度 +23% / システムインシデント -81%。",
    url: "https://www.dbs.com/annualreports/2025/index.html",
  },
  {
    id: 16,
    title: "Standard Chartered rolls out SC GPT",
    publisher: "Standard Chartered",
    date: "2025-03-27",
    tier: "T3",
    summary: "SC GPT 70,000 名体制、41 市場展開。規制違反 40%↓ / リスク工数 30%↓ / モデル配備 4×。",
    url: "https://www.sc.com/en/press-release/standard-chartered-rolls-out-sc-gpt-advancing-ai-driven-innovation-in-banking/",
  },
  {
    id: 17,
    title: "ProtectID / Chat Concierge / 推論コスト削減",
    publisher: "Capital One Newsroom",
    date: "2025-2026",
    tier: "T1",
    summary: "ProtectID 2026 FinTech Breakthrough Award 受賞、AI 推論コスト 1,000× 削減。",
    url: "https://www.capitalone.com/about/newsroom/",
  },
  {
    id: 18,
    title: "Gartner: AI Regulations Fuel Billion-Dollar Market / Forrester blog",
    publisher: "Gartner / Forrester",
    date: "2025-2026",
    tier: "T2",
    summary: "AI ガバナンスプラットフォーム市場 $10 億規模、ガバナンス効果 3.4×、パーソナライゼーション CLV 25-35%。",
    url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms",
  },
  {
    id: 19,
    title: "How Retail Banks Can Put Agentic AI to Work",
    publisher: "Boston Consulting Group",
    date: "2026",
    tier: "T2",
    summary: "リテール銀行のエージェント型 AI 活用、$370B profit potential by 2030。",
    url: "https://www.bcg.com/publications/2026/how-retail-banks-can-put-agentic-ai-to-work",
  },
  {
    id: 20,
    title: "2026 Banking and Capital Markets Outlook",
    publisher: "Deloitte",
    date: "2025-2026",
    tier: "T2",
    summary: "AI 導入 営業利益率改善 5-7% (2-3年) / 10-15% (5-7年)、67% AI/ML 運用、最大障壁は脆弱・断片化したデータ基盤。",
    url: "https://www.deloitte.com/us/en/insights/industry/financial-services/financial-services-industry-outlooks/banking-industry-outlook.html",
  },
  {
    id: 21,
    title: "How AI is reshaping banking",
    publisher: "PwC US Financial Services",
    date: "2025",
    tier: "T2",
    summary: "効率性比率 15 ポイント改善の分析。",
    url: "https://www.pwc.com/us/en/industries/financial-services/library/how-ai-is-reshaping-banking.html",
  },
  {
    id: 22,
    title: "Canaries in the Coal Mine (AI 職種雇用)",
    publisher: "Stanford Digital Economy Lab",
    date: "2025-11-13",
    tier: "T2",
    summary: "AI 影響職種 22-25 歳の雇用が 16% 相対減少 (2022-2025)、payroll 実データ実証研究。",
    url: "https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/",
  },
  {
    id: 23,
    title: "Banks View Doing Nothing with AI as Greatest Risk",
    publisher: "ABA Banking Journal",
    date: "2026-03-30",
    tier: "T3",
    summary: "AI 不採用リスクが採用リスクを上回るとする survey 結果。",
    url: "https://bankingjournal.aba.com/2026/03/aba-survey-banks-view-doing-nothing-with-ai-as-greatest-risk/",
  },
  {
    id: 24,
    title: "FS AI Risk Management Framework (230 統制目標、Press SB0401)",
    publisher: "U.S. Department of the Treasury",
    date: "2026-02-19",
    tier: "T1",
    summary: "NIST AI RMF を金融向けカスタマイズ。230 統制目標を 4 成熟段階 (Initial 21 / Minimal 126 / Evolving 193 / Embedded 230) にマッピング。",
    url: "https://home.treasury.gov/news/press-releases/sb0401",
  },
  {
    id: 25,
    title: "Evident AI Index 2025 (Banking Brief)",
    publisher: "Evident",
    date: "2025",
    tier: "T2",
    summary: "Top 10 (JPMC/COF/RBC/CommBank/MS/WF/UBS/HSBC/GS/BofA)、4 ピラー (Talent 45% / Innovation 30% / Leadership 15% / Transparency 10%)。",
    url: "https://evidentinsights.com/bankingbrief/heres-the-2025-evident-ai-index/",
  },
];

export const bankingReport = {
  hero,
  industryImpact,
  players,
  evidentTop10,
  roiDomains,
  roiDomainsSummary,
  consulting,
  timeline,
  principles,
  sources,
} as const;
