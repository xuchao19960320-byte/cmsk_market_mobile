import type { ChartDatum, Dimension, Project } from '../../shared/types';
export function distribution(
  projects: Project[],
  dimension: Dimension,
  getValue: (project: Project) => number,
): ChartDatum[] {
  const grouped = new Map<string, number>();
  for (const project of projects) {
    const name = dimension === 'group' ? project.group : dimension === 'city' ? project.company : project.name;
    grouped.set(name, (grouped.get(name) || 0) + getValue(project));
  }
  return [...grouped].map(([name, value]) => ({ id: name, name, value })).sort((a, b) => b.value - a.value);
}
