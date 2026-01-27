"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Check, X, FileText, Calendar, Newspaper, Users, Library, FolderKanban, GitPullRequest, UserCog, PlusCircle, Edit, Trash2, Store } from "lucide-react";
import { useAuth, type UserRole, type Alumnus, type AlumniOpportunity, type AppDbUser } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePermissions, showPermissionError } from "@/hooks/use-permissions";
import { ProjectReviewDialog } from "@/components/project-review-dialog";
import { ResourceReviewDialog } from "@/components/resource-review-dialog";
import { OpportunityReviewDialog } from "@/components/opportunity-review-dialog";
import { BlogPostReviewDialog } from "@/components/blog-post-review-dialog";
import { UpdateRoleSelect } from "@/components/update-role-select";
import { EditLeaderDialog } from "@/components/edit-leader-dialog";
import { EditAlumnusDialog } from "@/components/edit-alumnus-dialog";
import { EditAlumniOpportunityDialog } from "@/components/edit-alumni-opportunity-dialog";

import { MarksCardDialog } from "@/components/marks-card-dialog";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { AddResourceDialog } from "@/components/add-resource-dialog";
import { AddOpportunityDialog } from "@/components/add-opportunity-dialog";
import { AddBlogPostDialog } from "@/components/add-blog-post-dialog";
import Link from "next/link";

