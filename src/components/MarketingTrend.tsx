import { chartScroll } from '../utils/chartScroll';
import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import type { Dashboard, Dimension, PeriodMetrics } from '../../shared/types';
import type { EChartsOption } from 'echarts';
import { addMetrics } from '../../shared/numbers';
import { ratio } from '../../shared/metrics';
import { AnalysisPanel } from './AnalysisPanel';
import { EChart } from './EChart';
import { token } from '../utils/tokens';
import { number, percent } from '../utils/format';
import { useWorkspace } from '../stores/useWorkspace';
interface OrganizationMetrics { id: string; name: string; metrics: PeriodMetrics }
export function MarketingTrend({ data }: { data: Dashboard }) {
  const [dimension, setDimension] = useState<Dimension>('group');
  const period = useWorkspace((s) => s.cardPeriod), theme = useWorkspace((s) => s.theme);
  const org = useWorkspace((s) => s.filters.org);
  const cityOnly = data.projects.length > 0 && data.projects.every((p) => p.company === org);
  const effective = cityOnly ? 'project' : dimension;
  const [sort,setSort] = useState('leads');
  const rows = useMemo(() => organizationRows(data,effective,period).sort((a,b)=>metricValue(b.metrics,sort)-metricValue(a.metrics,sort)),[data,effective,period,sort]);
  const total = addMetrics(data.projects.map((p) => p[period]));
  const option = useMemo(() => organizationOption(withAverage(rows,effective).sort((a,b)=>metricValue(b.metrics,sort)-metricValue(a.metrics,sort) || a.id.localeCompare(b.id)),sort), [rows, effective, sort, theme]);
  const summaries = [['获客人数',number(total.leads)],['到访人数',number(total.visits)],['认购套数',number(total.buy)],['签约套数',number(total.sign)],['获客转到访率',percent(ratio(total.visits,total.leads))],['到访转认购率',percent(ratio(total.buy,total.visits))],['认购转签约率',percent(ratio(total.sign,total.buy))]];
  return <AnalysisPanel className="marketing-conversion-comparison" title="营销转换对比分析" description={`${period === 'monthly' ? '当月' : '年累计'} · 各组织获客、到访、认购、签约数量对比`}>
    <div className="summary-strip">{summaries.map(([name,value])=><div key={name}><span className="helper-text">{name}</span><strong>{value}</strong></div>)}</div>
    <div className="toolbar comparison-sort-toolbar"><div className="comparison-sort-fields"><span className="helper-text">排序字段</span><Segmented value={sort} onChange={setSort} options={sortOptions} /></div><Segmented<Dimension> disabled={cityOnly} value={effective} onChange={setDimension} options={[{label:'城市群',value:'group'},{label:'城市',value:'city'},{label:'项目',value:'project'}]} /></div>
    <EChart option={option} label="各组织获客、到访、认购、签约数量对比" />
  </AnalysisPanel>;
}
function organizationRows(data: Dashboard, dimension: Dimension, period: 'monthly'|'yearly'): OrganizationMetrics[] {
  const groups = new Map<string, {name:string; metrics: PeriodMetrics[]}>();
  data.projects.forEach((p)=>{
    const id=dimension==='project'?p.id:dimension==='group'?p.group:p.company;
    const name=dimension==='project'?p.name:id;
    const group=groups.get(id) || {name,metrics:[]};
    group.metrics.push(p[period]);groups.set(id,group);
  });
  return [...groups].map(([id,row])=>({id,name:row.name,metrics:addMetrics(row.metrics)})).sort((a,b)=>b.metrics.leads-a.metrics.leads);
}
function organizationOption(rows: OrganizationMetrics[], selected: string): EChartsOption {
  return {
    textStyle:{fontFamily:token('--font-sans'),color:token('--color-muted'),fontSize:12},
    color:['--color-stage-leads','--color-stage-visits','--color-yellow','--color-stage-sign'].map(token),
    tooltip:{trigger:'axis',valueFormatter:(value)=>Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})},legend:{bottom:0},grid:{left:70,right:24,top:24,bottom:90},
    xAxis:{type:'category',data:rows.map((r)=>r.name),axisLabel:{rotate:25,interval:0}},
    yAxis:[{type:'value',name:'数量'},{type:'value',name:'转化率（%）',min:0,max:100,splitLine:{show:false}}],
    dataZoom:chartScroll(rows.length,20),
    series:[...(['leads','visits','buy','sign'] as const).map((key,i)=>({name:['获客人数','到访人数','认购套数','签约套数'][i],type:'bar' as const,barMaxWidth:18,z:key===selected?5:2,itemStyle:{opacity:key===selected?1:.45,borderWidth:key===selected?1:0,borderColor:token('--color-ink')},data:rows.map((r)=>({value:r.metrics[key],itemStyle:r.id==='organization-average'?{borderType:'dashed' as const,borderWidth:2,borderColor:token('--color-ink'),opacity:.65}:undefined}))})), ...rates.map((key,i)=>({name:rateLabels[i],type:'line' as const,yAxisIndex:1,smooth:true,z:key===selected?8:3,symbolSize:key===selected?9:5,lineStyle:{width:key===selected?4:2,opacity:key===selected?1:.4},itemStyle:{opacity:key===selected?1:.5},data:rows.map((r)=>Number(metricValue(r.metrics,key).toFixed(2)))}))],
  };
}

const rates=['leadRate','buyRate','signRate'];
const rateLabels=['获客转到访率','到访转认购率','认购转签约率'];
const sortOptions=['leads','visits','buy','sign',...rates].map((value,i)=>({value,label:['获客人数','到访人数','认购套数','签约套数',...rateLabels][i]}));
function metricValue(m:PeriodMetrics,key:string):number {
  if(key==='leadRate') return ratio(m.visits,m.leads);
  if(key==='buyRate') return ratio(m.buy,m.visits);
  if(key==='signRate') return ratio(m.sign,m.buy);
  return m[key as keyof PeriodMetrics];
}

function withAverage(rows:OrganizationMetrics[],dimension:Dimension):OrganizationMetrics[] {
  if(!rows.length) return rows;
  const total=addMetrics(rows.map((r)=>r.metrics));
  const metrics=Object.fromEntries(Object.entries(total).map(([key,value])=>[key,value/rows.length])) as unknown as PeriodMetrics;
  return [{id:'organization-average',name:dimension==='group'?'城市群平均':dimension==='city'?'城市平均':'项目平均',metrics},...rows];
}
