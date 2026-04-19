import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  BlurFade,
  Breadcrumb,
  Button,
  Callout,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardSub,
  CardTitle,
  Collapsible,
  CountUp,
  CopilotPanel,
  EmptyState,
  ErrorState,
  Eyebrow,
  FilterBar,
  Fmt,
  Freshness,
  Heading,
  HighlightNum,
  ImpactRow,
  Kbd,
  MetricValue,
  MicroBar,
  NotificationCenter,
  ProgressRing,
  Pulse,
  SectionReveal,
  Skeleton,
  Sparkline,
  StaggerReveal,
  StatCard,
  Stepper,
  SystemStatusBar,
  Table,
  Tabs,
  TierBadge,
  TimeRangeSelector,
  Toast,
  Tooltip,
  type FilterDef,
  type FilterValue,
  type NotificationItem,
  type StepDef,
  type SystemStatusState,
  type TableColumn,
  type TableRow,
  type TableSort,
} from "@clarity-ds/core";
import {
  CATEGORY_MIX,
  KPI_TRENDS,
  TRANSACTIONS,
  findCustomer,
  formatTime,
  type Transaction,
  type TxStatus,
} from "../data/mock";

interface DashboardProps {
  onOpenNotif: () => void;
  notifOpen: boolean;
  onCloseNotif: () => void;
  notifications: NotificationItem[];
}

const STATUS_LABEL: Record<TxStatus, string> = {
  succeeded: "完了",
  pending: "処理中",
  failed: "失敗",
  disputed: "異議",
};

const STATUS_TONE: Record<TxStatus, "success" | "info" | "danger" | "warning"> = {
  succeeded: "success",
  pending: "info",
  failed: "danger",
  disputed: "warning",
};

const STATUS_HELP: Record<TxStatus, string> = {
  succeeded: "決済が成立、着金済み",
  pending: "オーソリ取得後、キャプチャ待ち",
  failed: "与信エラーまたはネットワーク拒否",
  disputed: "顧客からチャージバック申立",
};

const METHOD_VARIANT: Record<
  Transaction["method"],
  "api" | "mq" | "db"
> = { card: "api", wire: "mq", ach: "db" };

const METHOD_LABEL: Record<Transaction["method"], string> = {
  card: "カード",
  wire: "電信",
  ach: "ACH",
};

const METHOD_HELP: Record<Transaction["method"], string> = {
  card: "即時決済 · 3% 手数料",
  wire: "1-3 営業日 · 固定 $25",
  ach: "3-5 営業日 · 0.8% 手数料",
};

const FILTER_DEFS: FilterDef[] = [
  {
    id: "status",
    label: "ステータス",
    options: [
      { value: "succeeded", label: "完了" },
      { value: "pending", label: "処理中" },
      { value: "failed", label: "失敗" },
      { value: "disputed", label: "異議" },
    ],
  },
  {
    id: "region",
    label: "リージョン",
    options: [
      { value: "US", label: "US" },
      { value: "EU", label: "EU" },
      { value: "APAC", label: "APAC" },
      { value: "LATAM", label: "LATAM" },
    ],
  },
];

const ONBOARD_STEPS: StepDef[] = [
  { key: "1", label: "アカウント検証", description: "本人確認書類", state: "completed" },
  { key: "2", label: "決済方法接続", description: "Card / Wire / ACH", state: "completed" },
  { key: "3", label: "Webhook 設定", description: "イベント通知先", state: "current" },
  { key: "4", label: "本番切替", description: "テスト→本番", state: "pending" },
];

