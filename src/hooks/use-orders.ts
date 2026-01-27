import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, onSnapshot, query, where, orderBy, getDoc } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { sendEmail } from '@/actions/send-email';

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
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  pickupLocation?: {
    id: string;
    name: string;
    address: string;
    contactNumber?: string;
  };
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
      const ordersQuery = query(collection(db, 'orders'));

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
          setLoading(false);
          setOrders([]);
          if (error.code !== 'permission-denied') {
            setError(error.message || 'Failed to load orders');
          }
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      console.error('useOrders error:', errorMessage);
      setError(null);
      setLoading(false);
      setOrders([]);
    }
  }, [user]);

  // Helper for sending email
  const sendOrderEmail = async (to: string | string[], subject: string, html: string) => {
    await sendEmail({ to, subject, html });
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: orderData.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });



      // Send Confirmation Email
      const itemsList = orderData.items.map(p => `<li>${p.name} (x${p.quantity}) - ₹${(p.price * p.quantity).toLocaleString('en-IN')}</li>`).join('');
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #6d28d9;">Order Confirmed!</h1>
          <p>Hi ${orderData.userName},</p>
          <p>Thank you for your order. We have received it and are processing it.</p>
          <h3>Order Details (Order #${docRef.id.slice(0, 8)})</h3>
          <ul>${itemsList}</ul>
          <p><strong>Total Amount: ₹${orderData.totalPrice.toLocaleString('en-IN')}</strong></p>
          ${orderData.deliveryAddress ? `<p>Shipping to: ${orderData.deliveryAddress}</p>` : ''}
          ${orderData.pickupLocation ? `<p>Pickup at: ${orderData.pickupLocation.name}</p>` : ''}
          <hr/>
          <p style="font-size: 12px; color: #666;">This is an automated email from AIREINO Shop.</p>
        </div>
      `;

      await sendOrderEmail(orderData.userEmail, `Order Confirmation: #${docRef.id.slice(0, 8)}`, emailHtml);

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

      // Fetch order to get user email
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order; // Partial data
        const userEmail = orderData.userEmail;
        const userName = orderData.userName;

        if (userEmail) {
          const emailHtml = `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1 style="color: #6d28d9;">Order Update</h1>
                    <p>Hi ${userName},</p>
                    <p>Your order <strong>#${orderId.slice(0, 8)}</strong> status has been updated to:</p>
                    <h2 style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">${status.toUpperCase()}</h2>
                    <p>You can view more details in your dashboard.</p>
                    ${notes ? `<p><strong>Note from Admin:</strong> ${notes}</p>` : ''}
                </div>
                `;
          await sendOrderEmail(userEmail, `Order Update: #${orderId.slice(0, 8)} is ${status}`, emailHtml);
        }
      }

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

  // NEW FUNCTION: Get orders for a specific user
  const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

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
      console.error('getUserOrders error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch user orders');
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getUserOrders,
  };
}
