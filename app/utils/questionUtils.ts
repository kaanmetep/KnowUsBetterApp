import { Language } from "../contexts/LanguageContext";

/**
 * Get question text based on selected language
 * Supports both new format (texts object) and old format (text string)
 */
export const getQuestionText = (
  question: any,
  selectedLanguage: Language
): string => {
  if (!question) return "";

  // New format: question.texts object with text_en, text_tr, text_es
  if (question.texts) {
    const langKey = `text_${selectedLanguage}` as keyof typeof question.texts;
    return question.texts[langKey] || question.texts.text_en || "";
  }

  // Fallback for old format: question.text or question.questionText
  if (question.text) return question.text;
  if (question.questionText) return question.questionText;

  return "";
};

/**
 * Get question answers based on selected language
 * Returns answers array for the selected language
 */
export const getQuestionAnswers = (
  question: any,
  selectedLanguage: Language
): string[] => {
  if (!question || !question.haveAnswers || !question.answers) {
    return [];
  }

  // question.answers JSONB object with answers_en, answers_tr, answers_es
  const langKey =
    `answers_${selectedLanguage}` as keyof typeof question.answers;
  const answers = question.answers[langKey];
  if (Array.isArray(answers)) {
    return answers;
  }
  // Fallback to English if selected language not available
  const englishAnswers = question.answers.answers_en;
  if (Array.isArray(englishAnswers)) {
    return englishAnswers;
  }

  return [];
};

/**
 * Get Yes/No button text based on selected language
 */
export const getYesNoText = (
  selectedLanguage: Language
): { yes: string; no: string } => {
  const translations: Record<Language, { yes: string; no: string }> = {
    en: { yes: "Yes", no: "No" },
    tr: { yes: "Evet", no: "Hayır" },
    es: { yes: "Sí", no: "No" },
  };
  return translations[selectedLanguage];
};
