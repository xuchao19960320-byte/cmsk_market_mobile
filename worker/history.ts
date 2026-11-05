import type { Filters, HistoryPoint } from '../shared/types';
import { getProjects } from '../shared/projects';
import { filterAdvisors, getAdvisors } from '../shared/advisors';
import { advisorValue, ranks } from '../shared/metrics';
import { advisorScope } from './rankings';
export function advisorHistory(filters: Filters, params: URLSearchParams): HistoryPoint[] {
  const months = Math.min(12, Math.max(3, Number(params.get('months')) || 6)),
    id = params.get('id') || '';
  const x = params.get('x') || 'monthly.advisor.signRate',
    y = params.get('y') || 'monthly.advisor.buyRate',
    size = params.get('size') || 'monthly.advisor.visits';
  return Array.from({ length: months }, (_, i) => {
    const [year, month] = filters.date.split('-').map(Number),
      date = new Date(year, month - months + i, 1),
      day =
        i === months - 1
          ? Number(filters.date.slice(-2))
          : new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const historicDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const advisors = filterAdvisors(getAdvisors(getProjects({ ...filters, date: historicDate })), advisorScope(params));
    const advisor = advisors.find((row) => row.id === id),
      xr = ranks(advisors, x).get(id),
      yr = ranks(advisors, y).get(id);
    return {
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      xScore: xr?.score || 0,
      yScore: yr?.score || 0,
      xValue: advisor ? advisorValue(advisor, x) : 0,
      yValue: advisor ? advisorValue(advisor, y) : 0,
      size: advisor ? advisorValue(advisor, size) : 0,
      xRank: xr?.rank || 0,
      yRank: yr?.rank || 0,
    };
  });
}
