"use client";

import { FC } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AlumniOpportunitiesPage: FC = () => {
  const { alumniOpportunities, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading alumni opportunities...</div>;
  }

  if (alumniOpportunities.length === 0) {
    return <div className="text-center">No alumni opportunities available at the moment.</div>;
  }

  return (
    <div className="space-y-8">
      {alumniOpportunities.map((opportunity) => (
        <Card key={opportunity.id} className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{opportunity.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Posted by {opportunity.authorName} on {new Date(opportunity.createdAt.toDate()).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{opportunity.description}</p>
            {opportunity.externalLinks && opportunity.externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {opportunity.externalLinks.map((link, index) => (
                  <Button asChild key={index} variant="outline" size="sm">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AlumniOpportunitiesPage;
