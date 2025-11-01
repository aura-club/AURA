
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const alumniOpportunitySchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(20, "Description must be at least 20 characters."),
});

type AlumniOpportunityFormValues = z.infer<typeof alumniOpportunitySchema>;

interface AddAlumniOpportunityDialogProps {
  children: React.ReactNode;
}

export function AddAlumniOpportunityDialog({ children }: AddAlumniOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const { addAlumniOpportunity } = useAuth();
  const { toast } = useToast();

  const form = useForm<AlumniOpportunityFormValues>({
    resolver: zodResolver(alumniOpportunitySchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: AlumniOpportunityFormValues) {
    try {
      await addAlumniOpportunity({ ...data, category: "alumni" });
      toast({
        title: "Opportunity Submitted!",
        description: "The alumni opportunity is now pending review.",
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Submission Failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit the opportunity. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Alumni Opportunity</DialogTitle>
          <DialogDescription>
            Share an opportunity with the alumni network.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Networking Event" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="A detailed description of the opportunity." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
