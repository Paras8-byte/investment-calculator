export type Inputs = {
  purchasePrice: number;
  coldRentMonthly: number;
  nonAllocCostsMonthly: number;
  equity: number;

  interestRatePct: number;
  initialRepaymentPct: number;
  vacancyPct: number;

  closingCostsPct: number;
  capex: number;
  reservesMonthly: number;
};

export type Results = {
  totalCost: number;
  loan: number;
  effectiveRent: number;
  debtService: number;
  netCashflow: number;
  annualNetCashflow: number;
  cashOnCash: number;
  dscr: number;
};

export function annuityMonthly(
  loan: number,
  interestPct: number,
  repaymentPct: number
) {
  const annualRate = (interestPct + repaymentPct) / 100;
  return (loan * annualRate) / 12;
}

export function calc(inputs: Inputs): Results {
  const totalCost =
    inputs.purchasePrice * (1 + inputs.closingCostsPct / 100) + inputs.capex;

  const loan = Math.max(0, totalCost - inputs.equity);

  const effectiveRent =
    inputs.coldRentMonthly * (1 - inputs.vacancyPct / 100);

  const debtService = annuityMonthly(
    loan,
    inputs.interestRatePct,
    inputs.initialRepaymentPct
  );

  const netCashflow =
    effectiveRent -
    inputs.nonAllocCostsMonthly -
    inputs.reservesMonthly -
    debtService;

  const annualNetCashflow = netCashflow * 12;

  const cashOnCash = inputs.equity > 0 ? annualNetCashflow / inputs.equity : 0;

  const dscr =
    debtService > 0
      ? (effectiveRent -
          inputs.nonAllocCostsMonthly -
          inputs.reservesMonthly) /
        debtService
      : 99;

  return {
    totalCost,
    loan,
    effectiveRent,
    debtService,
    netCashflow,
    annualNetCashflow,
    cashOnCash,
    dscr,
  };
}
export function breakevenRentMonthly(
  base: Inputs,
  target: "cashflow0" | "dscr110" | "coc6"
) {
  // Wir suchen die Kaltmiete/Monat, die das Ziel erreicht.
  // Simple Binary Search (schnell & stabil).
  const lo0 = 0;
  const hi0 = Math.max(5000, base.coldRentMonthly * 4);

  const meets = (rent: number) => {
    const r = calc({ ...base, coldRentMonthly: rent });

    if (target === "cashflow0") return r.netCashflow >= 0;
    if (target === "dscr110") return r.dscr >= 1.1;
    return r.cashOnCash >= 0.06;
  };

  let lo = lo0;
  let hi = hi0;

  // Wenn selbst hi nicht reicht, geben wir null zurück (unrealistisch).
  if (!meets(hi)) return null;

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (meets(mid)) hi = mid;
    else lo = mid;
  }

  return hi;
}
export function breakevenInterestPct(
  base: Inputs,
  target: "dscr110" | "cashflow0"
) {
  const meets = (interestPct: number) => {
    const r = calc({ ...base, interestRatePct: interestPct });
    if (target === "dscr110") return r.dscr >= 1.1;
    return r.netCashflow >= 0;
  };

  let lo = 0;
  let hi = 15;

  if (!meets(lo)) return null;
  if (meets(hi)) return hi;

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (meets(mid)) lo = mid;
    else hi = mid;
  }

  return lo;
}

