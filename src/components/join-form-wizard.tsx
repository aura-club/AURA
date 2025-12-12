"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, User, ClipboardList } from "lucide-react";
import { MCQQuiz } from "./mcq-quiz";
import { getRandomQuestions, PASSING_SCORE, MAX_ATTEMPTS } from "@/lib/mcq-data";

const userInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  usn: z.string().min(5, "USN must be at least 5 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  reason: z.string().min(20, "Please provide at least 20 characters explaining why you want to join."),
});

type UserInfoFormValues = z.infer<typeof userInfoSchema>;

interface JoinFormWizardProps {
  onComplete: (data: UserInfoFormValues & { quizScore: number; quizAnswers: number[] }) => Promise<void>;
}

export function JoinFormWizard({ onComplete }: JoinFormWizardProps) {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfoFormValues | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState(getRandomQuestions(15));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: "",
      usn: "",
      email: "",
      phone: "",
      password: "",
      reason: "",
    },
  });

  const handleUserInfoSubmit = (data: UserInfoFormValues) => {
    setUserInfo(data);
    setStep(2);
  };

  const handleQuizComplete = async (score: number, answers: number[]) => {
    if (score >= PASSING_SCORE) {
      // Passed - submit to backend
      setIsSubmitting(true);
      try {
        await onComplete({
          ...userInfo!,
          quizScore: score,
          quizAnswers: answers,
        });
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Failed - check attempts
      if (attemptNumber < MAX_ATTEMPTS) {
        // Allow retry
        setAttemptNumber(attemptNumber + 1);
        setQuizQuestions(getRandomQuestions(15)); // New random questions
        setStep(3); // Go to retry screen
      } else {
        // Max attempts reached
        setStep(4); // Go to failure screen
      }
    }
  };

  const handleRetry = () => {
    setStep(2); // Go back to quiz
  };

  const progress = (step / 2) * 100;

  // Step 1: User Information Form
  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl">Join Our Club</CardTitle>
          </div>
          <CardDescription>
            Fill in your details to start the membership application process
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUserInfoSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>USN (University Seat Number) *</FormLabel>
                    <FormControl>
                      <Input placeholder="1JS21CS001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+919876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join? *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain your interest in aeronautical engineering and what you hope to gain from joining the club..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Continue to Quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: MCQ Quiz
  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <ClipboardList className="h-5 w-5" />
          <span>Step 2 of 2: Complete the Screening Quiz</span>
        </div>
        <MCQQuiz
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          attemptNumber={attemptNumber}
          maxAttempts={MAX_ATTEMPTS}
        />
      </div>
    );
  }

  // Step 3: Retry Screen
  if (step === 3) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Failed</CardTitle>
          <CardDescription>
            You didn't pass this time, but you have {MAX_ATTEMPTS - attemptNumber} attempt(s) remaining.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Tips for your next attempt:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review basic aeronautical engineering concepts</li>
              <li>Take your time to read each question carefully</li>
              <li>You need at least 10 correct answers out of 15</li>
            </ul>
          </div>
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Max Attempts Reached
  if (step === 4) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Maximum Attempts Reached</CardTitle>
          <CardDescription>
            You have used all {MAX_ATTEMPTS} attempts for the screening quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm">
              Please contact the club administrators if you believe you should be given another chance.
            </p>
          </div>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
