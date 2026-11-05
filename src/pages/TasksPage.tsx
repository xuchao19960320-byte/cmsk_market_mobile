import { useState } from 'react';
import { App, Button, Drawer, Empty, Input, Pagination, Segmented, Space, Tag } from 'antd';
import { useWorkspace } from '../stores/useWorkspace';
import { TaskForm } from '../components/TaskForm';
import { AnalysisPanel } from '../components/AnalysisPanel';
import type { Task } from '../../shared/types';
export default function TasksPage() {
  return renderTasksPageView(useTasksPageModel());
}
function useTasksPageModel() {
  const { tasks, addTask, completeTask, removeTask } = useWorkspace(),
    [open, setOpen] = useState(false),
    [status, setStatus] = useState('all'),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(1),
    { modal, message } = App.useApp();
  const rows = tasks.filter(
    (t) => (status === 'all' || t.status === status) && (t.title + t.scope + t.owner).includes(search),
  );
  const save = (task: Omit<Task, 'id' | 'status'>) => {
    addTask(task);
    setOpen(false);
    message.success('任务已保存到当前浏览器');
  };
  const remove = (id: string) =>
    modal.confirm({
      title: '删除改进任务？',
      content: '删除后该任务及其记录将从当前浏览器移除，无法恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => removeTask(id),
    });

  return {
    tasks,
    addTask,
    completeTask,
    removeTask,
    open,
    setOpen,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    modal,
    message,
    rows,
    save,
    remove,
  };
}
function renderTasksPageView(model: ReturnType<typeof useTasksPageModel>) {
  const {
    tasks,
    addTask,
    completeTask,
    removeTask,
    open,
    setOpen,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    modal,
    message,
    rows,
    save,
    remove,
  } = model;
  return (
    <div className="page-content">
      <AnalysisPanel
        title="改进任务"
        description="任务统一保存在当前浏览器。清除浏览器数据后不会保留；尚未接入协同后台。"
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            新建改进任务
          </Button>
        }>
        {renderTasksPageViewPart1(model)}
        {rows.length ? renderTasksPageViewPart2(model) : <Empty description="暂无匹配任务" />}
        <Pagination
          current={page}
          pageSize={20}
          total={rows.length}
          onChange={setPage}
          showTotal={(total) => `共 ${total} 项任务`}
        />
      </AnalysisPanel>
      <Drawer title="新建改进任务" open={open} onClose={() => setOpen(false)} width={560} destroyOnHidden>
        <TaskForm onSubmit={save} />
      </Drawer>
    </div>
  );
}

function renderTasksPageViewPart1(model: ReturnType<typeof useTasksPageModel>) {
  const {
    tasks,
    addTask,
    completeTask,
    removeTask,
    open,
    setOpen,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    modal,
    message,
    rows,
    save,
    remove,
  } = model;
  return (
    <div className="toolbar">
      <Segmented
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: 'all', label: '全部任务' },
          { value: 'open', label: '进行中' },
          { value: 'done', label: '已完成' },
        ]}
      />
      <Input.Search
        aria-label="搜索任务"
        className="project-select"
        placeholder="任务 / 项目 / 负责人"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>
  );
}

function renderTasksPageViewPart2(model: ReturnType<typeof useTasksPageModel>) {
  const {
    tasks,
    addTask,
    completeTask,
    removeTask,
    open,
    setOpen,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    modal,
    message,
    rows,
    save,
    remove,
  } = model;
  return (
    <div className="task-list">
      {rows.slice((page - 1) * 20, page * 20).map((task) => (
        <article key={task.id} className="task-card">
          <div className="toolbar">
            <h3>{task.title}</h3>
            <Tag color={task.status === 'done' ? 'success' : 'processing'}>
              {task.status === 'done' ? '已完成' : '进行中'}
            </Tag>
          </div>
          <p>{task.scope}</p>
          <p className="helper-text">
            负责人：{task.owner} · 复盘日期：{task.due}
          </p>
          <p>{task.note}</p>
          <Space>
            {task.status === 'open' && <Button onClick={() => completeTask(task.id)}>标记完成</Button>}
            <Button danger onClick={() => remove(task.id)}>
              删除
            </Button>
          </Space>
        </article>
      ))}
    </div>
  );
}
