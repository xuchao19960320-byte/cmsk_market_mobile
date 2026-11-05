import type { AdvisorScope, Filters, RankingRow, TableQuery } from '../shared/types';
import { getProjects } from '../shared/projects';
import { filterAdvisors, getAdvisors } from '../shared/advisors';
import { addMetrics } from '../shared/numbers';
import { metricValue } from '../shared/metrics';
import { paginate } from './queries';
export function rankingRows(filters: Filters, kind: string): RankingRow[] {
  const projects = getProjects(filters);
  if (kind === 'advisor')
    return getAdvisors(projects).map((a) => ({
      id: a.id,
      name: a.name,
      projectName: a.projectName,
      company: a.company,
      projectCount: 1,
      rank: 0,
      monthly: a.monthly,
      yearly: a.yearly,
    }));
  if (kind === 'project')
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      projectName: p.name,
      company: p.company,
      projectCount: 1,
      rank: 0,
      monthly: p.monthly,
      yearly: p.yearly,
    }));
  return [...new Set(projects.map((p) => p.company))].map((company) => {
    const rows = projects.filter((p) => p.company === company);
    return {
      id: company,
      name: company,
      projectName: '',
      company,
      projectCount: rows.length,
      rank: 0,
      monthly: addMetrics(rows.map((p) => p.monthly)),
      yearly: addMetrics(rows.map((p) => p.yearly)),
    };
  });
}
export function rankings(filters: Filters, kind: string, query: TableQuery) {
  const [period, key] = query.sort.split('.'),
    target = period === 'monthly' ? 'monthly' : 'yearly';
  const sorted = rankingRows(filters, kind).sort(
    (a, b) =>
      (metricValue(a[target], key) - metricValue(b[target], key)) * (query.order === 'ascend' ? 1 : -1) ||
      a.id.localeCompare(b.id),
  );
  const rows = sorted
    .map((row, i) => ({ ...row, rank: i + 1 }))
    .filter((r) => (r.name + r.company + r.projectName).includes(query.search));
  return paginate(rows, query);
}
export function advisorScope(params: URLSearchParams): AdvisorScope {
  return {
    tier: params.get('tier') || '全部',
    company: params.get('company') || '全部',
    projectId: params.get('projectId') || '全部',
    search: params.get('search') || '',
  };
}
export function contributions(filters: Filters, params: URLSearchParams, query: TableQuery) {
  const metric = params.get('metric') || 'visits',
    list = filterAdvisors(getAdvisors(getProjects(filters)), advisorScope(params));
  const sorted = list
    .sort((a, b) => metricValue(b.monthly, metric) - metricValue(a.monthly, metric) || a.id.localeCompare(b.id))
    .slice(0, 30);
  const total = list.reduce((sum, row) => sum + metricValue(row.monthly, metric), 0);
  return {
    ...paginate(
      sorted.map((a, i) => ({
        ...a,
        rank: i + 1,
        value: metricValue(a.monthly, metric),
        share: total ? (metricValue(a.monthly, metric) / total) * 100 : 0,
      })),
      query,
    ),
    contributionTotal: total,
  };
}
