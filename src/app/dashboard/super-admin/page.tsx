"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, Settings } from "lucide-react";
import { UpdateRoleSelect } from "@/components/update-role-select";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AdminPermissions {
  canDelete: boolean;
  canManageMembers: boolean;
  canManageShop: boolean;
  canApproveSubmissions: boolean;
  canManageOrders: boolean;
}

export default function SuperAdminPage() {
  const { user, users } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [updatingPermissions, setUpdatingPermissions] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'super_admin') {
    return <div className="flex h-screen items-center justify-center">Access Denied</div>;
  }

  // Filter only admins (exclude super_admins, members, and regular users)
  const adminUsers = useMemo(() => {
    return users
      .filter(u => u.role === 'admin')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const updatePermission = async (
    userEmail: string,
    permissionKey: keyof AdminPermissions,
    value: boolean
  ) => {
    setUpdatingPermissions(userEmail);
    try {
      const userDoc = doc(db, 'users', userEmail);
      await updateDoc(userDoc, {
        [`permissions.${permissionKey}`]: value,
      });
      
      toast({
        title: "Permission Updated",
        description: `Permission ${value ? 'granted' : 'revoked'}. The affected admin should refresh their page to see changes.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setUpdatingPermissions(null);
    }
  };

  const getPermissions = (admin: any): AdminPermissions => {
    return {
      canDelete: admin.permissions?.canDelete === true,
      canManageMembers: admin.permissions?.canManageMembers === true,
      canManageShop: admin.permissions?.canManageShop === true,
      canApproveSubmissions: admin.permissions?.canApproveSubmissions === true,
      canManageOrders: admin.permissions?.canManageOrders === true,
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="h-8 w-8" />
          Super Admin: Manage Admin Permissions
        </h1>
        <p className="text-muted-foreground mt-2">
          Control permissions for admin users. Super admins have all permissions by default.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Users ({adminUsers.length})
          </CardTitle>
          <CardDescription>
            Configure granular permissions for each admin. Toggle permissions on/off as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length > 0 ? (
            <div className="space-y-6">
              {adminUsers.map((admin) => {
                const permissions = getPermissions(admin);
                const isUpdating = updatingPermissions === admin.email;

                return (
                  <Card key={admin.email} className="border-2">
                    <CardContent className="pt-6">
                      {/* Admin Header */}
                      <div className="flex items-start justify-between mb-6 pb-4 border-b">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{admin.name}</h3>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            Admin
                          </span>
                          <UpdateRoleSelect userEmail={admin.email} currentRole={admin.role} />
                        </div>
                      </div>

                      {/* Permission Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Can Delete Content */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Delete Content</p>
                            <p className="text-xs text-muted-foreground">Remove posts, projects, resources</p>
                          </div>
                          <Switch
                            checked={permissions.canDelete}
                            onCheckedChange={(checked) =>
                              updatePermission(admin.email, 'canDelete', checked)
                            }
                            disabled={isUpdating}
                          />
                        </div>

                        {/* Can Manage Members */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Manage Members</p>
                            <p className="text-xs text-muted-foreground">Approve/deny member requests</p>
                          </div>
                          <Switch
                            checked={permissions.canManageMembers}
                            onCheckedChange={(checked) =>
                              updatePermission(admin.email, 'canManageMembers', checked)
                            }
                            disabled={isUpdating}
                          />
                        </div>

                        {/* Can Manage Shop */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Manage Shop</p>
                            <p className="text-xs text-muted-foreground">Add/edit products, locations</p>
                          </div>
                          <Switch
                            checked={permissions.canManageShop}
                            onCheckedChange={(checked) =>
                              updatePermission(admin.email, 'canManageShop', checked)
                            }
                            disabled={isUpdating}
                          />
                        </div>

                        {/* Can Approve Submissions */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Approve Submissions</p>
                            <p className="text-xs text-muted-foreground">Review pending content</p>
                          </div>
                          <Switch
                            checked={permissions.canApproveSubmissions}
                            onCheckedChange={(checked) =>
                              updatePermission(admin.email, 'canApproveSubmissions', checked)
                            }
                            disabled={isUpdating}
                          />
                        </div>

                        {/* Can Manage Orders */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Manage Orders</p>
                            <p className="text-xs text-muted-foreground">View and update shop orders</p>
                          </div>
                          <Switch
                            checked={permissions.canManageOrders}
                            onCheckedChange={(checked) =>
                              updatePermission(admin.email, 'canManageOrders', checked)
                            }
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No admin users found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Promote users to admin role from the Members section.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">About Admin Permissions</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• <strong>Delete Content:</strong> Remove any content from the platform</li>
                <li>• <strong>Manage Members:</strong> Approve/deny join requests and manage user permissions</li>
                <li>• <strong>Manage Shop:</strong> Add/edit products, manage inventory and pickup locations</li>
                <li>• <strong>Approve Submissions:</strong> Review and approve pending content submissions</li>
                <li>• <strong>Manage Orders:</strong> View all orders and update order status</li>
              </ul>
              <p className="text-sm text-blue-800 mt-3 font-medium">
                Note: Super admins always have all permissions and cannot be restricted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
