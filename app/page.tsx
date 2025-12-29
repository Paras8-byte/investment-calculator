"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import {
  calc,
  breakevenRentMonthly,
  breakevenInterestPct,
  type Inputs,
} from "@/lib/engine";

import { track } from "@/lib/analytics";

/* =========================
   helpers
========================= */
function euro(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(x);
}

function pct(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(x);
}

function clamp(n: number, min?: number, max?: number) {
  if (!Number.isFinite(n)) return min ?? 0;
  let x = n;
  if (typeof min === "number") x = Math.max(min, x);
  if (typeof max === "number") x = Math.min(max, x);
  return x;
}

function safe(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

function safeOrNull(n: number) {
  return Number.isFinite(n) ? n : null;
}

function signedEuro(n: number) {
  const x = safe(n, 0);
  const sign = x > 0 ? "+" : "";
  return `${sign}${euro(x)}`;
}

type Results = ReturnType<typeof calc>;

function safeCalc(inputs: Inputs): Results {
  try {
    const r = calc(inputs);

    // Hardening: stelle sicher, dass zentrale Felder finite sind (Charts/KPIs)
    return {
      ...r,
      netCashflow: safe(r.netCashflow),
      dscr: safe(r.dscr),
      cashOnCash: safe(r.cashOnCash),
      effectiveRent: safe(r.effectiveRent),
      debtService: safe(r.debtService),
      loan: safe(r.loan),
    };
  } catch {
    // Fallback: minimal “nicht crashen”
    return {
      netCashflow: 0,
      dscr: 0,
      cashOnCash: 0,
      effectiveRent: 0,
      debtService: 0,
      loan: 0,
    } as Results;
  }
}

function trafficLight(results: {
  netCashflow: number;
  dscr: number;
  cashOnCash: number;
}) {
  const reasons: string[] = [];

  if (results.netCashflow < 0) reasons.push("Cashflow negativ");
  if (results.dscr < 1.1) reasons.push("DSCR < 1.10");
  if (results.cashOnCash < 0.06) reasons.push("Cash-on-Cash < 6%");

  const score = 3 - reasons.length;

  if (score === 3) {
    return {
      label: "Grün",
      tone: "green" as const,
      hint: "Solide Basis: Cashflow, DSCR und Rendite sind im grünen Bereich.",
      reasons: [],
    };
  }

  if (score === 2) {
    return {
      label: "Gelb",
      tone: "yellow" as const,
      hint: "Fast gut – ein Punkt ist kritisch. Stell an Zins/Miete/Leerstand.",
      reasons,
    };
  }

  return {
    label: "Rot",
    tone: "red" as const,
    hint: "Riskant – mindestens zwei Kennzahlen sind schwach.",
    reasons,
  };
}

type BreakEven = {
  cashflow0: number | null;
  dscr110: number | null;
  coc6: number | null;
  maxInterestDscr110: number | null;
  maxInterestCashflow0: number | null;
};

const DEFAULT_INPUTS: Inputs = {
  purchasePrice: 320000,
  coldRentMonthly: 1100,
  nonAllocCostsMonthly: 120,
  equity: 60000,
  interestRatePct: 3.8,
  initialRepaymentPct: 2.0,
  vacancyPct: 4,
  closingCostsPct: 10,
  capex: 0,
  reservesMonthly: 0,
};

/* =========================
   Presets (Einsteiger + Semi-Pro)
========================= */
const PRESETS: Array<{ id: string; label: string; inputs: Inputs }> = [
  {
    id: "berlin-etw-starter",
    label: "Berlin ETW (Starter)",
    inputs: {
      ...DEFAULT_INPUTS,
      purchasePrice: 380000,
      coldRentMonthly: 1350,
      nonAllocCostsMonthly: 160,
      equity: 80000,
      interestRatePct: 3.9,
      initialRepaymentPct: 2.0,
      vacancyPct: 3,
      closingCostsPct: 10,
      capex: 8000,
      reservesMonthly: 60,
    },
  },
  {
    id: "leipzig-etw-yield",
    label: "Leipzig ETW (Yield)",
    inputs: {
      ...DEFAULT_INPUTS,
      purchasePrice: 220000,
      coldRentMonthly: 950,
      nonAllocCostsMonthly: 140,
      equity: 50000,
      interestRatePct: 3.8,
      initialRepaymentPct: 2.2,
      vacancyPct: 5,
      closingCostsPct: 10,
      capex: 5000,
      reservesMonthly: 70,
    },
  },
  {
    id: "mfh-semi-pro",
    label: "MFH (Semi-Pro)",
    inputs: {
      ...DEFAULT_INPUTS,
      purchasePrice: 950000,
      coldRentMonthly: 5200,
      nonAllocCostsMonthly: 650,
      equity: 220000,
      interestRatePct: 4.0,
      initialRepaymentPct: 2.0,
      vacancyPct: 6,
      closingCostsPct: 10,
      capex: 35000,
      reservesMonthly: 220,
    },
  },
];

/* =========================
   localStorage state
========================= */
function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      setState(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [key]);

  // save
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}

