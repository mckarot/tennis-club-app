// src/components/users/UserCard/UserCard.tsx

import { FC } from 'react';
import { motion } from 'framer-motion';
import type { User } from '../../../firebase/types';
import { RoleBadge } from '../RoleBadge/RoleBadge';
import { StatusIndicator } from '../StatusIndicator/StatusIndicator';
import { UserActionsMenu } from '../UserActionsMenu/UserActionsMenu';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.article
      role="article"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-surface rounded-xl p-4 shadow-sm border border-surface-container-highest"
    >
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center"
        >
          <span className="text-lg font-bold text-primary">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-base font-bold text-on-surface truncate">
            {user.name}
          </h3>
          <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge role={user.role} />
            <StatusIndicator status={user.status} />
          </div>
        </div>

        <UserActionsMenu
          onEdit={() => onEdit(user)}
          onDelete={() => onDelete(user)}
        />
      </div>
    </motion.article>
  );
};
