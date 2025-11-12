"use client";

import React, { useState } from "react";
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
import { Check, X, FileText, Calendar, Newspaper, Users, Library, FolderKanban, GitPullRequest, UserCog, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ProjectReviewDialog } from "@/components/project-review-dialog";
import { ResourceReviewDialog } from "@/components/resource-review-dialog";
import { OpportunityReviewDialog } from "@/components/opportunity-review-dialog";
import { BlogPostReviewDialog } from "@/components/blog-post-review-dialog";
import { useSearchParams } from "next/navigation";
import type { SubmissionStatus, Alumnus } from "@/hooks/use-auth";
import { EditLeaderDialog } from "@/components/edit-leader-dialog";
import { EditAlumnusDialog } from "@/components/edit-alumnus-dialog";
import { AlumniOpportunityReviewDialog } from "@/components/alumni-opportunity-review-dialog";
import { AddAlumniOpportunityDialog } from "@/components/add-alumni-opportunity-dialog";
import { EditAlumniOpportunityDialog } from "@/components/edit-alumni-opportunity-dialog";
import Image from "next/image";
import { UpdateRoleSelect } from "@/components/update-role-select";

const statusColors: { [key in SubmissionStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  approved: "secondary",
  pending: "outline",
  rejected: "destructive",
};

export default function AdminPage() {
  const { user: currentUser, users, projects, resources, opportunities, blogPosts, leadership, alumni, alumniOpportunities, approveUser, denyUser, toggleUploadPermission, approveProject, rejectProject, approveResource, rejectResource, approveOpportunity, rejectOpportunity, approveBlogPost, rejectBlogPost, toggleLeaderVisibility, approveAlumniOpportunity, rejectAlumniOpportunity, deleteAlumnus, deleteAlumniOpportunity, updateAlumniOpportunity } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'requests';
  const [alumnusToDelete, setAlumnusToDelete] = useState<Alumnus | null>(null);

  const handleApproveUser = async (email: string) => {
    try {
      await approveUser(email);
      toast({ title: "Member Approved", description: "The user has been promoted to a member." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve user. Please try again.",
      });
    }
  };

  const handleDenyUser = async (email: string) => {
    try {
      await denyUser(email);
      toast({ title: "Request Denied", description: "The user's join request has been denied." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Denial Failed",
        description: error.message || "Failed to deny user. Please try again.",
      });
    }
  };
  
  const handleToggleUpload = async (email: string, canUpload: boolean) => {
    try {
      await toggleUploadPermission(email, canUpload);
      toast({ title: "Permissions Updated", description: "The member's upload permissions have been changed." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update permissions. Please try again.",
      });
    }
  };

  const handleApproveProject = (id: string) => {
    approveProject(id);
    toast({ title: "Project Approved", description: "The project will now be visible on the public site." });
  };

  const handleRejectProject = (id: string, reason: string) => {
    rejectProject(id, reason);
    toast({ title: "Project Rejected", description: "The project has been rejected and will not be displayed." });
  };

  const handleApproveResource = (id: string) => {
    approveResource(id);
    toast({ title: "Resource Approved", description: "The resource will now be visible on the public site." });
  };

  const handleRejectResource = (id: string, reason: string) => {
    rejectResource(id, reason);
    toast({ title: "Resource Rejected", description: "The resource has been rejected and will not be displayed." });
  };

  const handleApproveOpportunity = (id: string) => {
    approveOpportunity(id);
    toast({ title: "Opportunity Approved", description: "The opportunity will now be visible on the public site." });
  };

  const handleRejectOpportunity = (id: string, reason: string) => {
    rejectOpportunity(id, reason);
    toast({ title: "Opportunity Rejected", description: "The opportunity has been rejected and will not be displayed." });
  };

  const handleApproveBlogPost = (id: string) => {
    approveBlogPost(id);
    toast({ title: "Blog Post Approved", description: "The post will now be visible on the public site." });
  };

  const handleRejectBlogPost = (id: string, reason: string) => {
    rejectBlogPost(id, reason);
    toast({ title: "Blog Post Rejected", description: "The post has been rejected and will not be displayed." });
  };

  const handleDeleteAlumnus = async (alumnusToDelete: Alumnus) => {
    try {
      await deleteAlumnus(alumnusToDelete.id);
      toast({ title: "Alumnus Deleted", description: `The alumnus "${alumnusToDelete.name}" has been successfully deleted.` });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || `Could not delete ${alumnusToDelete.name}. Please try again.`,
      });
    }
  };
  
  const handleToggleLeaderVisibility = async (id: string, isVisible: boolean) => {
    try {
        await toggleLeaderVisibility(id, isVisible);
        toast({ title: "Visibility Updated", description: "The leader's visibility has been changed." });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update the leadership member's visibility.",
        });
    }
  };

  const joinRequests = users.filter(u => u.status === 'pending');
  const membersAndUsers = users.filter(u => u.status === 'approved' && u.email !== currentUser?.email);
  const pendingProjects = projects.filter(p => p.status === 'pending');
  const pendingResources = resources.filter(r => r.status === 'pending');
  const pendingOpportunities = opportunities.filter(o => o.status === 'pending');
  const pendingBlogPosts = blogPosts.filter(b => b.status === 'pending');
  const pendingAlumniOpportunities = alumniOpportunities.filter(o => o.status === 'pending');

  const renderContent = () => {
    switch(activeTab) {
      case 'requests':
        return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><GitPullRequest className="h-8 w-8"/>Join Requests</h1>
              <p className="text-muted-foreground mt-2">Review and approve or deny new member applications.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Join Requests</CardTitle>
                <CardDescription>Total pending requests: {joinRequests.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {joinRequests.map((req) => (
                        <TableRow key={req.email}>
                          <TableCell className="font-medium">{req.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{req.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground max-w-sm truncate">{req.reason}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApproveUser(req.email)}><Check className="h-4 w-4 mr-1" />Approve</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDenyUser(req.email)}><X className="h-4 w-4 mr-1" />Deny</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending join requests.</p>
                )}
              </CardContent>
            </Card>
          </>
        )
      case 'members':
        return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><Users className="h-8 w-8"/>Member Management</h1>
              <p className="text-muted-foreground mt-2">Modify member roles and permissions.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Current Members</CardTitle>
                 <CardDescription>Total members: {membersAndUsers.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Can Upload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersAndUsers.map((member) => (
                      <TableRow key={member.email}>
                        <TableCell>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </TableCell>
                        <TableCell>
                          <UpdateRoleSelect userEmail={member.email} currentRole={member.role} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            id={`upload-${member.email}`} 
                            checked={member.canUpload} 
                            onCheckedChange={(checked) => handleToggleUpload(member.email, checked)}
                            aria-label="Toggle Upload Permission" 
                            disabled={member.role === 'admin'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )
      case 'leadership':
        return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><UserCog className="h-8 w-8"/>Leadership Management</h1>
              <p className="text-muted-foreground mt-2">Add, edit, or remove members from the leadership team.</p>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Leadership Team</CardTitle>
                    <CardDescription>Total members: {leadership.length}</CardDescription>
                  </div>
                   <EditLeaderDialog>
                      <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Leader</Button>
                   </EditLeaderDialog>
              </CardHeader>
              <CardContent>
                 {leadership.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-center">Visible</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadership.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <Image 
                                src={member.imageUrl || 'https://placehold.co/40x40.png'} 
                                alt={member.name} 
                                width={40} height={40} 
                                className="rounded-full h-10 w-10 object-cover" 
                              />
                            </TableCell>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.order}</TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={member.isVisible}
                                    onCheckedChange={(checked) => handleToggleLeaderVisibility(member.id, checked)}
                                    aria-label="Toggle Visibility"
                                />
                            </TableCell>
                             <TableCell className="text-right space-x-2">
                                <EditLeaderDialog leader={member}>
                                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                </EditLeaderDialog>
                             </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No leadership members defined yet. Click "Add Leader" to begin.</p>
                 )}
              </CardContent>
            </Card>
          </>
        )
      case 'alumni':
        return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><Users className="h-8 w-8"/>Alumni Management</h1>
              <p className="text-muted-foreground mt-2">Add, edit, or remove alumni and manage alumni opportunities.</p>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Alumni</CardTitle>
                    <CardDescription>Total alumni: {alumni.length}</CardDescription>
                  </div>
                   <EditAlumnusDialog>
                      <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Alumnus</Button>
                   </EditAlumnusDialog>
              </CardHeader>
              <CardContent>
                 {alumni.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Graduation Year</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alumni.map((alumnus) => (
                          <TableRow key={alumnus.id}>
                            <TableCell>
                              <Image 
                                src={alumnus.photoURL || 'https://placehold.co/40x40.png'} 
                                alt={alumnus.name} 
                                width={40} height={40} 
                                className="rounded-full h-10 w-10 object-cover" 
                              />
                            </TableCell>
                            <TableCell className="font-medium">{alumnus.name}</TableCell>
                            <TableCell>{alumnus.email}</TableCell>
                            <TableCell>{alumnus.graduationYear}</TableCell>
                            <TableCell>{alumnus.company}</TableCell>
                             <TableCell className="text-right space-x-2">
                                <EditAlumnusDialog alumnus={alumnus}>
                                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                </EditAlumnusDialog>
                                <Button variant="destructive" size="icon" onClick={() => setAlumnusToDelete(alumnus)}><Trash2 className="h-4 w-4" /></Button>
                             </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No alumni defined yet. Click "Add Alumnus" to begin.</p>
                 )}
              </CardContent>
            </Card>
            {alumnusToDelete && (
              <DeleteConfirmationDialog
                open={alumnusToDelete !== null}
                onConfirm={async () => {
                  await handleDeleteAlumnus(alumnusToDelete);
                  setAlumnusToDelete(null);
                }}
                onCancel={() => setAlumnusToDelete(null)}
                title="Are you sure you want to delete this alumnus?"
                description={`This will permanently delete ${alumnusToDelete.name}. This action cannot be undone.`}
              />
            )}
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Alumni Opportunities</CardTitle>
                  <CardDescription>Total opportunities: {alumniOpportunities.length}</CardDescription>
                </div>
                <AddAlumniOpportunityDialog>
                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Opportunity</Button>
                </AddAlumniOpportunityDialog>
              </CardHeader>
              <CardContent>
                {alumniOpportunities.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Author</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alumniOpportunities.map((opportunity) => (
                        <TableRow key={opportunity.id}>
                          <TableCell className="font-medium">{opportunity.title}</TableCell>
                          <TableCell className="hidden md:table-cell">{opportunity.authorName}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <EditAlumniOpportunityDialog opportunity={opportunity}>
                              <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                            </EditAlumniOpportunityDialog>
                            <Button variant="destructive" size="icon" onClick={() => deleteAlumniOpportunity(opportunity.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No alumni opportunities have been added yet.</p>
                )}
              </CardContent>
            </Card>
          </>
        )
      case 'projects':
        return (
           <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><FolderKanban className="h-8 w-8"/>Project Submissions</h1>
              <p className="text-muted-foreground mt-2">Review and approve or reject pending projects.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Projects</CardTitle>
                <CardDescription>Total pending projects: {pendingProjects.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingProjects.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Title</TableHead>
                        <TableHead className="hidden md:table-cell">Author</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell className="hidden md:table-cell">{project.authorName}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <ProjectReviewDialog project={project} onApprove={handleApproveProject} onReject={handleRejectProject}>
                                <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2"/>
                                    Review
                                </Button>
                             </ProjectReviewDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending projects to review.</p>
                )}
              </CardContent>
            </Card>
          </>
        )
      case 'resources':
        return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><Library className="h-8 w-8"/>Resource Submissions</h1>
              <p className="text-muted-foreground mt-2">Review and approve or reject pending resources.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Resources</CardTitle>
                 <CardDescription>Total pending resources: {pendingResources.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingResources.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource Title</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.title}</TableCell>
                          <TableCell className="hidden md:table-cell"><Badge variant="secondary">{resource.category}</Badge></TableCell>
                          <TableCell className="text-right space-x-2">
                             <ResourceReviewDialog resource={resource} onApprove={handleApproveResource} onReject={handleRejectResource}>
                                <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2"/>
                                    Review
                                </Button>
                             </ResourceReviewDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending resources to review.</p>
                )}
              </CardContent>
            </Card>
          </>
        )
      case 'opportunities':
        return (
           <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><Calendar className="h-8 w-8"/>Opportunity Submissions</h1>
              <p className="text-muted-foreground mt-2">Review and approve or reject pending opportunities.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Opportunities</CardTitle>
                <CardDescription>Total pending opportunities: {pendingOpportunities.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingOpportunities.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOpportunities.map((opportunity) => (
                        <TableRow key={opportunity.id}>
                          <TableCell className="font-medium">{opportunity.title}</TableCell>
                          <TableCell className="hidden md:table-cell capitalize">
                            <Badge variant="outline">{opportunity.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <OpportunityReviewDialog opportunity={opportunity} onApprove={handleApproveOpportunity} onReject={handleRejectOpportunity}>
                                <Button variant="outline" size="sm">
                                    <Calendar className="h-4 w-4 mr-2"/>
                                    Review
                                </Button>
                             </OpportunityReviewDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending opportunities to review.</p>
                )}
              </CardContent>
            </Card>
          </>
        )

      case 'blog':
         return (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-3"><Newspaper className="h-8 w-8"/>Blog Post Submissions</h1>
              <p className="text-muted-foreground mt-2">Review and approve or reject pending blog posts.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Blog Posts</CardTitle>
                <CardDescription>Total pending posts: {pendingBlogPosts.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBlogPosts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Post Title</TableHead>
                        <TableHead className="hidden md:table-cell">Author</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBlogPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{post.authorName}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <BlogPostReviewDialog post={post} onApprove={handleApproveBlogPost} onReject={handleRejectBlogPost}>
                                <Button variant="outline" size="sm">
                                    <Newspaper className="h-4 w-4 mr-2"/>
                                    Review
                                </Button>
                             </BlogPostReviewDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending blog posts to review.</p>
                )}
              </CardContent>
            </Card>
          </>
        )
      default:
        return null;
    }
  }

  return (
    <div>
        {renderContent()}
    </div>
  );
}