const TIME_RANGE_OPTIONS = [
  { value: "5m", label: "5m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

type ToastState = {
  key: number;
  variant: "info" | "success" | "warning" | "error";
  msg: string;
  action?: { label: string; onClick: () => void };
};

function TxStatusPill({ status }: { status: TxStatus }) {
  return (
    <Tooltip label={STATUS_HELP[status]}>
      <Badge tone={STATUS_TONE[status]} dot>
        {STATUS_LABEL[status]}
      </Badge>
    </Tooltip>
  );
}

export function Dashboard({
  onOpenNotif,
  notifOpen,
  onCloseNotif,
  notifications,
}: DashboardProps) {
  const [filters, setFilters] = useState<FilterValue>({});
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState<TableSort | null>({
    columnId: "createdAt",
    direction: "desc",
  });
  const [aiSession, setAiSession] = useState(0);
  const [aiRegenerating, setAiRegenerating] = useState(false);
  const [timeRange, setTimeRange] = useState("6h");
  const [bannerState, setBannerState] = useState<SystemStatusState | "dismissed">("degraded");
  const [initialLoading, setInitialLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [streamingAi, setStreamingAi] = useState(true);
  const [streamedText, setStreamedText] = useState("");
  const [prompt, setPrompt] = useState("");
  const toastKeyRef = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const aiFull =
    "TXN-2404 (Coastal Media Inc, $89,300) は通常パターンから逸脱。金額が同社平均の 10 倍、Device fingerprint は新規、Velocity check で card testing pattern の兆候 (1h 内 3 件試行 / 1 失敗)。推奨: 48h temporary hold + 顧客確認。";

  useEffect(() => {
    if (!streamingAi) return;
    setStreamedText("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setStreamedText(aiFull.slice(0, i));
      if (i >= aiFull.length) {
        window.clearInterval(id);
        setStreamingAi(false);
      }
    }, 18);
    return () => window.clearInterval(id);
  }, [streamingAi, aiSession]);

  function pushToast(t: Omit<ToastState, "key">) {
    toastKeyRef.current += 1;
    const key = toastKeyRef.current;
    setToasts((cur) => [{ key, ...t }, ...cur.slice(0, 2)]);
    return key;
  }

  function dismissToast(key: number) {
    setToasts((cur) => cur.filter((t) => t.key !== key));
  }

  const tabFilter: string | null =
    activeTab === "disputed" || activeTab === "pending" ? activeTab : null;

  const filteredTx = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (tabFilter && t.status !== tabFilter) return false;
      for (const [key, raw] of Object.entries(filters)) {
        if (raw == null) continue;
        if (Array.isArray(raw)) {
          if (raw.length === 0) continue;
          if (!raw.includes(String(t[key as keyof Transaction]))) return false;
        } else if (String(t[key as keyof Transaction]) !== raw) return false;
      }
      return true;
    });
  }, [filters, tabFilter]);

  const sortedTx = useMemo(() => {
    if (!sort) return filteredTx;
    const { columnId, direction } = sort;
    return [...filteredTx].sort((a, b) => {
      const av = a[columnId as keyof Transaction];
      const bv = b[columnId as keyof Transaction];
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return direction === "asc" ? cmp : -cmp;
    });
  }, [filteredTx, sort]);

  const columns: TableColumn[] = [
    { id: "id", label: "取引 ID", sortable: true, widthClass: "w-[140px]" },
    { id: "createdAt", label: "時刻", sortable: true, widthClass: "w-[80px]" },
    { id: "customer", label: "顧客" },
    { id: "method", label: "方式" },
    { id: "region", label: "リージョン" },
    { id: "amount", label: "金額", align: "right", numeric: true, sortable: true },
    { id: "risk", label: "リスク", align: "right" },
    { id: "status", label: "ステータス" },
  ];

  const rows: TableRow[] = sortedTx.map((t) => {
    const customer = findCustomer(t.customerId);
    return {
      id: t.id,
      cells: {
        id: (
          <a
            href={`#/order/${t.id}`}
            className="font-mono text-xs text-primary transition-colors duration-fast hover:underline active:text-primary-strong"
          >
            {t.id}
          </a>
        ),
        createdAt: (
          <span className="tabular-nums text-xs text-muted-foreground">
            {formatTime(t.createdAt)}
          </span>
        ),
        customer: customer ? (
          <span className="flex items-center gap-2">
            <Tooltip label={`${customer.tier} · ${customer.email}`}>
              <TierBadge tier={customer.tier} size="sm" />
            </Tooltip>
            <span>{customer.name}</span>
          </span>
        ) : null,
        method: (
          <Tooltip label={METHOD_HELP[t.method]}>
            <Badge variant={METHOD_VARIANT[t.method]} label={METHOD_LABEL[t.method]} />
          </Tooltip>
        ),
        region: <Caption as="span">{t.region}</Caption>,
        amount: (
          <span className="tabular-nums font-medium">
            {t.currency === "JPY" ? Fmt.yen(t.amount) : `${Fmt.dec(t.amount)} ${t.currency}`}
          </span>
        ),
        risk: (
          <Tooltip
            label={`リスク ${Math.round(t.riskScore * 100)}% · ${
              t.riskScore > 0.6 ? "高リスク" : t.riskScore > 0.35 ? "中リスク" : "低リスク"
            }`}
          >
            <span className="inline-flex items-center justify-end gap-2">
              <MicroBar
                value={t.riskScore * 100}
                tone={t.riskScore > 0.6 ? "error" : t.riskScore > 0.35 ? "warning" : "success"}
                width={44}
                height={4}
              />
              <span className="tabular-nums text-xs text-muted-foreground">
                {Math.round(t.riskScore * 100)}
              </span>
            </span>
          </Tooltip>
        ),
        status: <TxStatusPill status={t.status} />,
      },
    };
  });

  function handleRegenerate() {
    setAiRegenerating(true);
    setStreamingAi(true);
    window.setTimeout(() => {
      setAiRegenerating(false);
      setAiSession((n) => n + 1);
    }, 400);
  }

  function handleExport() {
    pushToast({
      variant: "success",
      msg: "CSV エクスポートを開始しました",
      action: { label: "開く", onClick: () => {} },
    });
  }

  const totalVolumeUSD = TRANSACTIONS.reduce(
    (sum, t) =>
      sum +
      (t.currency === "USD"
        ? t.amount
        : t.currency === "EUR"
          ? t.amount * 1.08
          : t.amount * 0.0065),
    0,
  );
  const disputeCount = TRANSACTIONS.filter((t) => t.status === "disputed").length;

  return (
    <>
      {/* Sticky page header (within shell's main area) */}
      <header
        id="main"
        className="sticky top-0 z-20 border-b border-border bg-background/85 px-8 py-4 backdrop-blur-md motion-reduce:backdrop-blur-0"
      >
        <div className="mb-2 flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: "Payments", onClick: () => {} },
              { label: "Overview", onClick: () => {} },
              { label: "ap-northeast-1", dropdown: true, onClick: () => {} },
            ]}
          />
          <div className="flex items-center gap-1.5">
            <Freshness live />
            <Tooltip label="⌘ + R でリロード">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={
                  <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
              >
                同期
              </Button>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={
                <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              onClick={handleExport}
            >
              エクスポート
            </Button>
            <div className="relative">
              <Tooltip label={`通知 (${notifications.filter((n) => n.unread).length} 件未読)`}>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={onOpenNotif}
                  iconLeft={
                    <span className="relative">
                      <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" />
                      </svg>
                      <span className="absolute -right-0.5 -top-0.5 size-[7px] rounded-full border-[1.5px] border-background bg-error" aria-hidden />
                    </span>
                  }
                />
              </Tooltip>
              {notifOpen && (
                <NotificationCenter
                  items={notifications}
                  onClose={onCloseNotif}
                  onMarkAllRead={() => {}}
                  onViewAll={() => {}}
                  onOpenSettings={() => {}}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <Heading level={1} className="text-[32px] leading-[1.15] tracking-[-0.025em]">
              本日の決済状況
            </Heading>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Production · Tokyo region</span>
              <span className="size-[3px] rounded-full bg-muted-foreground/60" aria-hidden />
              <span className="font-mono tabular-nums">
                {Fmt.stamp(new Date())} JST
              </span>
              {disputeCount > 0 && (
                <Badge tone="warning" dot>
                  {disputeCount} 件 要確認
                </Badge>
              )}
            </div>
          </div>
          <TimeRangeSelector
            options={TIME_RANGE_OPTIONS}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </header>

      {/* Main grid: content + Copilot */}
      <div className="grid grid-cols-[1fr_340px] gap-0">
        <div className="thin-scroll flex flex-col gap-5 px-8 py-5">
          {/* System status banner */}
          {bannerState !== "dismissed" && (
            <SystemStatusBar
              state={bannerState}
              onCycle={() =>
                setBannerState((s) =>
                  s === "degraded" ? "throttled" : s === "throttled" ? "stale" : "degraded",
                )
              }
              onDismiss={() => setBannerState("dismissed")}
            />
          )}

          {/* KPI row */}
          <SectionReveal>
            {initialLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardBody className="flex flex-col gap-2 p-3.5">
                      <Skeleton variant="text" className="w-2/3" />
                      <Skeleton variant="rect" className="h-8 w-1/2" />
                      <Skeleton variant="rect" className="h-7 w-full" />
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <StaggerReveal className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="REQUESTS / MIN"
                  sublabel="リクエスト"
                  help="直近 1 分の取引数。成功・失敗を含む。"
                  value={<CountUp value={TRANSACTIONS.length * 4} duration={900} />}
                  unit="件"
                  delta={{ value: 2.4, direction: "up" }}
                  trend={KPI_TRENDS.volume}
                  tone="brand"
                />
                <KpiCard
                  label="P95 LATENCY"
                  sublabel="レイテンシ p95"
                  help="95 パーセンタイル処理時間。目標 < 200ms"
                  value={<CountUp value={142} duration={900} />}
                  unit="ms"
                  delta={{ value: 8.1, direction: "down" }}
                  positiveIsGood={false}
                  trend={KPI_TRENDS.count}
                  tone="info"
                />
                <KpiCard
                  label="ERROR RATE"
                  sublabel="エラー率"
                  help="失敗取引の割合。異議は別集計。"
                  value={<CountUp value={0.42} decimals={2} duration={900} />}
                  unit="%"
                  delta={{ value: 0.18, direction: "up" }}
                  positiveIsGood={false}
                  trend={KPI_TRENDS.dispute}
                  tone="warning"
                />
                <KpiCard
                  label="APDEX"
                  sublabel="Apdex"
                  help="ユーザー満足度指標 (0-1)"
                  value={<CountUp value={0.94} decimals={2} duration={900} />}
                  delta={{ value: 0.01, direction: "up" }}
                  trend={KPI_TRENDS.success}
                  tone="success"
                />
              </StaggerReveal>
            )}
          </SectionReveal>

          {/* StatCards */}
          <SectionReveal>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="hover-lift">
                <Tooltip label="P50 レイテンシ。目標 < 2.0s">
                  <span className="block">
                    <StatCard variant="alt" label="平均処理時間" value="1.8" unit="秒" note="目標 < 2.0s を達成" />
                  </span>
                </Tooltip>
              </div>
              <div className="hover-lift">
                <Tooltip label="Webhook endpoint への配信成功率 (直近 7d)">
                  <span className="block">
                    <StatCard variant="good" label="Webhook 配信成功" value="99.94" unit="%" note="直近 7 日間" />
                  </span>
                </Tooltip>
              </div>
              <div className="hover-lift">
                <Tooltip label="現在の rate limit 使用率。上限で 429 応答">
                  <span className="block">
                    <StatCard variant="warn" label="API レート近接" value="87" unit="%" note="上限まで残 420 req/min" />
                  </span>
                </Tooltip>
              </div>
            </div>
          </SectionReveal>

          {/* Category mix */}
          <BlurFade>
            <Card>
              <CardHeader>
                <div className="flex flex-col">
                  <CardTitle>カテゴリ別比率</CardTitle>
                  <CardSub>Auto / Augment · 取引カテゴリ構成</CardSub>
                </div>
                <Badge tone="brand">{CATEGORY_MIX.length} categories</Badge>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-1">
                  {CATEGORY_MIX.map((c, i) => (
                    <ImpactRow
                      key={c.label}
                      label={c.label}
                      auto={c.auto}
                      augment={c.augment}
                      total={c.total}
                      highlight={i === 0}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </BlurFade>

          {/* Transactions table */}
          <SectionReveal>
            <Card id="transactions">
              <CardHeader>
                <div className="flex flex-col">
                  <CardTitle>直近の取引</CardTitle>
                  <CardSub>Recent transactions · {Fmt.int(TRANSACTIONS.length)} 件</CardSub>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="link"
                    onClick={() => {
                      setFilters({});
                      setActiveTab("all");
                    }}
                  >
                    フィルタをクリア
                  </Button>
                  <Tooltip label="Slash キーで検索">
                    <Button variant="secondary" size="sm" iconOnly kbd="/"
                      iconLeft={
                        <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden>
                          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      }
                    />
                  </Tooltip>
                </div>
              </CardHeader>
              <CardBody flush>
                <div className="border-b border-border px-5 pt-3">
                  <Tabs
                    tabs={[
                      { id: "all", label: "全て" },
                      { id: "disputed", label: "要確認" },
                      { id: "pending", label: "処理中" },
                    ]}
                    activeId={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
                <div className="px-5 py-3">
                  <FilterBar filters={FILTER_DEFS} value={filters} onChange={setFilters} />
                </div>
                {initialLoading ? (
                  <div className="px-5 pb-4">
                    <Skeleton variant="text" lines={6} />
                  </div>
                ) : rows.length === 0 ? (
                  <div className="px-5 pb-5">
                    <EmptyState
                      tone="filtered"
                      title="該当する取引が見つかりませんでした"
                      description="条件を緩めるか、フィルタをクリアしてください。"
                      action={
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setFilters({});
                            setActiveTab("all");
                          }}
                        >
                          フィルタをクリア
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <Table
                    caption="直近 24 時間の取引一覧"
                    captionSrOnly
                    columns={columns}
                    rows={rows}
                    sort={sort}
                    onSortChange={setSort}
                    stickyHeader
                    rowHover
                  />
                )}
              </CardBody>
            </Card>
          </SectionReveal>

          {/* Incidents + System health */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SectionReveal>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Active alerts</CardTitle>
                    <Badge tone="danger" dot>2</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconRight={
                      <svg viewBox="0 0 24 24" fill="none" className="size-3" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                  >
                    全て表示
                  </Button>
                </CardHeader>
                <CardBody flush>
                  {[
                    { id: "ALR-2849", title: "Coastal Media — card testing 疑い", severity: "P1", status: "調査中", started: "08:42" },
                    { id: "ALR-2848", title: "payment-processor レイテンシ劣化", severity: "P3", status: "対応中", started: "07:18" },
                  ].map((alr, i, a) => (
                    <div
                      key={alr.id}
                      className={`grid grid-cols-[auto_72px_1fr_auto_auto] items-center gap-3 px-5 py-2.5 ${
                        i < a.length - 1 ? "border-b border-border/60" : ""
                      }`}
                    >
                      <Pulse tone={alr.severity === "P1" ? "error" : "warning"}>
                        <span className="inline-block size-2 rounded-full bg-current" style={{ color: alr.severity === "P1" ? "var(--error-default)" : "var(--warning-default)" }} />
                      </Pulse>
                      <span className="font-mono text-xs text-muted-foreground">{alr.id}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{alr.title}</span>
                        <span className="text-xs text-muted-foreground">
                          started {alr.started} JST
                        </span>
                      </div>
                      <Badge tone={alr.severity === "P1" ? "danger" : "warning"}>
                        {alr.severity}
                      </Badge>
                      <Badge tone="neutral">{alr.status}</Badge>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </SectionReveal>

            <SectionReveal>
              <Card id="health">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <Freshness live />
                </CardHeader>
                <CardBody>
                  <StaggerReveal className="flex flex-col gap-3">
                    {[
                      { label: "API Gateway", hint: "Uptime 30d", value: 99.4, tone: "success" as const },
                      { label: "Webhook Delivery", hint: "Success rate 24h", value: 94, tone: "warning" as const },
                      { label: "Queue Depth", hint: "処理中 / 容量", value: 68, tone: "brand" as const },
                    ].map((h) => (
                      <div key={h.label} className="hover-lift flex items-center gap-4 rounded-md border border-border p-3">
                        <ProgressRing value={h.value} max={100} size="lg" tone={h.tone} showValue />
                        <div>
                          <div className="text-sm font-semibold">{h.label}</div>
                          <Caption>{h.hint}</Caption>
                        </div>
                      </div>
                    ))}
                  </StaggerReveal>
                </CardBody>
              </Card>
            </SectionReveal>
          </div>

          {/* Onboarding Stepper */}
          <SectionReveal>
            <Card>
              <CardHeader>
                <div className="flex flex-col">
                  <CardTitle>Onboarding</CardTitle>
                  <CardSub>本番切替までの残ステップ</CardSub>
                </div>
              </CardHeader>
              <CardBody>
                <Stepper steps={ONBOARD_STEPS} orientation="horizontal" />
              </CardBody>
            </Card>
          </SectionReveal>

          {/* Collapsible */}
          <SectionReveal>
            <Collapsible
              summary={
                <span className="flex items-center gap-2">
                  <Eyebrow>追加メトリクス</Eyebrow>
                  <Caption as="span">週次 / 月次ビュー</Caption>
                </span>
              }
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Callout variant="insight" title="週次サマリ">
                  今週合計取引額は{" "}
                  <HighlightNum>{Fmt.compact(totalVolumeUSD * 7)}</HighlightNum> USD、先週比{" "}
                  <HighlightNum>+8.2%</HighlightNum>。
                </Callout>
                <Callout variant="warning" title="月次アラート">
                  ディスピュート件数が閾値 (10件/月) を超過する推移。来週までにレビュー推奨。
                </Callout>
              </div>
            </Collapsible>
          </SectionReveal>

          {/* Error state partial */}
          <ErrorState
            severity="partial"
            title="一部リージョンで集計遅延"
            description="LATAM リージョンの集計が約 3 分遅延しています。非ブロッキング。"
            retry={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => pushToast({ variant: "info", msg: "再集計をリクエストしました" })}
              >
                再試行
              </Button>
            }
            details="region=LATAM"
          />
        </div>

        {/* Copilot side panel */}
        <CopilotPanel
          title="Copilot"
          subtitle="ctx: ALR-2849 · transaction fraud"
          suggestedQueries={[
            { label: "ALR-2849 の根本原因は？", onClick: () => {} },
            { label: "TXN-2404 の異常パターンを要約", onClick: () => {} },
            { label: "今日のリスクスコア > 60% の取引一覧", onClick: () => {} },
          ]}
          responseText={streamedText}
          streaming={streamingAi}
          confidence={0.88}
          sources={
            !streamingAi
              ? [
                  {
                    n: 1,
                    type: "metric",
                    label: "TXN-2404 金額プロファイル",
                    sublabel: "Stripe Ledger · 08:31–08:45 JST",
                  },
                  {
                    n: 2,
                    type: "log",
                    label: "Velocity check events",
                    sublabel: "FraudLog · level=warn (n=3)",
                  },
                  {
                    n: 3,
                    type: "deploy",
                    label: "BIN rules v3.2 rollout",
                    sublabel: "ArgoCD · 30 min before spike",
                  },
                ]
              : undefined
          }
          reasoning={[
            { label: "金額が Coastal Media 平均の 10.6 倍 ($89,300 vs $8,400)", citation: 1 },
            { label: "Device fingerprint が過去 30 日で新規", citation: 2 },
            { label: "1h 内に 3 件の連続試行 (1 failed) — card testing pattern", citation: 2 },
          ]}
          reasoningConclusion="タイムラインと症状から card testing fraud の可能性が高い (88%)"
          actions={
            !streamingAi
              ? [
                  {
                    key: "hold",
                    label: "48h temporary hold",
                    variant: "brand",
                    onExecute: () =>
                      pushToast({
                        variant: "info",
                        msg: "実行: 48h temporary hold · 5 秒以内に取り消せます",
                        action: { label: "取消", onClick: () => pushToast({ variant: "success", msg: "取消しました" }) },
                      }),
                  },
                  {
                    key: "contact",
                    label: "顧客へ確認連絡",
                    onExecute: () =>
                      pushToast({
                        variant: "info",
                        msg: "実行: 確認メール送信 · 5 秒以内に取り消せます",
                        action: { label: "取消", onClick: () => {} },
                      }),
                  },
                  {
                    key: "monitor",
                    label: "同 BIN 他取引監視",
                    onExecute: () =>
                      pushToast({ variant: "info", msg: "監視モニターを有効化" }),
                  },
                ]
              : undefined
          }
          contextChips={[
            { label: "ALR-2849", tone: "danger" },
            { label: "Coastal Media", tone: "neutral" },
            { label: "ap-northeast-1", tone: "neutral" },
            { label: "08:31 JST", tone: "neutral" },
            { label: "+6h history", tone: "neutral" },
          ]}
          generatedMeta={
            <>Model: fraud-v3.2 · Generated {Fmt.stamp(new Date())}</>
          }
          onRegenerate={() => {
            if (aiRegenerating) return;
            handleRegenerate();
          }}
          onAlternate={() => pushToast({ variant: "info", msg: "別角度で生成中…" })}
          onPositive={() => pushToast({ variant: "success", msg: "フィードバックを送信しました" })}
          onCopy={() => pushToast({ variant: "info", msg: "クリップボードにコピー" })}
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmitPrompt={(v) => {
            if (!v) return;
            pushToast({ variant: "info", msg: `質問を送信: ${v.slice(0, 30)}${v.length > 30 ? "…" : ""}` });
            setPrompt("");
          }}
          ghostSuggestions={[
            "TXN-2404 を再分析して",
            "今日のディスピュート件数は？",
            "Coastal Media の過去 90 日取引を要約",
            "card testing pattern 他に該当する取引",
          ]}
          className="border-l border-border bg-background"
        />
      </div>

      {/* Toast stack (bottom-right) */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
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
              duration={t.action ? 5200 : 3200}
              action={t.action}
            >
              {t.msg}
            </Toast>
          </div>
        ))}
      </div>

      {/* Keyboard hint footer */}
      <div className="pointer-events-none fixed bottom-3 left-[252px] z-[50] flex items-center gap-2 text-[10px] text-muted-foreground">
        <Kbd>?</Kbd>
        <span>でヘルプ</span>
        <span className="opacity-40">·</span>
        <Kbd>⌘K</Kbd>
        <span>でコマンド</span>
      </div>
    </>
  );
}

function KpiCard({
  label,
  sublabel,
  help,
  value,
  unit,
  delta,
  trend,
  tone,
  positiveIsGood = true,
}: {
  label: string;
  sublabel: string;
  help: string;
  value: React.ReactNode;
  unit?: string;
  delta: { value: number; direction: "up" | "down" | "flat" };
  trend: readonly number[];
  tone: "brand" | "success" | "warning" | "error" | "info" | "neutral";
  positiveIsGood?: boolean;
}) {
  return (
    <Card className="hover-lift">
      <CardBody className="flex flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
            <span className="-mt-px text-[10px] text-muted-foreground/70">{sublabel}</span>
          </div>
          <Tooltip label={help}>
            <svg viewBox="0 0 24 24" fill="none" className="size-3 text-muted-foreground/60" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Tooltip>
        </div>
        <MetricValue
          value={value}
          unit={unit}
          delta={delta}
          positiveIsGood={positiveIsGood}
          size="lg"
        />
        <Sparkline
          values={trend}
          tone={tone}
          showArea
          width={260}
          height={28}
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>vs. 昨日同時刻</span>
          <span className="font-mono">n = {Fmt.int(48236)}</span>
        </div>
      </CardBody>
    </Card>
  );
}
