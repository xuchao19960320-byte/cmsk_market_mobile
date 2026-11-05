import { useMemo } from 'react';
import { Button, Select } from 'antd';
import type { EChartsOption } from 'echarts';
import type { ChartDatum } from '../../shared/types';
import { number } from '../utils/format';
import { propertyColors, token } from '../utils/tokens';
import { useWorkspace } from '../stores/useWorkspace';
import { EChart } from './EChart';
interface Props {
  rows: ChartDatum[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}
export function PropertyDonut({ rows, selected, onSelect, label }: Props) {
  return renderPropertyDonutView(usePropertyDonutModel({ rows, selected, onSelect, label }));
}
function usePropertyDonutModel({ rows, selected, onSelect, label }: Props) {
  const theme = useWorkspace((s) => s.theme),
    total = rows.reduce((sum, row) => sum + row.value, 0),
    value = selected === '全部业态' ? total : rows.find((r) => r.name === selected)?.value || 0;
  const option = usePropertyDonutOption({ value, selected, rows, theme });

  return { rows, selected, onSelect, label, theme, total, value, option };
}
function renderPropertyDonutView(model: ReturnType<typeof usePropertyDonutModel>) {
  const { rows, selected, onSelect, label, theme, total, value, option } = model;
  return (
    <div>
      <EChart option={option} label={label} onClick={(e) => onSelect(e.name)} />
      <div className="flex items-center justify-center gap-2">
        <Select
          aria-label="选择业态"
          value={selected}
          onChange={onSelect}
          options={[{ value: '全部业态', label: '全部业态' }, ...rows.map((r) => ({ value: r.name, label: r.name }))]}
        />
        <Button type="text" onClick={() => onSelect('全部业态')}>
          合计 {number(total)} 套
        </Button>
      </div>
    </div>
  );
}

function usePropertyDonutOption({
  value,
  selected,
  rows,
  theme,
}: {
  value: number;
  selected: string;
  rows: ChartDatum[];
  theme: 'light' | 'dark';
}) {
  return useMemo<EChartsOption>(
    () => ({
      color: propertyColors(),
      textStyle: { fontFamily: token('--font-sans'), fontSize: 12 },
      title: {
        text: number(value),
        subtext: selected,
        left: 'center',
        top: '43%',
        textStyle: { color: token('--color-ink'), fontSize: 24 },
        subtextStyle: { color: token('--color-muted'), fontSize: 12 },
      },
      tooltip: { trigger: 'item', valueFormatter: (v) => number(Number(v)) + '套' },
      series: [
        {
          type: 'pie',
          radius: ['30%', '43%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: '{b}\n{c}套\n{d}%',
            fontSize: 12,
            color: token('--color-muted'),
            lineHeight: 18,
          },
          labelLine: { length: 14, length2: 12 },
          data: rows.map((r) => ({ name: r.name, value: r.value, selected: r.name === selected })),
        },
      ],
    }),
    [rows, selected, value, theme],
  );
}
