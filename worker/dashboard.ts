import type { Dashboard, Filters, TrendPoint } from '../shared/types';
import { availableUntil, getProjects, monthMetrics, seeds } from '../shared/projects';
import { getAdvisors } from '../shared/advisors';
import { addMetrics } from '../shared/numbers';
export function dashboard(filters: Filters): Dashboard {
  const projects = getProjects(filters),
    ids = new Set(projects.map((p) => p.id));
  const [year, month, day] = filters.date.split('-').map(Number);
  const trend: TrendPoint[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, month - 12 + i, 1),
      m = date.getMonth() + 1,
      d = i === 11 ? day : new Date(date.getFullYear(), m, 0).getDate();
    const parts = seeds.flatMap((seed, index) =>
      ids.has(seed.id) ? [monthMetrics(seed, index, m, d, filters.caliber)] : [],
    );
    return { month: `${date.getFullYear()}-${String(m).padStart(2, '0')}`, monthly: addMetrics(parts) };
  });
  return { projects, advisors: getAdvisors(projects), trend, updatedAt: availableUntil, isDemo: true };
}
