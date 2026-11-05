import type { Channel, PeriodMetrics, Project, Stage } from './types';
import { addMetrics, allocate, emptyMetrics } from './numbers';
export const channelNames = ['中介分销', '自渠自拓', '其他', '自然到访', '线上获客', '全民营销', '老带新'];
export const onlineNames = ['抖音', '腾讯', '百度', '安居客', '字节', '其他'];
function splitChannelMetrics(metrics: PeriodMetrics): PeriodMetrics[] {
  const weights = [0.24, 0.14, 0.07, 0.185, 0.2615, 0.0165, 0.087];
  const counts = channelNames.map(() => emptyMetrics());
  for (const key of Object.keys(metrics) as (keyof PeriodMetrics)[]) {
    const currentWeights = key === 'buy' || key === 'sign' ? [0.275, 0.154, 0.06, 0.176, 0.191, 0.015, 0.129] : weights;
    const parts = allocate(metrics[key], currentWeights);
    counts.forEach((row, i) => (row[key] = parts[i]));
  }
  return counts;
}
export function projectChannels(projectId: string, monthly: PeriodMetrics, series: PeriodMetrics[]): Channel[] {
  const month = splitChannelMetrics(monthly),
    year = series.map(splitChannelMetrics);
  return channelNames.map((name, i) => ({
    id: `${projectId}-channel-${i}`,
    name,
    monthly: month[i],
    yearly: addMetrics(year.map((rows) => rows[i])),
  }));
}
export function channelRows(
  projects: Project[],
  period: 'monthly' | 'yearly',
  online: boolean,
  stage: Stage,
): { id: string; name: string; value: number; previous: number }[] {
  const names = online ? onlineNames : channelNames;
  const previousStage: Record<Stage, Stage> = { leads: 'leads', visits: 'leads', buy: 'visits', sign: 'buy' };
  const base = channelNames.map((_, i) => addMetrics(projects.map((p) => p.channels[i][period])));
  const values = online ? allocate(base[4][stage], [0.3, 0.23, 0.16, 0.13, 0.11, 0.07]) : base.map((m) => m[stage]);
  const previous = online
    ? allocate(base[4][previousStage[stage]], [0.3, 0.23, 0.16, 0.13, 0.11, 0.07])
    : base.map((m) => m[previousStage[stage]]);
  return names.map((name, i) => ({ id: name, name, value: values[i], previous: previous[i] }));
}
