import { AuditCommandCenter } from './AuditCommandCenter';
import { useEffect, useState } from 'react';
import { fetchWorkOrders, type WorkOrder } from '@/services/auditService';

export function GovernanceCenter() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  useEffect(() => { void fetchWorkOrders().then(setOrders); }, []);
  return <AuditCommandCenter workOrders={orders} />;
}
