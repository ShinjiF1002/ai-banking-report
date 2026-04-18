import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Body,
  Callout,
  Caption,
  Drawer,
  FilterBar,
  Heading,
  KpiTile,
  StatusPill,
  TabularNum,
  Table,
  Tabs,
  TierBadge,
} from "@clarity-ds/core";
import type {
  FilterDef,
  FilterValue,
  TabDef,
  TableColumn,
  TableRow,
  TableSort,
  Tier,
} from "@clarity-ds/core";
import { processCatalog, type Process } from "../data/process-catalog";

type MockState = "loading" | "error" | "partial" | null;

/**
 * Read ?state= URL flag for behavioral state exercise.
 * Plan v1.2 D (CR Round 1 S3 pivot, mock-only honesty — S2_CHARTER_COVERAGE.md
 * notes this is visual-primitive rendering, not real async).
 */
function useMockState(): MockState {
  const [state, setState] = useState<MockState>(() => {
    if (typeof window === "undefined") return null;
    const flag = new URLSearchParams(window.location.search).get("state");
    if (flag === "loading" || flag === "error" || flag === "partial")
      return flag;
    return null;
  });
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState(null), 3000);
    return () => clearTimeout(timer);
  }, [state]);
  return state;
}

const patternFilterOptions = [
  { value: "api", label: "API" },
  { value: "mq", label: "MQ" },
  { value: "agent", label: "Agent" },
  { value: "rpa", label: "RPA" },
  { value: "db", label: "DB" },
];

const riskFilterOptions = [
  { value: "low", label: "Low" },
  { value: "mid", label: "Mid" },
  { value: "high", label: "High" },
];

const maturityFilterOptions = [
  { value: "established", label: "Established" },
  { value: "emerging", label: "Emerging" },
];

const filterDefs: FilterDef[] = [
  {
    id: "pattern",
    label: "Pattern",
    multi: true,
    options: patternFilterOptions,
  },
  { id: "risk", label: "Risk", options: riskFilterOptions },
  { id: "maturity", label: "Maturity", options: maturityFilterOptions },
];

const tierForState: Record<Process["state"], Tier> = {
  running: "T1",
  paused: "T3",
  error: "T5",
};

function applyFilter(processes: Process[], value: FilterValue): Process[] {
  return processes.filter((p) => {
    const pattern = value.pattern;
    if (
      Array.isArray(pattern) &&
      pattern.length > 0 &&
      !pattern.includes(p.pattern)
    )
      return false;
    if (typeof value.risk === "string" && value.risk && value.risk !== p.risk)
      return false;
    if (
      typeof value.maturity === "string" &&
      value.maturity &&
      value.maturity !== p.maturity
    )
      return false;
    return true;
  });
}

function sortRows(rows: Process[], sort: TableSort | null): Process[] {
  if (!sort) return rows;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.columnId as keyof Process];
    const bv = b[sort.columnId as keyof Process];
    if (typeof av === "string" && typeof bv === "string")
      return dir * av.localeCompare(bv);
    if (typeof av === "number" && typeof bv === "number")
      return dir * (av - bv);
    return 0;
  });
}

