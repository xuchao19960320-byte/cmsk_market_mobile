import { useMemo } from 'react';
import { Segmented } from 'antd';
import type { EChartsOption } from 'echarts';
import type { ChartDatum, Dimension } from '../../shared/types';
import { useWorkspace } from '../stores/useWorkspace';
import { token } from '../utils/tokens';
import { number } from '../utils/format';
import { EChart } from './EChart';
interface Props {
  title: string;
  rows: ChartDatum[];
  dimension?: Dimension;
  onDimension?: (value: Dimension) => void;
  color?: string;
  unit?: string;
  onSelect?: (name: string) => void;
  sort?: boolean;
}
export function DistributionChart({
  title,
  rows,
  dimension,
  onDimension,
  color,
  unit = '套',
  onSelect,
  sort = true,
}: Props) {
  return renderDistributionChartView(
    useDistributionChartModel({ title, rows, dimension, onDimension, color, unit, onSelect, sort }),
  );
}
function useDistributionChartModel({
  title,
  rows,
  dimension,
  onDimension,
  color,
  unit = '套',
  onSelect,
  sort = true,
}: Props) {
  const theme = useWorkspace((s) => s.theme);
  const option = useDistributionChartOption({ sort, rows, color, unit, theme });

  return { title, rows, dimension, onDimension, color, unit, onSelect, sort, theme, option };
}
function renderDistributionChartView(model: ReturnType<typeof useDistributionChartModel>) {
  const { title, rows, dimension, onDimension, color, unit, onSelect, sort, theme, option } = model;
  return (
    <div className="detail-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        {dimension && onDimension && (
          <Segmented<Dimension>
            size="small"
            value={dimension}
            options={[
              { value: 'group', label: '城市群' },
              { value: 'city', label: '城市公司' },
              { value: 'project', label: '项目' },
            ]}
            onChange={onDimension}
          />
        )}
      </div>
      <span className="helper-text">单位：{unit}</span>
      <EChart option={option} label={title} onClick={onSelect ? (event) => onSelect(event.name) : undefined} />
    </div>
  );
}

function useDistributionChartOption({
  sort,
  rows,
  color,
  unit,
  theme,
}: {
  sort: boolean;
  rows: ChartDatum[];
  color: string | undefined;
  unit: string;
  theme: 'light' | 'dark';
}) {
  return useMemo<EChartsOption>(() => {
    const data = sort ? [...rows].sort((a, b) => b.value - a.value) : rows;
    return {
      color: [color || token('--color-primary')],
      textStyle: { fontFamily: token('--font-sans'), fontSize: 12, color: token('--color-muted') },
      tooltip: { trigger: 'axis', valueFormatter: (value) => `${number(Number(value))} ${unit}` },
      grid: { top: 36, right: 16, bottom: data.length > 10 ? 66 : 36, left: 54 },
      xAxis: {
        type: 'category',
        data: data.map((r) => r.name),
        axisLabel: {
          interval: 0,
          rotate: data.length > 8 ? 35 : 0,
          overflow: 'truncate',
          width: data.length > 8 ? 90 : 110,
        },
        axisTick: { show: false },
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: token('--color-line'), type: 'dashed' } } },
      dataZoom:
        data.length > 10
          ? [{ type: 'slider', start: 0, end: Math.min(100, (10 / data.length) * 100), height: 14, bottom: 4 }]
          : [],
      series: [
        {
          type: 'bar',
          data: data.map((r) => ({ id: r.id, name: r.name, value: r.value })),
          barMaxWidth: 22,
          label: { show: true, position: 'top', formatter: (p) => number(Number(p.value)) },
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [rows, color, unit, sort, theme]);
}
