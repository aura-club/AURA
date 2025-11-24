"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, Clock, Truck, Package } from "lucide-react";
import { useOrders, Order } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { usePermissions, showPermissionError } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { UpdateOrderStatusDialog } from "@/components/orders/update-order-status-dialog";

export default function OrdersManagementPage() {
  const { getAllOrders, updateOrderStatus, loading, error } = useOrders();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);

  // Redirect if no permission (only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user) {
      setHasCheckedPermissions(true);
      if (!permissions.canManageOrders) {
        router.push('/dashboard/access-denied');
      }
    }
  }, [authLoading, user, permissions.canManageOrders, router]);

  // Load all orders on mount
  useEffect(() => {
    if (permissions.canManageOrders && hasCheckedPermissions) {
      loadOrders();
    }
  }, [permissions.canManageOrders, hasCheckedPermissions]);

  const loadOrders = async () => {
    try {
      setPageLoading(true);
      const allOrders = await getAllOrders();
      setOrders(allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userPhone.includes(searchQuery) ||
        order.id.includes(searchQuery);
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

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
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-600';
      case 'processing':
        return 'bg-purple-500/20 text-purple-600';
      case 'delivered':
        return 'bg-green-500/20 text-green-600';
      case 'cancelled':
        return 'bg-red-500/20 text-red-600';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const handleStatusUpdate = async (newStatus: Order['status'], notes?: string) => {
    if (!permissions.canManageOrders) {
      toast(showPermissionError());
      return;
    }

    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, notes);
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
      setShowStatusDialog(false);
      await loadOrders();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = (order: Order) => {
    if (!permissions.canManageOrders) {
      toast(showPermissionError());
      return;
    }
    setSelectedOrder(order);
    setShowStatusDialog(true);
  };

  // Show loading while checking auth and permissions
  if (authLoading || !hasCheckedPermissions) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if no permission (prevents flash before redirect)
  if (!permissions.canManageOrders) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Orders Management</h1>
        <p className="text-muted-foreground mt-2">Manage and process customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, email, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pageLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Order ID</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-left py-2 px-2">Total</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{order.userName}</p>
                          <p className="text-xs text-muted-foreground">{order.userPhone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs">{order.items.length} item(s)</td>
                      <td className="py-3 px-2 font-semibold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${getStatusColor(order.status)} gap-1`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {order.createdAt.toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-2 space-x-2 flex">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedOrder && (
        <>
          <OrderDetailsDialog
            order={selectedOrder}
            isOpen={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
          <UpdateOrderStatusDialog
            order={selectedOrder}
            isOpen={showStatusDialog}
            onOpenChange={setShowStatusDialog}
            onStatusUpdate={handleStatusUpdate}
          />
        </>
      )}
    </div>
  );
}
