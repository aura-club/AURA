"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const { leadership, users } = useAuth();
  
  const approvedUsers = users.filter(u => u.status === 'approved');
  const admins = approvedUsers.filter(u => u.role === 'admin');
  const members = approvedUsers.filter(u => u.role === 'member');
  
  const visibleLeadership = leadership.filter(l => l.isVisible);

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">About AIREINO</h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
                Get to know the team, our mission, and the core values that drive us to innovate and explore.
            </p>
        </div>

        <section id="mission-vision" className="mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-accent">Our Mission</h2>
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        To provide a collaborative platform for students to pursue their passion for aerospace through hands-on projects, research, and community engagement. We aim to foster innovation, develop practical skills, and launch the next generation of aerospace leaders.
                    </p>
                </div>
                <div className="space-y-4">
                     <h2 className="font-headline text-3xl font-bold text-accent">Our Vision</h2>
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        To be a center of excellence for unmanned and aerospace research, recognized for our ambitious projects and the exceptional talent of our members. We envision a future where our contributions make a tangible impact on the aerospace industry.
                    </p>
                </div>
            </div>
        </section>

        {visibleLeadership.length > 0 && (
          <section id="leadership" className="mb-24">
              <div className="text-center mb-12">
                  <h2 className="font-headline text-3xl md:text-4xl font-bold">Meet the Leadership</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                      The driving force behind our club's success and vision.
                  </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {visibleLeadership.map(member => (
                      <Card key={member.id} className="bg-card border-border/60 text-center">
                          <CardHeader>
                              <Image 
                                  src={member.imageUrl || "https://placehold.co/400x400.png"} 
                                  alt={member.name} 
                                  data-ai-hint="portrait person"
                                  width={200}
                                  height={200}
                                  className="rounded-full w-32 h-32 mx-auto object-cover border-4 border-accent"
                              />
                          </CardHeader>
                          <CardContent>
                              <h3 className="font-headline text-xl font-bold">{member.name}</h3>
                              <p className="text-accent font-semibold">{member.role}</p>
                              <p className="text-sm text-muted-foreground mt-2 break-words">{member.bio}</p>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </section>
        )}
        
        {admins.length > 0 && (
        <section id="admins" className="mb-24">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">Club Admins</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    The administrators who manage the community and platform.
                </p>
            </div>
             <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap justify-center gap-6">
                    {admins.map(admin => (
                        <div key={admin.uid} className="flex flex-col items-center gap-3 bg-primary/20 p-4 rounded-lg border-2 border-accent w-40 text-center shadow-lg">
                            <Image
                                src={admin.photoURL || "https://placehold.co/200x200.png"}
                                alt={admin.name}
                                data-ai-hint="portrait person"
                                width={80}
                                height={80}
                                className="rounded-full w-20 h-20 object-cover"
                            />
                            <div className="w-full">
                                <p className="font-semibold text-sm truncate w-full">{admin.name}</p>
                                <Badge variant="secondary" className="mt-1">
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        )}

        <section id="members" className="mb-24">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Members</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    The talented individuals who make up our community.
                </p>
            </div>
             <div className="max-w-5xl mx-auto">
                {members.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {members.map(member => (
                            <div key={member.uid} className="flex flex-col items-center gap-3 bg-card p-4 rounded-lg border w-36 text-center">
                                <Image
                                    src={member.photoURL || "https://placehold.co/200x200.png"}
                                    alt={member.name}
                                    data-ai-hint="portrait person"
                                    width={80}
                                    height={80}
                                    className="rounded-full w-20 h-20 object-cover"
                                />
                                <div className="w-full">
                                    <p className="font-semibold text-sm truncate w-full">{member.name}</p>
                                    <p className="text-xs text-accent capitalize">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">Our member list is growing! Check back soon.</p>
                )}
            </div>
        </section>

        <section id="join-us">
            <Card className="bg-card border-border/60 overflow-hidden group p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Launch?</h2>
                    <p className="mt-4 max-w-2xl text-muted-foreground">
                    Become a part of our community and start building the future of aerospace.
                    </p>
                </div>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0">
                    <Link href="/join">
                        Join AIREINO Today <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                </div>
            </Card>
        </section>
    </div>
  );
}
