/**
 * useClientDashboard Hook
 * 
 * Dashboard business logic + Firebase integration
 * Handles stats, court grid, upcoming reservations, maintenance notes, and location data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
  type Query,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import { useAuth } from '../hooks/useAuth';
import type {
  UseClientDashboardReturn,
  DashboardStats,
  CourtGridCell,
  CourtCellState,
  UpcomingReservation,
  MaintenanceNote,
  LocationData,
} from '../../types/client-dashboard.types';
import type { Court, CourtType, CourtStatus } from '../../types/court.types';
import type { Reservation, ReservationStatus } from '../../types/reservation.types';

// ==========================================
// CONSTANTS
// ==========================================

const GRID_START_HOUR = 6;
const GRID_END_HOUR = 22;
const GRID_TOTAL_ROWS = 8; // 6h-22h = 16 hours, but we show 8 rows per PNG
const GRID_TOTAL_COURTS = 7; // Per PNG audit

const LOCATION_DATA: LocationData = {
  address: '123 Avenue du Tennis',
  city: 'Le François',
  postalCode: '97240',
  phone: '+596 596 123 456',
  email: 'contact@tennis-club-du-francois.fr',
  mapUrl: 'https://maps.google.com/?q=tennis+club+le+françois',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get court type from court ID or number
 */
function getCourtType(courtNumber: number): CourtType {
  // Courts 1-4 are Quick, 5-7 are Terre (example logic)
  return courtNumber <= 4 ? 'Quick' : 'Terre';
}

/**
 * Determine cell state based on reservations
 * Returns 'confirmed-quick' or 'confirmed-terre' based on court type
 */
function determineCellState(
  hour: number,
  reservations: Reservation[],
  courtId: string,
  courtType: CourtType
): CourtCellState {
  const courtReservations = reservations.filter((r) => r.court_id === courtId);

  for (const reservation of courtReservations) {
    const reservationStartHour = reservation.start_time.toDate().getHours();
    const reservationEndHour = reservation.end_time.toDate().getHours();

    if (hour >= reservationStartHour && hour < reservationEndHour) {
      switch (reservation.status) {
        case 'confirmed':
        case 'completed':
          return courtType === 'Quick' ? 'confirmed-quick' : 'confirmed-terre';
        case 'pending':
        case 'pending_payment':
          return 'available'; // Show as available until confirmed
        case 'cancelled':
          return 'available';
        default:
          return 'available';
      }
    }
  }

  return 'available';
}

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// ==========================================
// MAIN HOOK
// ==========================================

