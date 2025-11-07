import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from './use-auth';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a query for the orders collection
      const ordersQuery = query(collection(db, 'orders'));

      // Use onSnapshot with the query
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          try {
            const allOrders = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              } as Order;
            });

            // Filter to only show current user's orders
            const userOrders = allOrders.filter(order => order.userId === user.uid);
            setOrders(userOrders);
            setLoading(false);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing orders:', parseError);
            setError('Error parsing orders data');
            setLoading(false);
          }
        },
        (error: any) => {
          console.error('Error loading orders:', error);
          // Don't show error - just silently fail and use empty orders
          setLoading(false);
          setOrders([]);
          // Only set error if it's not permission-denied
          if (error.code !== 'permission-denied') {
            setError(error.message || 'Failed to load orders');
          }
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      console.error('useOrders error:', errorMessage);
      setError(null); // Don't show errors for initialization issues
      setLoading(false);
      setOrders([]);
    }
  }, [user]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], notes?: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
        ...(notes && { notes }),
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const getAllOrders = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'orders')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Order;
      });
    } catch (err) {
      console.error('getAllOrders error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch orders');
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    getAllOrders,
  };
}
