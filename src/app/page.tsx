"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, ChevronDown, FlaskConical, Rocket } from "lucide-react";
import Link from "next/link";
import { FeaturedProjects } from "@/components/featured-projects";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full h-dvh min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/aireinovideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-background/60"></div>
        </div>

        <div className="relative z-10 container mx-auto flex flex-col items-center text-center px-4">
          <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-extrabold text-primary-foreground tracking-tighter">
            AIREINO
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground">
            Where innovation meets exploration. Join us in pushing the boundaries of aerospace engineering and aeronautical sciences.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/join">Join Our Mission</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
        </div>
      </section>

      <section className="py-16 md:py-24 relative bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">What We Do</h2>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
              We are a community of creators, thinkers, and explorers dedicated to pushing the boundaries of aerospace technology.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="bg-card border-border/60">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary rounded-full">
                  <Rocket className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-headline mt-4">Pioneering Projects</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                From high-powered rockets to autonomous drones, our projects provide hands-on experience with cutting-edge technology.
              </CardContent>
            </Card>
            <Card className="bg-card border-border/60">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary rounded-full">
                  <FlaskConical className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-headline mt-4">Collaborative Research</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                We foster an environment of inquiry, providing resources and mentorship for members to pursue their research interests.
              </CardContent>
            </Card>
            <Card className="bg-card border-border/60">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary rounded-full">
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-headline mt-4">Community & Events</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Engage with fellow enthusiasts through workshops, guest lectures, and competitions that inspire and challenge.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <FeaturedProjects />
      
      <section className="py-16 md:py-24 relative bg-background">
        <div className="container mx-auto px-4">
           <Card className="bg-card border-border/60 overflow-hidden group p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
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
        </div>
      </section>
    </div>
  );
}
