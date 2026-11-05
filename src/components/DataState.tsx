import { Alert, Button, Empty, Spin } from 'antd';
import type { ReactNode } from 'react';
interface Props {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  retry: () => void;
  children: ReactNode;
}
export function DataState({ loading, error, empty, retry, children }: Props) {
  if (loading)
    return (
      <div className="flex min-h-48 items-center justify-center" role="status">
        <Spin tip="加载中">
          <div className="p-8">正在读取分析数据</div>
        </Spin>
      </div>
    );
  if (error)
    return (
      <Alert
        className="data-state-error"
        type="error"
        showIcon
        message="数据加载失败"
        description={error}
        action={<Button onClick={retry}>重试</Button>}
      />
    );
  if (empty) return <Empty description="当前筛选范围暂无数据" />;
  return children;
}
