import type { Advisor, AdvisorScope, PeriodMetrics, Project } from './types';
import { allocate, emptyMetrics } from './numbers';
const names = ['陈悦', '林楠', '李欣', '张晨', '王宁', '赵妍', '周远', '徐浩'];
const reception = [0.19, 0.16, 0.14, 0.13, 0.12, 0.1, 0.09, 0.07];
const purchase = [0.24, 0.18, 0.12, 0.09, 0.16, 0.06, 0.1, 0.05];
const signing = [0.24, 0.2, 0.12, 0.08, 0.16, 0.06, 0.09, 0.05];
function distribute(metrics: PeriodMetrics): PeriodMetrics[] {
  const result = names.map(() => emptyMetrics());
  for (const key of Object.keys(metrics) as (keyof PeriodMetrics)[]) {
    const weights =
      key === 'buy' ? purchase : key === 'sign' || key === 'signAmount' || key === 'goal' ? signing : reception;
    const parts = allocate(metrics[key], weights);
    result.forEach((row, i) => (row[key] = parts[i]));
  }
  return result;
}
export function getAdvisors(projects: Project[]): Advisor[] {
  return projects.flatMap((p) => {
    const monthly = distribute(p.monthly),
      yearly = distribute(p.yearly);
    return names.map((name, i) => ({
      id: `${p.id}a${i}`,
      name,
      projectId: p.id,
      projectName: p.name,
      company: p.company,
      city: p.city,
      group: p.group,
      tier: p.tier,
      monthly: monthly[i],
      yearly: yearly[i],
      projectMonthly: p.monthly,
      projectYearly: p.yearly,
    }));
  });
}
export function filterAdvisors(rows: Advisor[], scope: AdvisorScope): Advisor[] {
  return rows.filter(
    (a) =>
      (scope.tier === '全部' || a.tier === scope.tier) &&
      (scope.company === '全部' || a.company === scope.company) &&
      (scope.projectId === '全部' || a.projectId === scope.projectId) &&
      (!scope.search || (a.name + a.projectName + a.company).includes(scope.search)),
  );
}
