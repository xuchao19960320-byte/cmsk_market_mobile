import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { TrendPoint } from '../../shared/types';
import { number, percent } from '../utils/format';
import { ratio } from '../../shared/metrics';
import { ServerTable } from './ServerTable';
interface TrendRow extends TrendPoint {
  id: string;
}
export function TrendTable({ property }: { property: string }) {
  const columns = useMemo<ColumnsType<TrendRow>>(
    () => [
      { title: '月份', dataIndex: 'month', width: 120 },
      ...(['leads', 'visits', 'buy', 'sign'] as const).map((key, i) => ({
        title: ['获客人数（人）', '到访人数（人）', '认购套数（套）', '签约套数（套）'][i],
        key,
        width: 160,
        align: 'right' as const,
        render: (_: unknown, row: TrendRow) => number(row.monthly[key]),
      })),
      {
        title: '到访转认购率',
        width: 160,
        align: 'right',
        render: (_: unknown, row) => percent(ratio(row.monthly.buy, row.monthly.visits)),
      },
      {
        title: '认购转签约率',
        width: 160,
        align: 'right',
        render: (_: unknown, row) => percent(ratio(row.monthly.sign, row.monthly.buy)),
      },
    ],
    [],
  );
  return <ServerTable<TrendRow> path="trend" query={{ property }} columns={columns} scrollX={1100} />;
}
