import { AuditCommandCenter } from './AuditCommandCenter';
import { PrototypeStatus } from './PrototypeStatus';
import { useEffect, useState } from 'react';
import { fetchWorkOrders, type WorkOrder } from '@/services/auditService';

export function GovernanceCenter() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  useEffect(() => { void fetchWorkOrders().then(setOrders); }, []);
  return <div className="space-y-4 sm:space-y-6"><PrototypeStatus /><AuditCommandCenter workOrders={orders} /></div>;
}
