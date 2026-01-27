"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Briefcase, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const opportunityBaseSchema = z.object({
    category: z.enum(["event", "session", "external"], { required_error: "Please select a category." }),
});

const eventSchema = opportunityBaseSchema.extend({
    category: z.literal("event"),
    title: z.string().min(3, "Title is required"),
    eventType: z.enum(["Talk", "Competition", "Workshop"], { required_error: "Please select an event type." }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please enter a valid date." }),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(3, "Location or link is required"),
    description: z.string().min(20, "Description must be at least 20 characters."),
    host: z.string().optional(),
    image: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
});

const sessionSchema = opportunityBaseSchema.extend({
    category: z.literal("session"),
    title: z.string().min(3, "Session title is required"),
    venue: z.string().min(3, "Venue is required"),
    time: z.string().min(1, "Time is required (e.g., 'Wednesdays at 7 PM')"),
    description: z.string().min(10, "Overview must be at least 10 characters."),
});

const externalSchema = opportunityBaseSchema.extend({
    category: z.literal("external"),
    title: z.string().min(3, "Title is required"),
    externalType: z.enum(["Research", "Internship", "Project Team", "Competition"], { required_error: "Please select a type." }),
    organization: z.string().min(2, "Organization/Project name is required."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    eligibility: z.string().min(10, "Eligibility requirements are required."),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please enter a valid date." }),
    applicationInstructions: z.string().min(10, "Application instructions are required."),
});

const opportunitySchema = z.discriminatedUnion("category", [eventSchema, sessionSchema, externalSchema]);
type OpportunityFormValues = z.infer<typeof opportunitySchema>;

const getInitialValues = (category?: "event" | "session" | "external"): Partial<OpportunityFormValues> => {
    const base = {
        title: "",
        description: "",
    };
    switch (category) {
        case "event":
            return { ...base, category, eventType: undefined, date: "", time: "", location: "", host: "", image: "" };
        case "session":
            return { ...base, category, venue: "", time: "" };
        case "external":
            return { ...base, category, externalType: undefined, organization: "", eligibility: "", deadline: "", applicationInstructions: "" };
        default:
            return { category: undefined };
    }
};

export function AddOpportunityDialog({ children }: { children?: React.ReactNode }) {
    const { addOpportunity } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState<"event" | "session" | "external" | "">("");

    const form = useForm<OpportunityFormValues>({
        resolver: zodResolver(opportunitySchema),
        defaultValues: getInitialValues(),
    });

    async function onSubmit(data: OpportunityFormValues) {
        try {
            await addOpportunity(data);
            toast({
                title: "Opportunity Submitted!",
                description: "The opportunity has been successfully created.",
            });
            setOpen(false);
            form.reset();
            setCategory("");
        } catch (error: any) {
            console.error("Submission Failed:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "Could not submit your opportunity. Please try again.",
            });
        }
    }

    const renderFormFields = () => {
        switch (category) {
            case "event": return (
                <>
                    <FormField control={form.control} name="eventType" render={({ field }) => (
                        <FormItem><FormLabel>Event Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an event type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Talk">Talk</SelectItem><SelectItem value="Competition">Competition</SelectItem><SelectItem value="Workshop">Workshop</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Annual Rocketry Competition" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="time" render={({ field }) => (
                            <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g., 6:00 PM - 8:00 PM" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location / Link</FormLabel><FormControl><Input placeholder="e.g., Engineering Bldg, Room 201 or 'Virtual'" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="host" render={({ field }) => (
                        <FormItem><FormLabel>Host Organization (Optional)</FormLabel><FormControl><Input placeholder="e.g., NASA, SpaceX" {...field} /></FormControl><FormDescription>Leave blank if this is an internal AIREINO Nexus event.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A detailed description of the event." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/event-image.png" {...field} /></FormControl><FormDescription>A direct link to a promotional image for the event.</FormDescription><FormMessage /></FormItem>
                    )} />
                </>
            );
            case "session": return (
                <>
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Session Title</FormLabel><FormControl><Input placeholder="e.g., Weekly CAD Practice" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="venue" render={({ field }) => (
                        <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g., Design Lab (ENGR 312)" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g., Every Wednesday, 7 PM - 9 PM" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Brief Overview</FormLabel><FormControl><Textarea placeholder="What happens during this session?" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </>
            );
            case "external": return (
                <>
                    <FormField control={form.control} name="externalType" render={({ field }) => (
                        <FormItem><FormLabel>Opportunity Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Research">Research</SelectItem><SelectItem value="Internship">Internship</SelectItem><SelectItem value="Project Team">Join Project Team</SelectItem><SelectItem value="Competition">Competition</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Research Fellowship" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="organization" render={({ field }) => (
                            <FormItem><FormLabel>Organization / Project</FormLabel><FormControl><Input placeholder="e.g., NASA JPL or Project Chimera" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="deadline" render={({ field }) => (
                            <FormItem><FormLabel>Application Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Brief Description</FormLabel><FormControl><Textarea placeholder="Describe the opportunity." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eligibility" render={({ field }) => (
                        <FormItem><FormLabel>Eligibility Requirements</FormLabel><FormControl><Textarea placeholder="Who is eligible to apply?" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="applicationInstructions" render={({ field }) => (
                        <FormItem><FormLabel>Application Instructions</FormLabel><FormControl><Textarea placeholder="How can members apply? Include links, contacts, etc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </>
            );
            default: return <p className="text-sm text-muted-foreground text-center py-8">Please select a category to begin.</p>;
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Opportunity
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Add New Opportunity</DialogTitle>
                    <DialogDescription>Share an event, session, or external opportunity.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opportunity Category</FormLabel>
                                        <Select onValueChange={(value) => {
                                            const newCategory = value as "event" | "session" | "external";
                                            field.onChange(newCategory);
                                            setCategory(newCategory);
                                            form.reset(getInitialValues(newCategory));
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an opportunity category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="event"><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Event</span></div></SelectItem>
                                                <SelectItem value="session"><div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Club Session</span></div></SelectItem>
                                                <SelectItem value="external"><div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>External</span></div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {renderFormFields()}

                            {category && (
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
