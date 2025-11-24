import { useAuth } from "./use-auth";

export interface AdminPermissions {
  canUpload: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canManageShop: boolean;
  canApproveSubmissions: boolean;
  canManageOrders: boolean;
}

export function usePermissions() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  // Super admins have all permissions
  if (isSuperAdmin) {
    return {
      canUpload: true,
      canDelete: true,
      canManageMembers: true,
      canManageShop: true,
      canApproveSubmissions: true,
      canManageOrders: true,
      isAdmin: true,
      isSuperAdmin: true,
    };
  }

  // Regular admins check their permissions
  if (isAdmin) {
    const permissions = (user as any).permissions || {};
    
    return {
      canUpload: permissions.canUpload === true,
      canDelete: permissions.canDelete === true,
      canManageMembers: permissions.canManageMembers === true,
      canManageShop: permissions.canManageShop === true,
      canApproveSubmissions: permissions.canApproveSubmissions === true,
      canManageOrders: permissions.canManageOrders === true,
      isAdmin: true,
      isSuperAdmin: false,
    };
  }

  // Non-admin users have no permissions
  return {
    canUpload: false,
    canDelete: false,
    canManageMembers: false,
    canManageShop: false,
    canApproveSubmissions: false,
    canManageOrders: false,
    isAdmin: false,
    isSuperAdmin: false,
  };
}

export function showPermissionError() {
  return {
    title: "Permission Denied",
    description: "You don't have permission to perform this action. Please contact a Super Admin.",
    variant: "destructive" as const,
  };
}
