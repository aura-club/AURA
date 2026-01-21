"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, XCircle, Clock, Maximize2, Minimize2 } from "lucide-react";
import { Question, Division } from "@/lib/quiz-engine"; // Updated import
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MCQQuizProps {
  questions: Question[];
  onComplete: (score: number, answers: number[]) => void;
  attemptNumber: number;
  maxAttempts: number;
  division: Division;
  passingScore: number;
  timeLimitSeconds: number;
}

export function MCQQuiz({ questions, onComplete, attemptNumber, maxAttempts, division, passingScore, timeLimitSeconds }: MCQQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to true as requested

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctIndex) { // Updated property name
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
    onComplete(correctCount, selectedAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAllAnswered = selectedAnswers.every((answer) => answer !== -1);

  // Fullscreen container styles
  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto"
    : "w-full max-w-4xl mx-auto";

  const cardClass = isFullscreen
    ? "w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col"
    : "w-full max-w-4xl mx-auto";

  if (showResult) {
    const passed = score >= passingScore;
    return (
      <div className={containerClass}>
        <Card className="w-full max-w-3xl mx-auto border-border/60 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle2 className="h-20 w-20 text-green-500 animate-pulse" />
              ) : (
                <XCircle className="h-20 w-20 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl font-headline">
              {passed ? "Congratulations! 🎉" : "Quiz Failed"}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              You scored {score} out of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passed ? (
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  You have successfully passed the {division} Division screening! Your membership request will now be processed.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need at least {passingScore} correct answers to pass. You have {Math.max(0, maxAttempts - attemptNumber)} {Math.max(0, maxAttempts - attemptNumber) === 1 ? 'attempt' : 'attempts'} remaining.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-6 rounded-lg space-y-3">
              <h3 className="font-semibold mb-2">Performance Summary:</h3>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Division:</span>
                <span className="font-medium">{division}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Correct Answers:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{score}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Wrong Answers:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{questions.length - score}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-bold">{passingScore} / {questions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Card className={`${cardClass} border-border/60 shadow-2xl`}>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className={`font-mono font-medium ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
                {division} Division
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Attempt {attemptNumber} of {maxAttempts}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <CardTitle className="text-xl font-headline">Question {currentQuestionIndex + 1} <span className="text-muted-foreground font-normal text-base">/ {questions.length}</span></CardTitle>
            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground uppercase font-semibold tracking-wider">
              {currentQuestion.difficulty}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-medium leading-relaxed font-headline">
              {currentQuestion.question}
            </h3>

            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 group ${selectedAnswers[currentQuestionIndex] === index
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-border hover:border-accent/50 hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="data-[state=checked]:border-accent data-[state=checked]:text-accent" />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base md:text-lg font-normal group-hover:text-foreground/90"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <div className="p-6 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-all ${index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : selectedAnswers[index] !== -1
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNext} className="flex-1 sm:flex-none">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isAllAnswered}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
