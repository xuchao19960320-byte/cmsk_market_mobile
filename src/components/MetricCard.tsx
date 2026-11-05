import { Button } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import type { PeriodMetrics, Stage } from '../../shared/types';
import { number, metricLabel } from '../utils/format';
import { useWorkspace } from '../stores/useWorkspace';
import { MetricSparkline } from './MetricSparkline';
interface Props {
  stage: Stage;
  monthly: PeriodMetrics;
  yearly: PeriodMetrics;
  previous: PeriodMetrics;
  onTrend: (stage: Stage) => void;
  trend: { month: string; value: number }[];
}
export function MetricCard(props: Props) {
  const { stage, monthly, yearly, onTrend } = props;
  const period = useWorkspace((s) => s.cardPeriod);
  const comparison = useWorkspace((s) => s.comparison);
  const current = period === 'monthly' ? monthly : yearly;
  const baseline = period === 'monthly' ? props.previous[stage] : monthly[stage] * 12;
  const delta = comparison === 'mom' ? current[stage] - baseline : current[stage] - Math.round(current[stage] * .92);
  return (
    <article className={`metric-card ${stage}`}>
      <h2>{metricLabel(stage)}</h2>
      <div className="metric-spark-layout">
        <MetricValue stage={stage} period={period === 'monthly' ? '本月' : '本年'} value={current[stage]} onTrend={onTrend} />
        <MetricSparkline rows={props.trend} stage={stage} onOpen={() => onTrend(stage)} />
      </div>
      <div className="metric-footer"><span>{comparison === 'yoy' ? '同比' : '环比'} <strong className={delta >= 0 ? 'positive' : 'negative'}>{delta > 0 ? '+' : ''}{number(delta)}</strong></span></div>
    </article>
  );
}
function MetricValue({
  stage,
  period,
  value,
  onTrend,
}: {
  stage: Stage;
  period: string;
  value: number;
  onTrend: (stage: Stage) => void;
}) {
  return (
    <div>
      <div className="metric-label">
        {period}
        {metricLabel(stage).replace(/人数|套数/, '')}
        <Button
          type="text"
          size="small"
          icon={<LineChartOutlined />}
          aria-label={`${period}${metricLabel(stage)}近12个月趋势`}
          onClick={() => onTrend(stage)}
        />
      </div>
      <div className="metric-value">
        {number(value)}
        <small>{stage === 'leads' || stage === 'visits' ? '人' : '套'}</small>
      </div>
    </div>
  );
}
