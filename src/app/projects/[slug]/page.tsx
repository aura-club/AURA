
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useParams } from 'next/navigation';
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Target, FlaskConical, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import React from "react";


export default function ProjectDetailPage() {
    const params = useParams();
    const { projects, user } = useAuth();
    const projectData = projects.find(p => p.id === params.slug);

    const canView = useMemo(() => {
        if (!projectData) return false;
        if (projectData.status === 'approved') return true;
        if (!user) return false;
        return user.role === 'admin' || user.role === 'super_admin' || user.email === projectData.authorEmail;
    }, [projectData, user]);

    const renderDescription = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <p key={i} className="text-foreground/90 text-lg">
                {line}
            </p>
        ));
    };

    if (!projectData || !canView) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground pl-0">
                        <Link href="/projects">&larr; Back to Projects</Link>
                    </Button>
                </div>
                <Card className="bg-card border-border/60">
                    <CardHeader>
                        <CardTitle className="font-headline">Project Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            The project you're looking for doesn't seem to exist. It might have been moved or deleted.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="mb-8">
                <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground pl-0">
                    <Link href="/projects">&larr; Back to Projects</Link>
                </Button>
            </div>

            <article className="space-y-12">
                <header className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">{projectData.title}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">{projectData.excerpt}</p>
                </header>

                <Image
                    src={projectData.thumbnailImage}
                    alt={projectData.title}
                    data-ai-hint={projectData.title.split(" ").slice(0, 2).join(" ")}
                    width={1200}
                    height={600}
                    className="w-full rounded-lg shadow-lg"
                />

                <div className="prose prose-invert max-w-none space-y-4">
                    {renderDescription(projectData.description)}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Target /> Objectives</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {projectData.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Users /> Team Members</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {projectData.teamMembers.map((member, i) => <Badge key={i} variant="secondary">{member}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><FlaskConical /> Methodology</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">{projectData.methodology}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><CheckCircle /> Outcomes</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">{projectData.outcomes}</p></CardContent>
                </Card>

                {projectData.galleryImages && projectData.galleryImages.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="font-headline">Gallery</CardTitle></CardHeader>
                        <CardContent>
                            <Carousel className="w-full max-w-4xl mx-auto">
                                <CarouselContent>
                                    {projectData.galleryImages.map((img, i) => (
                                        <CarouselItem key={i}>
                                            <Image src={img} alt={`${projectData.title} gallery image ${i + 1}`} width={1000} height={700} className="w-full rounded-md" data-ai-hint="project gallery" />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </CardContent>
                    </Card>
                )}

                {projectData.externalLinks && projectData.externalLinks.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="font-headline">Links & Resources</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                {projectData.externalLinks.map((link, i) => (
                                    <Button asChild variant="outline" className="justify-start" key={i}>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            {link.label}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

            </article>
        </div>
    )
}
