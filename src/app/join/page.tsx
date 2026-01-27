"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { JoinFormWizard } from "@/components/join-form-wizard";

export default function JoinPage() {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (data: {
    name: string;
    usn: string;
    email: string;
    phone: string;
    password: string;
    reason: string;
    quizScore: number;
    quizAnswers: number[];
    division: string;
  }) => {
    setIsSubmitting(true);
    try {
      await signUp(
        data.email,
        data.password,
        data.name,
        data.usn,
        data.phone,
        data.reason,
        data.quizScore,
        data.quizAnswers,
        data.division
      );

      toast({
        title: "Application Submitted! 🎉",
        description: "Your membership request has been sent to the admin for approval. You'll receive an email once approved.",
      });

      router.push('/login');
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-4xl">
        {isSubmitting ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Submitting your application...</p>
          </div>
        ) : (
          <JoinFormWizard onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
