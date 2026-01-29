
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// A simple component to render markdown
const MarkdownPreview = ({ content }: { content: string }) => {
    // Basic markdown to HTML conversion
    const html = content
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline">$1</a>')
        .replace(/^\* (.*$)/gim, '<ul class="list-disc pl-6"><li>$1</li></ul>') // Doesn't handle multi-line lists well
        .replace(/^\d+\. (.*$)/gim, '<ol class="list-decimal pl-6"><li>$1</li></ol>') // Doesn't handle multi-line lists well
        .replace(/\n/g, '<br />');

    return <div className="prose prose-invert max-w-none text-foreground/80 text-lg space-y-4" dangerouslySetInnerHTML={{ __html: html.replace(/<br \/>/g, "") }} />;
};


export default function BlogDetailPage({ params }: { params: { slug: string } }) {
    const { blogPosts, user } = useAuth();
    const postData = blogPosts.find(p => p.id === params.slug);

    const canView = postData?.status === 'approved' ||
        (user && (user.role === 'admin' || user.role === 'super_admin' || user.email === postData?.authorEmail));

    if (!postData || !canView) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="mb-8">
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Blog</Link>
                </div>
                <Card className="bg-card border-border/60">
                    <CardHeader>
                        <CardTitle className="font-headline">Post Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            The blog post you're looking for doesn't seem to exist or hasn't been approved yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <article>
                <header className="mb-8 text-center">
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Blog</Link>
                    <div className="flex justify-center gap-2 mt-4">
                        {postData.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold mt-4">{postData.title}</h1>
                    <div className="mt-6 flex justify-center items-center gap-4">
                        <Avatar>
                            <AvatarImage src={undefined} alt={postData.authorName} />
                            <AvatarFallback>{postData.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{postData.authorName}</p>
                            <p className="text-sm text-muted-foreground">{format(postData.createdAt.toDate(), "PPP")}</p>
                        </div>
                    </div>
                </header>

                <Image src={postData.imageUrl || "https://placehold.co/1200x600.png"} data-ai-hint="blog header" alt={postData.title} width={1200} height={600} className="w-full rounded-lg mb-8" />

                <MarkdownPreview content={postData.content} />

                <footer className="mt-12 pt-8 border-t border-border/40">
                    <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={undefined} alt={postData.authorName} />
                            <AvatarFallback>{postData.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Written by</p>
                            <h4 className="font-semibold text-lg">{postData.authorName}</h4>
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    )
}
