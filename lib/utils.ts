export const formatUGX = (amount: number): string => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Validation stub for quote ranges (Zod in Phase 4)
export const validateRange = (min: number, max: number): boolean =>
  min < max && min > 0;
