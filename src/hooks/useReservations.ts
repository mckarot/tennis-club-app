import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Reservation } from '../types/reservation.types';

export interface CreateReservationInput {
  court_id: string;
  user_id: string;
  moniteur_id?: string;
  start_time: Date;
  end_time: Date;
  type: Reservation['type'];
  status: Reservation['status'];
  title?: string;
  description?: string;
  participants?: number;
  is_paid?: boolean;
}

export interface UseReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
  createReservation: (input: CreateReservationInput) => Promise<string>;
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to reservations with onSnapshot
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(getDbInstance(), 'reservations'),
      orderBy('start_time')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          const reservation: Reservation = {
            id: doc.id,
            court_id: docData.court_id,
            user_id: docData.user_id,
            moniteur_id: docData.moniteur_id,
            start_time: docData.start_time,
            end_time: docData.end_time,
            type: docData.type,
            status: docData.status,
            title: docData.title,
            description: docData.description,
            participants: docData.participants,
            is_paid: docData.is_paid,
            created_at: docData.created_at,
            updated_at: docData.updated_at,
          };
          return reservation;
        });
        setReservations(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Firestore error'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Create reservation
  const createReservation = async (input: CreateReservationInput): Promise<string> => {
    try {
      const docRef = await addDoc(collection(getDbInstance(), 'reservations'), {
        ...input,
        start_time: Timestamp.fromDate(input.start_time),
        end_time: Timestamp.fromDate(input.end_time),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      console.error('[createReservation] Error:', err);
      throw err;
    }
  };

  // Update reservation
  const updateReservation = async (id: string, data: Partial<Reservation>): Promise<void> => {
    try {
      const ref = doc(getDbInstance(), 'reservations', id);
      await updateDoc(ref, {
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (err) {
      console.error('[updateReservation] Error:', err);
      throw err;
    }
  };

  // Delete reservation
  const deleteReservation = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(getDbInstance(), 'reservations', id));
    } catch (err) {
      console.error('[deleteReservation] Error:', err);
      throw err;
    }
  };

  return {
    reservations,
    isLoading,
    error,
    createReservation,
    updateReservation,
    deleteReservation,
  };
}
