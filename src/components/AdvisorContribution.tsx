import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import type { Advisor, AdvisorScope, PageResult } from '../../shared/types';
import { useWorkspace } from '../stores/useWorkspace';
import { useResource } from '../hooks/useResource';
import { propertyColors, token } from '../utils/tokens';
import { number, percent, escapeHtml } from '../utils/format';
import { AnalysisPanel } from './AnalysisPanel';
import { EChart } from './EChart';
import { DataState } from './DataState';
import { ServerTable } from './ServerTable';
interface ContributionRow extends Advisor {
  rank: number;
  value: number;
  share: number;
}
interface ContributionPage extends PageResult<ContributionRow> {
  contributionTotal: number;
}
export function AdvisorContribution({ scope, onSelect }: { scope: AdvisorScope; onSelect: (id: string) => void }) {
  return renderAdvisorContributionView(useAdvisorContributionModel({ scope, onSelect }));
}
function useAdvisorContributionModel({ scope, onSelect }: { scope: AdvisorScope; onSelect: (id: string) => void }) {
  const [metric, setMetric] = useState('visits'),
    filters = useWorkspace((s) => s.filters),
    theme = useWorkspace((s) => s.theme);
  const result = useResource<ContributionPage>('contributions', {
    ...filters,
    ...scope,
    metric,
    page: 1,
    pageSize: 30,
  });
  const name = { visits: '到访人数', buy: '认购套数', sign: '签约套数' }[metric] || '',
    unit = metric === 'visits' ? '人' : '套';
  const columns = useAdvisorContributionColumns({ name, unit });
  const option = useAdvisorContributionOption({ result, name, unit, metric, theme });

  return { scope, onSelect, metric, setMetric, filters, theme, result, name, unit, columns, option };
}
function renderAdvisorContributionView(model: ReturnType<typeof useAdvisorContributionModel>) {
  const { scope, onSelect, metric, setMetric, filters, theme, result, name, unit, columns, option } = model;
  return (
    <AnalysisPanel
      title="顾问贡献结构分析"
      description="当前筛选范围内按指标降序展示 TOP30；占比以全部匹配顾问为分母。"
      actions={
        <Segmented
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'visits', label: '到访人数' },
            { value: 'buy', label: '认购套数' },
            { value: 'sign', label: '签约套数' },
          ]}
        />
      }>
      <DataState loading={result.loading} error={result.error} empty={!result.data?.items.length} retry={result.reload}>
        <EChart option={option} label="顾问贡献结构TOP30" onClick={(event) => onSelect(event.id)} />
      </DataState>
      <div className="section-gap">
        <ServerTable<ContributionRow>
          path="contributions"
          query={{ ...scope, metric }}
          search={scope.search}
          columns={columns}
          initialSort="value"
          scrollX={800}
          onRowClick={(row) => onSelect(row.id)}
        />
      </div>
    </AnalysisPanel>
  );
}

function useAdvisorContributionColumns({ name, unit }: { name: string; unit: '人' | '套' }) {
  return useMemo<ColumnsType<ContributionRow>>(
    () => [
      { title: '排名', dataIndex: 'rank', width: 80 },
      { title: '顾问', dataIndex: 'name', width: 120 },
      { title: '项目', dataIndex: 'projectName', width: 240, ellipsis: true },
      {
        title: `${name}（${unit}）`,
        dataIndex: 'value',
        width: 160,
        align: 'right',
        render: (value) => number(Number(value)),
      },
      { title: '贡献占比', dataIndex: 'share', width: 140, align: 'right', render: (value) => percent(Number(value)) },
    ],
    [name, unit],
  );
}
function useAdvisorContributionOption({
  result,
  name,
  unit,
  metric,
  theme,
}: {
  result: import('/Users/xuchao/Desktop/codex/dataall/marketing-react/src/hooks/useResource').Resource<ContributionPage>;
  name: string;
  unit: '人' | '套';
  metric: string;
  theme: 'light' | 'dark';
}) {
  return useMemo<EChartsOption>(
    () => ({
      color: propertyColors(),
      tooltip: {
        formatter: (params: unknown) => {
          const p = params as { data?: { id?: string } },
            row = result.data?.items.find((a) => a.id === p.data?.id);
          return row
            ? `${escapeHtml(row.name)} · ${escapeHtml(row.projectName)}<br/>${name}：${number(row.value)} ${unit}<br/>占整体：${percent(row.share)}`
            : '';
        },
      },
      textStyle: { fontFamily: token('--font-sans'), fontSize: 12 },
      series: [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: { show: true, formatter: '{b}', color: token('--color-ink'), fontSize: 12 },
          itemStyle: { borderWidth: 2, gapWidth: 2 },
          data:
            result.data?.items.map((row) => ({
              id: row.id,
              name: `${row.name}\n${row.projectName}\n${number(row.value)}${unit} · ${percent(row.share)}`,
              value: row.value,
            })) || [],
        },
      ],
    }),
    [result.data, metric, theme],
  );
}
