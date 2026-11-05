import seedsJson from './project-seeds.json';
import organizationTree from './organizations.json';
import type { Caliber, Filters, PeriodMetrics, Project, ProjectSeed } from './types';
import { addMetrics } from './numbers';
import { projectChannels } from './channels';
export const seeds: ProjectSeed[] = seedsJson;
export const organizations = organizationTree.children;
export const availableUntil = '2026-10-25';
export function cityTier(company: string): string {
  if (['北京公司', '上海公司', '广州公司', '深圳公司'].includes(company)) return '一线城市';
  if (['江门公司', '深圳前海', '产园华南', '产园华东'].includes(company)) return '三四线城市';
  if (['济南公司', '昆明公司', '珠海公司', '惠州公司', '中山公司', '海南公司'].includes(company)) return '二线城市';
  return '新一线城市';
}
export function monthMetrics(
  seed: ProjectSeed,
  index: number,
  month: number,
  days: number,
  caliber: Caliber,
): PeriodMetrics {
  const season = [0.74, 0.68, 0.9, 0.96, 1.05, 1.01, 0.92, 0.96, 0.94, 1, 1.03, 1.08][month - 1];
  const adjust = month === 10 ? 1 : 1 + (((index + month) % 5) - 2) * 0.025;
  const groups = Math.max(1, Math.round((seed.visits * season * adjust * days) / 25));
  const visits = Math.round(groups * (1.22 + (index % 5) * 0.08));
  const buy = Math.round((seed.buy * season * (month === 10 ? 1 : 1 + (((index + month) % 3) - 1) * 0.06) * days) / 25);
  const sign = Math.min(buy, Math.round((seed.sign * season * days) / 25));
  const factor = caliber === 'equity' ? 0.51 : 1;
  return {
    leads: Math.ceil(visits / (0.89 + (index % 5) * 0.005)),
    visits,
    buy,
    sign,
    signAmount: sign * seed.price * factor,
    goal: seed.goal * factor,
    available: seed.stock + sign,
  };
}
export function buildProject(seed: ProjectSeed, index: number, filters: Filters): Project {
  const date = filters.date > availableUntil ? availableUntil : filters.date;
  const [year, month, day] = date.split('-').map(Number);
  const monthly = monthMetrics(seed, index, month, day, filters.caliber);
  const monthlySeries = Array.from({ length: month }, (_, i) =>
    monthMetrics(seed, index, i + 1, i + 1 === month ? day : new Date(year, i + 1, 0).getDate(), filters.caliber),
  );
  const yearly = addMetrics(monthlySeries);
  yearly.available = seed.stock + yearly.sign;
  yearly.goal = seed.goal * 12 * (filters.caliber === 'equity' ? 0.51 : 1);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previous = monthMetrics(
    seed,
    index,
    previousMonth,
    Math.min(day, new Date(year, previousMonth, 0).getDate()),
    filters.caliber,
  );
  const company = seed.company || seed.city + '公司';
  return {
    id: seed.id,
    name: seed.name,
    city: seed.city,
    company,
    group: organizations.find((g) => g.children.includes(company))?.name || '其他',
    tier: cityTier(company),
    phase: seed.phase,
    monthly,
    yearly,
    previous,
    channels: projectChannels(seed.id, monthly, monthlySeries),
  };
}
export function getProjects(filters: Filters): Project[] {
  const companies =
    filters.org === '招商蛇口'
      ? organizations.flatMap((g) => g.children)
      : organizations.find((g) => g.name === filters.org)?.children || [filters.org];
  return seeds.map((seed, index) => buildProject(seed, index, filters)).filter((p) => companies.includes(p.company));
}
