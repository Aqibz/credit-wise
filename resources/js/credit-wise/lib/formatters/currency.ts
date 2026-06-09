// Centralised PKR currency + rounding utilities.
// All money math in the app should go through these helpers so the
// installment matrix, product table, and breakdowns stay consistent.

const PKR_FORMATTER = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const PKR_FORMATTER_2DP = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/** Round to nearest whole rupee (banker-safe Math.round). */
export const roundRupee = (v: number): number => Math.round(Number(v) || 0);

/** Round monthly EMI up to nearest 10 PKR — matches how lenders quote EMIs. */
export const roundEmi = (v: number): number => {
  const n = Number(v) || 0;
  return Math.ceil(n / 10) * 10;
};

/** Format a number as `Rs. 1,68,000` (PKR, no decimals). */
export const fmtPKR = (v: any): string => `Rs. ${PKR_FORMATTER.format(roundRupee(Number(v) || 0))}`;

/** Format with 2 decimals — only for percentages or per-day fees if needed. */
export const fmtPKR2 = (v: any): string => `Rs. ${PKR_FORMATTER_2DP.format(Number(v) || 0)}`;

/** Short form: `Rs. 1.68L` / `Rs. 12.5K` for tight UI. */
export const fmtPKRShort = (v: any): string => {
  const n = Number(v) || 0;
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `Rs. ${(n / 10_000_000).toFixed(2)}Cr`;
  if (abs >= 100_000) return `Rs. ${(n / 100_000).toFixed(2)}L`;
  if (abs >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}K`;
  return fmtPKR(n);
};

// ===== Installment calculation =====

export type Plan = {
  id: string;
  name: string;
  tenure: number;          // months
  downType: "%" | "Fixed";
  downPayment: number;     // % or rupees depending on downType
  markup: number;          // annual-equivalent % applied flat on financed amount
  fee: number;             // one-time processing fee
  penalty: number;         // late fee per day
  graceDays: number;
};

export type InstallmentBreakdown = {
  cashPrice: number;
  dpAmount: number;
  financed: number;
  markupAmount: number;
  totalFinanced: number;   // financed + markup
  monthly: number;         // rounded EMI
  yearly: number;          // monthly * 12 (capped at tenure)
  fee: number;
  penalty: number;
  graceDays: number;
  upfront: number;         // dpAmount + fee
  totalPayable: number;    // dpAmount + totalFinanced + fee
  totalInterest: number;   // markup + fee (extra cost over cash)
};

/**
 * Single source of truth for installment calculation.
 * - Down payment computed from `downType` (% of cash price, or fixed rupees).
 * - Markup applied as flat % on the financed amount (cash − DP).
 * - Monthly EMI rounded UP to nearest 10 PKR (lender convention).
 * - Total payable recomputed from the rounded monthly so the breakdown
 *   never disagrees with the headline figure.
 */
export function calcInstallment(cashPrice: number, plan: Plan): InstallmentBreakdown {
  const cp = Math.max(0, roundRupee(cashPrice));
  const dpAmount = plan.downType === "%"
    ? roundRupee((cp * (Number(plan.downPayment) || 0)) / 100)
    : Math.min(cp, roundRupee(plan.downPayment));
  const financed = Math.max(0, cp - dpAmount);
  const markupAmount = roundRupee((financed * (Number(plan.markup) || 0)) / 100);
  const totalFinanced = financed + markupAmount;
  const tenure = Math.max(1, Number(plan.tenure) || 1);
  const monthlyRaw = totalFinanced / tenure;
  const monthly = roundEmi(monthlyRaw);
  // Reconcile: total payable from rounded monthly so user can verify by hand.
  const reconciledFinanced = monthly * tenure;
  const fee = Math.max(0, roundRupee(plan.fee));
  const penalty = Math.max(0, roundRupee(plan.penalty));
  const upfront = dpAmount + fee;
  const totalPayable = dpAmount + reconciledFinanced + fee;
  const yearly = monthly * Math.min(12, tenure);
  return {
    cashPrice: cp,
    dpAmount,
    financed,
    markupAmount,
    totalFinanced: reconciledFinanced,
    monthly,
    yearly,
    fee,
    penalty,
    graceDays: Math.max(0, Number(plan.graceDays) || 0),
    upfront,
    totalPayable,
    totalInterest: reconciledFinanced - financed + fee,
  };
}
