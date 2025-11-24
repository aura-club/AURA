"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, Order } from "@/hooks/use-orders";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { getUserOrders, loading: hookLoading } = useOrders();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [user, router]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'processing':
        return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'delivered':
        return 'bg-green-500/20 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 border-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusDescription = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Your order has been placed and is awaiting confirmation.';
      case 'confirmed':
        return 'Your order has been confirmed and will be processed soon.';
      case 'processing':
        return 'Your order is being prepared for delivery/pickup.';
      case 'delivered':
        return 'Your order has been delivered/picked up successfully.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
          <Package className="h-7 w-7 md:h-8 md:w-8" />
          My Orders
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Track your shop orders and delivery status
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading your orders...</div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base md:text-lg font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <Badge className={`${getStatusColor(order.status)} border gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Placed on {order.createdAt.toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl md:text-2xl font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{order.items.length} item(s)</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status Timeline */}
                <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm font-medium mb-2">Order Status</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {getStatusDescription(order.status)}
                  </p>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-semibold">Delivery Method</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      {order.deliveryMethod === 'delivery' ? (
                        <>
                          <Truck className="h-4 w-4" />
                          <span>Home Delivery</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>Pickup</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-semibold">Contact</p>
                    <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{order.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{order.userEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address or Pickup Location */}
                {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
                  <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                )}

                {order.deliveryMethod === 'pickup' && order.pickupLocation && (
                  <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pickup Location
                    </p>
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{order.pickupLocation.name}</p>
                      <p>{order.pickupLocation.address}</p>
                      {order.pickupLocation.contactNumber && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {order.pickupLocation.contactNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items Toggle */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full justify-between"
                  >
                    <span className="text-xs md:text-sm font-medium">
                      View Items ({order.items.length})
                    </span>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Expanded Items */}
                  {expandedOrder === order.id && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs md:text-sm font-semibold ml-3">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t font-semibold">
                        <span className="text-sm md:text-base">Total</span>
                        <span className="text-base md:text-lg">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm font-semibold mb-1 text-blue-900 dark:text-blue-100">Admin Note</p>
                    <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 md:py-16">
            <Package className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
