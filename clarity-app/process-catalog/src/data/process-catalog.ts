/**
 * Process Catalog — BackofficeAI 構想 sample processes.
 *
 * Source: ai_banking_landscape_analysis_jp.md §5 (接続パターン + BackofficeAI 構想)
 * + banking-report.ts use-case ROI rows.
 * Derived 2026-04-18, snapshot content (no auto-sync).
 *
 * 15 processes × 5 connection patterns distribution:
 *   API (4): 成熟 / 本命、安定動作、高速
 *   MQ (3): API の次点、非同期疎結合
 *   Agent (3): Emerging、Computer Use、POC 必須
 *   RPA (3): 最終手段、UI 変更で停止、API モダナイズ並行
 *   DB (2): 参照専用、判断業務不可、日次バッチ
 */

export type ConnectionPattern = "api" | "mq" | "agent" | "rpa" | "db";
export type Risk = "low" | "mid" | "high";
export type Maturity = "established" | "emerging";
export type ProcessState = "running" | "paused" | "error";

export interface Process {
  id: string;
  name: string;
  pattern: ConnectionPattern;
  risk: Risk;
  maturity: Maturity;
  state: ProcessState;
  owner: string;
  updatedAt: string;
  description: string;
  steps: string[];
  riskFactors: string[];
  relatedSources: number[]; // citation ids from banking-report.ts sources
}

