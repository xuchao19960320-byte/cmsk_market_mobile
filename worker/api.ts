import dictionary from '../shared/dictionary.json';
import { getProjects, organizations, availableUntil } from '../shared/projects';
import { channelRows } from '../shared/channels';
import type { Filters, Stage, TableQuery } from '../shared/types';
import { scaleMetrics } from '../shared/numbers';
import { propertyTypes } from '../shared/supply';
import { parseFilters, parseTable, paginate } from './queries';
import { dashboard } from './dashboard';
import { advisorHistory } from './history';
import { rankings, contributions } from './rankings';
export function handleApi(request: Request): Response {
  try {
    if (request.method !== 'GET') return Response.json({ message: '不支持的请求方式' }, { status: 405 });
    const url = new URL(request.url),
      params = url.searchParams;
    if (url.pathname === '/api/health') return Response.json({ status: 'ok', mode: 'demo' });
    const payload = resolveRoute(url.pathname, parseFilters(params), params, parseTable(params));
    if (payload === undefined) return Response.json({ message: '接口不存在' }, { status: 404 });
    return Response.json(payload, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : '请求失败' }, { status: 400 });
  }
}
function resolveRoute(path: string, filters: Filters, params: URLSearchParams, query: TableQuery): unknown {
  switch (path) {
    case '/api/metadata':
      return {
        organizations,
        availableUntil,
        projects: getProjects({ ...filters, org: '招商蛇口' }).map(({ id, name, company, tier }) => ({
          id,
          name,
          company,
          tier,
        })),
      };
    case '/api/dashboard':
      return dashboard(filters);
    case '/api/rankings':
      return rankings(filters, params.get('kind') || 'city', query);
    case '/api/advisor-history':
      return advisorHistory(filters, params);
    case '/api/contributions':
      return contributions(filters, params, query);
    case '/api/channels':
      return channelTable(filters, params, query);
    case '/api/trend':
      return trendTable(filters, params, query);
    case '/api/dictionary':
      return paginate(
        dictionary
          .filter((r) => (r.name + r.definition + r.formula).includes(query.search))
          .map((r) => ({ id: String(r.row), ...r })),
        query,
      );
    default:
      return undefined;
  }
}
function trendTable(filters: Filters, params: URLSearchParams, query: TableQuery) {
  const property = params.get('property') || '全部业态',
    weight = property === '全部业态' ? 1 : (propertyTypes.find((r) => r.name === property)?.weight || 0) / 10000;
  const rows = dashboard(filters).trend.map((r) => ({ ...r, id: r.month, monthly: scaleMetrics(r.monthly, weight) }));
  return paginate(rows, query);
}
function channelTable(filters: Filters, params: URLSearchParams, query: TableQuery) {
  const period = params.get('period') === 'yearly' ? 'yearly' : 'monthly',
    online = params.get('online') === 'true';
  const rawStage = params.get('stage') || 'visits',
    stage: Stage = ['leads', 'visits', 'buy', 'sign'].includes(rawStage) ? (rawStage as Stage) : 'visits';
  const rows = channelRows(getProjects(filters), period, online, stage),
    total = rows.reduce((s, r) => s + r.value, 0);
  const data = rows.map((row) => ({
    ...row,
    share: total ? (row.value / total) * 100 : 0,
    averageAcquisitionCost: 80 + (row.id.length * 17 % 160),
    conversion: row.previous ? (row.value / row.previous) * 100 : 0,
  }));
  const sortKey = ['name', 'value', 'share', 'conversion', 'averageAcquisitionCost'].includes(query.sort) ? query.sort : 'value';
  data.sort(
    (a, b) =>
      (sortKey === 'name'
        ? a.name.localeCompare(b.name)
        : Number(a[sortKey as keyof typeof a]) - Number(b[sortKey as keyof typeof b])) *
      (query.order === 'ascend' ? 1 : -1),
  );
  return paginate(data, query);
}
