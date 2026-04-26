import Constants from "expo-constants";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  "https://knowusbetterapp-backend.onrender.com";

export interface AiAnalysisResult {
  strengths?: string;
  differences?: string;
  tips?: string;
  compatibility?: string;
  player1AboutPlayer2?: string;
  player2AboutPlayer1?: string;
}

export const AI_ANALYSIS_COIN_COST = 3;
export type AiAnalysisType = "default" | "know_me_well";
export interface KnowMeWellPercentages {
  player1AboutPlayer2Percentage: number;
  player2AboutPlayer1Percentage: number;
}

/**
 * Calls the backend API to generate AI match analysis.
 * The backend handles OpenAI communication.
 */
export const generateAiAnalysis = async (
  completedRounds: any[],
  player1Name: string,
  player2Name: string,
  matchPercentage: number,
  language: string,
  analysisType: AiAnalysisType = "default",
  knowMeWellPercentages?: KnowMeWellPercentages
): Promise<AiAnalysisResult> => {
  const requestPayload = {
    completedRounds,
    player1Name,
    player2Name,
    matchPercentage,
    language,
    analysisType,
    ...(knowMeWellPercentages ? knowMeWellPercentages : {}),
  };

  const response = await fetch(`${BACKEND_URL}/api/ai-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `AI analysis failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (analysisType === "know_me_well") {
    if (!data.player1AboutPlayer2 || !data.player2AboutPlayer1) {
      throw new Error("Invalid Know Me Well AI response format");
    }
    return data;
  }

  if (
    !data.strengths ||
    !data.differences ||
    !data.tips ||
    !data.compatibility
  ) {
    throw new Error("Invalid default AI response format");
  }

  return data;
};
