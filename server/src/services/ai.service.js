import { GoogleGenAI } from "@google/genai";
import * as z from "zod";
import puppeteer from "puppeteer";

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
      description:
        "Match score between candidate resume and job description (0-100)",
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
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();

  page.setDefaultTimeout(120000);

  await page.setContent(htmlContent, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "10mm",
      right: "10mm",
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
      description:
        "Complete HTML resume with inline CSS, ready for PDF conversion",
    },
  },
  required: ["html"],
};

// ─── Resume PDF Zod Schema ───────────────────────────────────
const resumePDFSchema = z.object({
  html: z
    .string()
    .describe("Complete, self-contained HTML resume with inline CSS styling."),
});

// ─── Generate Resume PDF ─────────────────────────────────────
export const generateResumePDF = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const prompt = `You are an expert resume writer with 15+ years of experience in tech hiring.

Your task is to write a tailored, ATS-optimized resume in HTML format for the candidate below.

CANDIDATE DATA:
Resume/Experience: ${resume}
Job Description: ${jobDescription}  
Self Description: ${selfDescription}

CONTENT RULES (most important):
- Write in first-person implicit tone — no "I" statements, just action verbs
- Use STRONG action verbs: Architected, Engineered, Delivered, Spearheaded, Optimized
- Every bullet point must show IMPACT — what changed because of this person's work
- Quantify wherever possible — "30+ students", "3 projects", "reduced by 40%"
- Mirror exact keywords from the job description — this is critical for ATS
- Content must sound like a real human wrote it — NOT AI generated
- No buzzwords like "leverage", "utilize", "synergy", "passionate about"
- No generic statements like "team player" or "hard worker"
- Keep it concise — max 1 page, quality over quantity
- Only include experience/skills relevant to the job description

HTML DESIGN RULES:
- Clean, minimal, professional design
- Use ONLY inline CSS — no external stylesheets or Google Fonts
- Safe fonts only: Arial, Georgia, Times New Roman, Helvetica
- Color scheme: dark navy (#1a1a2e) headings, black body text, subtle accent
- Proper visual hierarchy — name biggest, sections clear
- Single column layout — ATS friendly
- No tables, no multi-column layouts — breaks ATS parsing
- No icons or images — text only
- Proper spacing — not too cramped, not too airy

SECTIONS TO INCLUDE (in this order):
1. Header — Name, Role, Location, Email, GitHub, LinkedIn
2. Professional Summary — 3-4 lines, tailored to the JD
3. Technical Skills — grouped by category, keywords from JD first
4. Projects — most relevant first, with tech stack and impact
5. Experience — if any professional experience
6. Education & Certifications

OUTPUT FORMAT:
- Return ONLY a JSON object
- Single field: "html"
- The html value must be a complete, valid HTML document
- Start with <!DOCTYPE html>
- No markdown, no backticks, no explanation outside JSON`;

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
