
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function BlogPage() {
  const { blogPosts } = useAuth();
  const approvedPosts = blogPosts.filter(p => p.status === 'approved');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">AIREINO Blog</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Stories, insights, and updates from our members.
        </p>
      </div>

      <div className="grid gap-12">
        {approvedPosts.length > 0 ? approvedPosts.map((post) => (
          <Card key={post.id} className="bg-card border-border/60 flex flex-col md:flex-row overflow-hidden group">
            <Link href={`/blog/${post.id}`} className="md:w-1/3 block">
              <div className="overflow-hidden aspect-video relative bg-muted p-4">
                <Image
                  src={post.imageUrl || "https://placehold.co/800x450.png"}
                  data-ai-hint="blog header"
                  alt={post.title}
                  fill
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="md:w-2/3 flex flex-col">
              <CardHeader>
                <div className="flex gap-2 mb-2">
                  {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <CardTitle className="font-headline text-2xl">
                  <Link href={`/blog/${post.id}`} className="hover:text-accent transition-colors">{post.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={undefined} alt={post.authorName} />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">{format(post.createdAt.toDate(), "PPP")}</p>
                  </div>
                </div>
              </CardFooter>
            </div>
          </Card>
        )) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-lg font-medium text-muted-foreground">No blog posts have been published yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for stories and updates from our members!</p>
          </div>
        )}
      </div>
    </div>
  );
}