export function ProcessCatalog() {
  const mockState = useMockState();
  const [filter, setFilter] = useState<FilterValue>({});
  const [sort, setSort] = useState<TableSort | null>(null);
  const [selected, setSelected] = useState<Process | null>(null);
  const [tab, setTab] = useState<string>("overview");
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const filtered = useMemo(
    () => sortRows(applyFilter(processCatalog, filter), sort),
    [filter, sort],
  );

  // Summary stats for the KPI grid
  const stats = useMemo(() => {
    const total = processCatalog.length;
    const apiCount = processCatalog.filter((p) => p.pattern === "api").length;
    const emergingCount = processCatalog.filter(
      (p) => p.maturity === "emerging",
    ).length;
    const errorCount = processCatalog.filter((p) => p.state === "error").length;
    return {
      total,
      apiRatio: `${Math.round((apiCount / total) * 100)}%`,
      emergingRatio: `${Math.round((emergingCount / total) * 100)}%`,
      errorCount,
    };
  }, []);

  // "Partial" mock: 3 processes fail their detail tab load
  const partialFailureIds = useMemo(
    () => new Set(["doc-review-agent", "legacy-ui-agent", "archive-query"]),
    [],
  );

  const drawerTabs: TabDef[] = [
    { id: "overview", label: "概要" },
    { id: "steps", label: "手順" },
    { id: "risk", label: "リスク" },
    { id: "sources", label: "関連 source" },
  ];

  const columns: TableColumn[] = [
    { id: "name", label: "業務名", sortable: true, widthClass: "w-[20rem]" },
    { id: "pattern", label: "Pattern", widthClass: "w-[6rem]" },
    { id: "risk", label: "Risk", sortable: true, widthClass: "w-[5rem]" },
    { id: "maturity", label: "Maturity", widthClass: "w-[7rem]" },
    { id: "state", label: "State", widthClass: "w-[6rem]" },
    { id: "owner", label: "Owner", sortable: true, widthClass: "w-[10rem]" },
    {
      id: "updatedAt",
      label: "Updated",
      sortable: true,
      numeric: true,
      widthClass: "w-[7rem]",
    },
  ];

  const rows: TableRow[] = filtered.map((p) => ({
    id: p.id,
    cells: {
      name: <span className="font-medium">{p.name}</span>,
      pattern: <Badge variant={p.pattern} />,
      risk: (
        <span
          className={
            p.risk === "high"
              ? "font-semibold text-error-strong"
              : p.risk === "mid"
                ? "text-warning-strong"
                : "text-muted-foreground"
          }
        >
          {p.risk}
        </span>
      ),
      maturity:
        p.maturity === "emerging" ? (
          <TierBadge tier="T3" size="xs" />
        ) : (
          <span className="text-sm text-muted-foreground">established</span>
        ),
      state: <StatusPill state={p.state} />,
      owner: <span className="text-sm">{p.owner}</span>,
      updatedAt: <TabularNum value={p.updatedAt} />,
    },
  }));

  const selectDetailFailed =
    selected && partialFailureIds.has(selected.id) && mockState === "partial";

  return (
    <main className="mx-auto max-w-[78rem] px-6 pb-24 pt-10 md:px-10">
      {/* Top nav strip */}
      <nav className="mb-10 flex items-center justify-between border-b border-border pb-4 text-sm">
        <a
          href="/ai-banking-report/clarity/"
          className="text-primary hover:underline"
        >
          ← Banking report
        </a>
        <span className="text-muted-foreground">
          Clarity S2 POC · process-catalog
        </span>
      </nav>

      {/* Header */}
      <Caption uppercase>BackofficeAI Process Catalog</Caption>
      <Heading level={1} id="process-catalog-heading">
        Bank process automation catalog
      </Heading>
      <Body size="lg" measure="wide" className="mt-4 text-foreground/90">
        銀行バックオフィスの {stats.total} 業務 × 5 接続パターン (API / MQ / AI
        Agent / RPA / DB 日次コピー) を 一覧。マチュリティ / リスク / 状態で
        filter し、行 click で詳細 drawer を展開する。Clarity Structural layer
        primitives の 5-state POC。
      </Body>

      {/* Summary KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiTile label="Total processes" value={stats.total} />
        <KpiTile label="API 比率" value={stats.apiRatio} hint="本命パターン" />
        <KpiTile label="Emerging" value={stats.emergingRatio} hint="POC 段階" />
        <KpiTile
          label="Error 状態"
          value={stats.errorCount}
          hint="要対応"
          tier={stats.errorCount > 0 ? "T5" : undefined}
        />
      </div>

      {/* Mock state banners */}
      {mockState === "error" ? (
        <Callout
          variant="warning"
          title="データ取得に失敗しました"
          className="mt-8"
        >
          ?state=error mock — 実 async layer は exercise していません。Retry
          は未実装 (plan v1.2 S3 honesty per S2_COVERAGE)。
        </Callout>
      ) : null}
      {mockState === "partial" ? (
        <Callout variant="note" title="Partial fetch (mock)" className="mt-8">
          3 process の detail が一部取得失敗しています。Drawer を開くと対象
          process で inline error が表示されます (visual-only mock)。
        </Callout>
      ) : null}

      {/* Filter */}
      <div className="mt-8">
        <FilterBar filters={filterDefs} value={filter} onChange={setFilter} />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-background shadow-sys-sm">
        {mockState === "loading" ? (
          <div className="p-6 text-sm text-muted-foreground">
            <Caption uppercase>Loading (mock, 3s)</Caption>
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-full animate-pulse rounded-sm bg-muted"
                />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 && mockState !== "error" ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              該当する process がありません
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter を変更するか、リセットしてください。
            </p>
          </div>
        ) : mockState === "error" ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-error-strong">
              データ取得に失敗しました
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.search = "";
              }}
              className="mt-3 cursor-pointer rounded-sm border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
            >
              再試行 (mock)
            </button>
          </div>
        ) : (
          <Table
            caption="BackofficeAI process catalog — 15 sample processes"
            columns={columns}
            rows={rows}
            variant="compact"
            stickyHeader
            rowHover
            sort={sort}
            onSortChange={setSort}
            onRowSelect={(r) => {
              const p = processCatalog.find((x) => x.id === r.id) ?? null;
              setSelected(p);
              setTab("overview");
            }}
            selectedRowId={selected?.id ?? null}
          />
        )}
      </div>

      {/* Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        initialFocusRef={titleRef}
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selected.pattern} size="md" />
              <StatusPill state={selected.state} />
              <TierBadge tier={tierForState[selected.state]} size="xs" />
              <span className="text-xs text-muted-foreground">
                {selected.owner} · Updated {selected.updatedAt}
              </span>
            </div>
            <Tabs
              tabs={drawerTabs}
              activeId={tab}
              onChange={setTab}
              ariaLabel="Process detail"
            />
            {selectDetailFailed ? (
              <p className="rounded-sm border border-error/30 bg-error-soft/40 p-3 text-sm text-error-strong">
                この process の詳細情報の取得に失敗しました (mock partial)。
              </p>
            ) : (
              <div ref={titleRef} tabIndex={-1}>
                {tab === "overview" && (
                  <Body size="md" measure="wide">
                    {selected.description}
                  </Body>
                )}
                {tab === "steps" && (
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                    {selected.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                )}
                {tab === "risk" && (
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {selected.riskFactors.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                {tab === "sources" && (
                  <ul className="space-y-2 text-sm">
                    {selected.relatedSources.map((id) => (
                      <li key={id} className="text-muted-foreground">
                        Source #{id} (Banking report footer reference)
                      </li>
                    ))}
                    <li className="pt-2 text-xs text-muted-foreground">
                      Full citations at{" "}
                      <a
                        href="/ai-banking-report/clarity/#citations"
                        className="text-primary hover:underline"
                      >
                        Banking report § Citations footer
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Clarity S2 POC · Structural layer (Table sortable+sticky+select + Drawer
        focus-trap + FilterBar + Badge + StatusPill + Tabs + KpiTile +
        TierBadge) exercise. 5 behavioral states via{" "}
        <code>?state=loading/error/partial</code> URL flags (mock, visual-only
        per plan S3 honesty).
      </footer>
    </main>
  );
}
