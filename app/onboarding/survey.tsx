import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SURVEY_QUESTIONS } from '../../lib/surveyQuestions';
import { buildPersonaVector } from '../../lib/personaEngine';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function Survey() {
  const router = useRouter();
  const setPersonaVector = useAuthStore((state) => state.setPersonaVector);
  const completeSurvey = useAuthStore((state) => state.completeSurvey);
  
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
      
      // Multi-select logic (limit to 3 per TRD)
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
    // Collect all selected IDs
    const allSelectedIds = skip ? [] : Object.values(selections).flat();
    const vector = buildPersonaVector(allSelectedIds);
    setPersonaVector(vector);
    completeSurvey();
    router.push('/onboarding/location-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {SURVEY_QUESTIONS.map((_, idx) => (
            <View 
              key={idx} 
              style={[styles.progressDot, idx === currentStep && styles.progressDotActive]} 
            />
          ))}
        </View>
        <Button 
          title="Start Custom (Skip)" 
          variant="ghost" 
          onPress={() => finishSurvey(true)}
          style={styles.skipBtn}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll}>
        <Typography variant="h2" style={styles.title}>{currentQuestion.title}</Typography>
        {currentQuestion.subtitle && (
          <Typography variant="bodyMedium" color={colors.textSecondary} style={styles.subtitle}>
            {currentQuestion.subtitle}
          </Typography>
        )}

        <View style={styles.optionsList}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentSelections.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => handleToggleOption(option.id)}
              >
                <Card style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
                  <Typography 
                    variant="bodyMedium" 
                    color={isSelected ? colors.primaryDark : colors.text}
                  >
                    {option.label}
                  </Typography>
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={currentStep === SURVEY_QUESTIONS.length - 1 ? "Finish" : "Next"} 
          onPress={handleNext}
          disabled={!canProceed && !skipAllowed(currentSelections)}
        />
      </View>
    </SafeAreaView>
  );
}

// Ensure button is disabled if required, although "skip" is an option in the header.
function skipAllowed(selections: string[]) {
  return selections.length === 0 ? false : true;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  progressContainer: { flexDirection: 'row', gap: spacing.s },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.primary },
  skipBtn: { paddingHorizontal: 0, paddingVertical: 0 },
  content: { flex: 1 },
  contentScroll: { padding: spacing.l },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xl },
  optionsList: { gap: spacing.m },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E6F4FE', // Light primary tint
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  footer: {
    padding: spacing.l,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
