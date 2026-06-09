import { Card, Empty } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';

const titles: Record<string, string> = {
  vehicles: '车辆管理',
  drivers: '司机管理',
  invoices: '发票查阅',
  finance: '财务管理',
  config: '运营配置',
  analytics: '数据分析与报表',
  system: '系统管理',
};

interface Props {
  module: string;
}

export default function Placeholder({ module }: Props) {
  const title = titles[module] || module;
  return (
    <Card style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Empty
        icon={<IconExclamationCircle style={{ fontSize: 64, color: '#c9cdd4' }} />}
        description={`${title}模块正在开发中`}
      />
    </Card>
  );
}