/* =========================
   small UI helpers
========================= */
function FeedbackButton() {
  return (
    <a
      href="https://tally.so/r/DEINFORMULAR" // <- hier dein Link rein
      target="_blank"
      rel="noreferrer"
      onClick={() => track("feedback_clicked")}
      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
    >
      Feedback geben
    </a>
  );
}

/* =========================
   Page
========================= */
export default function Page() {
  const [inputs, setInputs] = useLocalStorageState<Inputs>(
    "ic.inputsA",
    DEFAULT_INPUTS
  );

  const [inputsB, setInputsB] = useLocalStorageState<Inputs>(
    "ic.inputsB",
    DEFAULT_INPUTS
  );

  const [compareOn, setCompareOn] = useLocalStorageState<boolean>(
    "ic.compareOn",
    false
  );

  const [showAdvanced, setShowAdvanced] = useLocalStorageState<boolean>(
    "ic.showAdvanced",
    false
  );

  const [sens, setSens] = useLocalStorageState("ic.sens", {
    interestDeltaPct: 0,
    rentDeltaPct: 0,
  });

  const [presetId, setPresetId] = useLocalStorageState<string>(
    "ic.presetId",
    PRESETS[0]?.id ?? ""
  );

  const selectedPreset = useMemo(
    () => PRESETS.find((x) => x.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  function setA<K extends keyof Inputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function setB<K extends keyof Inputs>(key: K, value: number) {
    setInputsB((prev) => ({ ...prev, [key]: value }));
  }

  function applyPresetToA() {
    const p = selectedPreset;
    if (!p) return;
    track("preset_used", { preset: p.id, label: p.label, target: "A" });
    setInputs(p.inputs);
  }

  function applyPresetToB() {
    const p = selectedPreset;
    if (!p) return;
    track("preset_used", { preset: p.id, label: p.label, target: "B" });
    setInputsB(p.inputs);
  }

  // Simulation on A only (MVP)
  const simInputs = useMemo<Inputs>(() => {
    const rentFactor = 1 + sens.rentDeltaPct / 100;
    return {
      ...inputs,
      interestRatePct: inputs.interestRatePct + sens.interestDeltaPct,
      coldRentMonthly: Math.max(0, inputs.coldRentMonthly * rentFactor),
    };
  }, [inputs, sens]);

  const resultsA = useMemo<Results>(() => safeCalc(simInputs), [simInputs]);
  const lightA = useMemo(() => trafficLight(resultsA), [resultsA]);

  const resultsB = useMemo<Results>(() => safeCalc(inputsB), [inputsB]);
  const lightB = useMemo(() => trafficLight(resultsB), [resultsB]);

  const breakEven = useMemo<BreakEven>(() => {
    // breakeven helpers könnten null/NaN liefern -> harden
    const cashflow0 = safeOrNull(breakevenRentMonthly(inputs, "cashflow0") as any);
    const dscr110 = safeOrNull(breakevenRentMonthly(inputs, "dscr110") as any);
    const coc6 = safeOrNull(breakevenRentMonthly(inputs, "coc6") as any);
    const maxInterestDscr110 = safeOrNull(breakevenInterestPct(inputs, "dscr110") as any);
    const maxInterestCashflow0 = safeOrNull(breakevenInterestPct(inputs, "cashflow0") as any);

    return {
      cashflow0,
      dscr110,
      coc6,
      maxInterestDscr110,
      maxInterestCashflow0,
    };
  }, [inputs]);

  // Waterfall chart (A only) — IMPORTANT: keep negatives
  const chartData = useMemo(() => {
    return [
      { name: "Miete (effektiv)", value: safe(resultsA.effectiveRent) },
      {
        name: "Kosten",
        value: -safe(simInputs.nonAllocCostsMonthly + simInputs.reservesMonthly),
      },
      { name: "Finanzierung", value: -safe(resultsA.debtService) },
      { name: "Cashflow", value: safe(resultsA.netCashflow) },
    ];
  }, [resultsA, simInputs]);

  // Compare chart (A vs B) — keep negatives consistently
  const compareChartData = useMemo(() => {
    return [
      {
        name: "Miete (effektiv)",
        A: safe(resultsA.effectiveRent),
        B: safe(resultsB.effectiveRent),
      },
      {
        name: "Kosten",
        A: -safe(simInputs.nonAllocCostsMonthly + simInputs.reservesMonthly),
        B: -safe(inputsB.nonAllocCostsMonthly + inputsB.reservesMonthly),
      },
      {
        name: "Finanzierung",
        A: -safe(resultsA.debtService),
        B: -safe(resultsB.debtService),
      },
      {
        name: "Cashflow",
        A: safe(resultsA.netCashflow),
        B: safe(resultsB.netCashflow),
      },
    ];
  }, [resultsA, resultsB, simInputs, inputsB]);

  const compact = compareOn;

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Investment Calculator
              </h1>
              <p className="text-zinc-700">
                Minimaler Input → sofort Cashflow, DSCR, Cash-on-Cash.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FeedbackButton />
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* INPUTS */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Eingaben</h2>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  Objekt A ist die Basis. Vergleich schaltet Objekt B frei.
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                  onClick={() =>
                    setCompareOn((v) => {
                      const next = !v;
                      track("compare_toggled", { on: next ? "1" : "0" });
                      if (!v) setInputsB(inputs);
                      return next;
                    })
                  }
                >
                  {compareOn ? "Vergleich ausblenden" : "Vergleich anzeigen"}
                </button>

                <button
                  type="button"
                  className="text-sm font-semibold text-zinc-900 underline underline-offset-4"
                  onClick={() => setShowAdvanced((s) => !s)}
                >
                  {showAdvanced ? "Erweitert ausblenden" : "Erweitert anzeigen"}
                </button>
              </div>
            </div>

            <PresetBar
              presetId={presetId}
              setPresetId={setPresetId}
              compareOn={compareOn}
              onApplyA={applyPresetToA}
              onApplyB={applyPresetToB}
            />

            <div
              className={`mt-4 grid gap-4 ${
                compareOn ? "md:grid-cols-2" : "md:grid-cols-1"
              }`}
            >
              <ObjectCard
                title="Objekt A"
                inputs={inputs}
                setValue={setA}
                showAdvanced={showAdvanced}
                compact={compact}
              />

              {compareOn && (
                <ObjectCard
                  title="Objekt B"
                  inputs={inputsB}
                  setValue={setB}
                  showAdvanced={showAdvanced}
                  compact={compact}
                  topRight={
                    <button
                      type="button"
                      className="text-xs font-bold text-zinc-900 underline underline-offset-4"
                      onClick={() => setInputsB(inputs)}
                    >
                      Werte von A übernehmen
                    </button>
                  }
                />
              )}
            </div>
          </section>

          {/* RESULTS */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="text-lg font-semibold">Ergebnis</h2>

            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div>
                {compareOn ? (
                  <CompareTop
                    a={{ results: resultsA, light: lightA }}
                    b={{ results: resultsB, light: lightB }}
                  />
                ) : (
                  <AmpelCard light={lightA} />
                )}

                <DecisionSummary
                  light={lightA}
                  inputs={inputs}
                  breakEven={breakEven}
                />
              </div>

              <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900">
                    {compareOn ? "A vs B Vergleich" : "Cashflow-Wasserfall"}
                  </div>
                  <div className="text-xs font-bold text-zinc-700">
                    {compareOn ? "Objekt A vs Objekt B" : "Objekt A (simuliert)"}
                  </div>
                </div>

                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    {compareOn ? (
                      <BarChart data={compareChartData}>
                        <ReferenceLine y={0} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(v: any) => signedEuro(Number(v))}
                        />
                        <Bar dataKey="A" />
                        <Bar dataKey="B" />
                      </BarChart>
                    ) : (
                      <BarChart data={chartData}>
                        <ReferenceLine y={0} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(v: any) => signedEuro(Number(v))}
                        />
                        <Bar dataKey="value" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Kpi
                label="Netto-Cashflow / Monat"
                value={euro(safe(resultsA.netCashflow))}
              />
              <Kpi
                label="Cash-on-Cash (Jahr 1)"
                value={pct(safe(resultsA.cashOnCash))}
              />
              <Kpi label="Darlehen" value={euro(safe(resultsA.loan))} />
              <Kpi label="DSCR" value={safe(resultsA.dscr).toFixed(2)} />
            </div>

            <section className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="text-sm font-semibold text-zinc-900">
                Sensitivität{" "}
                <InfoTip text="Wir ändern nur die Anzeige (simuliert). Eingaben bleiben unverändert." />
              </div>

              <div className="mt-4 grid gap-4">
                <SliderRow
                  label="Zins-Delta"
                  value={sens.interestDeltaPct}
                  min={-2}
                  max={2}
                  step={0.1}
                  suffix="%"
                  onChange={(v) =>
                    setSens((s) => ({ ...s, interestDeltaPct: v }))
                  }
                />

                <SliderRow
                  label="Miete-Delta"
                  value={sens.rentDeltaPct}
                  min={-20}
                  max={20}
                  step={1}
                  suffix="%"
                  onChange={(v) =>
                    setSens((s) => ({ ...s, rentDeltaPct: v }))
                  }
                />

                <button
                  type="button"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                  onClick={() => setSens({ interestDeltaPct: 0, rentDeltaPct: 0 })}
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 text-xs font-bold text-zinc-700">
                Aktuell simuliert:{" "}
                <span className="font-extrabold text-zinc-900">
                  Zins {safe(simInputs.interestRatePct).toFixed(2)}%
                </span>{" "}
                ·{" "}
                <span className="font-extrabold text-zinc-900">
                  Miete {Math.round(safe(simInputs.coldRentMonthly))} €
                </span>
              </div>
            </section>

            <section className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="text-sm font-semibold text-zinc-900">
                Break-even{" "}
                <InfoTip text="Welche Kaltmiete / welcher Zins ist nötig, um Mindestwerte zu erreichen?" />
              </div>

              <div className="mt-4 grid gap-3">
                <BreakRow
                  label="Cashflow ≥ 0"
                  value={breakEven.cashflow0}
                  currentRent={inputs.coldRentMonthly}
                />
                <BreakRow
                  label="DSCR ≥ 1.10"
                  value={breakEven.dscr110}
                  currentRent={inputs.coldRentMonthly}
                />
                <BreakRow
                  label="Cash-on-Cash ≥ 6%"
                  value={breakEven.coc6}
                  currentRent={inputs.coldRentMonthly}
                />
              </div>

              <div className="mt-4 grid gap-3">
                <div className="text-xs font-extrabold text-zinc-800">
                  Zins-Break-even
                </div>
                <InterestRow
                  label="Max. Zins für DSCR ≥ 1.10"
                  value={breakEven.maxInterestDscr110}
                  current={inputs.interestRatePct}
                />
                <InterestRow
                  label="Max. Zins für Cashflow ≥ 0"
                  value={breakEven.maxInterestCashflow0}
                  current={inputs.interestRatePct}
                />
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================
   UI blocks
========================= */

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center">
      <span
        className="ml-1 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-white text-xs font-extrabold text-zinc-900 ring-1 ring-zinc-300"
        title={text}
      >
        i
      </span>
    </span>
  );
}

function PresetBar({
  presetId,
  setPresetId,
  compareOn,
  onApplyA,
  onApplyB,
}: {
  presetId: string;
  setPresetId: (v: string) => void;
  compareOn: boolean;
  onApplyA: () => void;
  onApplyB: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[220px]">
          <div className="text-xs font-extrabold text-zinc-700">Presets</div>
          <select
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            onClick={onApplyA}
          >
            Preset → Objekt A
          </button>

          <button
            type="button"
            className={`rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 ${
              compareOn ? "" : "pointer-events-none opacity-50"
            }`}
            onClick={onApplyB}
            title={compareOn ? "" : "Aktiviere Vergleich, um Objekt B zu befüllen."}
          >
            Preset → Objekt B
          </button>
        </div>
      </div>

      <div className="mt-2 text-[12px] font-semibold text-zinc-700">
        Tipp: Preset wählen → A/B befüllen → danach fein-tunen.
      </div>
    </div>
  );
}

function ObjectCard({
  title,
  inputs,
  setValue,
  showAdvanced,
  compact,
  topRight,
}: {
  title: string;
  inputs: Inputs;
  setValue: <K extends keyof Inputs>(key: K, value: number) => void;
  showAdvanced: boolean;
  compact: boolean;
  topRight?: React.ReactNode;
}) {
  const labelCls = compact
    ? "text-xs font-bold text-zinc-800"
    : "text-sm font-semibold text-zinc-800";
  const inputBase =
    "w-full rounded-xl border border-zinc-300 bg-white text-zinc-900 outline-none ring-0 focus:ring-2 focus:ring-zinc-200";
  const inputCls = compact
    ? `${inputBase} px-2 py-1.5 text-sm`
    : `${inputBase} px-3 py-2`;
  const gap = compact ? "gap-3" : "gap-4";

  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-extrabold text-zinc-900">{title}</div>
        {topRight}
      </div>

      <div className={`mt-4 grid ${gap} min-w-0`}>
        <Field
          label="Kaufpreis (€)"
          labelCls={labelCls}
          inputCls={inputCls}
          value={inputs.purchasePrice}
          min={0}
          step={1000}
          onChange={(v) => setValue("purchasePrice", v)}
        />

        <Field
          label="Kaltmiete/Monat (€)"
          labelCls={labelCls}
          inputCls={inputCls}
          value={inputs.coldRentMonthly}
          min={0}
          step={10}
          onChange={(v) => setValue("coldRentMonthly", v)}
        />

        <Field
          label="Nicht-umlagefähige Kosten/Monat (€)"
          labelCls={labelCls}
          inputCls={inputCls}
          value={inputs.nonAllocCostsMonthly}
          min={0}
          step={10}
          onChange={(v) => setValue("nonAllocCostsMonthly", v)}
        />

        <Field
          label="Eigenkapital (€)"
          labelCls={labelCls}
          inputCls={inputCls}
          value={inputs.equity}
          min={0}
          step={1000}
          onChange={(v) => setValue("equity", v)}
        />

        <div className={`grid grid-cols-2 ${compact ? "gap-2" : "gap-3"} min-w-0`}>
          <Field
            label="Zins (%)"
            labelCls={compact ? "text-[11px] font-extrabold text-zinc-800" : labelCls}
            inputCls={compact ? `${inputBase} px-2 py-1 text-[13px]` : inputCls}
            value={inputs.interestRatePct}
            min={0}
            max={15}
            step={0.1}
            onChange={(v) => setValue("interestRatePct", v)}
          />
          <Field
            label="Tilgung (%)"
            labelCls={compact ? "text-[11px] font-extrabold text-zinc-800" : labelCls}
            inputCls={compact ? `${inputBase} px-2 py-1 text-[13px]` : inputCls}
            value={inputs.initialRepaymentPct}
            min={0}
            max={15}
            step={0.1}
            onChange={(v) => setValue("initialRepaymentPct", v)}
          />
        </div>

        <Field
          label="Leerstand (%)"
          labelCls={labelCls}
          inputCls={inputCls}
          value={inputs.vacancyPct}
          min={0}
          max={30}
          step={0.5}
          onChange={(v) => setValue("vacancyPct", v)}
        />

        {showAdvanced && (
          <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <div className="text-xs font-extrabold text-zinc-900">Erweitert</div>

            <div className={`mt-3 grid ${gap}`}>
              <Field
                label="Kaufnebenkosten (%)"
                labelCls={labelCls}
                inputCls={inputCls}
                value={inputs.closingCostsPct}
                min={0}
                max={20}
                step={0.1}
                onChange={(v) => setValue("closingCostsPct", v)}
              />
              <Field
                label="Capex (€)"
                labelCls={labelCls}
                inputCls={inputCls}
                value={inputs.capex}
                min={0}
                step={1000}
                onChange={(v) => setValue("capex", v)}
              />
              <Field
                label="Rücklagen / Monat (€)"
                labelCls={labelCls}
                inputCls={inputCls}
                value={inputs.reservesMonthly}
                min={0}
                step={10}
                onChange={(v) => setValue("reservesMonthly", v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  step = 1,
  min,
  max,
  onChange,
  labelCls,
  inputCls,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  labelCls: string;
  inputCls: string;
}) {
  return (
    <label className="grid gap-1 min-w-0">
      <span className={labelCls}>{label}</span>
      <input
        className={inputCls}
        type="number"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const raw = Number(e.target.value);
          onChange(clamp(raw, min, max));
        }}
      />
    </label>
  );
}

function CompareTop({
  a,
  b,
}: {
  a: { results: Results; light: ReturnType<typeof trafficLight> };
  b: { results: Results; light: ReturnType<typeof trafficLight> };
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-zinc-900">Vergleich</div>
        <div className="text-xs font-bold text-zinc-700">A vs B</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-zinc-200">
          <div className="text-xs font-extrabold text-zinc-700">Objekt A</div>
          <div className="mt-1 text-sm font-extrabold text-zinc-900">
            Cashflow: {euro(safe(a.results.netCashflow))}
          </div>
          <div className="text-sm font-bold text-zinc-800">
            DSCR: {safe(a.results.dscr).toFixed(2)}
          </div>
          <div className="text-sm font-bold text-zinc-800">
            CoC: {pct(safe(a.results.cashOnCash))}
          </div>
          <div className="mt-2 text-xs font-bold text-zinc-700">
            Ampel: <span className="text-zinc-900">{a.light.label}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-zinc-200">
          <div className="text-xs font-extrabold text-zinc-700">Objekt B</div>
          <div className="mt-1 text-sm font-extrabold text-zinc-900">
            Cashflow: {euro(safe(b.results.netCashflow))}
          </div>
          <div className="text-sm font-bold text-zinc-800">
            DSCR: {safe(b.results.dscr).toFixed(2)}
          </div>
          <div className="text-sm font-bold text-zinc-800">
            CoC: {pct(safe(b.results.cashOnCash))}
          </div>
          <div className="mt-2 text-xs font-bold text-zinc-700">
            Ampel: <span className="text-zinc-900">{b.light.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
      <div className="text-xs font-extrabold text-zinc-700">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

function AmpelCard({
  light,
}: {
  light: {
    label: string;
    tone: "green" | "yellow" | "red";
    hint: string;
    reasons: string[];
  };
}) {
  const styles =
    light.tone === "green"
      ? {
          dot: "bg-green-600",
          badge: "bg-green-100 text-green-950",
          box: "bg-green-50 ring-green-200",
        }
      : light.tone === "yellow"
      ? {
          dot: "bg-yellow-500",
          badge: "bg-yellow-100 text-yellow-950",
          box: "bg-yellow-50 ring-yellow-200",
        }
      : {
          dot: "bg-red-600",
          badge: "bg-red-100 text-red-950",
          box: "bg-red-50 ring-red-200",
        };

  return (
    <div className={`rounded-2xl p-4 ring-1 ${styles.box}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold text-zinc-700">Ampel</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
            <span className="text-xl font-extrabold text-zinc-900">
              {light.label}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold text-zinc-800">{light.hint}</div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${styles.badge}`}
        >
          {light.label}
        </span>
      </div>

      {light.reasons.length > 0 && (
        <div className="mt-3 text-sm font-bold text-zinc-800">
          <div className="font-extrabold text-zinc-900">Warum?</div>
          <div className="mt-1">{light.reasons.join(" · ")}</div>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-zinc-800">{label}</div>
        <div className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-zinc-900 ring-1 ring-zinc-200">
          {value.toFixed(step < 1 ? 1 : 0)}
          {suffix ?? ""}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />

      <div className="flex justify-between text-[11px] font-bold text-zinc-700">
        <span>
          {min}
          {suffix ?? ""}
        </span>
        <span>
          {max}
          {suffix ?? ""}
        </span>
      </div>
    </div>
  );
}

function DecisionSummary({
  light,
  inputs,
  breakEven,
}: {
  light: {
    label: string;
    tone: "green" | "yellow" | "red";
    hint: string;
    reasons: string[];
  };
  inputs: Inputs;
  breakEven: BreakEven;
}) {
  const lines: string[] = [];

  if (light.tone === "green") {
    lines.push("✅ Sieht solide aus: Cashflow, DSCR und Rendite sind im grünen Bereich.");
  } else {
    if (breakEven.cashflow0 != null && breakEven.cashflow0 > inputs.coldRentMonthly) {
      const diff = Math.round(breakEven.cashflow0 - inputs.coldRentMonthly);
      lines.push(
        `Für Cashflow ≥ 0 brauchst du ca. ${Math.round(breakEven.cashflow0)} € Kaltmiete (≈ +${diff} €).`
      );
    }

    if (breakEven.maxInterestDscr110 != null && breakEven.maxInterestDscr110 < inputs.interestRatePct) {
      const diff = inputs.interestRatePct - breakEven.maxInterestDscr110;
      lines.push(
        `Für DSCR ≥ 1.10 brauchst du Zins ≤ ${breakEven.maxInterestDscr110.toFixed(2)}% (≈ -${diff.toFixed(2)}%).`
      );
    }

    if (lines.length === 0) {
      lines.push("Stell an Zins/Miete/Leerstand – aktuell ist mindestens eine Kennzahl kritisch.");
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="text-xs font-extrabold text-zinc-700">Kurzfazit</div>
      <div className="mt-1 text-sm font-extrabold text-zinc-900">{lines[0]}</div>
      {lines.slice(1).map((x) => (
        <div key={x} className="mt-1 text-sm font-bold text-zinc-800">
          {x}
        </div>
      ))}
    </div>
  );
}

function BreakRow({
  label,
  value,
  currentRent,
}: {
  label: string;
  value: number | null;
  currentRent: number;
}) {
  if (value === null) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
        <div className="text-sm font-bold text-zinc-800">{label}</div>
        <div className="text-sm font-extrabold text-zinc-900">nicht erreichbar</div>
      </div>
    );
  }

  const be = Math.round(value);
  const cur = Math.round(currentRent);
  const diff = be - cur;

  const diffLabel = diff === 0 ? "0 €" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} €`;

  const diffStyle =
    diff <= 0
      ? "bg-green-100 text-green-950"
      : diff <= 150
      ? "bg-yellow-100 text-yellow-950"
      : "bg-red-100 text-red-950";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
      <div className="text-sm font-bold text-zinc-800">{label}</div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${diffStyle}`}>
          {diffLabel}
        </span>
        <span className="text-sm font-extrabold text-zinc-900">{be} € / Monat</span>
      </div>
    </div>
  );
}

function InterestRow({
  label,
  value,
  current,
}: {
  label: string;
  value: number | null;
  current: number;
}) {
  if (value === null) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
        <div className="text-sm font-bold text-zinc-800">{label}</div>
        <div className="text-sm font-extrabold text-zinc-900">nicht erreichbar</div>
      </div>
    );
  }

  const maxI = Number(value.toFixed(2));
  const cur = Number(current.toFixed(2));
  const headroom = maxI - cur;

  const headroomLabel =
    headroom >= 0 ? `+${headroom.toFixed(2)}%` : `−${Math.abs(headroom).toFixed(2)}%`;

  const style =
    headroom >= 1
      ? "bg-green-100 text-green-950"
      : headroom >= 0
      ? "bg-yellow-100 text-yellow-950"
      : "bg-red-100 text-red-950";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
      <div className="text-sm font-bold text-zinc-800">{label}</div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${style}`}>
          {headroomLabel}
        </span>
        <span className="text-sm font-extrabold text-zinc-900">{maxI.toFixed(2)}%</span>
      </div>
    </div>
  );
}
