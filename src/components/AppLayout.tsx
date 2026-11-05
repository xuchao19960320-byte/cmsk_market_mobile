import { Button, Space, Tag } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { NavLink, Outlet } from 'react-router-dom';
import { GlobalFilters } from './GlobalFilters';
import { useWorkspace } from '../stores/useWorkspace';
export function AppLayout() {
  const theme = useWorkspace((s) => s.theme),
    toggleTheme = useWorkspace((s) => s.toggleTheme);
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h3l3-9 6 18 3-9h5" />
            </svg>
          </span>
          营销力分析
        </div>
        <nav aria-label="主导航">
          {[
            ['/overview', '首页'],
            ['/advisor', '顾问多维分析'],
            ['/actions', '改进任务'],
            ['/dictionary', '指标口径'],
          ].map(([path, label]) => (
            <NavLink key={path} to={path}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Space>
          <Tag>演示原型</Tag>
          <Button
            aria-label="切换明暗主题"
            icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
            onClick={toggleTheme}
          />
        </Space>
      </header>
      <div className="app-scroll">
        <GlobalFilters />
        <Outlet />
        <footer className="app-footer">招商蛇口 · 营销力分析　示例数据仅用于交互评审，未接入业务系统</footer>
      </div>
    </div>
  );
}
