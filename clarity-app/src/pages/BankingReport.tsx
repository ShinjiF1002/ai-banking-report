import {
  Body,
  Callout,
  Caption,
  Cite,
  Heading,
  KpiTile,
  TabularNum,
  Table,
  TierBadge,
} from "@clarity-ds/core";
import type { TableColumn, TableRow, Tier } from "@clarity-ds/core";
import { bankingReport } from "../data/banking-report";

export function BankingReport() {
  return (
    <main className="mx-auto max-w-[72rem] px-6 pb-24 pt-16 md:px-10">
      <HeroSection />
      <WhyNowSection />
      <PlayersSection />
      <RoiSection />
      <ConsultingSection />
      <TimelineSection />
      <PrinciplesSection />
      <CitationsFooter />
    </main>
  );
}

/* ============================================================ */
/* 1. Hero                                                      */
/* ============================================================ */

function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="pb-12">
      <Caption uppercase>Clarity view · 2026 Q2 edition</Caption>
      <Heading level={1} id="hero-heading">
        {bankingReport.hero.title}
      </Heading>
      <p className="mt-3 text-base font-medium tracking-[-0.005em] text-muted-foreground">
        {bankingReport.hero.subtitle}
      </p>
      <Body size="lg" measure="wide" className="mt-6 text-foreground/90">
        {bankingReport.hero.summary}
      </Body>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bankingReport.hero.keyStats.map((stat) => (
          <KpiTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            delta={stat.delta ? { ...stat.delta, direction: "up" } : undefined}
            tier={stat.tier}
            hint={stat.hint}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* 2. Why now?                                                  */
/* ============================================================ */

function WhyNowSection() {
  const columns: TableColumn[] = [
    { id: "industry", label: "業界" },
    { id: "automation", label: "自動化", numeric: true },
    { id: "augmentation", label: "拡張", numeric: true },
    { id: "total", label: "合計影響度", numeric: true },
  ];

  const rows: TableRow[] = bankingReport.industryImpact.map((row) => ({
    id: row.industry,
    highlight: row.industry === "銀行" ? "primary" : null,
    cells: {
      industry: row.industry === "銀行" ? <strong>{row.industry}</strong> : row.industry,
      automation: <TabularNum value={row.automation} suffix="%" />,
      augmentation: <TabularNum value={row.augmentation} suffix="%" />,
      total: (
        <TabularNum
          value={row.automation + row.augmentation}
          suffix="%"
          emphasis={row.industry === "銀行"}
        />
      ),
    },
  }));

  return (
    <section aria-labelledby="whynow-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 1 · Why now?</Caption>
      <Heading level={2} id="whynow-heading">
        なぜ今、銀行 AI が重要か
      </Heading>
      <Body measure="wide" className="mt-4">
        WEF / Accenture の共同白書は、全産業中で金融サービスが最も AI の影響を受ける業界であることを示した
        <Cite n={1} tier="T2" href={bankingReport.sources[0].url} />。
        世界の金融機関のうち AI をコア機能に組み込んでいる比率は
        <TabularNum value="1 年で倍増" emphasis />
        <Cite n={2} tier="T1" href={bankingReport.sources[1].url} />。
      </Body>

      <Callout variant="important" title="銀行業務の 73% が AI の影響を受ける" className="my-6">
        全産業中で最も高い合計影響度。以下は WEF / Accenture による業界別インパクト table。
      </Callout>

      <Table
        caption="業界別 AI インパクト (WEF / Accenture 2025)"
        columns={columns}
        rows={rows}
        variant="default"
      />
    </section>
  );
}

/* ============================================================ */
/* 3. Top 10 Players + Evident Index                            */
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
            <span className="text-xs text-muted-foreground">#{p.evidentRank}</span>
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
              <Cite key={id} n={id} tier={p.tier} href={bankingReport.sources[id - 1].url} />
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
    <section aria-labelledby="players-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 2 · 主要プレイヤーの現在地</Caption>
      <Heading level={2} id="players-heading">
        Top 10 global banks
      </Heading>
      <Body measure="wide" className="mt-4">
        米国 6 大手 + 欧州・アジアの主要 4 行が、AI を試験段階から本番運用へ移行した。JPMC が群を抜いてリード
        <Cite n={5} tier="T1" href={bankingReport.sources[4].url} />、DBS は監査済み AI 経済価値 S$10 億を開示し ROI 計測規律で他行をリード
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
          独立第三者ランキング。70 以上の指標と数百万の公開データポイントで評価。Talent (45%) / Innovation (30%) / Leadership (15%) / Transparency (10%)
          <Cite n={25} tier="T2" href={bankingReport.sources[24].url} />。Top 10 のスコア改善速度はその他の 2.3 倍。
        </Body>
        <div className="mt-4">
          <Table caption="Evident AI Index 2025 Top 10" columns={evidentColumns} rows={evidentRows} variant="compact" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* 4. ROI Matrix                                                */
/* ============================================================ */

function RoiSection() {
  return (
    <section aria-labelledby="roi-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 3 · 実証済みユースケースと ROI</Caption>
      <Heading level={2} id="roi-heading">
        7 領域の ROI 成熟度
      </Heading>
      <Body measure="wide" className="mt-4">
        最も成熟しているのは <strong>不正検知・カスタマーサービス・書類処理</strong>。各領域とも複数銀行 (T1 ソース) で同方向の効果を確認、業界ベンチマークも一致する。
      </Body>

      {bankingReport.roiDomains.map((domain) => {
        const columns: TableColumn[] = [
          { id: "bank", label: "銀行", widthClass: "w-[6rem]" },
          { id: "useCase", label: "ユースケース", widthClass: "w-[18rem]" },
          { id: "result", label: "測定済み成果" },
          { id: "tier", label: "Tier", widthClass: "w-[4rem]" },
        ];

        const rows: TableRow[] = domain.rows.map((r) => ({
          id: `${domain.id}-${r.bank}-${r.useCase}`,
          cells: {
            bank: <strong>{r.bank}</strong>,
            useCase: r.useCase,
            result: (
              <>
                {r.result}{" "}
                {r.citationIds.map((id) => (
                  <Cite key={id} n={id} tier={r.tier} href={bankingReport.sources[id - 1].url} />
                ))}
              </>
            ),
            tier: <TierBadge tier={r.tier} size="xs" />,
          },
        }));

        return (
          <div key={domain.id} className="mt-10">
            <Heading level={3}>
              {domain.emoji} {domain.name}
            </Heading>
            <p className="mt-1 text-sm text-muted-foreground">{domain.benchmark}</p>
            <div className="mt-4">
              <Table
                caption={`${domain.name} — 銀行別ユースケース`}
                columns={columns}
                rows={rows}
                variant="default"
              />
            </div>
          </div>
        );
      })}

      <Callout variant="note" title="残り 4 領域 (compressed summary)" className="mt-10">
        <ul className="space-y-2">
          {bankingReport.roiDomainsSummary.map((d) => (
            <li key={d.id}>
              <strong>
                {d.emoji} {d.name}
              </strong>
              : {d.note}
            </li>
          ))}
        </ul>
      </Callout>
    </section>
  );
}

/* ============================================================ */
/* 5. Consulting benchmarks                                     */
/* ============================================================ */

function ConsultingSection() {
  const columns: TableColumn[] = [
    { id: "firm", label: "機関", widthClass: "w-[10rem]" },
    { id: "indicator", label: "指標" },
    { id: "value", label: "数値", numeric: true, widthClass: "w-[10rem]" },
    { id: "note", label: "注記" },
  ];

  const rows: TableRow[] = bankingReport.consulting.map((c, i) => ({
    id: `consulting-${i}`,
    cells: {
      firm: <strong>{c.firm}</strong>,
      indicator: (
        <>
          {c.indicator}{" "}
          <Cite n={c.citationId} tier="T2" href={bankingReport.sources[c.citationId - 1].url} />
        </>
      ),
      value: <TabularNum value={c.value} emphasis />,
      note: c.note ?? "—",
    },
  }));

  return (
    <section aria-labelledby="consulting-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 4 · 業界全体の定量分析</Caption>
      <Heading level={2} id="consulting-heading">
        コンサル / 国際機関の集計
      </Heading>
      <Body measure="wide" className="mt-4">
        McKinsey・Accenture・Deloitte・世銀/IMF/BIS が独立に「AI は数 % ポイントの利益率改善を実現可能」と結論。同時に McKinsey は
        <TabularNum value="$1,700 億" emphasis />
        の利益侵食警告も並列で発表。最大の障壁は技術ではなく
        <strong>データ基盤の脆弱性</strong> (Deloitte)
        <Cite n={20} tier="T2" href={bankingReport.sources[19].url} />。
      </Body>

      <div className="mt-6">
        <Table caption="主要コンサル / 国際機関の AI 定量分析" columns={columns} rows={rows} variant="compact" />
      </div>
    </section>
  );
}

/* ============================================================ */
/* 6. Future outlook                                            */
/* ============================================================ */

function TimelineSection() {
  const confidenceTier: Record<"確認済" | "高" | "中", Tier> = {
    確認済: "T1",
    高: "T2",
    中: "T3",
  };

  const columns: TableColumn[] = [
    { id: "period", label: "時間軸", widthClass: "w-[10rem]" },
    { id: "developments", label: "予想される展開" },
    { id: "confidence", label: "確信度", widthClass: "w-[6rem]" },
  ];

  const rows: TableRow[] = bankingReport.timeline.map((t, i) => ({
    id: `timeline-${i}`,
    highlight: i === 0 ? "primary" : null,
    cells: {
      period: <strong>{t.period}</strong>,
      developments: (
        <ul className="space-y-0.5">
          {t.developments.map((d, j) => (
            <li key={j} className="text-sm">
              • {d}
            </li>
          ))}
        </ul>
      ),
      confidence: <TierBadge tier={confidenceTier[t.confidence]} size="xs" />,
    },
  }));

  return (
    <section aria-labelledby="timeline-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 5 · 将来展望 2026–2030</Caption>
      <Heading level={2} id="timeline-heading">
        エージェント型 AI の両刃の剣
      </Heading>
      <Callout variant="warning" title="McKinsey 警告" className="my-6">
        エージェント型 AI の「両刃の剣」 — グローバル銀行利益プールが <TabularNum value="$1,700 億" emphasis /> (約 9%) 減少リスク
        <Cite n={4} tier="T2" href={bankingReport.sources[3].url} />。
      </Callout>

      <Table caption="2026-2030 年の展望 timeline" columns={columns} rows={rows} variant="default" />
    </section>
  );
}

/* ============================================================ */
/* 7. Strategic principles                                      */
/* ============================================================ */

function PrinciplesSection() {
  return (
    <section aria-labelledby="principles-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 6 · 戦略的示唆</Caption>
      <Heading level={2} id="principles-heading">
        勝者と敗者を分ける 7 つの要因
      </Heading>
      <Body measure="wide" className="mt-4">
        「導入するか否か」ではなく <strong>実行スピード・ガバナンス成熟度・コスト最適化から収益イノベーションへの転換能力</strong> が問われる。
      </Body>

      <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {bankingReport.principles.map((p) => (
          <li
            key={p.n}
            className="flex flex-col gap-2 rounded-md border border-border bg-background p-5 shadow-sys-sm"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Principle {p.n}
              </span>
              <span className="text-xs text-muted-foreground">
                {p.citationIds.slice(0, 3).map((id) => (
                  <Cite key={id} n={id} tier="T1" href={bankingReport.sources[id - 1].url} />
                ))}
              </span>
            </div>
            <Heading level={4}>{p.title}</Heading>
            <Body size="sm">{p.rationale}</Body>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================================================ */
/* 8. Citations footer                                          */
/* ============================================================ */

function CitationsFooter() {
  return (
    <section aria-labelledby="citations-heading" className="border-t border-border py-12">
      <Caption uppercase>Section 7 · References</Caption>
      <Heading level={2} id="citations-heading">
        25 情報源 (Tier 分類)
      </Heading>
      <Body size="sm" measure="wide" className="mt-2 text-muted-foreground">
        T1 = 企業公式 / 政府機関、T2 = 国際機関 / Big4 / MBB、T3 = Tier 1 通信社、T4 = 業界専門メディア、T5 = 個人ブログ / マーケティング。本レポートは T1〜T3 を引用根拠とする。
      </Body>

      <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {bankingReport.sources.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-1.5 rounded-sm border border-border bg-background p-4 shadow-sys-sm"
          >
            <div className="flex items-center gap-2">
              <TierBadge tier={s.tier} size="xs" />
              <span className="text-xs tabular-nums text-muted-foreground">#{s.id}</span>
              <span className="text-xs text-muted-foreground">{s.date}</span>
            </div>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              {s.title}
            </a>
            <p className="text-xs text-muted-foreground">{s.publisher}</p>
            <p className="text-xs text-foreground/90">{s.summary}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-md border border-border bg-muted/40 p-5 text-xs text-muted-foreground">
        Clarity view · built with Clarity design system v0.1.0 (S1 Parallel Alt-deploy) · 旧 HTML 版 は <a href="/ai-banking-report/" className="underline">/ai-banking-report/</a> で引き続き閲覧可能。
      </div>
    </section>
  );
}
