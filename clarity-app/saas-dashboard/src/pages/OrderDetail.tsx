import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AppShell,
  Badge,
  BlurFade,
  BorderBeam,
  Body,
  Button,
  Callout,
  Caption,
  Checkmark,
  Collapsible,
  ConfidenceBadge,
  CursorSpotlight,
  ErrorState,
  Eyebrow,
  Footer,
  GlareSweep,
  Heading,
  MicroBar,
  PermissionGate,
  ProgressBar,
  Pulse,
  RegenerateButton,
  SectionReveal,
  SkipLink,
  StaggerReveal,
  StreamingText,
  Stepper,
  Tabs,
  TextShimmer,
  ThemeToggle,
  TierBadge,
  Toast,
  Tooltip,
  TopBar,
  BrandMark,
  useOptimisticAction,
  type StepDef,
} from "@clarity-ds/core";
import {
  AI_FRAUD_ANALYSIS,
  AI_RISK_FACTORS,
  findCustomer,
  findTransaction,
  formatAmount,
  type TxStatus,
} from "../data/mock";

const STATUS_META: Record<
  TxStatus,
  { label: string; cls: string; help: string }
> = {
  succeeded: {
    label: "完了",
    cls: "bg-success-soft text-success-strong",
    help: "決済成立、着金済み",
  },
  pending: {
    label: "処理中",
    cls: "bg-info-soft text-info-strong",
    help: "オーソリ取得後、キャプチャ待ち",
  },
  failed: {
    label: "失敗",
    cls: "bg-error-soft text-error-strong",
    help: "与信エラーまたはネットワーク拒否",
  },
  disputed: {
    label: "異議あり",
    cls: "bg-warning-soft text-warning-strong",
    help: "顧客からチャージバック申立 (48h 以内に証憑提出要)",
  },
};

const METHOD_LABEL: Record<string, string> = {
  card: "カード決済",
  wire: "電信送金 (Wire)",
  ach: "ACH Direct Debit",
};

const METHOD_HELP: Record<string, string> = {
  card: "即時決済 · 手数料 3%",
  wire: "1-3 営業日 · 固定 $25",
  ach: "3-5 営業日 · 手数料 0.8%",
};

const TIMELINE_STEPS: StepDef[] = [
  { key: "1", label: "取引作成", description: "08:31 UTC / 17:31 JST", state: "completed" },
  { key: "2", label: "オーソリ取得", description: "08:31 UTC / 17:31 JST", state: "completed" },
  { key: "3", label: "キャプチャ", description: "08:32 UTC / 17:32 JST", state: "completed" },
  { key: "4", label: "ディスピュート発生", description: "09:15 UTC / 18:15 JST", state: "error" },
  { key: "5", label: "レビュー待ち", description: "担当者アサイン予定", state: "current" },
  { key: "6", label: "解決", description: "未実施", state: "pending" },
];

interface PaymentState {
  status: TxStatus;
  notes: number;
}

type ToastState = {
  key: number;
  variant: "info" | "success" | "warning" | "error";
  msg: string;
  undoable?: boolean;
  onUndo?: () => void;
};

