
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, type AppDbUser } from "@/hooks/use-auth";
import { Check, X, User, Mail, GraduationCap, Trophy, AlertCircle, Clock } from "lucide-react";
import { getQuestionsForDivision, Division } from "@/lib/quiz-engine";

interface MarksCardDialogProps {
    user: AppDbUser;
    onApprove: (email: string) => Promise<void>;
    onDeny: (email: string) => Promise<void>;
}

export function MarksCardDialog({ user, onApprove, onDeny }: MarksCardDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate detailed stats
    const totalQuestions = user.quizDivision === 'Elite' ? 40 : 25;
    const score = user.quizScore || 0;
    // If we had the actual answers array stored in user object, we could calculate exact correct/wrong counts.
    // Currently AppDbUser only has quizScore. 
    // Wait, I just updated AppDbUser to only have quizScore and quizDivision. I didn't add quizAnswers to AppDbUser, only to QuizAttempt collection.
    // Accessing the 'quizAttempts' collection here would be ideal, but for now, we can infer some data.
    // Actually, without the answers array, I can't show "Correct: X, Wrong: Y" precisely if negative marking existed, but here 1 Q = 1 Mark.
    // So Correct = Score. Wrong = Total - Score.
    const correct = score;
    const wrong = totalQuestions - score;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Determine Pass/Fail status based on Division
    // Standard: 15/25 (60%). Elite: 26/40 (65%).
    const passingScore = user.quizDivision === 'Elite' ? 26 : 15;
    const isPassed = score >= passingScore;

    const handleApprove = async () => {
        setIsLoading(true);
        await onApprove(user.email);
        setIsLoading(false);
        setOpen(false);
    };

    const handleDeny = async () => {
        setIsLoading(true);
        await onDeny(user.email);
        setIsLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    View Marks
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-headline">
                        Candidate Marks Card
                        <Badge variant={isPassed ? "default" : "destructive"} className="ml-2">
                            {isPassed ? "PASSED" : "FAILED"}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Detailed exam performance for {user.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="p-2 bg-background rounded-full">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Candidate Name</p>
                                <p className="font-medium text-sm">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="p-2 bg-background rounded-full">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="font-medium text-sm truncate" title={user.email}>{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="p-2 bg-background rounded-full">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Exam Division</p>
                                <p className="font-medium text-sm">{user.quizDivision || "General/Unknown"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="p-2 bg-background rounded-full">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Attempts Taken</p>
                                <p className="font-medium text-sm">{user.attemptCount || 1}</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <Card className="border-2 border-primary/10">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center text-center mb-6">
                                <div className="text-4xl font-bold font-headline mb-1">
                                    {score} <span className="text-xl text-muted-foreground">/ {totalQuestions}</span>
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Total Score</div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correct}</div>
                                    <div className="text-xs text-muted-foreground">Correct</div>
                                </div>
                                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{wrong}</div>
                                    <div className="text-xs text-muted-foreground">Wrong</div>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</div>
                                    <div className="text-xs text-muted-foreground">Percentage</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    {user.usn && (
                        <div className="text-xs text-muted-foreground flex gap-4">
                            <span><strong>USN:</strong> {user.usn}</span>
                            {user.phone && <span><strong>Phone:</strong> {user.phone}</span>}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none"
                            onClick={handleDeny}
                            disabled={isLoading}
                        >
                            <X className="mr-2 h-4 w-4" /> Deny
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none"
                            onClick={handleApprove}
                            disabled={isLoading}
                        >
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
