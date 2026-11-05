export type Dimension = 'group' | 'city' | 'project';
export type Stage = 'leads' | 'visits' | 'buy' | 'sign';
export type AmountMetric = 'available' | 'buy' | 'sign';
export type RankKind = 'city' | 'project' | 'advisor';
export type Caliber = 'equity' | 'full';
export interface Filters {
  org: string;
  caliber: Caliber;
  date: string;
}
export interface PeriodMetrics {
  leads: number;
  visits: number;
  buy: number;
  sign: number;
  signAmount: number;
  goal: number;
  available: number;
}
export interface ProjectSeed {
  id: string;
  name: string;
  short: string;
  city: string;
  company?: string;
  phase: string;
  visits: number;
  buy: number;
  sign: number;
  price: number;
  goal: number;
  stock: number;
}
export interface Channel {
  id: string;
  name: string;
  monthly: PeriodMetrics;
  yearly: PeriodMetrics;
}
export interface Project {
  id: string;
  name: string;
  city: string;
  company: string;
  group: string;
  tier: string;
  phase: string;
  monthly: PeriodMetrics;
  yearly: PeriodMetrics;
  previous: PeriodMetrics;
  channels: Channel[];
}
export interface Advisor {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  company: string;
  city: string;
  group: string;
  tier: string;
  monthly: PeriodMetrics;
  yearly: PeriodMetrics;
  projectMonthly: PeriodMetrics;
  projectYearly: PeriodMetrics;
}
export interface TrendPoint {
  month: string;
  monthly: PeriodMetrics;
}
export interface Dashboard {
  projects: Project[];
  advisors: Advisor[];
  trend: TrendPoint[];
  updatedAt: string;
  isDemo: boolean;
}
export interface Organization {
  name: string;
  children: string[];
}
export interface Metadata {
  organizations: Organization[];
  projects: Pick<Project, 'id' | 'name' | 'company' | 'tier'>[];
  availableUntil: string;
}
export interface TableQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  order: 'ascend' | 'descend';
}
export interface PageResult<T> {
  items: T[];
  total: number;
}
export interface RankingRow {
  id: string;
  name: string;
  projectName: string;
  company: string;
  projectCount: number;
  rank: number;
  monthly: PeriodMetrics;
  yearly: PeriodMetrics;
}
export interface DictionaryRow {
  id: string;
  name: string;
  definition: string;
  formula: string;
  unit: string;
}
export interface Task {
  id: string;
  title: string;
  owner: string;
  due: string;
  scope: string;
  note: string;
  status: 'open' | 'done';
}
export interface MetricDefinition {
  key: string;
  label: string;
  period: 'monthly' | 'yearly';
  target: 'advisor' | 'project';
  metric: keyof PeriodMetrics | 'leadRate' | 'buyRate' | 'signRate';
  unit: string;
}
export interface HistoryPoint {
  month: string;
  xScore: number;
  yScore: number;
  xValue: number;
  yValue: number;
  size: number;
  xRank: number;
  yRank: number;
}
export interface AdvisorScope {
  tier: string;
  company: string;
  projectId: string;
  search: string;
}
export interface ChartDatum {
  id: string;
  name: string;
  value: number;
}
