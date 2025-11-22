"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { JoinClubForm } from "@/components/join-club-form";
import { CreateAnnouncementForm } from "@/components/create-announcement-form";

export default function DashboardPage() {
  const { user, announcements } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const isAdmin = user?.role === 'admin';
  const isPending = user?.status === 'pending';
  const canUpload = user?.canUpload && !isAdmin;
  const displayName = user?.displayName || 'User';

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
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold">Welcome, {displayName}!</h1>

      {/* My Orders Section */}
      {user && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  My Orders
                </CardTitle>
                <CardDescription>Track your shop orders and delivery status</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading your orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-sm font-semibold">
                        Total: ₹{order.totalPrice.toLocaleString('en-IN')}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>

                    {order.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Note:</span> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <Button asChild>
                  <Link href="/shop">
                    Browse Shop
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Content Management</CardTitle>
            <CardDescription>Add new content to the AURA website.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Membership Pending</CardTitle>
            <CardDescription>Your application to become a full member is under review.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Once your application is approved by an admin, you will gain access to content creation tools and other member benefits. Thank you for your patience!</p>
          </CardContent>
        </Card>
      )}

      {user?.role === 'user' && !isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Become a Full Member</CardTitle>
            <CardDescription>Apply now to gain access to exclusive resources, project creation tools, and voting rights in the club.</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinClubForm />
          </CardContent>
        </Card>
      )}
      
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create Announcement</CardTitle>
            <CardDescription>Post an announcement that will be visible to all members on their dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAnnouncementForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements.length > 0 ? announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-lg bg-primary/10 border border-border/60">
              <h3 className="font-semibold">{ann.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No new announcements.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
