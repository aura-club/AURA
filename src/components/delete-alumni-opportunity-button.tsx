"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteAlumniOpportunityButtonProps {
  opportunityId: string;
  opportunityTitle: string;
}

export function DeleteAlumniOpportunityButton({ 
  opportunityId, 
  opportunityTitle 
}: DeleteAlumniOpportunityButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAlumniOpportunity } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAlumniOpportunity(opportunityId);
      toast({
        title: "Opportunity Deleted",
        description: `"${opportunityTitle}" has been successfully deleted.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete the opportunity. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
        title="Delete Alumni Opportunity"
        description={`Are you sure you want to delete "${opportunityTitle}"? This action cannot be undone.`}
      />
    </>
  );
}
