"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { CreateAnnouncementForm } from "@/components/create-announcement-form";

export default function DashboardPage() {
  const { user, announcements } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isPending = user?.status === 'pending';
  const canUpload = user?.canUpload && !isAdmin;
  const displayName = user?.displayName || 'User';

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold">Welcome, {displayName}!</h1>

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
            <p className="text-sm text-muted-foreground mb-4">
              Complete your membership application to unlock all features.
            </p>
            <Button asChild>
              <Link href="/join">Complete Application</Link>
            </Button>
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
