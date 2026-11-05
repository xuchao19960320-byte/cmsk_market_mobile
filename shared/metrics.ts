import type { Advisor, MetricDefinition, PeriodMetrics } from './types';
const metricNames = [
  ['leads', '获客人数', '人'],
  ['visits', '到访人数', '人'],
  ['leadRate', '获客转到访率', '%'],
  ['buy', '认购套数', '套'],
  ['buyRate', '到访转认购率', '%'],
  ['sign', '签约套数', '套'],
  ['signRate', '认购转签约率', '%'],
  ['signAmount', '签约金额', '万元'],
] as const;
export const metricDefinitions: MetricDefinition[] = [];
for (const period of ['monthly', 'yearly'] as const) {
  for (const target of ['advisor', 'project'] as const) {
    for (const [metric, name, unit] of metricNames)
      metricDefinitions.push({
        key: `${period}.${target}.${metric}`,
        label: `${period === 'monthly' ? '本月' : '本年'}-${target === 'advisor' ? '顾问' : '项目'}${name}`,
        period,
        target,
        metric,
        unit,
      });
  }
  metricDefinitions.push({
    key: `${period}.project.available`,
    label: `${period === 'monthly' ? '本月' : '本年'}-项目可售套数`,
    period,
    target: 'project',
    metric: 'available',
    unit: '套',
  });
}
export function ratio(a: number, b: number): number {
  return b ? (a / b) * 100 : 0;
}
export function metricValue(metrics: PeriodMetrics, key: string): number {
  if (key === 'leadRate') return ratio(metrics.visits, metrics.leads);
  if (key === 'buyRate') return ratio(metrics.buy, metrics.visits);
  if (key === 'signRate') return ratio(metrics.sign, metrics.buy);
  if (key === 'targetRate') return ratio(metrics.signAmount, metrics.goal);
  return metrics[key as keyof PeriodMetrics] || 0;
}
export function advisorValue(advisor: Advisor, key: string): number {
  const definition = metricDefinitions.find((m) => m.key === key);
  if (!definition) return 0;
  const source =
    definition.target === 'advisor'
      ? advisor[definition.period]
      : definition.period === 'monthly'
        ? advisor.projectMonthly
        : advisor.projectYearly;
  return metricValue(source, definition.metric);
}
export function ranks(rows: Advisor[], key: string): Map<string, { rank: number; score: number }> {
  const sorted = [...rows].sort((a, b) => advisorValue(b, key) - advisorValue(a, key) || a.id.localeCompare(b.id));
  return new Map(
    sorted.map((a, i) => [a.id, { rank: i + 1, score: sorted.length === 1 ? 1 : 1 - i / (sorted.length - 1) }]),
  );
}
