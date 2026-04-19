import { useEffect, useMemo, useState } from "react";
import {
  AppShell,
  BrandMark,
  CommandPalette,
  HelpOverlay,
  Kbd,
  PermissionProvider,
  ProgressBar,
  Sidebar,
  SkipLink,
  type CommandPaletteItem,
  type NotificationItem,
  type ShortcutGroup,
  type SidebarNavGroup,
} from "@clarity-ds/core";
import { Dashboard } from "./pages/Dashboard";
import { OrderDetail } from "./pages/OrderDetail";

type Route =
  | { name: "dashboard" }
  | { name: "detail"; id: string };

function parseHash(hash: string): Route {
  if (hash.startsWith("#/order/")) {
    const id = hash.slice("#/order/".length);
    if (id) return { name: "detail", id };
  }
  return { name: "dashboard" };
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "ナビゲーション",
    items: [
      { keys: ["⌘", "K"], label: "コマンドパレットを開く" },
      { keys: ["G", "D"], label: "ダッシュボードへ" },
      { keys: ["G", "O"], label: "明細画面へ (TXN-2404)" },
    ],
  },
  {
    title: "アクション",
    items: [
      { keys: ["⌘", "R"], label: "データを再読込" },
      { keys: ["⌘", "⇧", "E"], label: "現在のビューをエクスポート" },
      { keys: ["⌘", "Z"], label: "最後の操作を取り消し" },
    ],
  },
  {
    title: "選択・編集",
    items: [
      { keys: ["↑", "↓"], label: "項目の選択を移動" },
      { keys: ["↵"], label: "選択した項目を開く" },
      { keys: ["⌘", "S"], label: "保存" },
    ],
  },
  {
    title: "表示",
    items: [
      { keys: ["?"], label: "このヘルプを表示" },
      { keys: ["Esc"], label: "パネル / ダイアログを閉じる" },
    ],
  },
];

const NAV_ICONS = {
  chart: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="M3 3v18h18 M7 14l4-4 4 4 5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="M3 12h3l3-8 4 16 3-8h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="m12 2 10 6-10 6L2 8z M2 16 12 22l10-6M2 12l10 6 10-6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
};

const NOTIFICATIONS: NotificationItem[] = [
  { id: 1, tone: "danger", title: "TXN-2404 ディスピュート受理", body: "Coastal Media Inc からの異議申立、48h 以内に証憑提出要", time: "3 分前", unread: true },
  { id: 2, tone: "warning", title: "エラー率しきい値超過", body: "直近 1h エラー率 1.12% — しきい値 1.00% 超", time: "12 分前", unread: true },
  { id: 3, tone: "info", title: "AI 異常検知実行", body: "高リスク取引 TXN-2411 を検出", time: "28 分前", unread: true },
  { id: 4, tone: "success", title: "TXN-2407 決済成立", body: "Northwind Logistics · $340,000 着金確認", time: "1 時間前" },
  { id: 5, tone: "default", title: "AI 週次サマリが完了", body: "過去 7 日間の取引サマリを要約しました", time: "昨日 18:04" },
];

export function App() {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === "undefined" ? "" : window.location.hash),
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (!inField && e.key === "?") {
        e.preventDefault();
        setHelpOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setHelpOpen(false);
        setPaletteOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAdmin =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("role") === "admin";
  const permissions = isAdmin
    ? ["payment.refund", "payment.void", "payment.approve", "ai.regenerate"]
    : ["payment.approve", "ai.regenerate"];

  const navGroups: SidebarNavGroup[] = useMemo(
    () => [
      {
        title: "Primary",
        items: [
          {
            key: "dashboard",
            label: "ダッシュボード",
            sublabel: "Overview",
            icon: NAV_ICONS.chart,
            active: route.name === "dashboard",
            onClick: () => (window.location.hash = ""),
          },
          {
            key: "detail",
            label: "取引明細",
            sublabel: "Detail",
            icon: NAV_ICONS.pulse,
            active: route.name === "detail",
            onClick: () => (window.location.hash = "#/order/TXN-2404"),
          },
          {
            key: "alerts",
            label: "アラート",
            sublabel: "Alerts",
            icon: NAV_ICONS.alert,
            badge: "2",
            badgeTone: "danger",
          },
          {
            key: "settings",
            label: "設定",
            sublabel: "Settings",
            icon: NAV_ICONS.settings,
          },
        ],
      },
      {
        title: "Explore",
        items: [
          { key: "services", label: "サービス一覧", icon: NAV_ICONS.layers },
          { key: "team", label: "チーム", icon: NAV_ICONS.team },
          { key: "docs", label: "ドキュメント", icon: NAV_ICONS.book },
        ],
      },
    ],
    [route.name],
  );

  const paletteItems: CommandPaletteItem[] = [
    {
      group: "ページ",
      label: "ダッシュボード",
      hint: "Overview",
      icon: NAV_ICONS.chart,
      action: () => (window.location.hash = ""),
    },
    {
      group: "ページ",
      label: "取引明細 TXN-2404",
      hint: "Dispute",
      icon: NAV_ICONS.pulse,
      action: () => (window.location.hash = "#/order/TXN-2404"),
    },
    {
      group: "アクション",
      label: "すべてを再読込",
      hint: "⌘R",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      ),
      action: () => window.location.reload(),
    },
    {
      group: "AI",
      label: "Copilot を開く",
      hint: "⌘I",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
          <path d="M12 3 13.5 8 18 9.5 13.5 11 12 16l-1.5-5L6 9.5 10.5 8z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const brand = (
    <BrandMark label="P" wordmark="Payments" sublabel="Business · Tokyo" size="md" />
  );

  const search = (
    <div className="relative">
      <svg viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        placeholder="検索…"
        onFocus={() => setPaletteOpen(true)}
        className="h-7 w-full rounded-sm border border-border bg-background pl-7 pr-12 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <Kbd>⌘K</Kbd>
      </span>
    </div>
  );

  const sidebarFooter = (
    <div className="flex items-center gap-2 px-1.5 py-1">
      <div
        aria-hidden
        className="grid size-6 place-items-center rounded-full text-[11px] font-semibold"
        style={{ background: "oklch(0.87 0.08 25)", color: "oklch(0.35 0.15 25)" }}
      >
        S
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-medium">藤原 真司</span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {isAdmin ? "Admin · online" : "Editor · online"}
        </span>
      </div>
    </div>
  );

  return (
    <PermissionProvider permissions={permissions}>
      <AppShell
        layout="shell"
        skipLink={<SkipLink href="#main">本文へスキップ</SkipLink>}
        progressBar={<ProgressBar />}
        sidebar={
          <Sidebar
            brand={brand}
            search={search}
            groups={navGroups}
            footer={sidebarFooter}
          />
        }
      >
        {route.name === "dashboard" ? (
          <Dashboard
            onOpenNotif={() => setNotifOpen((o) => !o)}
            notifOpen={notifOpen}
            onCloseNotif={() => setNotifOpen(false)}
            notifications={NOTIFICATIONS}
          />
        ) : (
          <OrderDetail id={route.id} />
        )}
      </AppShell>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        items={paletteItems}
      />
      <HelpOverlay
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        groups={SHORTCUT_GROUPS}
      />
    </PermissionProvider>
  );
}
