import type { Advisor } from '../../shared/types';
import { advisorValue, ranks } from '../../shared/metrics';
export interface AdvisorPoint {
  id: string;
  name: string;
  projectId: string;
  value: [number, number, number];
  company: string;
  cluster: boolean;
}
export function rankPosition(score: number): number {
  return Math.min(
    2.88,
    Math.max(0.12, score < 0.3 ? score / 0.3 : score <= 0.7 ? 1 + (score - 0.3) / 0.4 : 2 + (score - 0.7) / 0.3),
  );
}
export function advisorPoints(
  rows: Advisor[],
  x: string,
  y: string,
  size: string,
  selected: string | null,
): AdvisorPoint[] {
  const xs = ranks(rows, x),
    ys = ranks(rows, y);
  const raw = rows.map((a) => ({
    id: a.id,
    name: a.name,
    projectId: a.projectId,
    company: a.company,
    cluster: false,
    value: [rankPosition(xs.get(a.id)?.score || 0), rankPosition(ys.get(a.id)?.score || 0), advisorValue(a, size)] as [
      number,
      number,
      number,
    ],
  }));
  if (raw.length <= 100) return raw;
  const groups = new Map<string, AdvisorPoint[]>();
  for (const point of raw) {
    if (point.id === selected) continue;
    groups.set(point.projectId, [...(groups.get(point.projectId) || []), point]);
  }
  const clusters = [...groups].map(([id, points]) => ({
    id: `project:${id}`,
    name: rows.find((a) => a.projectId === id)?.projectName || id,
    projectId: id,
    company: points[0].company,
    cluster: true,
    value: [
      points.reduce((s, p) => s + p.value[0], 0) / points.length,
      points.reduce((s, p) => s + p.value[1], 0) / points.length,
      points.reduce((s, p) => s + p.value[2], 0),
    ] as [number, number, number],
  }));
  return [...clusters, ...raw.filter((p) => p.id === selected)];
}
