import type { Filters, TableQuery } from '../shared/types';
import { availableUntil, organizations } from '../shared/projects';
export function parseFilters(params: URLSearchParams): Filters {
  const date = params.get('date') || availableUntil;
  const org = params.get('org') || '招商蛇口';
  const known = ['招商蛇口', ...organizations.map((g) => g.name), ...organizations.flatMap((g) => g.children)];
  if (!/^2026-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error('请选择有效的 2026 年日期');
  const normalized = new Date(date + 'T00:00:00Z').toISOString().slice(0, 10);
  if (normalized !== date) throw new Error('日期无效');
  if (!known.includes(org)) throw new Error('组织不存在');
  return {
    org,
    date: date > availableUntil ? availableUntil : date,
    caliber: params.get('caliber') === 'full' ? 'full' : 'equity',
  };
}
export function parseTable(params: URLSearchParams): TableQuery {
  return {
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: Math.min(200, Math.max(1, Number(params.get('pageSize')) || 20)),
    search: params.get('search') || '',
    sort: params.get('sort') || 'yearly.signAmount',
    order: params.get('order') === 'ascend' ? 'ascend' : 'descend',
  };
}
export function paginate<T>(rows: T[], query: TableQuery): { items: T[]; total: number } {
  const start = (query.page - 1) * query.pageSize;
  return { items: rows.slice(start, start + query.pageSize), total: rows.length };
}
