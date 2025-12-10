import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a creative caption for an uploaded image.
 */
export const generateImageCaption = async (base64Image: string, promptContext?: string): Promise<string> => {
  try {
    const prompt = `Write a short, engaging, and trendy Instagram-style caption for this image. 
    Include 3-5 relevant hashtags. 
    ${promptContext ? `Context provided by user: "${promptContext}"` : ''}
    Keep it under 280 characters if possible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png for simplicity in this demo
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "Just sharing a moment! #gek";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Caught in the moment. #gek";
  }
};

/**
 * Searches for real-world places based on a query string.
 */
export const searchPlaces = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List up to 5 distinct real-world cities, countries, or famous places that match the search term "${query}". Return only the names.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Place Search Error:", error);
    return [];
  }
};