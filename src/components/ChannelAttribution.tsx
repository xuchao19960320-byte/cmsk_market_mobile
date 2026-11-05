import { chartScroll } from '../utils/chartScroll';
import { useMemo, useState } from 'react';
import { Segmented, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Project, Stage } from '../../shared/types';
import { channelRows } from '../../shared/channels';
import { useWorkspace } from '../stores/useWorkspace';
import { metricLabel, number, percent } from '../utils/format';
import { token } from '../utils/tokens';
import { EChart } from './EChart';
interface Props { projects: Project[]; period: 'monthly' | 'yearly'; online: boolean; stage: Stage }
interface Contribution { id: string; name: string; value: number; share: number; channels: Record<string, number>; children?: Contribution[] }
export function ChannelAttribution(props: Props) {
  const { projects, period, online, stage } = props;
  const state = useWorkspace(), [dimension, setDimension] = useState('channel');
  const total = channelRows(projects, period, online, stage).reduce((sum, row) => sum + row.value, 0);
  const rows = contributionRows(projects, period, online, stage, total);
  const channels = channelRows(projects, period, online, stage);
  const baseline = state.comparison === 'yoy' ? Math.round(total * .92) : projects.reduce((sum, p) => sum + p.previous[stage], 0) * (period === 'yearly' ? 10 : 1);
  const cities = rows.flatMap((r)=>r.children || []);
  const parts = dimension === 'channel' ? channels : dimension === 'group' ? rows : dimension === 'city' ? cities : cities.flatMap((r)=>r.children || []);
  const date = new Date(state.filters.date), month = date.getMonth() + 1;
  const currentLabel = `2026年${period === 'yearly' ? '累计' : `${month}月`}`;
  const priorLabel = state.comparison === 'yoy' ? currentLabel.replace('2026', '2025') : period === 'yearly' ? '上年累计' : `2026年${month - 1}月`;
  const option = waterfall(parts, baseline, total, priorLabel, currentLabel);
  const columns = useMemo<ColumnsType<Contribution>>(() => [
    {title:'城市群 / 城市公司 / 项目',dataIndex:'name',key:'name',width:210,sorter:(a,b)=>a.name.localeCompare(b.name)},
    {title:metricLabel(stage),dataIndex:'value',key:'value',sorter:(a,b)=>a.value-b.value,align:'right',width:110,render:(v:number)=>number(v)},
    {title:'占比',dataIndex:'share',key:'share',sorter:(a,b)=>a.share-b.share,align:'right',width:90,render:(v:number)=>percent(v)},
    ...channels.map((c)=>({title:c.name,key:c.id,sorter:(a:Contribution,b:Contribution)=>(a.channels[c.name]||0)-(b.channels[c.name]||0),width:110,align:'right' as const,render:(_:unknown,r:Contribution)=>number(r.channels[c.name] || 0)})),
  ], [stage, JSON.stringify(channels)]);
  return <div className="attribution-body">
    <div className="attribution-totals">{[[`${currentLabel}${metricLabel(stage)}`,number(total)],[`${priorLabel}${metricLabel(stage)}`,number(baseline)],['增长数量',number(total-baseline)],['增长率',baseline ? percent((total-baseline)/baseline*100) : '—']].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <Segmented value={dimension} onChange={setDimension} options={[{label:'渠道',value:'channel'},{label:'城市群',value:'group'},{label:'城市公司',value:'city'},{label:'项目',value:'project'}]} />
    <EChart option={option} label="渠道与组织增长归因瀑布图" />
    <h3>组织贡献明细</h3><p className="helper-text">点击城市群展开城市公司，再展开项目；历史比较为演示模型。</p>
    <Table<Contribution> rowKey="id" columns={columns} dataSource={rows} pagination={{pageSize:20,showTotal:(n)=>`共 ${n} 条`}} scroll={{x:1100,y:260}} />
  </div>;
}
function contributionRows(projects: Project[], period: 'monthly'|'yearly', online:boolean, stage:Stage, total:number): Contribution[] {
  const make = (id:string,name:string,items:Project[]):Contribution => {
    const channels = channelRows(items,period,online,stage), value=channels.reduce((s,r)=>s+r.value,0);
    return {id,name,value,share:total ? value/total*100 : 0,channels:Object.fromEntries(channels.map((r)=>[r.name,r.value]))};
  };
  const cities = [...new Set(projects.map((p)=>p.company))].map((company)=>{
    const items=projects.filter((p)=>p.company===company);
    return {...make(company,company,items),children:items.map((p)=>make(p.id,p.name,[p]))};
  });
  return [...new Set(projects.map((p)=>p.group))].map((group)=>({...make(group,group,projects.filter((p)=>p.group===group)),children:cities.filter((c)=>projects.some((p)=>p.group===group && p.company===c.id))}));
}
function waterfall(parts: {name:string;value:number}[], baseline:number,total:number,prior:string,current:string) {
  const contributions = contributionChanges(parts, baseline, total);
  const changes = contributions.map((r) => r.change);
  let running=baseline;
  const offsets=[0,...changes.map((v)=>{const bottom=Math.min(running,running+v);running+=v;return bottom;}),0];
  return { tooltip:{trigger:'axis' as const},grid:{left:60,right:20,top:30,bottom:70},xAxis:{type:'category' as const,data:[prior,...contributions.map((r)=>r.name),current],axisLabel:{rotate:30}},yAxis:{type:'value' as const},dataZoom:chartScroll(contributions.length + 2,10),series:[
    {type:'bar' as const,stack:'total',silent:true,itemStyle:{opacity:0},data:offsets},
    {type:'bar' as const,stack:'total',barMaxWidth:32,label:{show:true,position:'top' as const,formatter:(p:{dataIndex:number})=>p.dataIndex===0 ? number(baseline) : p.dataIndex===changes.length+1 ? number(total) : (changes[p.dataIndex-1]>0?'+':'')+number(changes[p.dataIndex-1])},data:[baseline,...changes.map(Math.abs),total].map((value,i)=>({value,itemStyle:{color:token(i===0||i===changes.length+1?'--color-primary':changes[i-1]>=0?'--color-positive':'--color-danger')}}))},
  ]};
}

function contributionChanges(parts:{name:string;value:number}[],baseline:number,total:number) {
  const sum=parts.reduce((s,r)=>s+r.value,0);
  if(!sum) return parts.map((r)=>({...r,change:0}));
  const raw=parts.map((r,i)=>({...r,change:(total-baseline)*r.value/sum + r.value*(i%3===0 ? -.12 : .08)}));
  const correction=(total-baseline)-raw.reduce((s,r)=>s+r.change,0);
  const negatives=raw.filter((r)=>r.change<0), positives=raw.filter((r)=>r.change>=0);
  const receivers=positives.length ? positives : raw;
  const weight=receivers.reduce((s,r)=>s+r.value,0);
  receivers.forEach((r)=>{r.change += correction*(weight ? r.value/weight : 1/receivers.length);});
  const rounded=raw.map((r)=>({...r,change:Math.round(r.change)}));
  if(rounded.length) rounded[0].change+=(total-baseline)-rounded.reduce((s,r)=>s+r.change,0);
  return rounded.sort((a,b)=>b.change-a.change || a.name.localeCompare(b.name));
}
