import {
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  XCircle,
} from 'lucide-react';

const priorityConfig = {
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  EMERGENCY: { label: 'Emergency', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700', icon: ArrowUp },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', icon: Minus },
  LOW: { label: 'Low', color: 'bg-green-100 text-green-700', icon: ArrowDown },
};

const statusConfig = {
  AUTO_RESOLVED: { label: 'Auto Resolved', color: 'bg-teal-light text-teal-dark', icon: CheckCircle2 },
  ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  OFFICIAL_RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: UserCheck },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.LOW;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} /> {config.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.AUTO_RESOLVED;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} /> {config.label}
    </span>
  );
}

