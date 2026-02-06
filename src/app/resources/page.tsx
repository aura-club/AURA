"use client";

import { useState, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Download, Search, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { Resource } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

const ResourceListItem = ({ title, description, link, image, category }: Resource) => (
  <Card className="bg-card border-border/60 overflow-hidden">
    <div className="flex flex-col sm:flex-row">
      {image && (
        <div className="sm:w-1/3 aspect-video relative bg-muted p-4">
          <Image
            src={image}
            alt={title}
            data-ai-hint={`${category} icon`}
            fill
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className={`flex flex-col ${image ? 'sm:w-2/3' : 'w-full'}`}>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <CardTitle className="font-headline text-lg">{title}</CardTitle>
            </div>
            <Button variant="secondary" asChild className="flex-shrink-0">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Get
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </div>
    </div>
  </Card>
);

const ResourceCategoryContent = ({ resources }: { resources: Resource[] }) => (
  <div className="space-y-4">
    {resources.length > 0 ? (
      resources.map((item) => <ResourceListItem key={item.id} {...item} />)
    ) : (
      <p className="text-muted-foreground text-sm text-center py-8">No resources in this category yet.</p>
    )}
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="flex flex-col sm:flex-row bg-card border-border/60 overflow-hidden">
        <div className="sm:w-1/3">
          <Skeleton className="h-full w-full aspect-video" />
        </div>
        <div className="sm:w-2/3 p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    ))}
  </div>
);

export default function ResourcesPage() {
  const { resources, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const approvedResources = resources.filter(r => r.status === 'approved');

  const categories = ["Plug-ins", "Research Papers", "3D Designs", "Blueprints"];
  const categorizedResources: { [key: string]: Resource[] } = {
    "Plug-ins": approvedResources.filter(r => r.category === "Plug-ins"),
    "Research Papers": approvedResources.filter(r => r.category === "Research Papers"),
    "3D Designs": approvedResources.filter(r => r.category === "3D Designs"),
    "Blueprints": approvedResources.filter(r => r.category === "Blueprints"),
  };

  // Filter resources based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return approvedResources;

    const query = searchQuery.toLowerCase();
    return approvedResources.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );
  }, [approvedResources, searchQuery]);

  // Get filtered resources for each category
  const filteredCategorized = useMemo(() => {
    return {
      "Plug-ins": filteredResources.filter(r => r.category === "Plug-ins"),
      "Research Papers": filteredResources.filter(r => r.category === "Research Papers"),
      "3D Designs": filteredResources.filter(r => r.category === "3D Designs"),
      "Blueprints": filteredResources.filter(r => r.category === "Blueprints"),
    };
  }, [filteredResources]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Resource Hub</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          A curated collection of tools, papers, and assets for aerospace enthusiasts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources by title, description, or category..."
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
            Found {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-primary/20">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat.replace(/\s+/g, '-').toLowerCase()}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredResources.length > 0 ? (
            <div className="space-y-4">
              {filteredResources.map((item) => (
                <ResourceListItem key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No resources match your search.' : 'No resources have been added yet.'}
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
              {!searchQuery && (
                <p className="mt-2 text-sm text-muted-foreground">Check back soon or, if you're a member, add a resource from your dashboard!</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plug-ins">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredCategorized["Plug-ins"].length > 0 ? (
            <ResourceCategoryContent resources={filteredCategorized["Plug-ins"]} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No plug-ins match your search.' : 'No plug-ins in this category yet.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="research-papers">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredCategorized["Research Papers"].length > 0 ? (
            <ResourceCategoryContent resources={filteredCategorized["Research Papers"]} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No research papers match your search.' : 'No research papers in this category yet.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="3d-designs">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredCategorized["3D Designs"].length > 0 ? (
            <ResourceCategoryContent resources={filteredCategorized["3D Designs"]} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No 3D designs match your search.' : 'No 3D designs in this category yet.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="blueprints">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredCategorized["Blueprints"].length > 0 ? (
            <ResourceCategoryContent resources={filteredCategorized["Blueprints"]} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No blueprints match your search.' : 'No blueprints in this category yet.'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
