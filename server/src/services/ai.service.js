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

// export const generateInterviewReport = async ({
//   resume,
//   jobDescription,
//   selfDescription,
// }) => {
//   try {
//     const prompt = `You are an expert technical interviewer and career coach.

// Analyze the following candidate information against the job description and generate a structured interview preparation report.

// CANDIDATE RESUME:
// ${resume}

// JOB DESCRIPTION:
// ${jobDescription}

// CANDIDATE SELF DESCRIPTION:
// ${selfDescription}

// You MUST return a JSON object with EXACTLY these fields:
// - matchScore: number between 0-100
// - technicalQuestions: array of 5 objects, each with (question, intention, answer)
// - behavioralQuestions: array of 5 objects, each with (question, intention, answer)
// - skillGaps: array of objects, each with (skill, severity: "low"/"medium"/"high")
// - preparationPlan: array of 7 objects, each with (day: number, focus: string, tasks: array of strings)

// Do NOT add any extra fields. Follow the schema STRICTLY.`;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: geminiSchema, // ✅ manual schema
//       },
//     });

//     const parsed = JSON.parse(response.text);

//     // Zod se validate karo
//     const validated = interviewSchema.parse(parsed);

//     console.log(validated);
//     return validated;
//   } catch (error) {
//     throw new Error(`AI generation failed: ${error.message}`);
//   }
// };

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

1. matchScore
- Return a realistic score between 0 and 100.

2. technicalQuestions
- Generate EXACTLY 5 technical interview questions.
- Each question must be relevant to the candidate and the job.
- Each object MUST contain:
  - question
  - intention
  - answer
- The "answer" field MUST contain a detailed sample answer that demonstrates what an ideal candidate should say.
- The answer MUST NOT be empty.

3. behavioralQuestions
- Generate EXACTLY 5 behavioral interview questions.
- Each object MUST contain:
  - question
  - intention
  - answer
- The "answer" field MUST contain a professional sample answer using the STAR method where appropriate.
- The answer MUST NOT be empty.

4. skillGaps
- Identify realistic missing skills.
- Severity must ONLY be:
  - "low"
  - "medium"
  - "high"

5. preparationPlan
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


  const parsed = JSON.parse(response.text);

  // console.log(JSON.stringify(parsed, null, 2));

  return parsed;
};
