export type UserRole = 'admin' | 'moniteur' | 'client';

export interface NavItem {
  route: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

export const navItemsByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { route: '/dashboard', label: 'Tableau de bord', icon: 'dashboard', roles: ['admin'] },
    { route: '/courts', label: 'Terrains', icon: 'sports_tennis', roles: ['admin', 'moniteur', 'client'] },
    { route: '/reservations', label: 'Réservations', icon: 'calendar_today', roles: ['admin', 'moniteur', 'client'] },
    { route: '/users', label: 'Utilisateurs', icon: 'people', roles: ['admin'] },
    { route: '/settings', label: 'Paramètres', icon: 'settings', roles: ['admin'] },
  ],
  moniteur: [
    { route: '/dashboard', label: 'Tableau de bord', icon: 'dashboard', roles: ['admin', 'moniteur'] },
    { route: '/courts', label: 'Terrains', icon: 'sports_tennis', roles: ['admin', 'moniteur', 'client'] },
    { route: '/reservations', label: 'Réservations', icon: 'calendar_today', roles: ['admin', 'moniteur', 'client'] },
    { route: '/schedule', label: 'Emploi du temps', icon: 'schedule', roles: ['moniteur'] },
  ],
  client: [
    { route: '/dashboard', label: 'Accueil', icon: 'home', roles: ['client'] },
    { route: '/courts', label: 'Terrains', icon: 'sports_tennis', roles: ['admin', 'moniteur', 'client'] },
    { route: '/reservations', label: 'Mes Réservations', icon: 'calendar_today', roles: ['admin', 'moniteur', 'client'] },
    { route: '/profile', label: 'Profil', icon: 'person', roles: ['client'] },
  ],
};
