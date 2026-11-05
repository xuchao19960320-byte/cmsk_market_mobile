import type { Advisor, HistoryPoint } from '../../shared/types';
import { advisorValue, metricDefinitions } from '../../shared/metrics';
import { escapeHtml, number } from './format';
interface Axes {
  x: string;
  y: string;
  size: string;
}
export function advisorTooltip(advisor: Advisor, axes: Axes, point: HistoryPoint | null): string {
  const title = `<div class="chart-tooltip-heading">${escapeHtml(advisor.name)}</div>`;
  const identity = `<div>项目：${escapeHtml(advisor.projectName)}</div><div>城市：${escapeHtml(advisor.company)}</div>`;
  const metrics = (
    [
      ['y', 'Y轴'],
      ['x', 'X轴'],
      ['size', '气泡'],
    ] as const
  )
    .map(([key, label]) => {
      const definition = metricDefinitions.find((m) => m.key === axes[key]);
      const value = point
        ? key === 'x'
          ? point.xValue
          : key === 'y'
            ? point.yValue
            : point.size
        : advisorValue(advisor, axes[key]);
      return `<div class="chart-detail"><div>${label} · ${escapeHtml(definition?.label || '')}</div><b>${number(value, definition?.unit === '%' ? 2 : 0)} ${definition?.unit || ''}</b></div>`;
    })
    .join('');
  return title + identity + metrics;
}
