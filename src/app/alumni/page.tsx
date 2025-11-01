"use client";

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { ViewAlumnusDetailsDialog } from "@/components/view-alumnus-details-dialog";

interface Alumnus {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  company: string;
  bio: string;
  photoURL: string;
  socialLinks?: { platform: string; url: string; }[];
}

const AlumniPage: FC = () => {
  const { user } = useAuth();
  const [alumniData, setAlumniData] = useState<Alumnus[]>([]);
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);

  const handleViewMore = (alumnus: Alumnus) => {
    setSelectedAlumnus(alumnus);
  };

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const alumniCollection = collection(db, 'alumni');
        const alumniSnapshot = await getDocs(alumniCollection);
        const alumniList = alumniSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Alumnus);
        setAlumniData(alumniList);
      } catch (error) {
        console.error('Error fetching alumni data: ', error);
      }
    };

    fetchAlumni();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Alumni</h1>
          <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
            Meet the talented individuals who have been a part of our journey.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {alumniData.map((alumnus, index) => (
            <Card key={index} className="bg-card border-border/60">
              <CardHeader className="items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={alumnus.photoURL} alt={alumnus.name} />
                  <AvatarFallback>{alumnus.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline mt-4">{alumnus.name}</CardTitle>
                <p className="text-muted-foreground">Batch of {alumnus.graduationYear}</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{alumnus.bio}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center gap-4">
                  <Button asChild variant="outline">
                    <a href={`mailto:${alumnus.email}`}>Email</a>
                  </Button>
                  {/* LinkedIn Button */}
                  {alumnus.socialLinks && Array.isArray(alumnus.socialLinks) && alumnus.socialLinks.map((link) => (
                    link.platform === "LinkedIn" && (
                      <Button asChild key={link.url}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                      </Button>
                    )
                  ))}
                  {/* View More Button */}
                  <Button variant="secondary" onClick={() => handleViewMore(alumnus)}>
                    View More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ViewAlumnusDetailsDialog
        alumnus={selectedAlumnus}
        onClose={() => setSelectedAlumnus(null)}
      />
    </>
  );
};

export default AlumniPage;
