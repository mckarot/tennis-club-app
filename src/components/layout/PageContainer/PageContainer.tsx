import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  withSidebar?: boolean;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  withSidebar = true,
  sidebarCollapsed = false,
  className = '',
}: PageContainerProps) {
  const sidebarOffset = withSidebar ? 'lg:ml-64' : '';
  const collapsedOffset = sidebarCollapsed && withSidebar ? 'lg:ml-16' : '';

  return (
    <main
      className={`
        min-h-screen bg-surface
        pt-16 pb-24 lg:pb-8
        ${sidebarOffset}
        ${collapsedOffset}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </main>
  );
}
