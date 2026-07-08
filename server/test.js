import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Say hello",
});

console.log(response.text);