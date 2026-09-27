'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SURVEY_QUESTIONS, Persona } from '../../lib/surveyQuestions';
import { buildPersonaVector, getRecommendedTheme } from '../../lib/personaEngine';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function SurveyPage() {
  const router = useRouter();
  const theme = useTheme();

  const reinitializeLayout = useLayoutStore((s) => s.reinitializeLayout);
  const setTheme = useLayoutStore((s) => s.setTheme);
  const setPersonaVector = useAuthStore((s) => s.setPersonaVector);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [resultVector, setResultVector] = useState<Record<Persona, number> | null>(null);

  const question = SURVEY_QUESTIONS[currentStep];

  const toggleOption = (optionId: string) => {
    setSelectedAnswers((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleNext = () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      finishSurvey();
    }
  };

  const finishSurvey = () => {
    const vector = buildPersonaVector(selectedAnswers);
    setResultVector(vector);
    setPersonaVector(vector);
    reinitializeLayout(vector);

    const recommended = getRecommendedTheme(vector);
    if (recommended) {
      setTheme(recommended);
    }

    setCompleted(true);
  };

  const handleSkip = () => {
    reinitializeLayout(null);
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Progress header */}
      <div className="flex justify-between items-center text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
        <span>Question {currentStep + 1} of {SURVEY_QUESTIONS.length}</span>
        <button onClick={handleSkip} className="hover:underline">
          Skip to Default Homepage →
        </button>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${((currentStep + 1) / SURVEY_QUESTIONS.length) * 100}%`,
            backgroundColor: theme.colors.primary,
          }}
        />
      </div>

      {!completed ? (
        <Card className="p-6 md:p-8 space-y-6">
          <div>
            <Typography variant="h2" className="font-extrabold text-2xl md:text-3xl mb-1">
              {question.title}
            </Typography>
            {question.subtitle && (
              <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
                {question.subtitle}
              </Typography>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedAnswers.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                    isSelected
                      ? 'ring-2 ring-sky-500 font-bold scale-[1.02]'
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${theme.colors.primary}18` : theme.colors.surfaceSecondary || theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    color: theme.colors.text,
                  }}
                >
                  <span className="text-sm">{opt.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                      isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            {currentStep > 0 ? (
              <Button
                title="Back"
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
              />
            ) : (
              <div />
            )}

            <Button
              title={currentStep === SURVEY_QUESTIONS.length - 1 ? 'Generate My Mausam' : 'Continue →'}
              onClick={handleNext}
              disabled={selectedAnswers.length === 0 && currentStep === 0}
            />
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-3xl mx-auto">
            ✨
          </div>

          <div>
            <Typography variant="h2" className="font-extrabold mb-1">
              Your Persona Profile Assembled!
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
              Mausam dynamically assembled your dashboard based on your unique profile weights:
            </Typography>
          </div>

          {resultVector && (
            <div className="space-y-2 text-left max-w-md mx-auto">
              {Object.entries(resultVector)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([p, score]) => (
                  <div key={p} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold capitalize">
                      <span>{p}</span>
                      <span>{Math.round(score * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.round(score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Button
            title="Launch My Homepage →"
            className="w-full max-w-sm mx-auto"
            onClick={() => router.push('/')}
          />
        </Card>
      )}
    </div>
  );
}
