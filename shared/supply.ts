import type { AmountMetric, ChartDatum, Project } from './types';
import { allocate } from './numbers';
export const propertyTypes = [
  { name: '住宅', weight: 4382 },
  { name: '商业', weight: 1161 },
  { name: '公寓', weight: 772 },
  { name: '写字楼', weight: 1976 },
  { name: '车位', weight: 1636 },
  { name: '配套及其他', weight: 73 },
];
export const areas = ['<40㎡', '40–90㎡', '90–140㎡', '140–180㎡', '>180㎡'];
export const supplyMetricNames: Record<AmountMetric, string> = {
  available: '本月可售套数',
  buy: '本月认购套数',
  sign: '本月签约套数',
};
export function propertyCounts(projects: Project[], metric: AmountMetric): ChartDatum[] {
  const raw = projects.reduce((s, p) => s + p.monthly[metric], 0),
    total = metric === 'available' ? Math.ceil(raw / 10000) * 10000 : raw;
  const values = allocate(
    total,
    propertyTypes.map((p) => p.weight),
  );
  return propertyTypes.map((p, i) => ({ id: p.name, name: p.name, value: values[i] }));
}
export function areaCounts(projects: Project[], metric: AmountMetric, property: string): ChartDatum[] {
  const counts = propertyCounts(projects, metric),
    value =
      property === '全部业态'
        ? counts.reduce((s, r) => s + r.value, 0)
        : counts.find((r) => r.name === property)?.value || 0;
  const weights =
    property === '车位'
      ? [0.97, 0.02, 0.01, 0, 0]
      : property === '住宅'
        ? [0.01, 0.24, 0.44, 0.22, 0.09]
        : [0.12, 0.29, 0.32, 0.18, 0.09];
  return areas.map((name, i) => ({ id: name, name, value: allocate(value, weights)[i] }));
}
export function areaProjectCounts(projects: Project[], metric: AmountMetric, property: string, area: string): number[] {
  const total = areaCounts(projects, metric, property).find((r) => r.name === area)?.value || 0;
  return allocate(
    total,
    projects.map((p) => p.monthly[metric]),
  );
}
