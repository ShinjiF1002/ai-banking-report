import { useEffect, useState } from "react";
import {
  AlertDialog,
  AppShell,
  Body,
  BrandMark,
  Callout,
  Cite,
  Eyebrow,
  Footer,
  Heading,
  HighlightNum,
  ImpactRow,
  ProgressBar,
  ReadTimePill,
  SectionReveal,
  Skeleton,
  SkipLink,
  SmoothScrollLink,
  Spinner,
  StaggerReveal,
  StatCard,
  TabularNum,
  Table,
  TierBadge,
  Toast,
  TopBar,
} from "@clarity-ds/core";
import type { TableColumn, TableRow, Tier } from "@clarity-ds/core";
import { bankingReport } from "../data/banking-report";

/* ============================================================ */
/* Demo mode parsing — 5 universal states mock via URL flag     */
/* ============================================================ */

type DemoMode = "ideal" | "loading" | "error" | "empty" | "partial";

function getDemoMode(): DemoMode {
  if (typeof window === "undefined") return "ideal";
  const params = new URLSearchParams(window.location.search);
  const demo = params.get("demo");
  if (
    demo === "loading" ||
    demo === "error" ||
    demo === "empty" ||
    demo === "partial"
  ) {
    return demo;
  }
  return "ideal";
}

/* ============================================================ */
/* Shell: Nav links                                              */
/* ============================================================ */

const navLinks: { href: string; label: string }[] = [
  { href: "#whynow", label: "なぜ今か" },
  { href: "#players", label: "主要プレイヤー" },
  { href: "#roi", label: "実証 ROI" },
  { href: "#consulting", label: "定量分析" },
  { href: "#timeline", label: "2026–2030 展望" },
  { href: "#principles", label: "7 原則" },
  { href: "#citations", label: "References" },
];

function NavLinks() {
  return (
    <nav
      aria-label="目次"
      className="hidden items-center gap-1 overflow-x-auto md:flex"
    >
      {navLinks.map((l) => (
        <SmoothScrollLink
          key={l.href}
          href={l.href}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground hover:bg-muted"
        >
          {l.label}
        </SmoothScrollLink>
      ))}
    </nav>
  );
}

/* ============================================================ */
/* Hero meta card (対象 / 情報源 / 期間 / 想定読者)              */
/* ============================================================ */

function HeroMetaCard() {
  const rows: { label: string; value: string }[] = [
    { label: "対象", value: "米国 6 大手 + 欧州・アジア主要 4 行" },
    { label: "情報源", value: "企業公式 / 国際機関 / Big4 / Tier 1 通信社" },
    { label: "期間", value: "2025 – 2026" },
    { label: "想定読者", value: "Non-tech Executive" },
  ];
  return (
    <div className="mt-8 rounded-md border border-border bg-muted/40 p-5 text-sm">
      <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-8">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline gap-3">
            <dt className="w-16 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {r.label}
            </dt>
            <dd className="text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ============================================================ */
/* Hero                                                          */
/* ============================================================ */

const heroStatVariants = ["default", "alt", "good", "warn"] as const;
type HeroStatVariant = (typeof heroStatVariants)[number];

function HeroSection() {
  const statVariants: HeroStatVariant[] = ["default", "alt", "good", "warn"];
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="scroll-mt-20 pb-16 pt-4"
    >
      <SectionReveal>
        <Eyebrow>Executive Briefing · 25 情報源統合</Eyebrow>
        <Heading
          level={1}
          id="hero-heading"
          className="mt-5 text-balance leading-[1.2]"
        >
          米国大手グローバル銀行の{" "}
          <em>AI 活用は「試験段階」を終えた</em>。
          <br />
          いま問われるのは、
          <em>実行スピードとガバナンスの成熟度</em>。
        </Heading>
        <Body size="lg" measure="wide" className="mt-6">
          銀行業務の{" "}
          <HighlightNum
            cite={
              <Cite
                n={1}
                tier="T2"
                href={bankingReport.sources[0].url}
              />
            }
          >
            73%
          </HighlightNum>{" "}
          が AI の影響を受ける — 全産業中で最も高い影響度。世界の金融機関の
          AI コア実装率は 1 年で{" "}
          <HighlightNum
            cite={
              <Cite
                n={2}
                tier="T1"
                href={bankingReport.sources[1].url}
              />
            }
          >
            24% → 47%
          </HighlightNum>{" "}
          へ倍増し、AI 投資は{" "}
          <HighlightNum
            cite={
              <Cite
                n={1}
                tier="T2"
                href={bankingReport.sources[0].url}
              />
            }
          >
            $970 億
          </HighlightNum>{" "}
          規模の市場へ拡大する。一方で McKinsey は「エージェント型 AI
          未対応時の利益侵食{" "}
          <HighlightNum
            cite={
              <Cite
                n={4}
                tier="T2"
                href={bankingReport.sources[3].url}
              />
            }
          >
            $1,700 億
          </HighlightNum>
          」を警告している。
        </Body>
        <HeroMetaCard />
      </SectionReveal>

      <StaggerReveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bankingReport.hero.keyStats.map((stat, i) => {
          const variant = statVariants[i] ?? "default";
          const value = stat.value.replace(/[^\d.,$]/g, "");
          const unit = stat.value.replace(/[\d.,$]/g, "") || stat.delta
            ? stat.value.match(/[^\d.,$]+$/)?.[0] ?? ""
            : "";
          return (
            <StatCard
              key={stat.label}
              variant={variant}
              label={stat.label}
              value={value}
              unit={unit}
              note={stat.hint}
            />
          );
        })}
      </StaggerReveal>
    </section>
  );
}

