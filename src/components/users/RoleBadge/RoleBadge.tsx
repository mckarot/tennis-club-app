// src/components/users/RoleBadge/RoleBadge.tsx

import { FC } from 'react';
import { motion } from 'framer-motion';

type RoleType = 'ADMIN' | 'MONITEUR' | 'CLIENT';

interface RoleBadgeProps {
  role: RoleType;
}

const roleStyles: Record<RoleType, { bg: string; text: string }> = {
  ADMIN: { bg: 'bg-[#ffdbce]', text: 'text-[#9d431b]' },
  MONITEUR: { bg: 'bg-primary-fixed', text: 'text-primary' },
  CLIENT: { bg: 'bg-surface-container-highest', text: 'text-on-surface' },
};

export const RoleBadge: FC<RoleBadgeProps> = ({ role }) => {
  return (
    <motion.span
      role="status"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center px-3 py-1 rounded-full
        text-xs font-bold uppercase tracking-wide
        ${roleStyles[role].bg}
        ${roleStyles[role].text}
      `}
    >
      {role}
    </motion.span>
  );
};
