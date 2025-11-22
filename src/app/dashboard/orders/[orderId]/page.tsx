"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!loading && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [orders, orderId, loading]);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      confirmed: { icon: CheckCircle, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
      processing: { icon: Truck, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Processing" },
      delivered: { icon: Package, color: "bg-green-100 text-green-800 border-green-200", label: "Delivered" },
      cancelled: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border font-medium`} variant="outline">
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-amber-600 mt-3 p-2 bg-amber-50 rounded">
                  💳 Cash on Delivery
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.userName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.userEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.userPhone}</p>
              </div>
            </div>

            {order.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <p className="text-sm p-3 bg-muted rounded-lg">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline/Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Order Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-start gap-4 ${order.status === 'pending' ? 'text-yellow-700' : 'text-muted-foreground'}`}>
              <Clock className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Order Placed - Pending</p>
                <p className="text-sm text-muted-foreground">Your order has been received and is awaiting confirmation</p>
              </div>
            </div>

            <div className={`flex items-start gap-4 ${order.status === 'confirmed' ? 'text-blue-700' : 'text-muted-foreground'}`}>
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-muted-foreground">Your order has been confirmed by the admin</p>
              </div>
            </div>

            <div className={`flex items-start gap-4 ${order.status === 'processing' ? 'text-purple-700' : 'text-muted-foreground'}`}>
              <Truck className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Processing</p>
                <p className="text-sm text-muted-foreground">Your order is being prepared for delivery</p>
              </div>
            </div>

            <div className={`flex items-start gap-4 ${order.status === 'delivered' ? 'text-green-700' : 'text-muted-foreground'}`}>
              <Package className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Delivered</p>
                <p className="text-sm text-muted-foreground">Your order has been delivered successfully</p>
              </div>
            </div>

            {order.status === 'cancelled' && (
              <div className="flex items-start gap-4 text-red-700">
                <XCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">This order has been cancelled</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        {order.status === 'pending' && (
          <Button variant="outline" className="flex-1" disabled>
            Contact Support
          </Button>
        )}
      </div>
    </div>
  );
}
