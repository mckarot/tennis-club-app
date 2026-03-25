/**
 * Court components barrel export
 *
 * Phase 5: Court Components (12 components)
 * - Core Grid (6): CourtGrid, TimeSlotCell, CourtHeader, TimeColumn, ViewToggle, AvailabilityLegend
 * - Court Cards (4): CourtCard, CourtCardClient, StatusBadge, SurfacePreview
 * - Upcoming Panel (2): UpcomingPanel, ReservationCard
 */

// Core Grid Components
export { CourtGrid } from './CourtGrid/CourtGrid';
export type { CourtGridProps } from './CourtGrid/CourtGrid.types';
export type {
  GridViewMode,
  TimeSlotState,
  GridCell,
  CourtHeaderProps,
  TimeColumnProps,
  ViewToggleProps,
  AvailabilityLegendProps,
  LegendItem,
  TimeSlotStyleConfig,
} from './CourtGrid/CourtGrid.types';

export { CourtHeader } from './CourtHeader/CourtHeader';
export type { CourtHeaderProps } from './CourtHeader/CourtHeader.types';

export { TimeColumn } from './TimeColumn/TimeColumn';
export type { TimeColumnProps } from './TimeColumn/TimeColumn.types';

export { ViewToggle } from './ViewToggle/ViewToggle';
export type { ViewToggleProps } from './ViewToggle/ViewToggle.types';

export { AvailabilityLegend } from './AvailabilityLegend/AvailabilityLegend';
export type { AvailabilityLegendProps, LegendItem } from './AvailabilityLegend/AvailabilityLegend.types';

// TimeSlotCell
export { TimeSlotCell } from './TimeSlotCell/TimeSlotCell';
export type { TimeSlotCellProps } from './TimeSlotCell/TimeSlotCell.types';
export type { TimeSlotState } from './TimeSlotCell/TimeSlotCell.types';
export { timeSlotStateStyles, getTimeSlotStyle, stateLabels, stateIcons } from './TimeSlotCell/TimeSlotCell.types';

// Court Cards
export { CourtCard } from './CourtCard/CourtCard';
export type { CourtCardProps } from './CourtCard/CourtCard';

export { CourtCardAdmin } from './CourtCard/CourtCardAdmin';
export type { CourtCardAdminProps } from './CourtCard/CourtCardAdmin.types';
export type { AdminCourtStatus, StatusBadgeConfig } from './CourtCard/CourtCardAdmin.types';
export { adminStatusConfig, mapCourtStatusToAdmin } from './CourtCard/CourtCardAdmin.types';

export { CourtCardClient } from './CourtCard/CourtCardClient';
export type { CourtCardClientProps } from './CourtCard/CourtCardClient.types';
export { clientStatusConfig } from './CourtCard/CourtCardClient.types';

export { StatusBadge } from './StatusBadge/StatusBadge';
export type { StatusBadgeProps, StatusBadgeVariant } from './StatusBadge/StatusBadge.types';
export { statusBadgeConfig, statusBadgeSizes } from './StatusBadge/StatusBadge.types';

export { SurfacePreview } from './SurfacePreview/SurfacePreview';
export type { SurfacePreviewProps } from './SurfacePreview/SurfacePreview.types';
export { surfaceTextureConfig, courtTypeColors, surfacePreviewSizes } from './SurfacePreview/SurfacePreview.types';

// Loading
export { LoadingGrid } from './LoadingGrid/LoadingGrid';
