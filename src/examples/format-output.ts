export function formatNumber(value: number | undefined, decimals: number): string {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toFixed(decimals);
}

export function formatPct(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}
