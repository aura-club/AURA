"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, User, ClipboardList, XCircle, ChevronRight, Brain, Zap, Plane, Activity, Rocket, Hammer } from "lucide-react";
import { MCQQuiz } from "./mcq-quiz";
import { getQuestionsForDivision, getAttemptStatus, recordAttempt, Division, DIVISION_CONFIGS, Question } from "@/lib/quiz-engine"; // Updated import

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
  onComplete: (data: UserInfoFormValues & { quizScore: number; quizAnswers: number[]; division: string }) => Promise<void>;
}

export function JoinFormWizard({ onComplete }: JoinFormWizardProps) {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfoFormValues | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt tracking state
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);

  // Check attempts on mount
  useEffect(() => {
    const status = getAttemptStatus();
    setAttemptsLeft(status.attemptsLeft);
    setCooldownTime(status.cooldownUntil);

    // If blocked, go to blocked screen (Step 5)
    if (status.attemptsLeft <= 0 && status.cooldownUntil) {
      setStep(5);
    }
  }, []);

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
    setStep(2); // Move to Division Selection
  };

  const handleDivisionSelect = (division: Division) => {
    setSelectedDivision(division);
    const questions = getQuestionsForDivision(division);
    setQuizQuestions(questions);

    if (attemptsLeft > 0) {
      setStep(3); // Start Quiz
    } else {
      setStep(5); // Blocked
    }
  };

  const handleQuizComplete = async (score: number, answers: number[]) => {
    if (!selectedDivision) return;

    recordAttempt(); // Deduct an attempt
    const status = getAttemptStatus();
    setAttemptsLeft(status.attemptsLeft);
    setCooldownTime(status.cooldownUntil);

    const config = DIVISION_CONFIGS[selectedDivision];
    const passed = score >= config.passingScore;

    if (passed) {
      // Passed - submit to backend
      setIsSubmitting(true);
      try {
        await onComplete({
          ...userInfo!,
          quizScore: score,
          quizAnswers: answers,
          division: selectedDivision,
        });
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Failed
      if (status.attemptsLeft > 0) {
        setStep(4); // Retry screen
      } else {
        setStep(5); // Blocked/Failed screen
      }
    }
  };

  const handleRetry = () => {
    // Regenerate questions for the same division
    if (selectedDivision) {
      setQuizQuestions(getQuestionsForDivision(selectedDivision));
      setStep(3); // Go back to quiz
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const progress = (step / 3) * 100;

  // Step 1: User Information Form (Unchanged Logic, just render)
  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl font-headline">Join Our Club</CardTitle>
          </div>
          <CardDescription>
            Fill in your details to start the membership application process
          </CardDescription>
          <Progress value={20} className="mt-4" />
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
                    <FormLabel>USN *</FormLabel>
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
                      <FormLabel>Email *</FormLabel>
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
                      <FormLabel>Phone *</FormLabel>
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
                    <FormLabel>Statement of Purpose *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why do you want to join AIREINO? What can you contribute?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Next Step</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Division Selection
  if (step === 2) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl font-headline">Select Your Division</CardTitle>
          </div>
          <CardDescription>
            Choose a division to specialize in. You will be tested on relevant topics.
          </CardDescription>
          <Progress value={40} className="mt-4" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            { id: 'Aerodynamics', icon: Plane, label: 'Aerodynamics & Stability', desc: 'Wing design, stability, flight physics.', criteria: 'Passing: 15/25' },
            { id: 'Avionics', icon: Activity, label: 'Avionics & Embedded', desc: 'Flight controllers, sensors, logic.', criteria: 'Passing: 15/25' },
            { id: 'Propulsion', icon: Zap, label: 'Propulsion & Power', desc: 'Motors, batteries, propulsion.', criteria: 'Passing: 15/25' },
            { id: 'Structure', icon: Hammer, label: 'Structures & Materials', desc: 'Manufacturing, CAD, materials science.', criteria: 'Passing: 15/25' },
            { id: 'Elite', icon: Brain, label: 'Elite Division', desc: 'All-rounder exam for Core Members.', criteria: 'Passing: 26/40 (Hard)' }
          ].map((div) => (
            <div
              key={div.id}
              onClick={() => handleDivisionSelect(div.id as Division)}
              className="flex flex-col p-6 border rounded-xl hover:border-accent hover:bg-accent/5 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <div.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">{div.label}</h3>
              </div>
              <p className="text-muted-foreground text-sm flex-1">{div.desc}</p>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">{div.criteria}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Step 3: Quiz
  if (step === 3 && selectedDivision) {
    const config = DIVISION_CONFIGS[selectedDivision];
    return (
      <MCQQuiz
        questions={quizQuestions}
        onComplete={handleQuizComplete}
        attemptNumber={4 - attemptsLeft} // If 3 attempts left, it's 1st attempt. 3 - 3 + 1 = 1.
        maxAttempts={3}
        division={selectedDivision}
        passingScore={config.passingScore}
        timeLimitSeconds={config.timeLimitSeconds}
      />
    );
  }

  // Step 4: Retry Screen
  if (step === 4) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Quiz Failed</CardTitle>
          <CardDescription>
            You didn't meet the passing criteria for {selectedDivision}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg text-left">
            <h4 className="font-semibold mb-2">Status:</h4>
            <div className="flex justify-between items-center text-sm">
              <span>Attempts Remaining:</span>
              <span className="font-bold text-accent">{attemptsLeft}</span>
            </div>
          </div>
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 5: Blocked Screen
  if (step === 5) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-destructive/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-20 w-20 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive font-headline">Access Locked</CardTitle>
          <CardDescription>
            You have exhausted all attempts for today.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-6 rounded-lg text-center">
            <p className="font-medium mb-1">Cooldown Active</p>
            <p className="text-sm text-muted-foreground">Please try again after:</p>
            <p className="text-lg font-mono font-bold mt-2">
              {cooldownTime ? formatTime(cooldownTime) : '24 hours'}
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Refresh Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
