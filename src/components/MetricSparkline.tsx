import { Button } from 'antd';
import type { Stage } from '../../shared/types';
import { EChart } from './EChart';
import { token } from '../utils/tokens';
interface Props { rows: { month: string; value: number }[]; stage: Stage; onOpen: () => void }
export function MetricSparkline({ rows, stage, onOpen }: Props) {
  const option = {
    color: [token(`--color-stage-${stage}`)],
    grid: { left: 4, right: 4, top: 12, bottom: 12 },
    xAxis: { type: 'category' as const, show: false, data: rows.map((r) => r.month) },
    yAxis: { type: 'value' as const, show: false, scale: true },
    series: [{ type: 'line' as const, smooth: true, showSymbol: false, data: rows.map((r) => r.value), lineStyle: { width: 3 } }],
  };
  return <div className="metric-sparkline" role="button" tabIndex={0} aria-label="查看近12个月趋势" onClick={onOpen} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen();}}}><EChart option={option} label="近12个月趋势线" /></div>;
}
