import { useMemo, useState } from 'react';
import { Button, Drawer, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DictionaryRow } from '../../shared/types';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { ServerTable } from '../components/ServerTable';
export default function DictionaryPage() {
  return renderDictionaryPageView(useDictionaryPageModel());
}
function useDictionaryPageModel() {
  const [search, setSearch] = useState(''),
    [selected, setSelected] = useState<DictionaryRow | null>(null);
  const columns = useMemo<ColumnsType<DictionaryRow>>(
    () => [
      { title: '指标名称', dataIndex: 'name', width: 210, ellipsis: true },
      { title: '指标定义', dataIndex: 'definition', width: 500, ellipsis: true },
      { title: '单位', dataIndex: 'unit', width: 100 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (_: unknown, row) => (
          <Button type="link" onClick={() => setSelected(row)}>
            查看口径
          </Button>
        ),
      },
    ],
    [],
  );

  return { search, setSearch, selected, setSelected, columns };
}
function renderDictionaryPageView(model: ReturnType<typeof useDictionaryPageModel>) {
  const { search, setSearch, selected, setSelected, columns } = model;
  return (
    <div className="page-content">
      <AnalysisPanel
        title="指标口径"
        description="沿用上传指标字典。新增演示指标与真实后台字段契约尚待业务确认。"
        actions={
          <Input.Search
            aria-label="搜索指标字典"
            className="project-select"
            placeholder="搜索指标 / 定义 / 公式"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }>
        <ServerTable<DictionaryRow> path="dictionary" columns={columns} search={search} scrollX={1000} />
      </AnalysisPanel>
      <Drawer title={selected?.name || '指标说明'} open={!!selected} onClose={() => setSelected(null)} width={600}>
        <div className="content-detail">
          <h3>定义</h3>
          <p>{selected?.definition || '暂无定义'}</p>
          <h3>计算公式</h3>
          <p className="whitespace-pre-wrap">{selected?.formula || '暂无公式'}</p>
          <h3>单位</h3>
          <p>{selected?.unit || '—'}</p>
        </div>
      </Drawer>
    </div>
  );
}
