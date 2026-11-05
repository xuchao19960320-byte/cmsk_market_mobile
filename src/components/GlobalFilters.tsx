import { Alert, Button, DatePicker, Select, Segmented, Space, Tag, TreeSelect } from 'antd';
import dayjs from 'dayjs';
import { useMetadata } from '../hooks/useDashboard';
import { useWorkspace } from '../stores/useWorkspace';
export function GlobalFilters() {
  return renderGlobalFiltersView(useGlobalFiltersModel());
}
function useGlobalFiltersModel() {
  const filters = useWorkspace((s) => s.filters),
    setFilters = useWorkspace((s) => s.setFilters),
    metadata = useMetadata();
  const tree = [
    {
      title: '招商蛇口',
      value: '招商蛇口',
      children:
        metadata.data?.organizations.map((g) => ({
          title: g.name,
          value: g.name,
          children: g.children.map((name) => ({ title: name, value: name })),
        })) || [],
    },
  ];

  return { filters, setFilters, metadata, tree };
}
function renderGlobalFiltersView(model: ReturnType<typeof useGlobalFiltersModel>) {
  const { filters, setFilters, metadata, tree } = model;
  return (
    <div className="filter-bar">
      <TreeSelect
        aria-label="组织范围"
        className="filter-org"
        showSearch
        treeDefaultExpandAll
        treeNodeFilterProp="title"
        value={filters.org}
        treeData={tree}
        onChange={(org) => setFilters({ org })}
        loading={metadata.loading}
      />
      <Select
        aria-label="口径"
        className="filter-caliber"
        value={filters.caliber}
        options={[
          { value: 'equity', label: '全口径-权益' },
          { value: 'full', label: '全口径' },
        ]}
        onChange={(caliber) => setFilters({ caliber })}
      />
      <DatePicker
        aria-label="统计日期"
        value={dayjs(filters.date)}
        allowClear={false}
        onChange={(date) => {
          if (date) setFilters({ date: date.format('YYYY-MM-DD') });
        }}
        disabledDate={(date) =>
          date.year() !== 2026 || date.format('YYYY-MM-DD') > (metadata.data?.availableUntil || '2026-10-25')
        }
      />
      <CardFilters />
      <div className="filter-right">
        <Space>
          <Tag>演示数据</Tag>
          <span>数据截至 {metadata.data?.availableUntil || '—'}</span>
        </Space>
      </div>
      {metadata.error && (
        <Alert type="error" message="组织加载失败" action={<Button onClick={metadata.reload}>重试</Button>} />
      )}
    </div>
  );
}

function CardFilters() {
  const state = useWorkspace();
  return <Space className="card-filter-switches">
    <Segmented value={state.cardPeriod} onChange={state.setCardPeriod} options={[{label:'当月',value:'monthly'},{label:'年累计',value:'yearly'}]} />
    <Segmented value={state.comparison} onChange={state.setComparison} options={[{label:'同比',value:'yoy'},{label:'环比',value:'mom'}]} />
  </Space>;
}
