import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a production app, never expose API keys on the client side.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const getConciergeResponse = async (userQuery: string, userName: string): Promise<string> => {
  if (!ai) {
    return "I'm sorry, my AI brain is not connected (API Key missing). Please contact the front desk.";
  }

  try {
    const model = "gemini-2.5-flash";
    const systemPrompt = `You are the Virtual Concierge for Rajvista Hotels, a collection of luxury heritage properties in Rajasthan.
    Your tone is polite, luxurious, and helpful. 
    The user's name is ${userName}.
    
    General Info:
    - We have properties in Jaipur, Udaipur, Jodhpur, and Jaisalmer.
    - Amenities typically include: Royal Spas, Heritage Walks, Fine Dining, and Folk Performances.
    - Check-in: 2 PM, Check-out: 11 AM.
    
    Answer the guest's question briefly and helpfully regarding their stay, booking, or local Rajasthani culture.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I apologize, I didn't catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently experiencing a high volume of requests. Please try again later.";
  }
};