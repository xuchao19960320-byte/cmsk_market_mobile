import { Segmented } from 'antd';
import { ChannelAttribution } from './ChannelAttribution';
import { useState, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import type { Project, Stage } from '../../shared/types';
import { channelRows } from '../../shared/channels';
import { token, chartColors } from '../utils/tokens';
import { metricLabel, number, percent } from '../utils/format';
import { ServerTable } from './ServerTable';
import { EChart } from './EChart';
import { useWorkspace } from '../stores/useWorkspace';
interface ChannelRow {
  id: string;
  name: string;
  value: number;
  previous: number;
  share: number;
  conversion: number;
  averageAcquisitionCost: number;
}
interface Props {
  projects: Project[];
  period: 'monthly' | 'yearly';
  online: boolean;
  stage: Stage;
  selected: string | null;
  onSelect: (name: string) => void;
}
export function ChannelStructure({ projects, period, online, stage, selected, onSelect }: Props) {
  const [view, setView] = useState('structure');
  const model = useChannelStructureModel({ projects, period, online, stage, selected, onSelect });
  return <div className="channel-analysis-mode"><Segmented value={view} onChange={setView} options={[{label:'结构分析',value:'structure'},{label:'归因分析',value:'attribution'}]} />{view === 'attribution' ? <ChannelAttribution projects={projects} period={period} online={online} stage={stage} /> : renderChannelStructureView(model)}</div>;
}
function useChannelStructureModel({ projects, period, online, stage, selected, onSelect }: Props) {
  const theme = useWorkspace((s) => s.theme),
    rows = channelRows(projects, period, online, stage),
    total = rows.reduce((sum, r) => sum + r.value, 0);
  const conversionLabel = { leads: '获客基数', visits: '获客转到访率', buy: '到访转认购率', sign: '认购转签约率' }[
    stage
  ];
  const columns = useChannelStructureColumns({ stage, conversionLabel });
  const option = useChannelStructureOption({ total, stage, rows, theme });

  return { projects, period, online, stage, selected, onSelect, theme, rows, total, conversionLabel, columns, option };
}
function renderChannelStructureView(model: ReturnType<typeof useChannelStructureModel>) {
  const { projects, period, online, stage, selected, onSelect, theme, rows, total, conversionLabel, columns, option } =
    model;
  return (
    <div className={`detail-panel channel-structure stage-${stage}`}>
      <div className="panel-heading">
        <h3>
          {period === 'monthly' ? '本月' : '本年'}
          {metricLabel(stage)}渠道结构
        </h3><span className="helper-text">当前查看：{period === 'monthly' ? '本月' : '本年'}{metricLabel(stage)}</span>
      </div>
      <p className="helper-text">平均获客成本为模拟费用口径，单位：元。</p>
      <div className="channel-mix">
        <EChart option={option} label="渠道贡献环形图" onClick={(e) => onSelect(e.name)} />
        <ServerTable<ChannelRow>
          path="channels"
          query={{ period, online, stage }}
          columns={columns}
          initialSort="value"
          scrollX={660}
          onRowClick={(row) => onSelect(row.name)}
          rowClassName={(row) => (row.name === selected ? 'selected-channel' : '')}
        />
      </div>
    </div>
  );
}

function useChannelStructureColumns({ stage, conversionLabel }: { stage: Stage; conversionLabel: string }) {
  return useMemo<ColumnsType<ChannelRow>>(
    () => [
      { title: '渠道名', dataIndex: 'name', key: 'name', fixed: 'left', sorter: true, width: 120, ellipsis: true },
      {
        title: `${metricLabel(stage)}（${stage === 'leads' || stage === 'visits' ? '人' : '套'}）`,
        dataIndex: 'value',
        key: 'value',
        align: 'right',
        sorter: true,
        width: 145,
        render: (value) => number(Number(value)),
      },
      {
        title: '渠道占比',
        dataIndex: 'share',
        key: 'share',
        align: 'right',
        width: 110,
        sorter: true,
        render: (value) => percent(Number(value)),
      },
      { title: '平均获客成本', dataIndex: 'averageAcquisitionCost', key: 'averageAcquisitionCost', width: 150, align: 'right', sorter: true, render: (value) => number(Number(value), 2) },
      {
        title: conversionLabel,
        dataIndex: 'conversion',
        key: 'conversion',
        align: 'right',
        width: 135,
        sorter: true,
        render: (value) => (stage === 'leads' ? '—' : percent(Number(value))),
      },
    ],
    [stage, conversionLabel],
  );
}
function useChannelStructureOption({
  total,
  stage,
  rows,
  theme,
}: {
  total: number;
  stage: Stage;
  rows: { id: string; name: string; value: number; previous: number }[];
  theme: 'light' | 'dark';
}) {
  return useMemo<EChartsOption>(
    () => ({
      color: chartColors(),
      tooltip: { trigger: 'item', valueFormatter: (value) => number(Number(value)) },
      title: {
        text: metricLabel(stage),
        subtext: number(total),
        left: 'center',
        top: '36%',
        textStyle: { fontSize: 14, color: token('--color-muted') },
        subtextStyle: { fontSize: 28, fontWeight: 600, color: token(`--color-stage-${stage}`) },
      },
      series: [
        {
          type: 'pie',
          radius: ['57%', '76%'],
          label: { show: false },
          data: rows.map((r) => ({ name: r.name, value: r.value })),
        },
      ],
    }),
    [total, stage, JSON.stringify(rows), theme],
  );
}
