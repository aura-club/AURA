"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { MCQQuestion } from "@/lib/mcq-data";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MCQQuizProps {
  questions: MCQQuestion[];
  onComplete: (score: number, answers: number[]) => void;
  attemptNumber: number;
  maxAttempts: number;
}

export function MCQQuiz({ questions, onComplete, attemptNumber, maxAttempts }: MCQQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

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
      if (selectedAnswers[index] === question.correct) {
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

  const isAllAnswered = selectedAnswers.every(answer => answer !== -1);

  if (showResult) {
    const passed = score >= 10;
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {passed ? "Congratulations! 🎉" : "Quiz Failed"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            You scored {score} out of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passed ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You have successfully passed the screening quiz! Your membership request will now be sent to the admin for approval.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    You need at least 10 correct answers to pass. You have {maxAttempts - attemptNumber} {maxAttempts - attemptNumber === 1 ? 'attempt' : 'attempts'} remaining.
  </AlertDescription>
</Alert>

          )}

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Your Performance:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Correct Answers:</span>
                <span className="font-bold text-green-600">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>Wrong Answers:</span>
                <span className="font-bold text-red-600">{questions.length - score}</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Score:</span>
                <span className="font-bold">10 / 15</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500 font-bold' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Attempt {attemptNumber} of {maxAttempts}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between mt-4">
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {selectedAnswers.filter(a => a !== -1).length} answered
          </span>
        </div>
        
        <CardDescription className="mt-2">
          <span className="font-medium text-foreground">{currentQuestion.category}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]?.toString()}
          onValueChange={(value) => handleAnswerSelect(parseInt(value))}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Question Navigation - UPDATED */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-accent text-accent-foreground'
                    : selectedAnswers[index] !== -1
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - UPDATED */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              Submit Quiz
            </Button>
          )}
        </div>

        {!isAllAnswered && currentQuestionIndex === questions.length - 1 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please answer all questions before submitting.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
