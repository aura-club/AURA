"use client";

import { FC, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { projects } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter((project) =>
      project.title.toLowerCase().includes(query) ||
      project.excerpt.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.teamMembers?.some(member => member.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Projects</h1>
        <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
          Explore the innovative projects being developed by AIREINO Nexus members.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects by title, description, or team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-card border-border/60 hover:border-border transition-colors flex flex-col">
              {project.thumbnailImage && (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={project.thumbnailImage}
                    alt={project.title}
                    className="h-full w-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <CardHeader className="flex-1">
                <CardTitle className="font-headline">{project.title}</CardTitle>
                <CardDescription>{project.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/projects/${project.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery ? 'No projects match your search.' : 'No projects available.'}
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={handleClearSearch}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
