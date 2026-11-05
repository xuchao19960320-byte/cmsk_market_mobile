import { Button, DatePicker, Form, Input } from 'antd';
import type { Dayjs } from 'dayjs';
import type { Task } from '../../shared/types';
interface TaskValues {
  title: string;
  owner: string;
  scope: string;
  due: Dayjs;
  note: string;
}
interface Props {
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void;
}
export function TaskForm({ onSubmit }: Props) {
  const [form] = Form.useForm<TaskValues>();
  const submit = (values: TaskValues) => {
    onSubmit({ ...values, due: values.due.format('YYYY-MM-DD') });
    form.resetFields();
  };
  return (
    <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
      <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }, { max: 80 }]}>
        <Input maxLength={80} />
      </Form.Item>
      <Form.Item name="scope" label="关联项目或顾问" rules={[{ required: true, message: '请输入关联范围' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="owner" label="负责人" rules={[{ required: true, message: '请输入负责人' }]}>
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item name="due" label="复盘日期" rules={[{ required: true, message: '请选择日期' }]}>
        <DatePicker />
      </Form.Item>
      <Form.Item name="note" label="改进动作与验证方式" rules={[{ required: true, message: '请输入具体动作' }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        保存任务
      </Button>
    </Form>
  );
}
