import Constants from "expo-constants";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  "https://knowusbetterapp-backend.onrender.com";

export interface AiAnalysisResult {
  strengths: string;
  differences: string;
  tips: string;
  compatibility: string;
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
  language: string
): Promise<AiAnalysisResult> => {
  const response = await fetch(`${BACKEND_URL}/api/ai-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      completedRounds,
      player1Name,
      player2Name,
      matchPercentage,
      language,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `AI analysis failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (!data.strengths || !data.differences || !data.tips || !data.compatibility) {
    throw new Error("Invalid AI response format");
  }

  return data;
};
