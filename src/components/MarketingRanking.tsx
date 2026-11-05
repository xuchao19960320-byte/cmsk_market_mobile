import { useMemo, useState } from 'react';
import { Button, Input, Segmented, Space, App } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RankKind, RankingRow, PeriodMetrics } from '../../shared/types';
import { metricValue } from '../../shared/metrics';
import { AnalysisPanel } from './AnalysisPanel';
import { ServerTable } from './ServerTable';
import { number, percent, downloadCsv } from '../utils/format';
import { request } from '../api/client';
import { useWorkspace } from '../stores/useWorkspace';
const rankingMetrics = [
  ['leads', '获客人数（人）'],
  ['visits', '到访人数（人）'],
  ['leadRate', '获客转到访率'],
  ['buy', '认购套数（套）'],
  ['buyRate', '到访转认购率'],
  ['sign', '签约套数（套）'],
  ['goal', '签约目标金额（亿）'],
  ['signAmount', '签约金额（亿）'],
  ['targetRate', '签约达成率'],
];
function rankingMetricColumn(period: 'monthly' | 'yearly', key: string, title: string) {
  return {
    title,
    key: `${period}.${key}`,
    width: 160,
    align: 'right' as const,
    sorter: true,
    render: (_: unknown, row: RankingRow) => {
      const value = metricValue(row[period], key);
      return key.endsWith('Rate')
        ? percent(value)
        : key === 'goal' || key === 'signAmount'
          ? number(value / 10000, 2)
          : number(value);
    },
  };
}
export function MarketingRanking() {
  return renderMarketingRankingView(useMarketingRankingModel());
}
function useMarketingRankingModel() {
  const [kind, setKind] = useState<RankKind>('city'),
    [searches, setSearches] = useState({ city: '', project: '', advisor: '' }),
    filters = useWorkspace((s) => s.filters),
    { message } = App.useApp();
  const columns = useMarketingRankingColumns({ kind });
  const exportRows = async () => {
    try {
      const result = await request<{ items: RankingRow[]; total: number }>('rankings', {
        ...filters,
        kind,
        search: searches[kind],
        page: 1,
        pageSize: 200,
      });
      let items = result.items;
      for (let page = 2; items.length < result.total; page++) {
        const next = await request<{ items: RankingRow[] }>('rankings', {
          ...filters,
          kind,
          search: searches[kind],
          page,
          pageSize: 200,
        });
        if (!next.items.length) break;
        items = items.concat(next.items);
      }
      downloadCsv('营销排名.csv', [
        ['名称', '城市公司', '年度签约金额（万元）', '月度签约金额（万元）'],
        ...items.map((r) => [r.name, r.company, r.yearly.signAmount, r.monthly.signAmount]),
      ]);
      message.success('已导出当前筛选结果');
    } catch {
      message.error('导出失败，请重试');
    }
  };

  return { kind, setKind, searches, setSearches, filters, message, columns, exportRows };
}
function renderMarketingRankingView(model: ReturnType<typeof useMarketingRankingModel>) {
  const { kind, setKind, searches, setSearches, filters, message, columns, exportRows } = model;
  return (
    <AnalysisPanel
      title="营销排名分析"
      description="年度与月度指标并列；服务端全量排序、分页。"
      actions={
        <Button icon={<DownloadOutlined />} onClick={exportRows}>
          导出
        </Button>
      }>
      <div className="toolbar">
        <Segmented<RankKind>
          value={kind}
          onChange={setKind}
          options={[
            { value: 'city', label: '城市公司排名' },
            { value: 'project', label: '项目排名' },
            { value: 'advisor', label: '顾问排名' },
          ]}
        />
        <Space>
          <Input.Search
            aria-label="搜索排名"
            placeholder="搜索名称 / 城市 / 项目"
            value={searches[kind]}
            onChange={(e) => setSearches({ ...searches, [kind]: e.target.value })}
            allowClear
          />
        </Space>
      </div>
      <ServerTable<RankingRow>
        key={kind}
        path="rankings"
        query={{ kind }}
        search={searches[kind]}
        columns={columns}
        scrollX={3380}
      />
    </AnalysisPanel>
  );
}

function useMarketingRankingColumns({ kind }: { kind: RankKind }) {
  return useMemo<ColumnsType<RankingRow>>(
    () => [
      { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, fixed: 'left' },
      {
        title: kind === 'city' ? '城市公司' : kind === 'project' ? '项目名称' : '顾问名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        fixed: 'left',
        ellipsis: true,
      },
      {
        title: kind === 'city' ? '项目数量' : '所属城市 / 项目',
        key: 'scope',
        width: 220,
        ellipsis: true,
        render: (_: unknown, row) =>
          kind === 'city' ? row.projectCount : row.company + (kind === 'advisor' ? ` / ${row.projectName}` : ''),
      },
      ...(['yearly', 'monthly'] as const).map((period) => ({
        title: period === 'yearly' ? '年度' : '月度',
        key: period,
        children: rankingMetrics.map(([key, title]) => rankingMetricColumn(period, key, title)),
      })),
    ],
    [kind],
  );
}
