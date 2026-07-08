import { GoogleGenAI } from "@google/genai";
import * as z from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Zod — sirf validation ke liye rakho
const interviewSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
});

// Gemini ka apna schema format — manually likho
const geminiSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
      description:
        "Match score between candidate resume and job description (0-100)",
    },
    technicalQuestions: {
      type: "array",
      items: {
        type: "object", // ← explicit object type
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "array",
      items: {
        type: "object", // ← explicit object type
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "array",
      items: {
        type: "object", // ← explicit object type
        properties: {
          skill: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "array",
      items: {
        type: "object", // ← explicit object type
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

export const generateInterviewReport = async ({
  resume,
  jobDescription,
  selfDescription,
}) => {
  try {
    const prompt = `You are an expert technical interviewer and career coach.

Analyze the following candidate information against the job description and generate a structured interview preparation report.

CANDIDATE RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE SELF DESCRIPTION:
${selfDescription}

You MUST return a JSON object with EXACTLY these fields:
- matchScore: number between 0-100
- technicalQuestions: array of 5 objects, each with (question, intention, answer)
- behavioralQuestions: array of 5 objects, each with (question, intention, answer)
- skillGaps: array of objects, each with (skill, severity: "low"/"medium"/"high")
- preparationPlan: array of 7 objects, each with (day: number, focus: string, tasks: array of strings)

Do NOT add any extra fields. Follow the schema STRICTLY.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiSchema, // ✅ manual schema        
      },
    });

    const parsed = JSON.parse(response.text);

    // Zod se validate karo
    const validated = interviewSchema.parse(parsed);

    console.log(validated);
    return validated;
  } catch (error) {
    throw new Error(`AI generation failed: ${error.message}`);
  }
};
