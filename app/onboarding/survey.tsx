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
import { useLayoutStore } from '../../store/useLayoutStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { SupportedLocale } from '../../lib/i18n';

const LANGUAGE_STEP_OPTIONS: { id: SupportedLocale; label: string; sub: string }[] = [
  { id: 'en', label: 'English', sub: 'Standard' },
  { id: 'hi', label: 'हिन्दी (Hindi)', sub: 'उत्तर और मध्य भारत' },
  { id: 'mr', label: 'मराठी (Marathi)', sub: 'महाराष्ट्र' },
  { id: 'ta', label: 'தமிழ் (Tamil)', sub: 'தமிழ்நாடு' },
  { id: 'bn', label: 'বাংলা (Bengali)', sub: 'পশ্চিমবঙ্গ' },
  { id: 'te', label: 'తెలుగు (Telugu)', sub: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
];

export default function Survey() {
  const router = useRouter();
  const setPersonaVector = useAuthStore((state) => state.setPersonaVector);
  const completeSurvey = useAuthStore((state) => state.completeSurvey);
  const theme = useTheme();
  const { locale, setLocale, t } = useLocaleStore();
  
  // Step 0 is Language, Steps 1..N are Lifestyle Questions
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  
  const totalSteps = 1 + SURVEY_QUESTIONS.length;
  const isLanguageStep = currentStep === 0;
  const currentLifestyleQuestion = !isLanguageStep ? SURVEY_QUESTIONS[currentStep - 1] : null;

  const currentSelections = isLanguageStep
    ? [locale]
    : selections[currentLifestyleQuestion!.id] || [];
  const canProceed = isLanguageStep ? !!locale : currentSelections.length > 0;

  const handleSelectLanguage = (lang: SupportedLocale) => {
    setLocale(lang);
  };

  const handleToggleOption = (optionId: string) => {
    if (!currentLifestyleQuestion) return;
    setSelections(prev => {
      const selected = prev[currentLifestyleQuestion.id] || [];
      if (currentLifestyleQuestion.type === 'single') {
        return { ...prev, [currentLifestyleQuestion.id]: [optionId] };
      }
      
      if (selected.includes(optionId)) {
        return { ...prev, [currentLifestyleQuestion.id]: selected.filter(id => id !== optionId) };
      } else if (selected.length < 3) {
        return { ...prev, [currentLifestyleQuestion.id]: [...selected, optionId] };
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
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
    useLayoutStore.getState().reinitializeLayout(vector);

    const hasLocation = useLocationStore.getState().locations.some((l) => l.isDefault);
    if (hasLocation) {
      router.replace('/(tabs)');
    } else {
      router.push('/onboarding/location-setup');
    }
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
          {Array.from({ length: totalSteps }).map((_, idx) => (
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
        {isLanguageStep ? (
          <>
            <Typography variant="h2" style={{ marginBottom: theme.spacing.xs, letterSpacing: -0.5 }}>
              Choose Your Language
            </Typography>
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.xl }}>
              Select your preferred language for forecasts, alerts & radar
            </Typography>

            <View style={{ gap: theme.spacing.m }}>
              {LANGUAGE_STEP_OPTIONS.map((opt) => {
                const isSelected = locale === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectLanguage(opt.id)}
                  >
                    <Card style={[
                      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: theme.colors.border },
                      isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface }
                    ]}>
                      <View style={{ flex: 1, marginRight: theme.spacing.s }}>
                        <Typography 
                          variant="bodyMedium" 
                          color={isSelected ? theme.colors.primary : theme.colors.text}
                          style={{ fontWeight: isSelected ? '700' : '600' }}
                        >
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {opt.sub}
                        </Typography>
                      </View>
                      <View style={[
                        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border },
                        isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }
                      ]} />
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Typography variant="h2" style={{ marginBottom: theme.spacing.xs }}>{currentLifestyleQuestion!.title}</Typography>
            {currentLifestyleQuestion!.subtitle && (
              <Typography variant="bodyMedium" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.xl }}>
                {currentLifestyleQuestion!.subtitle}
              </Typography>
            )}

            <View style={{ gap: theme.spacing.m }}>
              {currentLifestyleQuestion!.options.map((option) => {
                const isSelected = currentSelections.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() => handleToggleOption(option.id)}
                  >
                    <Card style={[
                      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: theme.colors.border },
                      isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface }
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
          </>
        )}
      </ScrollView>

      <View style={{
        padding: theme.spacing.l,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}>
        <Button 
          title={currentStep === totalSteps - 1 ? (t('finish') || 'Finish') : (t('next') || 'Continue')} 
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
    </SafeAreaView>
  );
}
