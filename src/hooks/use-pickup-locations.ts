import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  contactNumber?: string;
  isActive: boolean;
}

export function usePickupLocations() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pickupLocations'), where('isActive', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PickupLocation));
      setLocations(locs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { locations, loading };
}
