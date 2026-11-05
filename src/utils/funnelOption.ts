import type { EChartsOption } from 'echarts';
import type { Stage } from '../../shared/types';
import { ratio } from '../../shared/metrics';
import { token } from './tokens';
import { metricLabel, number, percent } from './format';
const stages: Stage[] = ['leads', 'visits', 'buy', 'sign'];
function funnelGraphics(q: Record<Stage, number>, colors: string[]) {
  const values = [ratio(q.visits, q.leads), ratio(q.buy, q.visits), ratio(q.sign, q.buy)];
  return values.map((value, i) => ({
    type: 'group' as const,
    left: '68%',
    top: `${27 + i * 24}%`,
    children: [
      {
        type: 'text' as const,
        style: {
          text: ['获客转到访率', '到访转认购率', '认购转签约率'][i],
          fill: token('--color-muted'),
          fontSize: 12,
        },
      },
      {
        type: 'text' as const,
        top: 21,
        style: { text: percent(value), fill: colors[i + 1], fontSize: 20, fontWeight: 600 },
      },
      {
        type: 'line' as const,
        left: -65,
        top: 31,
        shape: { x1: 0, y1: 0, x2: 60, y2: 0 },
        style: { stroke: colors[i + 1], lineDash: [3, 3] },
      },
    ],
  }));
}
export function funnelOption(q: Record<Stage, number>, stage: Stage): EChartsOption {
  const colors = stages.map((s) => token(`--color-stage-${s}`));
  const label = (p: { dataIndex: number }) => {
    const key = stages[p.dataIndex];
    return `${metricLabel(key)}\n${number(q[key])}${key === 'leads' || key === 'visits' ? '人' : '套'}${key === stage ? '\n✓ 已选中' : ''}`;
  };
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'funnel',
        left: '2%',
        top: 10,
        bottom: 12,
        width: '66%',
        minSize: '35%',
        maxSize: '95%',
        gap: 18,
        sort: 'descending',
        label: { show: true, position: 'inside', fontFamily: token('--font-sans'), fontSize: 20, fontWeight: 600, color: token('--color-surface'), textBorderWidth: 0, lineHeight: 28, formatter: label },
        data: stages.map((key, i) => ({
          name: key,
          value: 4 - i,
          itemStyle: { color: colors[i], opacity: key === stage ? 1 : 0.55 },
        })),
      },
    ],
    graphic: funnelGraphics(q, colors),
  };
}
