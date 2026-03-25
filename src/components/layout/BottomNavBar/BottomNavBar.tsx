export interface BottomNavBarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNavBar({ activeRoute, onNavigate }: BottomNavBarProps) {
  const navItems = [
    { route: '/dashboard', label: 'Accueil', icon: 'home' },
    { route: '/courts', label: 'Terrains', icon: 'sports_tennis' },
    { route: '/reservations', label: 'Réservations', icon: 'calendar_today' },
    { route: '/profile', label: 'Profil', icon: 'person' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl rounded-t-3xl border-t border-surface-container-highest lg:hidden"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              aria-label={item.label}
              aria-current={activeRoute === item.route ? 'page' : undefined}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none
                ${
                  activeRoute === item.route
                    ? 'text-primary scale-105'
                    : 'text-on-surface/60 hover:text-on-surface hover:scale-105'
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-body text-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
