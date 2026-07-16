import { GoogleGenAI } from "@google/genai";
import * as z from "zod";
import puppeteer from "puppeteer-core";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── Interview Schema ────────────────────────────────────────
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

// ─── Interview Gemini Schema ─────────────────────────────────
const interviewGeminiSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A short descriptive title for this interview report.",
    },
    matchScore: {
      type: "number",
      description: "Match score between candidate resume and job description (0-100)",
    },
    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
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
        type: "object",
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
        type: "object",
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
        type: "object",
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

// ─── Generate Interview Report ───────────────────────────────
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
    { "question": "", "intention": "", "answer": "" }
  ],
  "behavioralQuestions": [
    { "question": "", "intention": "", "answer": "" }
  ],
  "skillGaps": [
    { "skill": "", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "", "tasks": [""] }
  ]
}

Requirements:

1. title — short meaningful title. Format: "<Job Role>"
2. matchScore — realistic score 0-100
3. technicalQuestions — EXACTLY 5 questions with question, intention, answer
4. behavioralQuestions — EXACTLY 5 questions with question, intention, answer (STAR method)
5. skillGaps — missing skills with severity: "low" | "medium" | "high"
6. preparationPlan — EXACTLY 7 days, each with day, focus, tasks (3-5 tasks)

VERY IMPORTANT:
- Every string field must contain meaningful content
- Never leave any field empty
- Never use null
- Return ONLY valid JSON

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
      responseSchema: interviewGeminiSchema, // ✅ renamed
    },
  });

  const parsed = interviewSchema.parse(JSON.parse(response.text));
  return parsed;
};

// ─── HTML to PDF (Puppeteer) ─────────────────────────────────
async function generatePdfFromHtml(htmlContent) {        // ✅ added
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", 
    protocolTimeout: 180000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded",timeout: 60000, });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return pdfBuffer;
}

// ─── Resume PDF Gemini Schema ────────────────────────────────
const resumeGeminiSchema = {                             
  type: "object",
  properties: {
    html: {
      type: "string",
      description: "Complete HTML resume with inline CSS, ready for PDF conversion",
    },
  },
  required: ["html"],
};

// ─── Resume PDF Zod Schema ───────────────────────────────────
const resumePDFSchema = z.object({
  html: z.string().describe(
    "Complete, self-contained HTML resume with inline CSS styling."
  ),
});

// ─── Generate Resume PDF ─────────────────────────────────────
export const generateResumePDF = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const prompt = `You are a professional resume writer.

Generate a complete, well-formatted HTML resume for the candidate below.

CANDIDATE RESUME / EXPERIENCE:
${resume}

JOB DESCRIPTION (tailor resume for this role):
${jobDescription}

SELF DESCRIPTION:
${selfDescription}

STRICT REQUIREMENTS:
- Return a single JSON object with one field: "html"
- The HTML must be complete and self-contained
- Use ONLY inline CSS styles (no external stylesheets)
- Professional design: clean layout, good typography
- Include sections: Summary, Skills, Experience, Projects, Education
- Tailor the content to match the job description
- The content should NOT sound AI-generated
- ATS friendly format
- Max 1-2 pages when converted to PDF
- Do NOT include markdown, code blocks, or any text outside the JSON`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeGeminiSchema, // ✅ renamed
      },
    });

    const parsed = JSON.parse(response.text);
    const validated = resumePDFSchema.parse(parsed);

    // ✅ HTML se PDF banao aur return karo
    const pdfBuffer = await generatePdfFromHtml(validated.html);
    return pdfBuffer;

  } catch (error) {
    throw new Error(`Resume PDF generation failed: ${error.message}`);
  }
};