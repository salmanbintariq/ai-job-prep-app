import { GoogleGenAI } from "@google/genai";
import * as z from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
  title: z.string(),
});

// Gemini ka apna schema format — manually likho
const geminiSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A short descriptive title for this interview report.",
    },

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
    "title",
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
  const prompt = `
You are an expert technical interviewer, hiring manager, and career coach.

Analyze the candidate's resume, self-description, and the job description carefully.

Return ONLY a valid JSON object.

IMPORTANT RULES:
- Do NOT return Markdown.
- Do NOT wrap the response inside \`\`\`.
- Do NOT include explanations before or after the JSON.
- Do NOT return an array.
- Return ONLY one JSON object.
- Follow the structure EXACTLY.

The JSON MUST have this structure:

{
  "title": "",
  "matchScore": 85,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [""]
    }
  ]
}

Requirements:

1. title
- Generate a short and meaningful title for this interview report.
- Format:
  "<Job Role>"
- Example:
  "Associate Software Engineer"

2. matchScore
- Return a realistic score between 0 and 100.

3. technicalQuestions
- Generate EXACTLY 5 technical interview questions.
- Each question must be relevant to the candidate and the job.
- Each object MUST contain:
  - question
  - intention
  - answer
- The "answer" field MUST contain a detailed sample answer that demonstrates what an ideal candidate should say.
- The answer MUST NOT be empty.

4. behavioralQuestions
- Generate EXACTLY 5 behavioral interview questions.
- Each object MUST contain:
  - question
  - intention
  - answer
- The "answer" field MUST contain a professional sample answer using the STAR method where appropriate.
- The answer MUST NOT be empty.

5. skillGaps
- Identify realistic missing skills.
- Severity must ONLY be:
  - "low"
  - "medium"
  - "high"

6. preparationPlan
- Generate EXACTLY 7 days.
- Each day must include:
  - day
  - focus
  - tasks
- Each day should have 3-5 practical tasks.

VERY IMPORTANT:
- Every string field must contain meaningful content.
- Never leave any field empty.
- Never use null.
- Never omit any required field.
- Return ONLY valid JSON.

Candidate Resume:
${resume}

Job Description:
${jobDescription}

Candidate Self Description:
${selfDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = interviewSchema.parse(JSON.parse(response.text));

  return parsed;
};
