import type { PeriodMetrics } from './types';
export const emptyMetrics = (): PeriodMetrics => ({
  leads: 0,
  visits: 0,
  buy: 0,
  sign: 0,
  signAmount: 0,
  goal: 0,
  available: 0,
});
export function addMetrics(rows: PeriodMetrics[]): PeriodMetrics {
  return rows.reduce((total, row) => {
    for (const key of Object.keys(total) as (keyof PeriodMetrics)[]) total[key] += row[key] || 0;
    return total;
  }, emptyMetrics());
}
export function allocate(total: number, weights: number[]): number[] {
  const denominator = weights.reduce((sum, value) => sum + value, 0);
  if (!denominator) return weights.map(() => 0);
  const result = weights.map((value) => Math.floor((total * value) / denominator));
  const remainder = Math.round(total) - result.reduce((sum, value) => sum + value, 0);
  for (let i = 0; i < remainder; i++) result[i % result.length]++;
  return result;
}
export function scaleMetrics(metrics: PeriodMetrics, weight: number): PeriodMetrics {
  const result = emptyMetrics();
  for (const key of Object.keys(result) as (keyof PeriodMetrics)[]) result[key] = Math.round(metrics[key] * weight);
  return result;
}
