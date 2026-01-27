"use client";

import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";

export function LoadingScreen({ className }: { className?: string }) {
    return (
        <div className={cn("fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background", className)}>
            <div className="relative flex items-center justify-center">
                {/* Outer Ring - Slow Shine */}
                <div className="absolute h-32 w-32 rounded-full border border-primary/20 animate-[spin_8s_linear_infinite]" />

                {/* Middle Ring - Reverse Spin */}
                <div className="absolute h-24 w-24 rounded-full border-t-2 border-b-2 border-accent/50 animate-[spin_3s_linear_infinite_reverse]" />

                {/* Inner Ring - Fast Spin */}
                <div className="absolute h-16 w-16 rounded-full border-r-2 border-l-2 border-primary animate-spin" />

                {/* Center Logo/Icon - Pulse */}
                <div className="relative h-10 w-10 flex items-center justify-center bg-background rounded-full z-10 animate-pulse">
                    <Plane className="h-6 w-6 text-accent -rotate-45" />
                </div>

                {/* Radar Effect background */}
                <div className="absolute h-64 w-64 rounded-full bg-accent/5 animate-pulse blur-3xl opacity-20" />
            </div>

            {/* Text Loading */}
            <div className="mt-8 flex flex-col items-center gap-1">
                <h2 className="text-xl font-headline font-bold tracking-widest text-primary animate-pulse">
                    LOADING
                </h2>
                <div className="flex gap-1">
                    <div className="h-1 w-1 bg-accent rounded-full animate-bounce delay-75" />
                    <div className="h-1 w-1 bg-accent rounded-full animate-bounce delay-150" />
                    <div className="h-1 w-1 bg-accent rounded-full animate-bounce delay-300" />
                </div>
            </div>
        </div>
    );
}
