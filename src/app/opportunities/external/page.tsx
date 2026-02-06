

"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import type { ExternalOpportunity, ExternalType } from "@/hooks/use-auth";
import { Briefcase, FlaskConical, Users, Trophy } from "lucide-react";
import { ExternalOpportunityDetailsDialog } from "@/components/external-opportunity-details-dialog";

const typeInfo: { [key in ExternalType]: { icon: React.ReactNode; } } = {
    Internship: { icon: <Briefcase className="h-4 w-4" /> },
    Research: { icon: <FlaskConical className="h-4 w-4" /> },
    "Project Team": { icon: <Users className="h-4 w-4" /> },
    Competition: { icon: <Trophy className="h-4 w-4" /> },
};


const ExternalListItem = ({ opportunity }: { opportunity: ExternalOpportunity }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-4">
            <div>
                <Badge variant="outline" className="flex items-center gap-2 mb-2 w-fit">
                    {typeInfo[opportunity.externalType].icon}
                    {opportunity.externalType}
                </Badge>
                <h3 className="font-headline text-lg">{opportunity.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.organization}
                </p>
            </div>
            <ExternalOpportunityDetailsDialog opportunity={opportunity}>
                <Button variant="outline" className="w-full sm:w-auto flex-shrink-0">View Details</Button>
            </ExternalOpportunityDetailsDialog>
        </div>
    );
};

export default function ExternalPage() {
    const { opportunities } = useAuth();
    const [typeFilter, setTypeFilter] = useState<ExternalType | "all">("all");
    const [statusFilter, setStatusFilter] = useState<"upcoming" | "past" | "all">("all");

    const externalOpps = useMemo(() => {
        let filtered = opportunities
            .filter(o => o.status === 'approved' && o.category === 'external') as ExternalOpportunity[];

        if (typeFilter !== "all") {
            filtered = filtered.filter(e => e.externalType === typeFilter);
        }

        if (statusFilter !== "all") {
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today
            filtered = filtered.filter(e => {
                const deadlineDate = new Date(e.deadline);
                return statusFilter === 'upcoming' ? deadlineDate >= now : deadlineDate < now;
            });
        }

        return filtered.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    }, [opportunities, typeFilter, statusFilter]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All External Opps</SelectItem>
                        <SelectItem value="Internship">Internships</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Project Team">Project Teams</SelectItem>
                        <SelectItem value="Competition">Competitions</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All External Opps</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {externalOpps.length > 0 ? (
                <div className="divide-y divide-border rounded-lg border bg-card">
                    {externalOpps.map(opp => <ExternalListItem key={opp.id} opportunity={opp} />)}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-lg font-medium text-muted-foreground">No external opportunities match the current filters.</p>
                    <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or check back later!</p>
                </div>
            )}
        </div>
    );
}
