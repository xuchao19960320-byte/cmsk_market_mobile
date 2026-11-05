import { useState } from 'react';
import { Modal } from 'antd';
import type { Dashboard, Stage } from '../../shared/types';
import { addMetrics } from '../../shared/numbers';
import { metricLabel } from '../utils/format';
import { token } from '../utils/tokens';
import { EChart } from './EChart';
import { MetricCard } from './MetricCard';
export function MetricCards({ data }: { data: Dashboard }) {
  const [trend, setTrend] = useState<Stage | null>(null),
    monthly = addMetrics(data.projects.map((p) => p.monthly)),
    yearly = addMetrics(data.projects.map((p) => p.yearly)),
    previous = addMetrics(data.projects.map((p) => p.previous));
  const option = {
    color: [token('--color-primary')],
    tooltip: { trigger: 'axis' as const },
    grid: { left: 65, right: 20, top: 25, bottom: 40 },
    xAxis: { type: 'category' as const, data: data.trend.map((r) => r.month) },
    yAxis: { type: 'value' as const, scale: true },
    series: [{ type: 'line' as const, smooth: true, symbolSize: 7, label: { show: true, position: 'top' as const }, areaStyle: { opacity: .06 }, data: data.trend.map((r) => (trend ? r.monthly[trend] : 0)), lineStyle: { width: 3 } }],
    textStyle: { color: token('--color-muted'), fontFamily: token('--font-sans') },
  };
  return (
    <>
      <section className="metric-cards">
        {(['leads', 'visits', 'buy', 'sign'] as Stage[]).map((stage) => (
          <MetricCard
            key={stage}
            stage={stage}
            trend={data.trend.map((row) => ({ month: row.month, value: row.monthly[stage] }))}
            monthly={monthly}
            yearly={yearly}
            previous={previous}
            onTrend={setTrend}
          />
        ))}
      </section>
      <Modal
        title={`${trend ? metricLabel(trend) : ''} · 近12个月趋势`}
        open={trend !== null}
        onCancel={() => setTrend(null)} footer={null}
        width="88%">
        <div className="trend-dialog-summary"><h3>{trend ? metricLabel(trend) : ''} · 近12个月趋势</h3><p className="helper-text">各月当月值；当前月截至所选日期。跨年历史为模拟数据。</p></div>
        <EChart option={option} size="tall" label="近12个月指标趋势" />
      </Modal>
    </>
  );
}
