import type { EChartsOption, MarkAreaComponentOption } from 'echarts';
import type { Advisor, HistoryPoint } from '../../shared/types';
import { advisorPoints, rankPosition } from './advisorPoints';
import { advisorTooltip } from './advisorTooltip';
import { chartColors, token } from './tokens';
export interface MatrixInput {
  rows: Advisor[];
  axes: { x: string; y: string; size: string };
  selected: string | null;
  point: HistoryPoint | null;
  trajectory: HistoryPoint[];
}
function matrixAreas(): MarkAreaComponentOption['data'] {
  return Array.from({ length: 9 }, (_, i) => {
    const x = i % 3,
      y = Math.floor(i / 3);
    return [
      {
        name: `${['后30%', '中间40%', '前30%'][x]} × ${['后30%', '中间40%', '前30%'][y]}`,
        xAxis: x,
        yAxis: y,
        itemStyle: {
          color: token(x === 2 ? '--color-zone-high' : x === 1 && y > 0 ? '--color-zone-mid' : '--color-zone-low'),
        },
      },
      { xAxis: x + 1, yAxis: y + 1 },
    ];
  });
}
function scatterData(input: MatrixInput) {
  const { rows, axes, selected, point } = input,
    points = advisorPoints(rows, axes.x, axes.y, axes.size, selected),
    companies = [...new Set(rows.map((a) => a.company))],
    colors = chartColors();
  return points.map((p) => ({
    id: p.id,
    name: p.name,
    value: p.id === selected && point ? [rankPosition(point.xScore), rankPosition(point.yScore), point.size] : p.value,
    itemStyle: {
      color: p.id === selected ? token('--color-track') : colors[companies.indexOf(p.company) % colors.length],
      opacity: selected && p.id !== selected ? 0.28 : 0.8,
    },
  }));
}
function matrixTooltip(params: unknown, input: MatrixInput): string {
  const event = params as { data?: { id?: string } },
    id = event.data?.id,
    advisor = input.rows.find((a) => a.id === id);
  return advisor
    ? advisorTooltip(advisor, input.axes, id === input.selected ? input.point : null)
    : '项目聚合：点击展开该项目顾问';
}
function matrixAxis() {
  return {
    min: 0,
    max: 3,
    interval: 1,
    axisLabel: { formatter: (value: number) => ['后30%', '中间40%', '前30%', ''][value] },
    splitLine: { lineStyle: { color: token('--color-line') } },
  };
}
export function matrixOption(input: MatrixInput): EChartsOption {
  const data = scatterData(input),
    max = Math.max(1, ...data.map((p) => Number(p.value[2])));
  return {
    animationDurationUpdate: 800,
    textStyle: { fontFamily: token('--font-sans'), fontSize: 12, color: token('--color-muted') },
    tooltip: {
      trigger: 'item',
      triggerOn: 'click',
      confine: true,
      enterable: true,
      backgroundColor: token('--color-surface'),
      borderColor: token('--color-line'),
      textStyle: { color: token('--color-ink'), fontSize: 12 },
      formatter: (params: unknown) => matrixTooltip(params, input),
    },
    grid: { top: 30, right: 18, bottom: 45, left: 65 },
    xAxis: matrixAxis(),
    yAxis: matrixAxis(),
    series: [
      {
        type: 'scatter',
        id: 'advisors',
        data,
        symbolSize: (value: number[]) => 8 + Math.sqrt(value[2] / max) * 18,
        markArea: {
          silent: true,
          label: { position: 'insideTopLeft', fontSize: 12, color: token('--color-muted') },
          data: matrixAreas(),
        },
      },
      {
        type: 'line',
        id: 'trajectory',
        data: input.trajectory.map((p) => [rankPosition(p.xScore), rankPosition(p.yScore)]),
        lineStyle: { color: token('--color-track'), type: 'dashed' },
        itemStyle: { color: token('--color-track') },
        symbolSize: 5,
        silent: true,
      },
    ],
  };
}