export function OrderDetail({ id }: { id: string }) {
  const tx = findTransaction(id);
  const customer = tx ? findCustomer(tx.customerId) : undefined;
  const [aiSession, setAiSession] = useState(0);
  const [aiRegenerating, setAiRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refundDialog, setRefundDialog] = useState(false);
  const [refunded, setRefunded] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toastKeyRef = useRef(0);
  const refundTimerRef = useRef<number | null>(null);

  const refundAction = useOptimisticAction<PaymentState, []>({
    initial: { status: tx?.status ?? "succeeded", notes: 0 },
    optimistic: (current) => ({ ...current, status: "pending" }),
    mutate: async () => {
      await new Promise((r) => window.setTimeout(r, 1400));
      return { status: "succeeded" as TxStatus, notes: 1 };
    },
    onError: () => {
      pushToast({ variant: "error", msg: "返金処理に失敗しました" });
    },
  });

  function pushToast(t: Omit<ToastState, "key">) {
    toastKeyRef.current += 1;
    const key = toastKeyRef.current;
    setToasts((cur) => [{ key, ...t }, ...cur.slice(0, 2)]);
    return key;
  }

  function dismissToast(key: number) {
    setToasts((cur) => cur.filter((t) => t.key !== key));
  }

  useEffect(() => {
    return () => {
      if (refundTimerRef.current !== null) {
        window.clearTimeout(refundTimerRef.current);
      }
    };
  }, []);

  if (!tx) {
    return (
      <AppShell
        maxWidth="md"
        skipLink={<SkipLink href="#main">本文へスキップ</SkipLink>}
        topBar={
          <TopBar
            left={<BrandMark label="P" wordmark="Payments" sublabel="Detail" />}
            right={<ThemeToggle />}
          />
        }
      >
        <ErrorState
          severity="critical"
          title="取引が見つかりませんでした"
          description={`取引 ID "${id}" はシステムに存在しません。`}
          retry={
            <Button variant="secondary" onClick={() => (window.location.hash = "")}>
              ダッシュボードに戻る
            </Button>
          }
        />
      </AppShell>
    );
  }

  const meta = STATUS_META[tx.status];
  const riskPercent = Math.round(tx.riskScore * 100);

  function handleRegenerate() {
    setAiRegenerating(true);
    window.setTimeout(() => {
      setAiRegenerating(false);
      setAiSession((n) => n + 1);
      pushToast({ variant: "success", msg: "AI 分析を再生成しました" });
    }, 1200);
  }

  function handleRefund() {
    refundAction.dispatch();
    setRefundDialog(false);
    setRefunded(true);
    const key = pushToast({
      variant: "info",
      msg: "返金処理を受け付けました",
      undoable: true,
      onUndo: () => {
        setRefunded(false);
        dismissToast(key);
        pushToast({ variant: "info", msg: "返金を取消しました" });
        if (refundTimerRef.current !== null) {
          window.clearTimeout(refundTimerRef.current);
          refundTimerRef.current = null;
        }
      },
    });
    refundTimerRef.current = window.setTimeout(() => {
      dismissToast(key);
      pushToast({ variant: "success", msg: "返金が完了しました" });
      refundTimerRef.current = null;
    }, 5200);
  }

  function handleTabChange(next: string) {
    setActiveTab(next);
  }

  return (
    <>
      <AppShell
        maxWidth="xl"
        skipLink={<SkipLink href="#main">本文へスキップ</SkipLink>}
        progressBar={<ProgressBar />}
        topBar={
          <TopBar
            left={
              <BrandMark
                label="P"
                wordmark="Payments"
                sublabel="Transaction Detail"
              />
            }
            center={
              <nav aria-label="breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
                <a href="#/" className="transition-colors duration-fast hover:text-foreground">
                  ダッシュボード
                </a>
                <span aria-hidden>/</span>
                <a href="#/" className="transition-colors duration-fast hover:text-foreground">
                  取引
                </a>
                <span aria-hidden>/</span>
                <span className="font-mono text-foreground">{tx.id}</span>
              </nav>
            }
            right={
              <Tooltip label="テーマを切り替え (light / dark / system)">
                <span>
                  <ThemeToggle />
                </span>
              </Tooltip>
            }
          />
        }
      >
        <div className="flex flex-col gap-10">
          <SectionReveal>
            <div className="flex flex-col gap-4">
              <Eyebrow tone="brand">Transaction</Eyebrow>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Heading level={1}>
                    <TextShimmer as="span">{tx.id}</TextShimmer>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span className="tabular-nums">
                      {formatAmount(tx.amount, tx.currency)}
                    </span>
                  </Heading>
                  <Body size="md" className="text-muted-foreground">
                    {customer ? customer.name : "Unknown customer"} ·{" "}
                    <Tooltip label={METHOD_HELP[tx.method]}>
                      <span className="underline decoration-dotted underline-offset-4">
                        {METHOD_LABEL[tx.method]}
                      </span>
                    </Tooltip>{" "}
                    · {tx.region} リージョン
                  </Body>
                </div>
                <div className="flex items-center gap-3">
                  <Tooltip label={meta.help}>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ${meta.cls}`}
                    >
                      <span
                        className="inline-block size-2 rounded-full bg-current"
                        aria-hidden
                      />
                      {meta.label}
                    </span>
                  </Tooltip>
                  <Tooltip label={`モデル信頼度 ${Math.round((1 - tx.riskScore) * 100)}% · T1 ソース`}>
                    <span>
                      <ConfidenceBadge value={1 - tx.riskScore} sourceTier="T1" />
                    </span>
                  </Tooltip>
                </div>
              </div>
              {tx.status === "disputed" && (
                <Callout variant="warning" title="ディスピュートが発生しています">
                  顧客からの異議申立てが受理されました。48 時間以内に証憑を提出する必要があります。
                </Callout>
              )}
            </div>
          </SectionReveal>

          <Tabs
            tabs={[
              { id: "overview", label: "概要" },
              { id: "risk", label: "AI リスク分析" },
              { id: "timeline", label: "タイムライン" },
              { id: "notes", label: "メモ" },
            ]}
            activeId={activeTab}
            onChange={handleTabChange}
          />

          <div key={activeTab} className="tab-panel-enter">
            {activeTab === "overview" && (
              <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="hover-lift rounded-md">
                  <CursorSpotlight
                    tone="brand"
                    className="rounded-md p-5 ring-1 ring-inset ring-border"
                  >
                    <Eyebrow>決済情報</Eyebrow>
                    <Heading level={4} className="mt-2">
                      {METHOD_LABEL[tx.method]}
                    </Heading>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">通貨</dt>
                        <dd className="font-semibold">{tx.currency}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">カテゴリ</dt>
                        <dd className="font-semibold">{tx.category}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">リージョン</dt>
                        <dd className="font-semibold">{tx.region}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">作成日時</dt>
                        <dd className="tabular-nums">
                          {new Date(tx.createdAt).toLocaleString("ja-JP")}
                        </dd>
                      </div>
                    </dl>
                  </CursorSpotlight>
                </div>
                <div className="hover-lift rounded-md p-5 ring-1 ring-inset ring-border">
                  <Eyebrow>顧客情報</Eyebrow>
                  {customer ? (
                    <>
                      <div className="mt-2 flex items-center gap-2">
                        <Tooltip label={`${customer.tier} tier · 信頼度 ${customer.tier === "T1" ? "最高" : "中"}`}>
                          <TierBadge tier={customer.tier} size="md" />
                        </Tooltip>
                        <Heading level={4}>{customer.name}</Heading>
                      </div>
                      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">顧客 ID</dt>
                          <dd className="font-mono text-xs">{customer.id}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">連絡先</dt>
                          <dd>
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-primary transition-colors duration-fast hover:underline active:text-primary-strong"
                            >
                              {customer.email}
                            </a>
                          </dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <Caption>顧客情報が取得できませんでした</Caption>
                  )}
                </div>
              </StaggerReveal>
            )}

            {activeTab === "risk" && (
              <BlurFade>
                <section className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Eyebrow tone="brand">AI FRAUD ANALYSIS</Eyebrow>
                    <Tooltip label="独立検証済 (Tier 1 = 一次ソース)">
                      <span>
                        <ConfidenceBadge value={0.94} sourceTier="T1" />
                      </span>
                    </Tooltip>
                    <Tooltip label={`リスクスコア ${riskPercent}% — 高リスク閾値 60% 超`}>
                      <span>
                        <Pulse trigger={aiSession} tone="error">
                          <Badge variant="agent" label={`リスク ${riskPercent}`} />
                        </Pulse>
                      </span>
                    </Tooltip>
                  </div>
                  <BorderBeam tone="ai" className="p-5">
                    <div className="flex flex-col gap-4">
                      <Body size="sm">
                        <StreamingText
                          key={aiSession}
                          text={AI_FRAUD_ANALYSIS}
                          charsPerSecond={60}
                        />
                      </Body>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Caption>
                          Model: fraud-v3.2 · Generated{" "}
                          {new Date().toLocaleString("ja-JP")}
                        </Caption>
                        <PermissionGate
                          required="ai.regenerate"
                          mode="disable"
                          reason="再生成権限が必要です"
                        >
                          <Tooltip label="別角度で再分析 (約 1.2 秒)">
                            <span>
                              <RegenerateButton
                                variant="ai"
                                loading={aiRegenerating}
                                onClick={handleRegenerate}
                              />
                            </span>
                          </Tooltip>
                        </PermissionGate>
                      </div>
                    </div>
                  </BorderBeam>

                  <div className="hover-lift rounded-md p-5 ring-1 ring-inset ring-border">
                    <Eyebrow>リスク要因スコアカード</Eyebrow>
                    <Heading level={4} className="mt-2">
                      検出された異常パターン
                    </Heading>
                    <ul className="mt-4 flex flex-col gap-3">
                      {AI_RISK_FACTORS.map((f) => (
                        <li
                          key={f.label}
                          className="grid grid-cols-[1fr_auto_60px] items-center gap-3"
                        >
                          <Tooltip
                            label={
                              f.weight === "high"
                                ? "高寄与: このシグナル単独で hold 判定"
                                : f.weight === "medium"
                                  ? "中寄与: 他シグナルと組合せで判断"
                                  : "低寄与: 通常範囲内"
                            }
                          >
                            <span className="text-sm">{f.label}</span>
                          </Tooltip>
                          <MicroBar
                            value={f.value}
                            tone={
                              f.weight === "high"
                                ? "error"
                                : f.weight === "medium"
                                  ? "warning"
                                  : "success"
                            }
                            width={140}
                            height={6}
                          />
                          <span className="tabular-nums text-right text-xs font-medium text-muted-foreground">
                            {f.value}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </BlurFade>
            )}

            {activeTab === "timeline" && (
              <SectionReveal>
                <section className="hover-lift rounded-md p-5 ring-1 ring-inset ring-border">
                  <Eyebrow>Timeline</Eyebrow>
                  <Heading level={4} className="mt-2">
                    取引イベント履歴
                  </Heading>
                  <div className="mt-4">
                    <Stepper steps={TIMELINE_STEPS} orientation="vertical" />
                  </div>
                </section>
              </SectionReveal>
            )}

            {activeTab === "notes" && (
              <SectionReveal>
                <div className="flex flex-col gap-3">
                  <Collapsible
                    defaultOpen
                    summary={
                      <span className="flex items-center gap-2">
                        <Eyebrow>内部メモ</Eyebrow>
                        <Caption as="span">2 件</Caption>
                      </span>
                    }
                  >
                    <div className="flex flex-col gap-3 pt-2">
                      <Callout variant="note" title="リスクチーム 引継ぎ">
                        顧客へ本人確認連絡済。折り返し待ち (2026-04-18 17:45)。
                      </Callout>
                      <Callout variant="important" title="法務確認事項">
                        チャージバック期限まで 46 時間。証憑収集を優先。
                      </Callout>
                    </div>
                  </Collapsible>
                  <Collapsible
                    summary={
                      <span className="flex items-center gap-2">
                        <Eyebrow>顧客とのコミュニケーション</Eyebrow>
                        <Caption as="span">3 件</Caption>
                      </span>
                    }
                  >
                    <ul className="mt-2 flex flex-col gap-2 text-sm">
                      <li className="flex items-start gap-3">
                        <Caption className="w-24 shrink-0">17:31</Caption>
                        <span>取引成功 email 自動送信</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Caption className="w-24 shrink-0">18:15</Caption>
                        <span>顧客から異議申立て受理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Caption className="w-24 shrink-0">18:40</Caption>
                        <span>自動応答送信 (調査開始)</span>
                      </li>
                    </ul>
                  </Collapsible>
                </div>
              </SectionReveal>
            )}
          </div>

          {refunded && (
            <div className="flex items-start gap-4 rounded-md bg-success-soft/60 p-4 text-success-strong ring-1 ring-inset ring-success-soft">
              <Checkmark tone="success" size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  返金リクエストを受け付けました
                </p>
                <p className="text-xs opacity-90">
                  {refundAction.isPending
                    ? "処理中です。完了まで最大 1 分かかります。"
                    : "処理が完了しました。"}
                </p>
              </div>
            </div>
          )}

          <section className="flex flex-wrap items-center gap-3 rounded-md bg-muted/30 p-5">
            <div className="mr-auto flex flex-col gap-1">
              <Eyebrow>Actions</Eyebrow>
              <Heading level={4}>取引アクション</Heading>
              <Caption as="span">
                追加権限は URL に <code>?role=admin</code> 付与で有効化
              </Caption>
            </div>
            <PermissionGate
              required="payment.approve"
              mode="disable"
              reason="承認権限が必要です"
            >
              <Tooltip label="オーソリを即時キャプチャ">
                <span>
                  <GlareSweep>
                    <Button variant="primary">オーソリ承認</Button>
                  </GlareSweep>
                </span>
              </Tooltip>
            </PermissionGate>
            <Tooltip label="証憑ファイル (PDF / 画像) をアップロード">
              <Button
                variant="secondary"
                onClick={() =>
                  pushToast({ variant: "info", msg: "アップロード UI を開く (mock)" })
                }
              >
                証憑アップロード
              </Button>
            </Tooltip>
            <Tooltip label="この取引の詳細を JSON / PDF で出力">
              <Button
                variant="ghost"
                onClick={() =>
                  pushToast({ variant: "info", msg: "エクスポートを開始 (mock)" })
                }
              >
                エクスポート
              </Button>
            </Tooltip>
            <PermissionGate
              required="payment.refund"
              mode="disable"
              reason="返金権限 (admin) が必要です"
            >
              <Tooltip label="全額返金を実行 (取消可能期間 5 秒)">
                <span>
                  <Button
                    variant="destructive"
                    onClick={() => setRefundDialog(true)}
                    disabled={refundAction.isPending}
                  >
                    {refundAction.isPending ? "処理中..." : "返金実行"}
                  </Button>
                </span>
              </Tooltip>
            </PermissionGate>
          </section>

          <Footer>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 text-xs text-muted-foreground">
              <span>© 2026 Payments SaaS — Clarity Full-Dimension Sample</span>
              <span className="flex items-center gap-4">
                <a href="#/" className="hover:text-foreground">
                  ← ダッシュボードへ
                </a>
              </span>
            </div>
          </Footer>
        </div>
      </AppShell>

      <AlertDialog
        open={refundDialog}
        onClose={() => setRefundDialog(false)}
        title="返金を実行しますか?"
        description={`${tx.id} (${formatAmount(tx.amount, tx.currency)}) を全額返金します。5 秒以内であれば取消可能です。`}
        confirmLabel="返金する"
        cancelLabel="キャンセル"
        onConfirm={handleRefund}
        variant="destructive"
      />

      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t, i) => (
          <div
            key={t.key}
            style={{ transform: `translateY(${-i * 2}px)` }}
            className="pointer-events-auto"
          >
            <Toast
              open
              variant={t.variant}
              onClose={() => dismissToast(t.key)}
              duration={t.undoable ? 5200 : 3200}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{t.msg}</span>
                {t.undoable && t.onUndo && (
                  <button
                    type="button"
                    onClick={t.onUndo}
                    className="shrink-0 rounded-xs px-2 py-0.5 text-xs font-semibold underline-offset-2 hover:underline focus-visible:underline"
                  >
                    取消 (5s)
                  </button>
                )}
              </div>
            </Toast>
          </div>
        ))}
      </div>
    </>
  );
}