export function useClientDashboard(): UseClientDashboardReturn {
  const { user } = useAuth();
  
  // State
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    maintenanceCount: 0,
    availableSlots: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [courtGrid, setCourtGrid] = useState<CourtGridCell[][]>([]);
  const [gridLoading, setGridLoading] = useState(true);

  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [upcomingReservationsWithDetails, setUpcomingReservationsWithDetails] = useState<UpcomingReservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  
  const [maintenanceNote, setMaintenanceNote] = useState<MaintenanceNote | null>(null);
  const [location] = useState<LocationData>(LOCATION_DATA);
  const [error, setError] = useState<Error | null>(null);
  
  // Get current user ID
  const userId: string = user?.id || '';
  
  // ==========================================
  // FETCH COURTS
  // ==========================================
  
  useEffect(() => {
    if (!userId) {
      setGridLoading(false);
      return;
    }
    
    let unsubscribeCourts: Unsubscribe | null = null;
    
    const fetchCourts = async () => {
      try {
        const courtsQuery = query(
          collection(getDbInstance(), 'courts'),
          where('is_active', '==', true)
        );
        
        unsubscribeCourts = onSnapshot(
          courtsQuery,
          (snapshot: QuerySnapshot<DocumentData>) => {
            const courts: Court[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name,
                number: data.number,
                type: data.type,
                status: data.status,
                is_active: data.is_active,
                surface: data.surface,
                lighting: data.lighting,
                price_per_hour: data.price_per_hour,
              };
            });

            // Build grid from courts
            const grid = buildCourtGrid(courts);
            setCourtGrid(grid);
            setGridLoading(false);
          },
          (err: Error) => {
            console.error('[useClientDashboard] Error fetching courts:', err);
            setError(err instanceof Error ? err : new Error('Failed to load courts'));
            setGridLoading(false);
          }
        );
      } catch (err) {
        console.error('[useClientDashboard] Error setting up courts listener:', err);
        setError(err instanceof Error ? err : new Error('Failed to load courts'));
        setGridLoading(false);
      }
    };
    
    fetchCourts();
    
    return () => {
      if (unsubscribeCourts) {
        unsubscribeCourts();
      }
    };
  }, [userId]);
  
  // ==========================================
  // FETCH RESERVATIONS
  // ==========================================
  
  useEffect(() => {
    if (!userId) {
      setReservationsLoading(false);
      return;
    }
    
    let unsubscribeReservations: Unsubscribe | null = null;
    
    try {
      const now = Timestamp.now();
      
      const reservationsQuery = query(
        collection(getDbInstance(), 'reservations'),
        where('user_id', '==', userId),
        where('start_time', '>=', now),
        orderBy('start_time', 'asc')
      );
      
      unsubscribeReservations = onSnapshot(
        reservationsQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const reservations: Reservation[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              court_id: data.court_id,
              user_id: data.user_id,
              start_time: data.start_time,
              end_time: data.end_time,
              status: data.status,
              type: data.type,
              created_at: data.created_at,
              updated_at: data.updated_at,
              notes: data.notes,
              equipment_rented: data.equipment_rented,
              total_price: data.total_price,
              payment_status: data.payment_status,
            };
          });

          setUpcomingReservations(reservations);
          setReservationsLoading(false);
        },
        (err: Error) => {
          console.error('[useClientDashboard] Error fetching reservations:', err);
          setError(err instanceof Error ? err : new Error('Failed to load reservations'));
          setReservationsLoading(false);
        }
      );
    } catch (err) {
      console.error('[useClientDashboard] Error setting up reservations listener:', err);
      setError(err instanceof Error ? err : new Error('Failed to load reservations'));
      setReservationsLoading(false);
    }
    
    return () => {
      if (unsubscribeReservations) {
        unsubscribeReservations();
      }
    };
  }, [userId]);

  // ==========================================
  // FETCH RESERVATION DETAILS (Court + Client)
  // ==========================================

  useEffect(() => {
    if (upcomingReservations.length === 0) {
      setUpcomingReservationsWithDetails([]);
      return;
    }

    const fetchDetails = async () => {
      try {
        const details: UpcomingReservation[] = await Promise.all(
          upcomingReservations.map(async (reservation): Promise<UpcomingReservation> => {
            const court = await fetchCourtDetails(reservation.court_id);
            const client = await fetchClientDetails(reservation.user_id);

            return {
              id: reservation.id,
              courtId: reservation.court_id,
              courtNumber: court?.number || 0,
              courtName: court?.name || `Court ${court?.number || '?'}`,
              courtType: court?.type || 'Quick',
              userId: reservation.user_id,
              userName: client?.name || 'Client',
              startTime: reservation.start_time,
              endTime: reservation.end_time,
              status: reservation.status,
              type: reservation.type as 'location_libre' | 'cours_collectif' | 'cours_private',
              notes: reservation.notes,
              equipment_rented: reservation.equipment_rented,
              total_price: reservation.total_price,
              payment_status: reservation.payment_status,
            };
          })
        );

        setUpcomingReservationsWithDetails(details);
      } catch (err) {
        console.error('[useClientDashboard] Error fetching reservation details:', err);
      }
    };

    fetchDetails();
  }, [upcomingReservations]);
  
  // ==========================================
  // CALCULATE STATS
  // ==========================================
  
  useEffect(() => {
    const calculateStats = async () => {
      try {
        setStatsLoading(true);

        // Count active bookings (confirmed or pending for this user)
        const activeBookings = upcomingReservationsWithDetails.filter(
          (r) => r.status === 'confirmed' || r.status === 'pending'
        ).length;

        // Count maintenance courts - using getDocs for single fetch
        const courtsQuery = query(
          collection(getDbInstance(), 'courts'),
          where('status', '==', 'maintenance')
        );

        let maintenanceCount = 0;
        try {
          const maintenanceSnapshot = await getDocs(courtsQuery);
          maintenanceCount = maintenanceSnapshot.size;
        } catch (err) {
          console.error('[Stats] Error fetching maintenance courts:', err);
          // Keep default 0
        }

        // Count available slots (simplified: total slots - booked slots)
        const totalSlots = GRID_TOTAL_COURTS * GRID_TOTAL_ROWS;
        const bookedSlots = courtGrid.reduce((acc, courtCells) => {
          return acc + courtCells.filter((cell) => cell.state !== 'available').length;
        }, 0);
        const availableSlots = totalSlots - bookedSlots;

        setStats({
          activeBookings,
          maintenanceCount,
          availableSlots,
        });

        setStatsLoading(false);
      } catch (err) {
        console.error('[useClientDashboard] Error calculating stats:', err);
        setStatsLoading(false);
      }
    };

    calculateStats();
  }, [upcomingReservationsWithDetails, courtGrid]);
  
  // ==========================================
  // FETCH MAINTENANCE NOTE
  // ==========================================
  
  useEffect(() => {
    let unsubscribeMaintenance: Unsubscribe | null = null;
    
    try {
      const maintenanceQuery = query(
        collection(getDbInstance(), 'maintenance_notes'),
        where('expiresAt', '>=', Timestamp.now()),
        orderBy('createdAt', 'desc'),
        orderBy('expiresAt', 'desc')
      );
      
      unsubscribeMaintenance = onSnapshot(
        maintenanceQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            setMaintenanceNote({
              id: doc.id,
              title: data.title,
              message: data.message,
              severity: data.severity,
              is_active: data.is_active ?? true,
              createdAt: data.createdAt,
              expiresAt: data.expiresAt,
              affectedCourts: data.affectedCourts,
            });
          } else {
            setMaintenanceNote(null);
          }
        },
        (err: Error) => {
          console.error('[useClientDashboard] Error fetching maintenance note:', err);
          // Non-critical error, don't set error state
        }
      );
    } catch (err) {
      console.error('[useClientDashboard] Error setting up maintenance note listener:', err);
    }
    
    return () => {
      if (unsubscribeMaintenance) {
        unsubscribeMaintenance();
      }
    };
  }, []);
  
  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  
  /**
   * Build court grid from courts data
   */
  function buildCourtGrid(courts: Court[]): CourtGridCell[][] {
    // For now, return empty grid with structure
    // In real implementation, this would fetch reservations and build the grid
    return courts.map((court) => {
      const cells: CourtGridCell[] = [];

      for (let row = 0; row < GRID_TOTAL_ROWS; row++) {
        const hour = GRID_START_HOUR + row * 2; // 6, 8, 10, 12, 14, 16, 18, 20

        // Determine state based on court status and reservations
        let state: CourtCellState = 'available';
        
        if (court.status === 'maintenance') {
          state = 'maintenance';
        } else {
          // Would check reservations here in full implementation
          state = 'available';
        }

        cells.push({
          id: `${court.id}-${hour}`,
          courtId: court.id,
          courtNumber: court.number,
          courtName: court.name,
          courtType: court.type,
          date: new Date(),
          hour,
          state,
        });
      }

      return cells;
    });
  }
  
  /**
   * Fetch court details by ID
   */
  async function fetchCourtDetails(courtId: string): Promise<Court | null> {
    try {
      const courtsQuery = query(
        collection(getDbInstance(), 'courts'),
        where('__name__', '==', courtId)
      );

      const snapshot = await getDocs(courtsQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          number: data.number,
          type: data.type,
          status: data.status,
          is_active: data.is_active,
          surface: data.surface,
          lighting: data.lighting,
          price_per_hour: data.price_per_hour,
        };
      }
      return null;
    } catch (error: unknown) {
      console.error('[fetchCourtDetails] Error:', error);
      return null;
    }
  }

  /**
   * Fetch client details by ID
   */
  async function fetchClientDetails(clientId: string): Promise<{ id: string; name: string } | null> {
    try {
      const usersQuery = query(
        collection(getDbInstance(), 'users'),
        where('__name__', '==', clientId)
      );

      const snapshot = await getDocs(usersQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const userData = doc.data();
        return {
          id: doc.id,
          name: userData.name || 'Client',
        };
      }
      return null;
    } catch (error: unknown) {
      console.error('[fetchClientDetails] Error:', error);
      return null;
    }
  }
  
  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  
  const handleBookNow = useCallback(() => {
    // Navigate to booking page
    console.log('[useClientDashboard] Book Now clicked');
    // In real implementation: navigate('/booking');
  }, []);
  
  const handleViewSchedule = useCallback(() => {
    // Navigate to schedule page
    console.log('[useClientDashboard] View Schedule clicked');
    // In real implementation: navigate('/schedule');
  }, []);
  
  const handleCellClick = useCallback((cell: CourtGridCell) => {
    console.log('[useClientDashboard] Cell clicked:', cell);
    // In real implementation: open booking modal or navigate to booking page
  }, []);
  
  const handleReservationClick = useCallback((reservation: UpcomingReservation) => {
    console.log('[useClientDashboard] Reservation clicked:', reservation);
    // In real implementation: open reservation details modal
  }, []);
  
  // ==========================================
  // RETURN
  // ==========================================
  
  return {
    // Stats
    stats,
    statsLoading,
    
    // Court grid
    courtGrid,
    gridLoading,
    
    // Upcoming reservations
    upcomingReservations: upcomingReservationsWithDetails,
    reservationsLoading,
    
    // Maintenance note
    maintenanceNote,
    
    // Location
    location,
    
    // User
    userName: user?.name || 'Client',
    
    // Actions
    handleBookNow,
    handleViewSchedule,
    handleCellClick,
    handleReservationClick,
    
    // Errors
    error,
  };
}
