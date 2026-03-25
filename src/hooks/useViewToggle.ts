import { useState, useCallback } from 'react';
import type { ViewMode } from '../components/reservations/ViewToggle/ViewToggle.types';

export interface UseViewToggleReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isToday: boolean;
  isWeekly: boolean;
  toggleView: () => void;
}

export function useViewToggle(initialMode: ViewMode = 'today'): UseViewToggleReturn {
  const [viewMode, setViewModeState] = useState<ViewMode>(initialMode);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const toggleView = useCallback(() => {
    setViewModeState((prev) => (prev === 'today' ? 'weekly' : 'today'));
  }, []);

  return {
    viewMode,
    setViewMode,
    isToday: viewMode === 'today',
    isWeekly: viewMode === 'weekly',
    toggleView,
  };
}
