/**
 * DashboardLayout Component
 * 
 * Common layout wrapper for all dashboards (Admin, Client, Moniteur).
 * Provides fixed TopNavBar and Sidebar with proper spacing.
 * 
 * Specifications:
 * - TopNavBar: fixed top-0, h-16, glass-nav, backdrop-blur
 * - Sidebar: fixed left-0, w-64, bg-surface-container-low
 * - Main: ml-64 pt-20, p-8
 * 
 * @module @components/layout/DashboardLayout
 */

import React, { type ReactNode } from 'react';
import { TopNavBar } from '../TopNavBar/TopNavBar';
import { Sidebar } from '../Sidebar/Sidebar';
import type { UserRole } from '../../../types/user.types';

export interface DashboardLayoutProps {
  /** Dashboard role (admin, client, moniteur) */
  role: UserRole;
  /** Page content */
  children: ReactNode;
  /** Additional CSS classes for main content */
  className?: string;
}

/**
 * DashboardLayout component
 */
export function DashboardLayout({
  role,
  children,
  className = '',
}: DashboardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-surface">
      {/* TopNavBar - Fixed */}
      <TopNavBar role={role} />
      
      {/* Sidebar - Fixed Left */}
      <Sidebar role={role} />
      
      {/* Main Content */}
      <main className={`ml-64 pt-20 p-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