export default function AdminPage() {
  const { user: currentUser, users, projects, resources, opportunities, blogPosts, leadership, alumni, alumniOpportunities, approveUser, denyUser, deleteUser, toggleUploadPermission, approveProject, rejectProject, approveResource, rejectResource, approveOpportunity, rejectOpportunity, approveBlogPost, rejectBlogPost, toggleLeaderVisibility, approveAlumniOpportunity, rejectAlumniOpportunity, deleteAlumnus, deleteAlumniOpportunity, updateAlumniOpportunity, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const permissions = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'requests';
  const [alumnusToDelete, setAlumnusToDelete] = useState<Alumnus | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppDbUser | null>(null);

  // Page-level protection - check if user has ANY admin permission
  useEffect(() => {
    if (!authLoading && currentUser) {
      const hasAnyAdminPermission =
        permissions.canManageMembers ||
        permissions.canApproveSubmissions ||
        permissions.canManageShop ||
        permissions.canDelete;

      if (!hasAnyAdminPermission) {
        router.push('/dashboard/access-denied');
      }
    }
  }, [authLoading, currentUser, permissions, router]);

  const pendingRequests = useMemo(() => users.filter((u) => u.status === 'pending'), [users]);
  const approvedMembers = useMemo(() => users.filter((u) => u.status === 'approved' && u.role === 'member'), [users]);
  const pendingProjects = useMemo(() => projects.filter(p => p.status === 'pending'), [projects]);
  const rejectedProjects = useMemo(() => projects.filter(p => p.status === 'rejected'), [projects]);
  const pendingResources = useMemo(() => resources.filter(r => r.status === 'pending'), [resources]);
  const rejectedResources = useMemo(() => resources.filter(r => r.status === 'rejected'), [resources]);
  const pendingOpportunities = useMemo(() => opportunities.filter(o => o.status === 'pending'), [opportunities]);
  const rejectedOpportunities = useMemo(() => opportunities.filter(o => o.status === 'rejected'), [opportunities]);
  const pendingBlogPosts = useMemo(() => blogPosts.filter(b => b.status === 'pending'), [blogPosts]);
  const rejectedBlogPosts = useMemo(() => blogPosts.filter(b => b.status === 'rejected'), [blogPosts]);

  const handleApprove = async (email: string) => {
    if (!permissions.canManageMembers) {
      toast(showPermissionError());
      return;
    }
    try {
      await approveUser(email);
      toast({ title: "User Approved", description: "The user is now an approved member." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve user", variant: "destructive" });
    }
  };

  const handleDeny = async (email: string) => {
    if (!permissions.canManageMembers) {
      toast(showPermissionError());
      return;
    }
    try {
      await denyUser(email);
      toast({ title: "User Denied", description: "The request has been denied." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to deny user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!permissions.canDelete) {
      toast(showPermissionError());
      setUserToDelete(null);
      return;
    }

    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.email);
      toast({ title: "User Deleted", description: "The user has been removed from the system." });
      setUserToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
      setUserToDelete(null);
    }
  };

  const handleToggleUploadPermission = async (email: string, canUpload: boolean) => {
    if (!permissions.canManageMembers) {
      toast(showPermissionError());
      return;
    }
    try {
      await toggleUploadPermission(email, canUpload);
      toast({ title: "Permissions Updated", description: `Upload permission ${canUpload ? 'granted' : 'revoked'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
    }
  };

  const handleApproveProject = async (id: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await approveProject(id);
      toast({ title: "Project Approved", description: "The project is now visible on the public site." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve project", variant: "destructive" });
    }
  };

  const handleRejectProject = async (id: string, reason: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await rejectProject(id, reason);
      toast({ title: "Project Rejected", description: "The author has been notified." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject project", variant: "destructive" });
    }
  };

  const handleApproveResource = async (id: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await approveResource(id);
      toast({ title: "Resource Approved", description: "The resource is now visible." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve resource", variant: "destructive" });
    }
  };

  const handleRejectResource = async (id: string, reason: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await rejectResource(id, reason);
      toast({ title: "Resource Rejected", description: "The author has been notified." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject resource", variant: "destructive" });
    }
  };

  const handleApproveOpportunity = async (id: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await approveOpportunity(id);
      toast({ title: "Opportunity Approved", description: "The opportunity is now visible." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve opportunity", variant: "destructive" });
    }
  };

  const handleRejectOpportunity = async (id: string, reason: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await rejectOpportunity(id, reason);
      toast({ title: "Opportunity Rejected", description: "The author has been notified." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject opportunity", variant: "destructive" });
    }
  };

  const handleApproveBlogPost = async (id: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await approveBlogPost(id);
      toast({ title: "Blog Post Approved", description: "The post is now visible." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve blog post", variant: "destructive" });
    }
  };

  const handleRejectBlogPost = async (id: string, reason: string) => {
    if (!permissions.canApproveSubmissions) {
      toast(showPermissionError());
      return;
    }
    try {
      await rejectBlogPost(id, reason);
      toast({ title: "Blog Post Rejected", description: "The author has been notified." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject blog post", variant: "destructive" });
    }
  };

  const handleToggleLeaderVisibility = async (leaderId: string, isVisible: boolean) => {
    if (!permissions.canManageMembers) {
      toast(showPermissionError());
      return;
    }
    try {
      await toggleLeaderVisibility(leaderId, isVisible);
      toast({ title: "Visibility Updated", description: `Leader is now ${isVisible ? 'visible' : 'hidden'} on the public site.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update visibility", variant: "destructive" });
    }
  };

  const handleDeleteAlumnus = async () => {
    if (!permissions.canDelete) {
      toast(showPermissionError());
      setAlumnusToDelete(null);
      return;
    }

    if (!alumnusToDelete) return;

    try {
      await deleteAlumnus(alumnusToDelete.id);
      toast({ title: "Alumnus Deleted", description: "The alumnus has been removed." });
      setAlumnusToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete alumnus", variant: "destructive" });
      setAlumnusToDelete(null);
    }
  };

  const handleDeleteAlumniOpportunity = async (id: string) => {
    if (!permissions.canDelete) {
      toast(showPermissionError());
      return;
    }

    try {
      await deleteAlumniOpportunity(id);
      toast({ title: "Opportunity Deleted", description: "The opportunity has been removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete opportunity", variant: "destructive" });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
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
  const hasAnyAdminPermission =
    permissions.canManageMembers ||
    permissions.canApproveSubmissions ||
    permissions.canManageShop ||
    permissions.canDelete;

  if (!hasAnyAdminPermission) {
    return null;
  }

  const tabConfig = [
    { id: 'requests', label: 'Join Requests', icon: <GitPullRequest className="h-4 w-4" />, count: pendingRequests.length, show: permissions.canManageMembers },
    { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" />, count: approvedMembers.length, show: permissions.canManageMembers },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="h-4 w-4" />, count: pendingProjects.length, show: permissions.canApproveSubmissions },
    { id: 'resources', label: 'Resources', icon: <Library className="h-4 w-4" />, count: pendingResources.length, show: permissions.canApproveSubmissions },
    { id: 'opportunities', label: 'Opportunities', icon: <Calendar className="h-4 w-4" />, count: pendingOpportunities.length, show: permissions.canApproveSubmissions },
    { id: 'blog', label: 'Blog Posts', icon: <Newspaper className="h-4 w-4" />, count: pendingBlogPosts.length, show: permissions.canApproveSubmissions },
    { id: 'leadership', label: 'Leadership', icon: <UserCog className="h-4 w-4" />, count: leadership.length, show: permissions.canManageMembers },
    { id: 'alumni', label: 'Alumni', icon: <Users className="h-4 w-4" />, count: alumni.length, show: permissions.canManageMembers },
  ].filter(tab => tab.show);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users, content, and submissions</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabConfig.map(tab => (
          <Link key={tab.id} href={`?tab=${tab.id}`}>
            <Button variant={activeTab === tab.id ? 'default' : 'outline'} className="whitespace-nowrap">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2">{tab.count}</Badge>
              )}
            </Button>
          </Link>
        ))}
      </div>

      {/* Join Requests Tab */}
      {activeTab === 'requests' && permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Join Requests</CardTitle>
            <CardDescription>Review and approve membership requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map(user => (
                    <TableRow key={user.email}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="max-w-md truncate">{user.reason || 'No reason provided'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <MarksCardDialog
                          user={user}
                          onApprove={handleApprove}
                          onDeny={handleDeny}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No pending requests</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Approved Members</CardTitle>
            <CardDescription>Manage member permissions and roles</CardDescription>
          </CardHeader>
          <CardContent>
            {approvedMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Can Upload</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedMembers.map(user => (
                    <TableRow key={user.email}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <UpdateRoleSelect userEmail={user.email} currentRole={user.role} />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.canUpload}
                          onCheckedChange={(checked) => handleToggleUploadPermission(user.email, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {permissions.canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No approved members</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && permissions.canApproveSubmissions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle>Project Submissions</CardTitle>
                <CardDescription>Review pending and rejected projects</CardDescription>
              </div>
              <AddProjectDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </AddProjectDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Pending Projects ({pendingProjects.length})
              </h3>
              {pendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {pendingProjects.map(project => (
                    <Card key={project.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{project.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{project.excerpt}</p>
                            <p className="text-xs text-muted-foreground mt-2">By {project.authorName}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <ProjectReviewDialog
                              project={project}
                              onApprove={handleApproveProject}
                              onReject={handleRejectProject}
                            >
                              <Button size="sm" variant="outline">Review</Button>
                            </ProjectReviewDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pending projects</p>
              )}
            </div>

            {rejectedProjects.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 text-destructive flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Rejected Projects ({rejectedProjects.length})
                </h3>
                <div className="space-y-4">
                  {rejectedProjects.map(project => (
                    <Card key={project.id} className="border-destructive/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{project.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{project.excerpt}</p>
                            <p className="text-xs text-destructive mt-2">Reason: {project.rejectionReason}</p>
                          </div>
                          <ProjectReviewDialog
                            project={project}
                            onApprove={handleApproveProject}
                            onReject={handleRejectProject}
                          >
                            <Button size="sm" variant="outline">Review</Button>
                          </ProjectReviewDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && permissions.canApproveSubmissions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle>Resource Submissions</CardTitle>
                <CardDescription>Review pending and rejected resources</CardDescription>
              </div>
              <AddResourceDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </AddResourceDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Library className="h-5 w-5 mr-2" />
                Pending Resources ({pendingResources.length})
              </h3>
              {pendingResources.length > 0 ? (
                <div className="space-y-4">
                  {pendingResources.map(resource => (
                    <Card key={resource.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{resource.title}</h4>
                            <Badge variant="outline" className="mt-2">{resource.category}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">{resource.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">By {resource.authorName}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <ResourceReviewDialog
                              resource={resource}
                              onApprove={handleApproveResource}
                              onReject={handleRejectResource}
                            >
                              <Button size="sm" variant="outline">Review</Button>
                            </ResourceReviewDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pending resources</p>
              )}
            </div>

            {rejectedResources.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 text-destructive flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Rejected Resources ({rejectedResources.length})
                </h3>
                <div className="space-y-4">
                  {rejectedResources.map(resource => (
                    <Card key={resource.id} className="border-destructive/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{resource.title}</h4>
                            <Badge variant="outline" className="mt-2">{resource.category}</Badge>
                            <p className="text-xs text-destructive mt-2">Reason: {resource.rejectionReason}</p>
                          </div>
                          <ResourceReviewDialog
                            resource={resource}
                            onApprove={handleApproveResource}
                            onReject={handleRejectResource}
                          >
                            <Button size="sm" variant="outline">Review</Button>
                          </ResourceReviewDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && permissions.canApproveSubmissions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle>Opportunity Submissions</CardTitle>
                <CardDescription>Review pending and rejected opportunities</CardDescription>
              </div>
              <AddOpportunityDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Opportunity
                </Button>
              </AddOpportunityDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Pending Opportunities ({pendingOpportunities.length})
              </h3>
              {pendingOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {pendingOpportunities.map(opportunity => (
                    <Card key={opportunity.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{opportunity.title}</h4>
                            <Badge variant="outline" className="mt-2">{opportunity.category}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">{opportunity.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">By {opportunity.authorName}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <OpportunityReviewDialog
                              opportunity={opportunity}
                              onApprove={handleApproveOpportunity}
                              onReject={handleRejectOpportunity}
                            >
                              <Button size="sm" variant="outline">Review</Button>
                            </OpportunityReviewDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pending opportunities</p>
              )}
            </div>

            {rejectedOpportunities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 text-destructive flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Rejected Opportunities ({rejectedOpportunities.length})
                </h3>
                <div className="space-y-4">
                  {rejectedOpportunities.map(opportunity => (
                    <Card key={opportunity.id} className="border-destructive/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{opportunity.title}</h4>
                            <Badge variant="outline" className="mt-2">{opportunity.category}</Badge>
                            <p className="text-xs text-destructive mt-2">Reason: {opportunity.rejectionReason}</p>
                          </div>
                          <OpportunityReviewDialog
                            opportunity={opportunity}
                            onApprove={handleApproveOpportunity}
                            onReject={handleRejectOpportunity}
                          >
                            <Button size="sm" variant="outline">Review</Button>
                          </OpportunityReviewDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Blog Posts Tab */}
      {activeTab === 'blog' && permissions.canApproveSubmissions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle>Blog Post Submissions</CardTitle>
                <CardDescription>Review pending and rejected blog posts</CardDescription>
              </div>
              <AddBlogPostDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </AddBlogPostDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Newspaper className="h-5 w-5 mr-2" />
                Pending Blog Posts ({pendingBlogPosts.length})
              </h3>
              {pendingBlogPosts.length > 0 ? (
                <div className="space-y-4">
                  {pendingBlogPosts.map(post => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                            <div className="flex gap-2 mt-2">
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">By {post.authorName}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <BlogPostReviewDialog post={post} onApprove={handleApproveBlogPost} onReject={handleRejectBlogPost}>
                              <Button size="sm" variant="outline">
                                <Newspaper className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </BlogPostReviewDialog>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pending blog posts</p>
              )}
            </div>

            {rejectedBlogPosts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 text-destructive flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Rejected Blog Posts ({rejectedBlogPosts.length})
                </h3>
                <div className="space-y-4">
                  {rejectedBlogPosts.map(post => (
                    <Card key={post.id} className="border-destructive/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                            <p className="text-xs text-destructive mt-2">Reason: {post.rejectionReason}</p>
                          </div>
                          <BlogPostReviewDialog post={post} onApprove={handleApproveBlogPost} onReject={handleRejectBlogPost}>
                            <Button size="sm" variant="outline">
                              <Newspaper className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </BlogPostReviewDialog>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leadership Tab */}
      {activeTab === 'leadership' && permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Leadership Team</CardTitle>
                <CardDescription>Manage leadership members and their visibility</CardDescription>
              </div>
              <Link href="/dashboard/leadership">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Leader
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {leadership.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadership.map(leader => (
                    <TableRow key={leader.id}>
                      <TableCell className="font-medium">{leader.name}</TableCell>
                      <TableCell>{leader.role}</TableCell>
                      <TableCell>{leader.order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={leader.isVisible}
                          onCheckedChange={(checked) => handleToggleLeaderVisibility(leader.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditLeaderDialog leader={leader}>
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                        </EditLeaderDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No leadership members</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alumni Tab */}
      {activeTab === 'alumni' && permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Alumni Network</CardTitle>
                <CardDescription>Manage alumni members and opportunities</CardDescription>
              </div>
              <Link href="/dashboard/alumni">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Alumnus
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Alumni Members */}
            <div>
              <h3 className="font-semibold mb-4">Alumni Members ({alumni.length})</h3>
              {alumni.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Graduation Year</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alumni.map(alumnus => (
                      <TableRow key={alumnus.id}>
                        <TableCell className="font-medium">{alumnus.name}</TableCell>
                        <TableCell>{alumnus.email}</TableCell>
                        <TableCell>{alumnus.company}</TableCell>
                        <TableCell>{alumnus.graduationYear}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <EditAlumnusDialog alumnus={alumnus}>
                            <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                          </EditAlumnusDialog>
                          {permissions.canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAlumnusToDelete(alumnus)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No alumni members</p>
              )}
            </div>

            {/* Alumni Opportunities */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Alumni Opportunities ({alumniOpportunities.length})</h3>
                <Link href="/dashboard/alumni">
                  <Button size="sm" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Opportunity
                  </Button>
                </Link>
              </div>
              {alumniOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {alumniOpportunities.map(opp => (
                    <Card key={opp.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{opp.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                            <a href={opp.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                              View Opportunity →
                            </a>
                          </div>
                          <div className="flex gap-2 mt-4 justify-end">
                            <EditAlumniOpportunityDialog opportunity={opp}>
                              <Button size="sm" variant="outline">Edit</Button>
                            </EditAlumniOpportunityDialog>
                            {permissions.canDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAlumniOpportunity(opp.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No alumni opportunities</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
      />

      <DeleteConfirmationDialog
        open={!!alumnusToDelete}
        onOpenChange={(open) => !open && setAlumnusToDelete(null)}
        onConfirm={handleDeleteAlumnus}
        onCancel={() => setAlumnusToDelete(null)}
        title="Delete Alumnus"
        description={`Are you sure you want to delete ${alumnusToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
