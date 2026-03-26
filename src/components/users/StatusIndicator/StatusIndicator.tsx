// src/components/users/StatusIndicator/StatusIndicator.tsx

import { FC } from 'react';

type StatusType = 'online' | 'away' | 'inactive';

interface StatusIndicatorProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { emoji: string; label: string }> = {
  online: { emoji: '🟢', label: 'Online' },
  away: { emoji: '🟡', label: 'Away' },
  inactive: { emoji: '⚫', label: 'Inactive' },
};

export const StatusIndicator: FC<StatusIndicatorProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant"
    >
      <span aria-hidden="true">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
};