export const processCatalog: Process[] = [
  // ===== API 連携 (4) =====
  {
    id: "fraud-realtime",
    name: "リアルタイム不正取引監視",
    pattern: "api",
    risk: "high",
    maturity: "established",
    state: "running",
    owner: "不正対策部",
    updatedAt: "2026-04-15",
    description:
      "カード / 送金 / オンラインバンキングのトランザクションを API 経由でリアルタイム監視し、ML モデルで不正スコアリング。高スコアは自動ブロック + 担当者通知。",
    steps: [
      "トランザクション発生 → コア系 API が不正検知 API に同期 POST",
      "AI モデルが特徴量 (金額 / 時刻 / 送付先 / デバイス) をスコア化",
      "閾値超過: 送金保留 + SMS 本人確認要求を自動送出",
      "担当者が Web UI で scored event を確認・承認/拒否",
      "承認判定を AI モデルへフィードバック (Human-in-the-Loop)",
    ],
    riskFactors: [
      "False positive で正常取引が止まる顧客体験劣化",
      "ML モデルドリフト (時間経過での精度低下)",
      "API latency が決済全体の速度を制約",
    ],
    relatedSources: [5, 14, 2],
  },
  {
    id: "balance-inquiry",
    name: "口座残高照会 API",
    pattern: "api",
    risk: "low",
    maturity: "established",
    state: "running",
    owner: "個人営業部",
    updatedAt: "2026-04-10",
    description:
      "モバイルアプリ / AI チャットボットから顧客の残高を即時取得する API。参照専用、更新なし。JPMC LLM Suite 型の社内アシスタント統合の前提。",
    steps: [
      "認証トークン検証 (OAuth 2.0 + OIDC)",
      "コア銀行システム内部 API を Gateway 経由で呼び出し",
      "顧客属性による参照権限チェック (RBAC)",
      "残高 + 直近 N 取引を JSON で返却",
      "監査ログに呼出元 / 応答時刻 / 結果を記録",
    ],
    riskFactors: [
      "認証トークン漏洩時のなりすまし",
      "API Gateway のキャパシティ不足でタイムアウト",
    ],
    relatedSources: [5],
  },
  {
    id: "rbac-authz",
    name: "RBAC 認可基盤",
    pattern: "api",
    risk: "high",
    maturity: "established",
    state: "running",
    owner: "情シス統制部",
    updatedAt: "2026-03-28",
    description:
      "全社横断の認可判定を集約する API。AI エージェント含む全ユーザの操作権限を単一 source of truth で判定。Charter Adaptation (RBAC) の foundation。",
    steps: [
      "呼出元サブジェクト (user / service / agent) + 操作 + リソース を送信",
      "ポリシーエンジン (OPA) が role / attribute を評価",
      "許否と理由 (reason phrase) を返却",
      "操作ログを SIEM に送出",
      "月次で権限過剰 detection を AI で走査、剥奪提案",
    ],
    riskFactors: [
      "Policy 定義ミスで過剰権限付与",
      "認可遅延で UI 全体の応答劣化",
    ],
    relatedSources: [24, 1],
  },
  {
    id: "settlement-api",
    name: "取引決済 API",
    pattern: "api",
    risk: "high",
    maturity: "established",
    state: "running",
    owner: "決済システム部",
    updatedAt: "2026-04-12",
    description:
      "資金移動 / 振込 / 送金の実行 API。強整合性 + 冪等性必須。Human-in-the-Loop で高額取引のみ承認ゲート。",
    steps: [
      "クライアントが冪等キー付きで送金要求",
      "残高確認 + 限度額チェック + AML リアルタイムスコア",
      "高額 / 高リスクは承認ワークフロー起動 (人間 HITL)",
      "2-phase commit で元帳更新",
      "確認応答 + 監査ログ",
    ],
    riskFactors: [
      "二重送金 (冪等性破綻)",
      "高額取引の完全自律化は禁止 (Charter 安全原則)",
    ],
    relatedSources: [5, 14, 2],
  },

  // ===== Azure Logic Apps + MQ (3) =====
  {
    id: "payment-reconcile-async",
    name: "支払照合 (非同期)",
    pattern: "mq",
    risk: "mid",
    maturity: "established",
    state: "running",
    owner: "決済オペ部",
    updatedAt: "2026-04-08",
    description:
      "加盟店 / 決済ネットワーク / 内部元帳の差分を日中バッチで突合。Azure Logic Apps + Service Bus で疎結合。",
    steps: [
      "各ソース CSV / API を Logic Apps がポーリング",
      "Service Bus キューにメッセージ投入",
      "ワーカーが並列でマッチング処理",
      "不一致は例外キューへ、担当者が画面で解消",
      "照合完了 → 会計システムへ確定データ送出",
    ],
    riskFactors: [
      "メッセージ順序保証が失敗すると重複照合",
      "クラウド経由のため厳密なデータ境界管理必要",
    ],
    relatedSources: [5, 11],
  },
  {
    id: "legacy-bridge-mq",
    name: "レガシー連携 bridge",
    pattern: "mq",
    risk: "mid",
    maturity: "established",
    state: "running",
    owner: "基幹系刷新 PMO",
    updatedAt: "2026-03-30",
    description:
      "メインフレーム基幹系と新クラウドサービス間を MQ で疎結合。API 公開が困難なレガシーへの橋渡し。",
    steps: [
      "新サービスが Logic Apps 経由でメッセージを送出",
      "MQ 上で永続化、失敗時は DLQ へ",
      "メインフレーム側 adapter が MQ を定期取得",
      "処理結果を逆方向 MQ で返信",
      "監視ダッシュボードで再送 / 失敗状況を可視化",
    ],
    riskFactors: [
      "DLQ に残留するメッセージの手動解消コスト",
      "メインフレーム側のスケジュール遅延で全体詰まり",
    ],
    relatedSources: [10, 11],
  },
  {
    id: "batch-notify-night",
    name: "夜間バッチ通知",
    pattern: "mq",
    risk: "low",
    maturity: "established",
    state: "paused",
    owner: "商品企画部",
    updatedAt: "2026-02-20",
    description:
      "夜間処理完了 / エラーを営業店へ通知する非同期 Job。Logic Apps で構築。Campaign 期間のみ有効化。",
    steps: [
      "夜間 Job が完了時にメッセージ送出",
      "MQ がルーティング (営業店 / 部署)",
      "翌朝営業開始時にメール / 社内ポータルで通知",
      "重要度別に SLA 管理",
    ],
    riskFactors: ["通知遅延で営業開始時の判断遅延"],
    relatedSources: [11],
  },

  // ===== AI Agent / Computer Use (3) =====
  {
    id: "doc-review-agent",
    name: "口座開設書類審査",
    pattern: "agent",
    risk: "mid",
    maturity: "emerging",
    state: "running",
    owner: "KYC オペ部",
    updatedAt: "2026-04-14",
    description:
      "Citi 型の書類審査自動化。AI Agent がスキャン書類を読み取り、不備を検出。担当者承認付き。75 分 → 15 分の実績 (Citi)。",
    steps: [
      "PDF / 画像を AI Agent に投入",
      "OCR + LLM で項目抽出、矛盾検出",
      "担当者が結果を UI で承認 (Human-in-the-Loop)",
      "承認後、コア系 API 経由で口座開設",
      "修正コメントを AI の業務マニュアルに蓄積 (蒸留)",
    ],
    riskFactors: [
      "Agent 確率的誤読で本人確認漏れ",
      "OCR ミスが承認フローで見落とされる",
    ],
    relatedSources: [10, 11],
  },
  {
    id: "legacy-ui-agent",
    name: "マニュアル解釈型レガシー操作",
    pattern: "agent",
    risk: "high",
    maturity: "emerging",
    state: "error",
    owner: "業務改革推進",
    updatedAt: "2026-04-16",
    description:
      "RPA で不安定な UI 変更頻度高いレガシー画面を、Anthropic Computer Use でマニュアル意図解釈しながら操作。POC 段階。",
    steps: [
      "担当者が操作マニュアル + スクリーンショットを Agent に提供",
      "Agent が画面を見ながら段階的実行、各ステップで人間承認",
      "失敗時は担当者が修正コメント、次回以降に反映",
      "一定精度達成後、夜間 / 休日に自律化",
      "高リスク取引は完全自律化しない設計",
    ],
    riskFactors: [
      "確率的動作による誤操作",
      "POC から本番化までに API コスト急増",
      "規制当局への説明責任",
    ],
    relatedSources: [24],
  },
  {
    id: "report-gen-agent",
    name: "夜間レポート生成 (POC)",
    pattern: "agent",
    risk: "low",
    maturity: "emerging",
    state: "paused",
    owner: "経営管理部",
    updatedAt: "2026-03-15",
    description:
      "営業店向けの翌日朝レポートを LLM Agent が夜間に生成。Notion / Confluence に投稿。POC で一部支店のみ。",
    steps: [
      "前日実績 CSV を Agent に投入",
      "テンプレート + 過去レポート参考に LLM が草稿生成",
      "AI ガバナンス team がサンプルレビュー",
      "OK ならポータル自動投稿、NG なら修正後承認",
      "週次でハルシネーション率を測定",
    ],
    riskFactors: ["ハルシネーション (事実と異なる表現)"],
    relatedSources: [5, 13],
  },

  // ===== RPA (3) =====
  {
    id: "form-transcribe",
    name: "帳票転記 RPA",
    pattern: "rpa",
    risk: "low",
    maturity: "established",
    state: "running",
    owner: "業務サポート部",
    updatedAt: "2026-04-05",
    description:
      "FAX / PDF 帳票を既存基幹 UI に RPA で転記。UI 変更時はメンテ発生。API モダナイズ完了までの繋ぎ。",
    steps: [
      "OCR で帳票項目抽出",
      "RPA script が基幹 UI を操作して入力",
      "確認画面で整合性チェック",
      "例外は担当者キューへ",
    ],
    riskFactors: ["UI 変更で RPA 停止", "OCR 誤認識の検証漏れ"],
    relatedSources: [10],
  },
  {
    id: "settlement-match-rpa",
    name: "決済照合 RPA",
    pattern: "rpa",
    risk: "mid",
    maturity: "established",
    state: "running",
    owner: "決済オペ部",
    updatedAt: "2026-04-01",
    description:
      "社内システムと外部決済ネットワークの差分を RPA で日次突合。将来は MQ 版に移行予定。",
    steps: [
      "各システムからデータ export",
      "RPA が突合スクリプト実行",
      "差分を Excel に出力",
      "担当者が Excel でレビュー",
    ],
    riskFactors: ["API モダナイズが遅延し続けると保守コスト累積"],
    relatedSources: [11],
  },
  {
    id: "report-daily-rpa",
    name: "定型レポート作成 RPA",
    pattern: "rpa",
    risk: "low",
    maturity: "established",
    state: "running",
    owner: "営業企画部",
    updatedAt: "2026-03-22",
    description:
      "日次 KPI レポートを定型スクリプトで生成、経営陣にメール送出。内容固定、UI 安定。",
    steps: [
      "定時起動、データソースから取得",
      "Excel テンプレートに値埋め込み",
      "PDF 化 + メール添付送出",
      "失敗時は再実行",
    ],
    riskFactors: ["元データソースの schema 変更"],
    relatedSources: [5],
  },

  // ===== DB 日次コピー (2) =====
  {
    id: "legacy-db-snapshot",
    name: "閉鎖レガシー DB 参照",
    pattern: "db",
    risk: "low",
    maturity: "established",
    state: "running",
    owner: "顧客分析部",
    updatedAt: "2026-04-02",
    description:
      "API / MQ で接続できない完全閉域のレガシー DB を、日次スナップショットで AI 分析環境に複製。参照専用、判断業務には使わない。",
    steps: [
      "夜間に DB ダンプ取得",
      "転送経路暗号化して AI 環境へ copy",
      "BI / AI モデルで参照",
      "同期失敗を翌朝監視",
    ],
    riskFactors: [
      "日次バッチのため直近データ反映遅延",
      "スナップショットのプライバシー扱い",
    ],
    relatedSources: [2, 20],
  },
  {
    id: "archive-query",
    name: "過去取引 archive 参照",
    pattern: "db",
    risk: "low",
    maturity: "established",
    state: "running",
    owner: "リスク管理部",
    updatedAt: "2026-03-18",
    description:
      "10 年超の過去取引を低頻度アクセス用 archive DB に格納、日次更新。規制対応検索に利用。",
    steps: [
      "本番 DB から 10 年超データを archive へ移管",
      "日次で新規過去化対象を追加",
      "規制検索時のみ read-only アクセス",
      "整合性検査を月次実施",
    ],
    riskFactors: ["整合性検査コスト", "規制期間延長時の retention 見直し"],
    relatedSources: [24],
  },
];
