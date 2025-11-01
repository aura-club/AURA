
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { AlumniOpportunity } from "@/hooks/use-auth";
import { RejectionReasonDialog } from "./rejection-reason-dialog";
import { format } from "date-fns";
import Image from "next/image";

interface AlumniOpportunityReviewDialogProps {
  opportunity: AlumniOpportunity;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  children: React.ReactNode;
}

export function AlumniOpportunityReviewDialog({ opportunity, onApprove, onReject, children }: AlumniOpportunityReviewDialogProps) {
  
  const handleApprove = () => {
    onApprove(opportunity.id);
  };

  const handleConfirmReject = (reason: string) => {
    onReject(opportunity.id, reason);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Badge variant="default" className="w-fit capitalize">{opportunity.category}</Badge>
          <DialogTitle className="font-headline text-2xl pt-2">{opportunity.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Submitted by: {opportunity.authorName} ({opportunity.authorEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p><strong>Description:</strong> {opportunity.description}</p>
        </div>
        
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>

          <RejectionReasonDialog onConfirm={handleConfirmReject}>
            <Button variant="destructive"><X className="h-4 w-4 mr-1" />Reject</Button>
          </RejectionReasonDialog>
          
          <DialogClose asChild>
            <Button onClick={handleApprove}><Check className="h-4 w-4 mr-1" />Approve</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