/* ============================================================ */
/* Why now? — ImpactRow visualization + full table              */
/* ============================================================ */

function WhyNowSection() {
  const rows = bankingReport.industryImpact;
  return (
    <SectionReveal>
      <section
        id="whynow"
        aria-labelledby="whynow-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>01 · Why Now</Eyebrow>
        <Heading level={2} id="whynow-heading" className="mt-4">
          なぜ今、銀行 AI が重要か
        </Heading>
        <Body measure="wide" className="mt-4">
          WEF / Accenture 共同白書は、全産業中で金融サービスが最も AI
          の影響を受ける業界であることを示した
          <Cite n={1} tier="T2" href={bankingReport.sources[0].url} />。
          世界の金融機関のうち AI をコア機能に組み込んでいる比率は
          <HighlightNum>1 年で倍増</HighlightNum>
          <Cite n={2} tier="T1" href={bankingReport.sources[1].url} />。
        </Body>

        <Callout
          variant="insight"
          title="銀行業務の 73% が AI の影響を受ける"
          className="my-8"
        >
          全産業中で最も高い合計影響度。以下は WEF / Accenture
          による業界別インパクトの視覚化 (自動化 = 紺 / 拡張 = 水色)。
        </Callout>

        <div className="mt-2 rounded-md border border-border bg-background p-4 shadow-sys-sm">
          {rows.map((r) => (
            <ImpactRow
              key={r.industry}
              label={r.industry}
              auto={r.automation}
              augment={r.augmentation}
              highlight={r.industry === "銀行"}
            />
          ))}
          <p className="mt-3 flex gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-xs bg-primary"
              />
              自動化 (Automation)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-xs bg-info"
              />
              拡張 (Augmentation)
            </span>
          </p>
        </div>

        {/* AI investment surge metrics table (7 rows) */}
        <div className="mt-8">
          <Heading level={3}>AI 投資と規模化の現状</Heading>
          <div className="mt-3 overflow-x-auto rounded-md border border-border bg-background shadow-sys-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    指標
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    数値
                  </th>
                  <th className="w-[12rem] px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    出典
                  </th>
                </tr>
              </thead>
              <tbody>
                {bankingReport.whyNowMetrics.map((m, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-4 py-3">{m.indicator}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums text-foreground">
                        {m.value}
                      </span>
                      {m.sub ? (
                        <span
                          className={
                            m.subTone === "up"
                              ? "ml-2 inline-flex items-center rounded-xs bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-success-strong"
                              : "ml-2 text-xs text-muted-foreground"
                          }
                        >
                          {m.sub}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {m.source}
                      <Cite
                        n={m.citationId}
                        tier="T2"
                        href={bankingReport.sources[m.citationId - 1].url}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Players                                                       */
/* ============================================================ */

function PlayersSection() {
  const playerColumns: TableColumn[] = [
    { id: "bank", label: "銀行", widthClass: "w-[8rem]" },
    { id: "scale", label: "AI スケール指標" },
    { id: "metrics", label: "主要メトリクス" },
    { id: "tier", label: "Tier", widthClass: "w-[4rem]" },
  ];

  const playerRows: TableRow[] = bankingReport.players.map((p) => ({
    id: p.bank,
    highlight: p.evidentRank === 1 ? "primary" : null,
    cells: {
      bank: (
        <div className="flex items-center gap-2">
          <strong>{p.bank}</strong>
          {p.evidentRank ? (
            <span className="text-xs text-muted-foreground">
              #{p.evidentRank}
            </span>
          ) : null}
        </div>
      ),
      scale: p.scaleIndicator,
      metrics: (
        <ul className="space-y-0.5">
          {p.metrics.map((m, i) => (
            <li key={i} className="text-sm">
              • {m}
            </li>
          ))}
          <li className="mt-1">
            {p.citationIds.map((id) => (
              <Cite
                key={id}
                n={id}
                tier={p.tier}
                href={bankingReport.sources[id - 1].url}
              />
            ))}
          </li>
        </ul>
      ),
      tier: <TierBadge tier={p.tier} />,
    },
  }));

  const evidentColumns: TableColumn[] = [
    { id: "rank", label: "Rank", numeric: true, widthClass: "w-[5rem]" },
    { id: "bank", label: "銀行" },
    { id: "note", label: "特記" },
  ];

  const evidentRows: TableRow[] = bankingReport.evidentTop10.map((e) => ({
    id: `evident-${e.rank}`,
    highlight: e.rank <= 2 ? "primary" : e.rank <= 5 ? "secondary" : null,
    cells: {
      rank: <TabularNum value={e.rank} emphasis />,
      bank: <strong>{e.bank}</strong>,
      note: e.note ?? "—",
    },
  }));

  return (
    <SectionReveal>
      <section
        id="players"
        aria-labelledby="players-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>02 · Key Players</Eyebrow>
        <Heading level={2} id="players-heading" className="mt-4">
          Top 10 global banks
        </Heading>
        <Body measure="wide" className="mt-4">
          米国 6 大手 + 欧州・アジアの主要 4 行が、AI
          を試験段階から本番運用へ移行した。
          <em>JPMC が群を抜いてリード</em>
          <Cite n={5} tier="T1" href={bankingReport.sources[4].url} />、
          <em>DBS は監査済み AI 経済価値 S$10 億を開示し ROI 計測規律で他行をリード</em>
          <Cite n={15} tier="T1" href={bankingReport.sources[14].url} />。
        </Body>

        <div className="mt-6">
          <Table
            caption="主要 10 行比較 — AI スケール指標と主要メトリクス"
            columns={playerColumns}
            rows={playerRows}
            variant="comparison"
          />
        </div>

        <div className="mt-10">
          <Heading level={3}>Evident AI Index 2025 — Top 10</Heading>
          <Body size="sm" measure="wide" className="mt-2 text-muted-foreground">
            独立第三者ランキング。70 以上の指標と数百万の公開データポイントで評価。
            Talent (45%) / Innovation (30%) / Leadership (15%) / Transparency
            (10%)
            <Cite n={25} tier="T2" href={bankingReport.sources[24].url} />。
            Top 10 のスコア改善速度はその他の{" "}
            <HighlightNum>2.3 倍</HighlightNum>。
          </Body>
          <div className="mt-4">
            <Table
              caption="Evident AI Index 2025 Top 10"
              columns={evidentColumns}
              rows={evidentRows}
              variant="compact"
            />
          </div>
        </div>

        {/* JPMC 深掘り — 4-year AI trajectory */}
        <div className="mt-12">
          <Heading level={3}>JPMC 深掘り — 4 年 AI 軌跡</Heading>
          <Body size="sm" measure="wide" className="mt-2 text-muted-foreground">
            群を抜く先行者の実装ロードマップ。2022 の試験段階から 2026 の
            全社 AI 基盤化まで、<em>投資と価値の同時スケール</em> が特徴。
          </Body>
          <ol className="relative mt-5 space-y-4 border-l-2 border-primary/30 pl-6">
            {bankingReport.jpmcTimeline.map((e, i) => (
              <li key={i} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[1.875rem] top-1.5 inline-flex size-3 items-center justify-center rounded-full border-2 border-primary bg-background"
                />
                <article className="flex flex-col gap-1 rounded-md border border-border bg-background p-4 shadow-sys-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-sm font-bold tabular-nums text-primary-strong">
                      {e.year}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {e.value}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{e.milestone}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* ROI Matrix                                                    */
/* ============================================================ */

function RoiSection() {
  const maturityLabelMap: Record<string, string> = {
    proven: "実証確立",
    scaling: "規模化段階",
    early: "検証中",
  };
  const maturityToneMap: Record<string, string> = {
    proven:
      "bg-success-soft/60 text-success-strong border border-success/30",
    scaling:
      "bg-warning-soft/60 text-warning-strong border border-warning/30",
    early: "bg-muted text-muted-foreground border border-border",
  };

  return (
    <SectionReveal>
      <section
        id="roi"
        aria-labelledby="roi-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>03 · Proven ROI</Eyebrow>
        <Heading level={2} id="roi-heading" className="mt-4">
          7 領域の ROI 成熟度
        </Heading>
        <Body measure="wide" className="mt-4">
          最も成熟しているのは{" "}
          <em>不正検知・カスタマーサービス・書類処理</em>
          。各領域とも複数銀行 (T1
          ソース) で同方向の効果を確認、業界ベンチマークも一致する。
        </Body>

        {/* Domain grid — 7-cards bespoke */}
        <StaggerReveal className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {bankingReport.roiDomains.map((domain) => (
            <article
              key={domain.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <header className="flex items-start justify-between gap-3">
                <Heading level={4} className="leading-tight">
                  <span aria-hidden>{domain.emoji}</span> {domain.name}
                </Heading>
                <span
                  className={`inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] ${maturityToneMap[domain.maturity]}`}
                >
                  {maturityLabelMap[domain.maturity]}
                </span>
              </header>
              <p className="text-xs text-muted-foreground">
                {domain.benchmark}
              </p>
              <ul className="mt-1 space-y-2">
                {domain.rows.map((r, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-1 border-l-2 border-primary/40 pl-3 text-sm"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="inline-flex items-center rounded-xs bg-primary-soft/40 px-1.5 py-0.5 text-xs font-semibold text-primary-strong">
                        {r.bank}
                      </span>
                      <span className="text-foreground">{r.useCase}</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground/90">
                      <span className="flex-1">{r.result}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <TierBadge tier={r.tier} size="xs" />
                        {r.citationIds.map((id) => (
                          <Cite
                            key={id}
                            n={id}
                            tier={r.tier}
                            href={bankingReport.sources[id - 1].url}
                          />
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          {/* Remaining 4 domains as compressed summary cards */}
          {bankingReport.roiDomainsSummary.map((d) => (
            <article
              key={d.id}
              className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/20 p-5"
            >
              <header className="flex items-start justify-between gap-3">
                <Heading level={4} className="leading-tight">
                  <span aria-hidden>{d.emoji}</span> {d.name}
                </Heading>
                <span className="inline-flex shrink-0 items-center rounded-sm border border-border bg-background px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Summary
                </span>
              </header>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {d.note}
                {" "}
                {d.citationIds.map((id) => (
                  <Cite
                    key={id}
                    n={id}
                    tier="T1"
                    href={bankingReport.sources[id - 1].url}
                  />
                ))}
              </p>
            </article>
          ))}
        </StaggerReveal>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Consulting                                                    */
/* ============================================================ */

function ConsultingSection() {
  // Group consulting entries by firm
  const byFirm = new Map<string, typeof bankingReport.consulting>();
  for (const c of bankingReport.consulting) {
    const list = byFirm.get(c.firm) ?? [];
    list.push(c);
    byFirm.set(c.firm, list);
  }
  const firmBadge: Record<string, string> = {
    McKinsey: "MBB · 2025",
    Accenture: "Consulting · 2025",
    Deloitte: "Big4 · 2025",
    "世銀 / IMF / BIS": "国際機関 · 2025",
  };

  return (
    <SectionReveal>
      <section
        id="consulting"
        aria-labelledby="consulting-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>05 · Industry Quantitative</Eyebrow>
        <Heading level={2} id="consulting-heading" className="mt-4">
          コンサル / 国際機関の集計
        </Heading>
        <Body measure="wide" className="mt-4">
          McKinsey・Accenture・Deloitte・世銀/IMF/BIS
          が独立に「AI は数 % ポイントの利益率改善を実現可能」と結論。
          同時に McKinsey は{" "}
          <HighlightNum>$1,700 億</HighlightNum>{" "}
          の利益侵食警告も並列で発表。最大の障壁は技術ではなく{" "}
          <em>データ基盤の脆弱性</em> (Deloitte)
          <Cite n={20} tier="T2" href={bankingReport.sources[19].url} />。
        </Body>

        {/* Quant grid — 4-col bespoke card per firm */}
        <StaggerReveal className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from(byFirm.entries()).map(([firm, entries]) => (
            <article
              key={firm}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <header className="flex flex-col gap-1 border-b border-border pb-3">
                <Heading level={4} className="leading-tight">
                  {firm}
                </Heading>
                <span className="inline-flex w-fit items-center rounded-xs bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  {firmBadge[firm] ?? "Analyst"}
                </span>
              </header>
              <ul className="space-y-2">
                {entries.map((c, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      {c.indicator}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="text-lg font-bold tabular-nums text-primary-strong">
                        {c.value}
                      </span>
                      <Cite
                        n={c.citationId}
                        tier="T2"
                        href={bankingReport.sources[c.citationId - 1].url}
                      />
                    </span>
                    {c.note && (
                      <span className="text-xs text-muted-foreground">
                        {c.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </StaggerReveal>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Timeline                                                      */
/* ============================================================ */

function TimelineSection() {
  const confidenceTier: Record<"確認済" | "高" | "中", Tier> = {
    確認済: "T1",
    高: "T2",
    中: "T3",
  };

  return (
    <SectionReveal>
      <section
        id="timeline"
        aria-labelledby="timeline-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>06 · Outlook 2026–2030</Eyebrow>
        <Heading level={2} id="timeline-heading" className="mt-4">
          エージェント型 AI の両刃の剣
        </Heading>
        <Callout variant="warning" title="McKinsey 警告" className="my-6">
          エージェント型 AI の「両刃の剣」 — グローバル銀行利益プールが{" "}
          <HighlightNum>$1,700 億</HighlightNum> (約 9%) 減少リスク
          <Cite n={4} tier="T2" href={bankingReport.sources[3].url} />。
        </Callout>

        {/* Vertical timeline — bespoke */}
        <ol className="relative mt-8 space-y-6 border-l-2 border-border pl-6">
          {bankingReport.timeline.map((t, i) => (
            <li key={i} className="relative">
              {/* Year badge — dot on the line */}
              <span
                aria-hidden
                className={`absolute -left-[1.875rem] top-1 inline-flex size-4 items-center justify-center rounded-full border-2 ${i === 0 ? "border-primary bg-primary" : "border-border bg-background"}`}
              />
              <article
                className={`rounded-md border border-border p-5 shadow-sys-sm ${i === 0 ? "bg-primary-soft/20" : "bg-background"}`}
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary-strong">
                      {t.period}
                    </span>
                    <Heading level={4} className="mt-1 leading-tight">
                      {t.developments[0]}
                    </Heading>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    確信度
                    <TierBadge tier={confidenceTier[t.confidence]} size="xs" />
                  </span>
                </header>
                {t.developments.length > 1 && (
                  <ul className="mt-3 space-y-1 text-sm text-foreground/90">
                    {t.developments.slice(1).map((d, j) => (
                      <li key={j} className="flex gap-2">
                        <span
                          aria-hidden
                          className="shrink-0 text-muted-foreground"
                        >
                          ·
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ol>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Principles                                                    */
/* ============================================================ */

function PrinciplesSection() {
  return (
    <SectionReveal>
      <section
        id="principles"
        aria-labelledby="principles-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>07 · Strategic Principles</Eyebrow>
        <Heading level={2} id="principles-heading" className="mt-4">
          勝者と敗者を分ける 7 つの要因
        </Heading>
        <Body measure="wide" className="mt-4">
          「導入するか否か」ではなく{" "}
          <em>
            実行スピード・ガバナンス成熟度・コスト最適化から収益イノベーションへの転換能力
          </em>{" "}
          が問われる。
        </Body>

        <StaggerReveal className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {bankingReport.principles.map((p) => (
            <li
              key={p.n}
              className="flex list-none flex-col gap-2 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Principle {p.n}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.citationIds.slice(0, 3).map((id) => (
                    <Cite
                      key={id}
                      n={id}
                      tier="T1"
                      href={bankingReport.sources[id - 1].url}
                    />
                  ))}
                </span>
              </div>
              <Heading level={4}>{p.title}</Heading>
              <Body size="sm">{p.rationale}</Body>
            </li>
          ))}
        </StaggerReveal>

        {/* Moat comparison — JPMC vs regional bank */}
        <div className="mt-12">
          <Heading level={3}>Moat 比較 — T1 リーダー vs 地方銀行</Heading>
          <Body size="sm" measure="wide" className="mt-2 text-muted-foreground">
            AI
            差別化の 3 次元 (資本・人材・データ) で T1 リーダーと地方銀行の差は
            <em>桁違い</em>。後発が追いつくには、資本・人材・データの三位一体を
            <em>同時に</em> 引き上げる必要がある。
          </Body>
          <div className="mt-4 overflow-x-auto rounded-md border border-border bg-background shadow-sys-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-[14rem] px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    次元
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-primary-strong">
                    T1 リーダー (JPMC 等)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    地方銀行 (中規模)
                  </th>
                </tr>
              </thead>
              <tbody>
                {bankingReport.moatComparison.map((m, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold">{m.dimension}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums text-primary-strong">
                        {m.leader}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="tabular-nums">{m.regional}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Citations footer — using Cite pub + intro slots              */
/* ============================================================ */

function CitationsFooter() {
  return (
    <SectionReveal>
      <section
        id="citations"
        aria-labelledby="citations-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>References</Eyebrow>
        <Heading level={2} id="citations-heading" className="mt-4">
          25 情報源 (Tier 分類)
        </Heading>
        <Body size="sm" measure="wide" className="mt-2 text-muted-foreground">
          T1 = 企業公式 / 政府機関、T2 = 国際機関 / Big4 / MBB、T3 = Tier 1
          通信社、T4 = 業界専門メディア、T5 = 個人ブログ / マーケティング。
          本レポートは <em>T1〜T3</em> を引用根拠とする。
        </Body>

        <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {bankingReport.sources.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-sm border border-border bg-background p-4 shadow-sys-sm"
            >
              <div className="flex items-center gap-2">
                <TierBadge tier={s.tier} size="xs" />
                <span className="text-xs tabular-nums text-muted-foreground">
                  #{s.id}
                </span>
                <span className="text-xs text-muted-foreground">{s.date}</span>
              </div>
              <Cite
                n={s.id}
                href={s.url}
                tier={s.tier}
                inline={false}
                label={s.title}
                pub={s.publisher}
                intro={s.summary}
              />
            </li>
          ))}
        </ol>

        <nav className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/ai-banking-report/"
            className="text-primary hover:underline"
          >
            ← 旧 HTML 版
          </a>
          <a
            href="/ai-banking-report/clarity/process-catalog/"
            className="text-primary hover:underline"
          >
            Process Catalog POC (Clarity S2) →
          </a>
        </nav>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* §tldr — Executive Summary 3 items                            */
/* ============================================================ */

function TldrSection() {
  const src = bankingReport.sources;
  type BodyRenderer = () => React.ReactNode;
  const bodyMap: Record<string, BodyRenderer> = {
    accelerate: () => (
      <>
        グローバル金融機関の AI コア実装率は 1 年で{" "}
        <HighlightNum cite={<Cite n={2} tier="T1" href={src[1].url} />}>
          24% → 47%
        </HighlightNum>{" "}
        へ倍増。AI 投資はテック予算の{" "}
        <HighlightNum cite={<Cite n={3} tier="T2" href={src[2].url} />}>
          12% → 16%
        </HighlightNum>{" "}
        へ拡大し、2027 年には世界市場{" "}
        <HighlightNum cite={<Cite n={1} tier="T2" href={src[0].url} />}>
          $970 億
        </HighlightNum>{" "}
        規模。
      </>
    ),
    prove: () => (
      <>
        不正検知 (HSBC
        <Cite n={14} tier="T1" href={src[13].url} /> 誤検知{" "}
        <HighlightNum>60% 削減</HighlightNum>)、書類処理 (Citi
        <Cite n={10} tier="T3" href={src[9].url} /> 口座開設{" "}
        <HighlightNum>75 → 15 分</HighlightNum>)、カスタマーサービス
        (BofA
        <Cite n={8} tier="T1" href={src[7].url} /> Erica 完結率{" "}
        <HighlightNum>98%</HighlightNum>)
        が最も裏付けが厚い。先行者と後発の差は拡大中。
      </>
    ),
    discipline: () => (
      <>
        DBS
        <Cite n={15} tier="T1" href={src[14].url} /> は{" "}
        <HighlightNum>S$10 億</HighlightNum> の AI
        経済価値を監査済みで開示。AI 規模化に成功したのは全体の{" "}
        <HighlightNum cite={<Cite n={3} tier="T2" href={src[2].url} />}>
          34%
        </HighlightNum>{" "}
        のみ。残り 66%
        は試験段階に留まり、ガバナンス設計の遅れが差を広げている。
      </>
    ),
  };

  return (
    <SectionReveal>
      <section
        id="tldr"
        aria-labelledby="tldr-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>Executive Summary</Eyebrow>
        <Heading level={2} id="tldr-heading" className="mt-4">
          3 行で掴む「いま何が起きているか」
        </Heading>

        <StaggerReveal className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {bankingReport.tldr.map((item) => (
            <article
              key={item.n}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <span
                className="font-mono text-sm font-semibold tracking-[0.08em] text-muted-foreground"
                aria-hidden
              >
                {item.n} · {item.tagline}
              </span>
              <Heading level={4} className="leading-tight">
                {item.headline}
              </Heading>
              <Body size="sm" className="text-foreground/90">
                {bodyMap[item.contentKey]()}
              </Body>
            </article>
          ))}
        </StaggerReveal>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* §integration — 接続パターン + Foundation + HITL + Ops         */
/* ============================================================ */

function IntegrationSection() {
  const src = bankingReport.sources;
  const intg = bankingReport.integration;

  const patternBodyMap: Record<string, React.ReactNode> = {
    api: (
      <>
        銀行コアと AI を API
        でつなぎ、リアルタイムにデータ授受。安定・高速・変更耐性が高い。
        <em>中長期では全てを API に一本化</em>するのが理想形。
      </>
    ),
    mq: (
      <>
        非同期・疎結合のメッセージング。直接 API
        公開が困難な基幹系レガシーとの橋渡しに加え、
        <em>新規業務でも非同期処理が適切なケースでは第一選択肢</em>。
        event-driven / near-realtime な設計では本命に近い位置付け。
      </>
    ),
    agent: (
      <>
        AI が人間のように画面を見て操作。マニュアルの「意図」を解釈し、UI
        変更にも適応できる。確率的動作のため全ステップ人間承認から始める段階的モデルが前提。
      </>
    ),
  };

  const tagToneClass: Record<string, string> = {
    primary: "bg-primary text-primary-foreground",
    info: "bg-info-soft text-info-strong border border-info/30",
    neutral: "bg-muted text-muted-foreground border border-border",
  };

  const foundationBodyMap: Record<string, React.ReactNode> = {
    "data-infra": (
      <>
        Deloitte
        <Cite n={20} tier="T2" href={src[19].url} /> は ROI
        実現の最大障壁を「脆弱で断片化したデータ基盤」と指摘。AI
        投資の前提条件。
      </>
    ),
    "manual-structure": (
      <>
        表面的手順だけでなく、ベテランの暗黙知も AI
        が解釈可能な形に変換する。
      </>
    ),
    "approval-audit": (
      <>
        米国財務省 FS AI RMF
        <Cite n={24} tier="T2" href={src[23].url} /> は AI
        ライフサイクル全体に <HighlightNum>230 統制目標</HighlightNum>{" "}
        を 4 段階モデルでマップ。
      </>
    ),
    "trust-model": (
      <>
        初期は全ステップ人間承認。実績に応じて段階的に自律化。高リスク業務は完全自律化しない。
      </>
    ),
  };

  const opsBodyMap: Record<string, React.ReactNode> = {
    hitl: (
      <>
        AI
        の出力を人間が定期的にサンプリングレビューし、誤りや偏りを検出、修正フィードバックを
        AI に戻す。重要判断 (融資、不正、KYC) では必須。
        <em>AI に任せきりにしないこと自体がリスク管理の要</em>。
      </>
    ),
    llmops: (
      <>
        MLOps の AI
        時代版。出力品質・ハルシネーション発生率・応答時間・モデルドリフトを監視。自動
        logging + 異常検知アラート + A/B テスト基盤 + 再学習サイクル。
        <em>品質劣化に気づかないことが最大リスク</em>。
      </>
    ),
    security: (
      <>
        悪意のある入力で AI の挙動を乗っ取る Prompt Injection、学習データ漏洩、Adversarial
        Inputs。対策は入力検証 + 出力フィルタ + 権限分離 + 監査ログ +{" "}
        <em>Red Team 定期シミュレーション</em>。
      </>
    ),
  };

  return (
    <SectionReveal>
      <section
        id="integration"
        aria-labelledby="integration-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>04 · Integration</Eyebrow>
        <Heading level={2} id="integration-heading" className="mt-4">
          AI と既存業務の接続パターン
        </Heading>
        <Body measure="wide" className="mt-4">
          AI を業務に組み込む際、銀行は <em>3 つの主要接続パターン</em> +{" "}
          <em>最終手段 (RPA)</em> +{" "}
          <em>参照専用の補助手段 (DB 日次コピー)</em> を使い分ける。
          <em>本命は API 連携</em>、その
          <em>次点が MQ (Azure Logic Apps)</em>、新興技術として AI Agent。
        </Body>

        {/* Pattern grid — 3-col */}
        <StaggerReveal className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {intg.patterns.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${tagToneClass[p.tagTone]}`}
                >
                  {p.tag}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.subtitle}
                </span>
              </div>
              <Heading level={4}>{p.title}</Heading>
              <Body size="sm">{patternBodyMap[p.contentKey]}</Body>
              <dl className="mt-2 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-xs">
                {p.defList.map((d, i) => (
                  <div key={i} className="contents">
                    <dt className="font-semibold text-muted-foreground">
                      {d.term}
                    </dt>
                    <dd className="text-foreground">{d.detail}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </StaggerReveal>

        {/* Fallback: RPA / DB copy comparison */}
        <div className="mt-10 rounded-md border border-border bg-muted/30 p-5 shadow-sys-sm">
          <Heading level={4} className="mb-4">
            最終手段と参照専用の補助手段
          </Heading>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    観点
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    RPA (最終手段)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    DB 日次コピー (参照専用)
                  </th>
                </tr>
              </thead>
              <tbody>
                {intg.fallbackAspects.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-3 py-2 font-semibold">{r.aspect}</td>
                    <td className="px-3 py-2">{r.rpa}</td>
                    <td className="px-3 py-2">{r.dbCopy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <em>選択の考え方:</em> 新規業務は <em>API ファースト</em>。API
            が難しければ <em>Azure Logic Apps + MQ</em>。UI
            変更が頻繁ならば <em>AI Agent (POC 前提)</em>。全て不可で UI
            が安定した定型処理は <em>RPA</em>。参照データのみは{" "}
            <em>DB 日次コピー</em>。
          </p>
        </div>

        {/* Foundations — 4 numbered */}
        <Heading level={3} className="mt-10">
          導入前に整備すべき 4 つの Foundation
        </Heading>
        <StaggerReveal className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {intg.foundations.map((f) => (
            <article
              key={f.n}
              className="flex flex-col gap-2 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <span
                className="font-mono text-2xl font-bold tabular-nums text-primary-strong"
                aria-hidden
              >
                {f.n}
              </span>
              <Heading level={4} className="leading-tight">
                {f.title}
              </Heading>
              <Body size="sm" className="text-foreground/90">
                {foundationBodyMap[f.contentKey]}
              </Body>
            </article>
          ))}
        </StaggerReveal>

        {/* HITL 5-step table */}
        <Heading level={3} className="mt-10">
          ベテランの暗黙知を AI に蒸留する仕組み — 安全に段階的な自動化
        </Heading>
        <Body measure="wide" className="mt-2">
          核心は「AI に一気に任せる」ではなく、<em>安全に段階的な自動化</em>を
          実現すること。AI Agent / Computer Use
          系の業務自動化フレームワークは、暗黙知を AI
          ナレッジに蒸留する仕組みを設計できる。典型的な 5 step メカニズム:
        </Body>
        <div className="mt-4 rounded-md border border-border bg-background shadow-sys-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[20rem] px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  ステップ
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  内容
                </th>
              </tr>
            </thead>
            <tbody>
              {intg.hitlSteps.map((s) => (
                <tr
                  key={s.step}
                  className="border-b border-border/60 last:border-b-0 align-top"
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-foreground">
                      {s.step}. {s.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ops — 3 col HITL / LLMOps / Security */}
        <Heading level={3} className="mt-10">
          運用上の重要事項: HITL・LLMOps・新セキュリティ脅威
        </Heading>
        <Body measure="wide" className="mt-2">
          AI は「導入して終わり」ではない。
          <em>運用中に継続改善し、新たな脅威に対応する仕組み</em>が Executive
          レベルの必須事項となる。
        </Body>
        <StaggerReveal className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {intg.ops.map((o) => (
            <article
              key={o.contentKey}
              className="flex flex-col gap-2 rounded-md border border-border bg-background p-5 shadow-sys-sm"
            >
              <Heading level={4} className="leading-tight">
                {o.title}
              </Heading>
              <Body size="sm" className="text-foreground/90">
                {opsBodyMap[o.contentKey]}
              </Body>
            </article>
          ))}
        </StaggerReveal>

        <Callout variant="insight" className="mt-8" title="Executive レベルの重要性">
          AI 固有の脅威モデルを <em>CIO / CISO / 法務</em>{" "}
          連携で構築する必要あり、従来のセキュリティ部門だけでは検知も対応も困難。
        </Callout>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* §closing — 結論 + 3 self-assessment questions                */
/* ============================================================ */

function ClosingSection() {
  const questionBodyMap: Record<string, React.ReactNode> = {
    audit: (
      <>
        我が社の AI ROI を{" "}
        <span className="bg-warning-soft/40 px-0.5">外部監査に耐える形</span>{" "}
        で計測できているか？
      </>
    ),
    governance: (
      <>
        ガバナンス基盤 (データ · 監査 · LLMOps · リーガル連携) は AI 展開と{" "}
        <span className="bg-warning-soft/40 px-0.5">並走</span> しているか?
      </>
    ),
    distill: (
      <>
        我が社が持つ暗黙知を AI に蒸留する{" "}
        <span className="bg-warning-soft/40 px-0.5">継続改善ループ</span>{" "}
        は設計されているか?
      </>
    ),
  };

  return (
    <SectionReveal>
      <section
        id="closing"
        aria-labelledby="closing-heading"
        className="scroll-mt-20 border-t border-border py-12"
      >
        <Eyebrow>Closing</Eyebrow>
        <Heading level={2} id="closing-heading" className="mt-4">
          結論 — Executive への 3 つの問い
        </Heading>

        <div className="mt-6 space-y-5">
          <Body measure="wide" size="lg">
            銀行 AI 競争は「導入するかどうか」ではなく、
            <span className="bg-warning-soft/40 px-0.5 font-semibold">
              実行スピード、ガバナンスの成熟度、コスト最適化から収益イノベーションへの転換能力
            </span>{" "}
            が問われる局面に入った。
          </Body>
          <Body measure="wide" size="lg">
            <em>勝者の条件</em>は明確だ —{" "}
            <span className="bg-warning-soft/40 px-0.5">
              地味なことから始め、監査可能な形で計測し (DBS
              方式)、ガバナンスを最初に構築し (ガバナンス ≒
              ROI)、ワークフロー自体を再設計する
            </span>
            。これらを同時に満たせる銀行だけが{" "}
            <HighlightNum>$1,700 億</HighlightNum>{" "}
            の利益侵食リスクを「守り」に変え、<HighlightNum>$2 兆</HighlightNum>{" "}
            規模の AI 経済価値を取りに行ける。
          </Body>
        </div>

        <div className="mt-10 rounded-md border border-primary/30 bg-primary-soft/20 p-6 shadow-sys-sm">
          <Heading level={4}>自社に置き換えた 3 つの問い:</Heading>
          <ol className="mt-4 space-y-3">
            {bankingReport.closing.questions.map((q) => (
              <li
                key={q.n}
                className="flex items-baseline gap-3 text-base leading-relaxed"
              >
                <span
                  className="font-mono text-lg font-bold tabular-nums text-primary-strong"
                  aria-hidden
                >
                  {String(q.n).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  {questionBodyMap[q.contentKey]}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ============================================================ */
/* Ideal view — main editorial layout                           */
/* ============================================================ */

function IdealView() {
  return (
    <>
      <HeroSection />
      <TldrSection />
      <WhyNowSection />
      <PlayersSection />
      <RoiSection />
      <IntegrationSection />
      <ConsultingSection />
      <TimelineSection />
      <PrinciplesSection />
      <ClosingSection />
      <CitationsFooter />
    </>
  );
}

/* ============================================================ */
/* Demo states (5 universal states mock)                        */
/* ============================================================ */

function LoadingDemo() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(t);
  }, []);
  if (loaded) return <IdealView />;
  return (
    <section className="space-y-6 py-8" aria-busy="true" aria-label="読み込み中">
      <Eyebrow>Loading demo · 3s</Eyebrow>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton variant="text" lines={4} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" />
        データ取得中…
      </div>
    </section>
  );
}

function ErrorDemo() {
  const [toastOpen, setToastOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <section className="space-y-6 py-8" aria-label="エラー状態デモ">
      <Eyebrow tone="muted">Error demo · Toast + AlertDialog</Eyebrow>
      <Heading level={2}>読み込みエラー</Heading>
      <Body measure="wide">
        出典データの取得に失敗しました。再試行するか、このまま閉じてください。
      </Body>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
        >
          再試行 (AlertDialog)
        </button>
        <button
          type="button"
          onClick={() => setToastOpen(true)}
          className="rounded-sm border border-border px-4 py-2 text-sm font-medium hover:text-foreground"
        >
          Toast 再表示
        </button>
      </div>
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        variant="error"
        duration={0}
      >
        <strong>読み込み失敗</strong>: 25 情報源のうち 1
        件が取得できませんでした。
      </Toast>
      <AlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          window.location.search = "";
        }}
        title="再試行してよろしいですか?"
        description="ページを再読み込みして ideal 状態に戻ります。未保存の内容は破棄されます。"
        variant="neutral"
        confirmLabel="再試行"
      />
    </section>
  );
}

function EmptyDemo() {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <Eyebrow tone="muted">Empty demo</Eyebrow>
      <Heading level={2}>該当する情報源がありません</Heading>
      <Body measure="wide" className="text-muted-foreground">
        現在のフィルタ条件では表示するデータがありません。
        検索条件を広げるか、全データ表示に戻してください。
      </Body>
      <a
        href="?demo=ideal"
        className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
      >
        全データ表示に戻る
      </a>
    </section>
  );
}

function PartialView() {
  const [partialToast, setPartialToast] = useState(true);
  return (
    <>
      <IdealView />
      <Toast
        open={partialToast}
        onClose={() => setPartialToast(false)}
        variant="warning"
        duration={0}
      >
        <strong>一部の出典データが取得できませんでした。</strong>
        主要データは表示されています。
      </Toast>
    </>
  );
}

/* ============================================================ */
/* Root                                                          */
/* ============================================================ */

export function BankingReport() {
  const [demoMode] = useState<DemoMode>(() => getDemoMode());

  return (
    <AppShell
      skipLink={<SkipLink href="#hero">本文にスキップ</SkipLink>}
      progressBar={<ProgressBar />}
      topBar={
        <TopBar
          left={
            <BrandMark
              label="AI"
              wordmark="Banking AI Landscape"
              sublabel="Executive Briefing · 2026"
            />
          }
          center={<NavLinks />}
          right={<ReadTimePill minutes={10} />}
        />
      }
    >
      {demoMode === "loading" ? (
        <LoadingDemo />
      ) : demoMode === "error" ? (
        <ErrorDemo />
      ) : demoMode === "empty" ? (
        <EmptyDemo />
      ) : demoMode === "partial" ? (
        <PartialView />
      ) : (
        <IdealView />
      )}

      <Footer>
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <p>
            Clarity view · Charter Fullness Probe · 2026 Q2 edition
          </p>
          <p>
            旧 HTML 版は{" "}
            <a href="/ai-banking-report/" className="underline">
              /ai-banking-report/
            </a>{" "}
            で引き続き閲覧可能。
          </p>
        </div>
      </Footer>
    </AppShell>
  );
}
