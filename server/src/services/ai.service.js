import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
})

// testing
export async function invokeAI(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello gemini! explain what is an interview?",
  })

  console.log("AI Response:", response.text);
}