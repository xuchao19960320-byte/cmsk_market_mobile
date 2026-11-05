import { useState } from 'react';
import { Button, Tabs } from 'antd';
import type { Dimension, Project, Stage } from '../../shared/types';
import { channelRows, channelNames, onlineNames } from '../../shared/channels';
import { useWorkspace } from '../stores/useWorkspace';
import { AnalysisPanel } from './AnalysisPanel';
import { ConversionFunnel } from './ConversionFunnel';
import { ChannelStructure } from './ChannelStructure';
import { DistributionChart } from './DistributionChart';
import { distribution } from '../utils/distribution';
import { metricLabel, number } from '../utils/format';
import { chartColors } from '../utils/tokens';
interface Props {
  projects: Project[];
}
const scopes = [{key:'all',label:'全渠道分析'},{key:'online',label:'线上渠道分析'}];
export function ChannelAnalysis({ projects }: Props) {
  return renderChannelAnalysisView(useChannelAnalysisModel({ projects }));
}
function useChannelAnalysisModel({ projects }: Props) {
  const [scope, setScope] = useState('all'),
    [stage, setStage] = useState<Stage>('visits'),
    [selected, setSelected] = useState<string | null>(null),
    [dimension, setDimension] = useState<Dimension>('group');
  const period = useWorkspace((s) => s.cardPeriod), online = scope === 'online';
  const quantities = Object.fromEntries(
    (['leads', 'visits', 'buy', 'sign'] as Stage[]).map((k) => [
      k,
      channelRows(projects, period, online, k).reduce((sum, r) => sum + r.value, 0),
    ]),
  ) as Record<Stage, number>;
  const rows = distribution(
    projects,
    dimension,
    (p) => channelRows([p], period, online, stage).find((r) => r.name === selected)?.value || 0,
  );
  const colorIndex = (online ? onlineNames : channelNames).indexOf(selected || ''),
    unit = stage === 'leads' || stage === 'visits' ? '人' : '套';

  return {
    projects,
    scope,
    setScope,
    stage,
    setStage,
    selected,
    setSelected,
    dimension,
    setDimension,
    period,
    online,
    quantities,
    rows,
    colorIndex,
    unit,
  };
}
function renderChannelAnalysisView(model: ReturnType<typeof useChannelAnalysisModel>) {
  const {
    projects,
    scope,
    setScope,
    stage,
    setStage,
    selected,
    setSelected,
    dimension,
    setDimension,
    period,
    online,
    quantities,
    rows,
    colorIndex,
    unit,
  } = model;
  return (
    <AnalysisPanel className="channel-analysis">
      <Tabs
        activeKey={scope}
        items={scopes}
        onChange={(key) => {
          setScope(key);
          setSelected(null);
        }}
      />
      <p className="helper-text">{period === 'monthly' ? '本月累计' : '本年累计'} · {online ? '线上渠道' : '全部渠道'} · 点击漏斗阶段联动右侧结构</p>
      <div className={`channel-content selected-stage-${stage}`}>
        <ConversionFunnel quantities={quantities} stage={stage} onStage={setStage} />
        <div className="funnel-structure-link" aria-hidden="true"><span>→</span></div>
        <ChannelStructure
          projects={projects}
          period={period}
          online={online}
          stage={stage}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
      {selected && renderChannelAnalysisViewPart1(model)}
    </AnalysisPanel>
  );
}

function renderChannelAnalysisViewPart1(model: ReturnType<typeof useChannelAnalysisModel>) {
  const {
    projects,
    scope,
    setScope,
    stage,
    setStage,
    selected,
    setSelected,
    dimension,
    setDimension,
    period,
    online,
    quantities,
    rows,
    colorIndex,
    unit,
  } = model;
  return (
    <div className={`linked-row accent-${Math.max(0, colorIndex)}`}>
      <div className="linked-source">
        <b>{selected}</b>
        <span>{metricLabel(stage)}</span>
        <strong>
          {number(rows.reduce((sum, r) => sum + r.value, 0))} {unit}
        </strong>
        <Button type="link" onClick={() => setSelected(null)}>
          收起分析
        </Button>
      </div>
      <div className="linked-arrow">→</div>
      <DistributionChart
        title={`${selected} · ${metricLabel(stage)}分布`}
        rows={rows}
        dimension={dimension}
        onDimension={setDimension}
        unit={unit}
        color={chartColors()[Math.max(0, colorIndex)]}
      />
    </div>
  );
}
