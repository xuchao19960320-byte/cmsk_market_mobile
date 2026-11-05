import { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PageResult } from '../../shared/types';
import type { Query } from '../api/client';
import { useResource } from '../hooks/useResource';
import { useWorkspace } from '../stores/useWorkspace';
import { DataState } from './DataState';
interface Props<T> {
  path: string;
  query?: Query;
  columns: ColumnsType<T>;
  search?: string;
  initialSort?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  scrollX?: number;
}
export function ServerTable<T extends { id: string }>({
  path,
  query = {},
  columns,
  search = '',
  initialSort = 'yearly.signAmount',
  onRowClick,
  rowClassName,
  scrollX = 1200,
}: Props<T>) {
  return renderServerTableView<T>(
    useServerTableModel<T>({ path, query, columns, search, initialSort, onRowClick, rowClassName, scrollX }),
  );
}
function useServerTableModel<T extends { id: string }>({
  path,
  query = {},
  columns,
  search = '',
  initialSort = 'yearly.signAmount',
  onRowClick,
  rowClassName,
  scrollX = 1200,
}: Props<T>) {
  const filters = useWorkspace((s) => s.filters),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(initialSort),
    [order, setOrder] = useState('descend');
  const resetKey = JSON.stringify({ ...filters, ...query, search });
  useEffect(() => setPage(1), [resetKey]);
  const result = useResource<PageResult<T>>(path, { ...filters, ...query, search, page, pageSize, sort, order });
  const onChange: TableProps<T>['onChange'] = (pagination, _filters, sorting) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
    const current = Array.isArray(sorting) ? sorting[0] : sorting;
    if (current?.order) {
      setSort(String(current.columnKey || initialSort));
      setOrder(current.order);
    }
  };
  return {
    path,
    query,
    columns,
    search,
    initialSort,
    onRowClick,
    rowClassName,
    scrollX,
    filters,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    order,
    setOrder,
    resetKey,
    result,
    onChange,
  };
}
function renderServerTableView<T extends { id: string }>(model: ReturnType<typeof useServerTableModel<T>>) {
  const {
    path,
    query,
    columns,
    search,
    initialSort,
    onRowClick,
    rowClassName,
    scrollX,
    filters,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    order,
    setOrder,
    resetKey,
    result,
    onChange,
  } = model;
  return renderServerTableViewPart1(model);
}
function renderServerTableViewPart1<T extends { id: string }>(model: ReturnType<typeof useServerTableModel<T>>) {
  const { columns, onRowClick, rowClassName, scrollX, page, pageSize, result, onChange } = model;
  return (
    <DataState loading={false} error={result.error} retry={result.reload}>
      <Table<T>
        rowKey="id"
        columns={columns}
        dataSource={result.data?.items || []}
        loading={result.loading}
        onChange={onChange}
        rowClassName={rowClassName}
        onRow={(row) => ({
          onClick: () => onRowClick?.(row),
          tabIndex: onRowClick ? 0 : undefined,
          onKeyDown: (event) => {
            if (event.key === 'Enter') onRowClick?.(row);
          },
        })}
        scroll={{ x: scrollX, y: 360 }}
        sticky
        pagination={{
          current: page,
          pageSize,
          total: result.data?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100, 200],
          showTotal: (total) => `共 ${total} 条`,
        }}
        virtual={pageSize > 100}
      />
    </DataState>
  );
}
