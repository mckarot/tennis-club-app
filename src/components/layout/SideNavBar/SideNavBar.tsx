import type { UserRole } from './SideNavBar.types';
import { navItemsByRole } from './SideNavBar.types';

export interface SideNavBarProps {
  userRole: UserRole;
  activeRoute: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
}

export function SideNavBar({
  userRole,
  activeRoute,
  onNavigate,
  collapsed = false,
}: SideNavBarProps) {
  const navItems = navItemsByRole[userRole] || navItemsByRole.client;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-primary-fixed border-r border-surface-container-highest transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } hidden lg:block`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-surface-container-highest">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">sports_tennis</span>
          {!collapsed && (
            <span className="font-headline text-headline-sm font-bold text-primary">
              Tennis Club
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            aria-label={item.label}
            aria-current={activeRoute === item.route ? 'page' : undefined}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none
              ${
                activeRoute === item.route
                  ? 'bg-primary text-white'
                  : 'text-on-surface hover:bg-surface-container-highest/50 hover:translate-x-1'
              }
              ${collapsed ? 'justify-center hover:translate-x-0' : ''}
            `}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!collapsed && <span className="font-body text-body">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-container-highest">
          <div className="flex items-center gap-3 text-on-surface/60">
            <span className="material-symbols-outlined text-sm">info</span>
            <span className="font-body text-body-sm">v1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
}
