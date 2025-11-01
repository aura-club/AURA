import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Alumnus } from "@/hooks/use-auth";

interface ViewAlumnusDetailsDialogProps {
  alumnus: Alumnus | null;
  onClose: () => void;
}

export const ViewAlumnusDetailsDialog: FC<ViewAlumnusDetailsDialogProps> = ({ alumnus, onClose }) => {
  if (!alumnus) return null;

  const linkedInLink = alumnus.socialLinks && Array.isArray(alumnus.socialLinks)
    ? alumnus.socialLinks.find(link => link.platform === "LinkedIn")
    : null;

  return (
    <Dialog open={!!alumnus} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{alumnus.name}</DialogTitle>
          <DialogDescription>Details about {alumnus.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={alumnus.photoURL} alt={alumnus.name} />
            <AvatarFallback>{alumnus.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold">{alumnus.name}</p>
          <p className="text-sm text-muted-foreground">{alumnus.company} | Class of {alumnus.graduationYear}</p>
          <p className="text-sm text-muted-foreground">{alumnus.email}</p>
          <p className="text-sm text-center text-gray-700 dark:text-gray-300">{alumnus.bio}</p>
          <div className="flex gap-2">
            {linkedInLink && (
              <Button asChild>
                <a href={linkedInLink.url} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};