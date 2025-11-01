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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Alumnus } from "@/hooks/use-auth";
import { useState } from "react";

const alumnusSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  graduationYear: z.coerce.number().min(2000, "Invalid graduation year."),
  company: z.string().min(2, "Company is required."),
  bio: z.string().min(10, "Bio must be at least 10 characters.").max(200, "Bio cannot exceed 200 characters."),
  photoURL: z.string().url("A valid image URL is required."),
  socialLinks: z.string().url("A valid URL is required.").optional().or(z.literal("")),
});

type AlumnusFormValues = z.infer<typeof alumnusSchema>;

interface EditAlumnusDialogProps {
  children: React.ReactNode;
  alumnus?: Alumnus;
}

export function EditAlumnusDialog({ children, alumnus }: EditAlumnusDialogProps) {
  const [open, setOpen] = useState(false);
  const { addAlumnus, updateAlumnus } = useAuth();
  const { toast } = useToast();
  const isEditing = !!alumnus;

  const form = useForm<AlumnusFormValues>({
    resolver: zodResolver(alumnusSchema),
    defaultValues: {
      name: alumnus?.name || "",
      email: alumnus?.email || "",
      graduationYear: alumnus?.graduationYear || new Date().getFullYear(),
      company: alumnus?.company || "",
      bio: alumnus?.bio || "",
      photoURL: alumnus?.photoURL || "",
      socialLinks: alumnus?.socialLinks?.[0]?.url || "",
    },
  });

  async function onSubmit(data: AlumnusFormValues) {
    if (!form.formState.isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form.",
      });
      return;
    }
    try {
      const socialLinksArray = data.socialLinks ? [{ platform: "LinkedIn", url: data.socialLinks }] : [];
      if (isEditing && alumnus) {
        await updateAlumnus({ id: alumnus.id, ...data, socialLinks: socialLinksArray });
        toast({ title: "Alumnus Updated", description: "The alumnus's details have been saved." });
      } else {
        await addAlumnus({ ...data, socialLinks: socialLinksArray });
        toast({ title: "Alumnus Added", description: "The new alumnus has been added." });
      }
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to save alumnus", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? "Edit Alumnus" : "Add New Alumnus"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this alumnus." : "Add a new alumnus."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Alex Thompson" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="e.g., alex@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio</FormLabel>
                  <FormControl><Textarea placeholder="A short bio." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com/photo.png" {...field} /></FormControl>
                  <FormDescription>A direct link to a square (1:1 aspect ratio) photo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL</FormLabel>
                  <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} /></FormControl>
                  <FormDescription>Optional: Your LinkedIn profile URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}