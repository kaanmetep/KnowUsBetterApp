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
