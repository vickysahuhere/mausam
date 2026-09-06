import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SURVEY_QUESTIONS } from '../../lib/surveyQuestions';
import { buildPersonaVector } from '../../lib/personaEngine';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function Survey() {
  const router = useRouter();
  const setPersonaVector = useAuthStore((state) => state.setPersonaVector);
  const completeSurvey = useAuthStore((state) => state.completeSurvey);
  const theme = useTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  
  const currentQuestion = SURVEY_QUESTIONS[currentStep];
  const currentSelections = selections[currentQuestion.id] || [];
  const canProceed = currentSelections.length > 0;

  const handleToggleOption = (optionId: string) => {
    setSelections(prev => {
      const selected = prev[currentQuestion.id] || [];
      if (currentQuestion.type === 'single') {
        return { ...prev, [currentQuestion.id]: [optionId] };
      }
      
      if (selected.includes(optionId)) {
        return { ...prev, [currentQuestion.id]: selected.filter(id => id !== optionId) };
      } else if (selected.length < 3) {
        return { ...prev, [currentQuestion.id]: [...selected, optionId] };
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishSurvey();
    }
  };

  const finishSurvey = (skip: boolean = false) => {
    const allSelectedIds = skip ? [] : Object.values(selections).flat();
    const vector = buildPersonaVector(allSelectedIds);
    setPersonaVector(vector);
    completeSurvey();
    router.push('/onboarding/location-setup');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
      }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.s }}>
          {SURVEY_QUESTIONS.map((_, idx) => (
            <View 
              key={idx} 
              style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: idx === currentStep ? theme.colors.primary : theme.colors.border
              }} 
            />
          ))}
        </View>
        <Button 
          title="Start Custom (Skip)" 
          variant="ghost" 
          onPress={() => finishSurvey(true)}
          style={{ paddingHorizontal: 0, paddingVertical: 0 }}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.l }}>
        <Typography variant="h2" style={{ marginBottom: theme.spacing.xs }}>{currentQuestion.title}</Typography>
        {currentQuestion.subtitle && (
          <Typography variant="bodyMedium" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.xl }}>
            {currentQuestion.subtitle}
          </Typography>
        )}

        <View style={{ gap: theme.spacing.m }}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentSelections.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => handleToggleOption(option.id)}
              >
                <Card style={[
                  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: theme.colors.border },
                  isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface } // Keeping simple selection visual
                ]}>
                  <Typography 
                    variant="bodyMedium" 
                    color={isSelected ? theme.colors.primary : theme.colors.text}
                    style={{ flex: 1, flexShrink: 1, minWidth: 0, marginRight: theme.spacing.s }}
                  >
                    {option.label}
                  </Typography>
                  <View style={[
                    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border, flexShrink: 0 },
                    isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }
                  ]} />
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={{
        padding: theme.spacing.l,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}>
        <Button 
          title={currentStep === SURVEY_QUESTIONS.length - 1 ? "Finish" : "Next"} 
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
    </SafeAreaView>
  );
}
