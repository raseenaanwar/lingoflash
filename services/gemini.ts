import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyCard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVocabulary = async (
  topic: string, 
  difficulty: string,
  count: number = 10
): Promise<VocabularyCard[]> => {
  const model = "gemini-2.5-flash";
  
  // Adjusted prompt for more beginner-friendly/fun content
  const prompt = `Generate ${count} English vocabulary words related to the topic "${topic}" at a "${difficulty}" difficulty level. 
  
  Requirements:
  1. Words should be distinct, fun, and useful for a learner.
  2. Definitions must be simple, clear, and easy to memorize (avoid overly academic language).
  3. Example sentences should be engaging or slightly humorous if possible to help memory retention.
  4. Include phonetic pronunciation (IPA).
  
  Output JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING }
            },
            required: ["word", "pronunciation", "partOfSpeech", "definition", "example"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VocabularyCard[];
    }
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw error;
  }
};